from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
import razorpay
import hmac
import hashlib
import json
import logging
from datetime import datetime

from app.database import get_db
from app.config import settings
from app.models.subscription import (
    Subscription,
    FREE_PLAN_ID,
    INDIA_MARKET,
    INTERNATIONAL_MARKET,
    get_available_plans,
    get_pricing_catalog,
)
from app.models.organization import Organization
from app.models.user import User
from app.schemas.subscription import (
    PricingCatalogOut,
    SubscriptionCreate,
    SubscriptionVerify,
    SubscriptionOut,
    RazorpayKeyOut
)
from app.utils.dependencies import get_current_user, get_current_organization

logger = logging.getLogger(__name__)

router = APIRouter()


def get_razorpay_client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay keys not configured")
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def get_org_subscription(db: Session, organization_id: int):
    return (
        db.query(Subscription)
        .filter(Subscription.organization_id == organization_id)
        .order_by(Subscription.created_at.desc())
        .first()
    )


def update_organization_subscription_state(db: Session, organization_id: int, plan_id: str, status: str):
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    if org:
        org.plan_id = plan_id
        org.subscription_status = status


def detect_country_code(request: Request) -> str:
    override = request.query_params.get("country_code") or request.headers.get("X-Country-Code")
    if override:
        return override.upper()

    for header_name in (
        "CF-IPCountry",
        "X-Vercel-IP-Country",
        "CloudFront-Viewer-Country",
    ):
        header_value = request.headers.get(header_name)
        if header_value:
            return header_value.upper()

    accept_language = (request.headers.get("Accept-Language") or "").lower()
    if "-in" in accept_language:
        return "IN"

    return "US"


def get_recommended_market(country_code: str) -> str:
    return INDIA_MARKET if country_code.upper() == "IN" else INTERNATIONAL_MARKET


@router.get("/plans", response_model=PricingCatalogOut)
async def get_plans(request: Request):
    """Return available subscription plans"""
    country_code = detect_country_code(request)
    recommended_market = get_recommended_market(country_code)
    return {
        "detected_country": country_code,
        "recommended_market": recommended_market,
        "markets": get_pricing_catalog(recommended_market),
    }


@router.get("/key", response_model=RazorpayKeyOut)
async def get_razorpay_key():
    """Return public Razorpay key for frontend"""
    if not settings.RAZORPAY_KEY_ID:
        raise HTTPException(status_code=500, detail="Razorpay not configured")
    return RazorpayKeyOut(key_id=settings.RAZORPAY_KEY_ID)


@router.post("/create")
async def create_subscription(
    subscription_data: SubscriptionCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_organization),
):
    """
    Create a Razorpay subscription for the current organization.
    Returns subscription_id and short_url for checkout.
    """
    # Validate plan exists
    available_plans = get_available_plans()
    plan = next((p for p in available_plans if p["id"] == subscription_data.plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    country_code = detect_country_code(request)
    recommended_market = get_recommended_market(country_code)
    if plan["cta_type"] == "subscribe" and plan["market"] != recommended_market:
        raise HTTPException(status_code=403, detail="Selected plan is not available in your region")

    # Free plan - no payment required
    if plan["price"] == 0:
        org.plan_id = FREE_PLAN_ID
        org.subscription_status = "active"
        db.commit()
        return {
            "subscription_id": None,
            "short_url": None,
            "free_plan": True,
            "message": "Free plan activated"
        }

    # Determine total_count based on plan interval
    total_count = 12 if plan["interval"] == "month" else 1

    try:
        razorpay_client = get_razorpay_client()

        existing_subscription = get_org_subscription(db, org.id)
        if existing_subscription and existing_subscription.status in {"pending", "active"}:
            existing_subscription.status = "cancelled"

        # Create Razorpay subscription
        razorpay_subscription = razorpay_client.subscription.create({
            "plan_id": subscription_data.plan_id,
            "customer_notify": 1,
            "quantity": 1,
            "total_count": total_count,
            "notes": {
                "organization_id": str(org.id),
                "user_id": str(current_user.id),
                "plan_name": plan["name"]
            }
        })

        # Save subscription to database
        db_subscription = Subscription(
            organization_id=org.id,
            razorpay_subscription_id=razorpay_subscription["id"],
            razorpay_plan_id=subscription_data.plan_id,
            status="pending"
        )
        db.add(db_subscription)
        db.commit()

        return {
            "subscription_id": razorpay_subscription["id"],
            "short_url": razorpay_subscription.get("short_url"),
            "free_plan": False,
            "market": recommended_market,
        }

    except razorpay.errors.BadRequestError as e:
        logger.error(f"Razorpay error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error creating subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create subscription")


@router.post("/verify")
async def verify_subscription(
    verify_data: SubscriptionVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_organization),
):
    """
    Verify Razorpay payment signature after checkout.
    Updates subscription and organization status.
    """
    try:
        if not settings.RAZORPAY_KEY_SECRET:
            raise HTTPException(status_code=500, detail="Razorpay secret not configured")

        # Verify signature using HMAC-SHA256
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{verify_data.razorpay_payment_id}|{verify_data.razorpay_subscription_id}".encode(),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != verify_data.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")

        # Update subscription status
        subscription = db.query(Subscription).filter(
            Subscription.razorpay_subscription_id == verify_data.razorpay_subscription_id,
            Subscription.organization_id == org.id
        ).first()

        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")

        subscription.status = "active"
        subscription.current_period_start = datetime.utcnow()

        # Update organization
        update_organization_subscription_state(
            db,
            org.id,
            subscription.razorpay_plan_id,
            "active",
        )

        db.commit()

        return {
            "success": True,
            "message": "Subscription activated successfully",
            "subscription_id": subscription.razorpay_subscription_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Verification failed")


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_razorpay_signature: Optional[str] = Header(None),
):
    """
    Handle Razorpay webhook events.
    Verifies signature and updates subscription status.
    """
    if not x_razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing signature header")

    # Get raw body
    body = await request.body()

    # Verify webhook signature
    webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET or settings.RAZORPAY_KEY_SECRET
    expected_signature = hmac.new(
        webhook_secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, x_razorpay_signature):
        logger.warning("Invalid webhook signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Parse webhook payload
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = payload.get("event")
    payload_data = payload.get("payload", {})
    subscription_entity = payload_data.get("subscription", {}).get("entity", {})
    payment_entity = payload_data.get("payment", {}).get("entity", {})

    if not event:
        return {"status": "ignored", "reason": "Missing event"}

    razorpay_subscription_id = subscription_entity.get("id") or payment_entity.get("subscription_id")
    if not razorpay_subscription_id:
        return {"status": "ignored", "reason": "Missing subscription ID"}

    # Find subscription in DB
    subscription = db.query(Subscription).filter(
        Subscription.razorpay_subscription_id == razorpay_subscription_id
    ).first()

    if not subscription:
        logger.warning(f"Subscription not found: {razorpay_subscription_id}")
        return {"status": "ignored", "reason": "Subscription not found"}

    # Map Razorpay status to our status
    razorpay_status = subscription_entity.get("status", "").lower()

    if event == "subscription.activated" or razorpay_status == "active":
        subscription.status = "active"
        update_organization_subscription_state(
            db,
            subscription.organization_id,
            subscription.razorpay_plan_id,
            "active",
        )

    elif event == "subscription.cancelled" or razorpay_status == "cancelled":
        subscription.status = "cancelled"
        update_organization_subscription_state(
            db,
            subscription.organization_id,
            subscription.razorpay_plan_id,
            "cancelled",
        )

    elif event == "subscription.completed" or razorpay_status == "completed":
        subscription.status = "expired"
        update_organization_subscription_state(
            db,
            subscription.organization_id,
            subscription.razorpay_plan_id,
            "inactive",
        )

    elif event == "payment.captured":
        subscription.status = "active"
        update_organization_subscription_state(
            db,
            subscription.organization_id,
            subscription.razorpay_plan_id,
            "active",
        )
        logger.info(f"Payment captured for subscription {razorpay_subscription_id}")

    db.commit()

    return {"status": "ok", "event": event}


@router.get("/current", response_model=Optional[SubscriptionOut])
async def get_current_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_organization),
):
    """Get the current organization's active subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.organization_id == org.id,
        Subscription.status == "active"
    ).order_by(Subscription.created_at.desc()).first()

    if not subscription:
        return None

    return subscription
