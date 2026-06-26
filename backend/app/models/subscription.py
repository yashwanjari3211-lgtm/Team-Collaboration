from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base
from app.config import settings


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    razorpay_subscription_id = Column(String, unique=True, index=True, nullable=False)
    razorpay_plan_id = Column(String, nullable=False)
    status = Column(String, default='pending')  # pending, active, cancelled, expired
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


FREE_PLAN_ID = "plan_free"

INDIA_MARKET = "india"
INTERNATIONAL_MARKET = "international"


def get_pricing_catalog(recommended_market: str = INDIA_MARKET):
    markets = [
        {
            "market": INDIA_MARKET,
            "title": "India Pricing (₹)",
            "subtitle": "Still 90% cheaper than Slack Pro for 25 people",
            "badge": "IN",
            "currency": "INR",
            "plans": [
                {
                    "id": FREE_PLAN_ID,
                    "code": "free",
                    "market": INDIA_MARKET,
                    "name": "Free",
                    "description": "Up to 5 members",
                    "price": 0,
                    "display_price": "₹0",
                    "currency": "INR",
                    "interval": "forever",
                    "max_members": 5,
                    "max_channels": 3,
                    "cta_type": "free",
                    "cta_label": "Get Started",
                    "is_popular": False,
                    "is_enterprise": False,
                },
                {
                    "id": settings.RAZORPAY_INR_STARTER_PLAN_ID,
                    "code": "starter",
                    "market": INDIA_MARKET,
                    "name": "Starter",
                    "description": "Up to 25 members",
                    "price": 1499,
                    "display_price": "₹1,499",
                    "currency": "INR",
                    "interval": "month",
                    "max_members": 25,
                    "max_channels": 25,
                    "cta_type": "subscribe",
                    "cta_label": "Subscribe",
                    "is_popular": True,
                    "is_enterprise": False,
                },
                {
                    "id": settings.RAZORPAY_INR_PRO_PLAN_ID,
                    "code": "pro",
                    "market": INDIA_MARKET,
                    "name": "Pro",
                    "description": "Up to 100 members",
                    "price": 3999,
                    "display_price": "₹3,999",
                    "currency": "INR",
                    "interval": "month",
                    "max_members": 100,
                    "max_channels": 100,
                    "cta_type": "subscribe",
                    "cta_label": "Subscribe",
                    "is_popular": False,
                    "is_enterprise": False,
                },
                {
                    "id": "enterprise_india",
                    "code": "enterprise",
                    "market": INDIA_MARKET,
                    "name": "Enterprise",
                    "description": "Unlimited members",
                    "price": 0,
                    "display_price": "Custom",
                    "currency": "INR",
                    "interval": "contact us",
                    "max_members": None,
                    "max_channels": None,
                    "cta_type": "contact_sales",
                    "cta_label": "Contact Sales",
                    "is_popular": False,
                    "is_enterprise": True,
                },
            ],
        },
        {
            "market": INTERNATIONAL_MARKET,
            "title": "International Pricing ($)",
            "subtitle": "Flat rate beats Slack's $7.25/user for any team over 3",
            "badge": "🌎",
            "currency": "USD",
            "plans": [
                {
                    "id": FREE_PLAN_ID,
                    "code": "free",
                    "market": INTERNATIONAL_MARKET,
                    "name": "Free",
                    "description": "Up to 5 members",
                    "price": 0,
                    "display_price": "$0",
                    "currency": "USD",
                    "interval": "forever",
                    "max_members": 5,
                    "max_channels": 3,
                    "cta_type": "free",
                    "cta_label": "Get Started",
                    "is_popular": False,
                    "is_enterprise": False,
                },
                {
                    "id": settings.RAZORPAY_USD_STARTER_PLAN_ID,
                    "code": "starter",
                    "market": INTERNATIONAL_MARKET,
                    "name": "Starter",
                    "description": "Up to 25 members",
                    "price": 19,
                    "display_price": "$19",
                    "currency": "USD",
                    "interval": "month",
                    "max_members": 25,
                    "max_channels": 25,
                    "cta_type": "subscribe",
                    "cta_label": "Subscribe",
                    "is_popular": True,
                    "is_enterprise": False,
                },
                {
                    "id": settings.RAZORPAY_USD_PRO_PLAN_ID,
                    "code": "pro",
                    "market": INTERNATIONAL_MARKET,
                    "name": "Pro",
                    "description": "Up to 100 members",
                    "price": 49,
                    "display_price": "$49",
                    "currency": "USD",
                    "interval": "month",
                    "max_members": 100,
                    "max_channels": 100,
                    "cta_type": "subscribe",
                    "cta_label": "Subscribe",
                    "is_popular": False,
                    "is_enterprise": False,
                },
                {
                    "id": "enterprise_international",
                    "code": "enterprise",
                    "market": INTERNATIONAL_MARKET,
                    "name": "Enterprise",
                    "description": "Unlimited members",
                    "price": 99,
                    "display_price": "$99+",
                    "currency": "USD",
                    "interval": "month",
                    "max_members": None,
                    "max_channels": None,
                    "cta_type": "contact_sales",
                    "cta_label": "Contact Sales",
                    "is_popular": False,
                    "is_enterprise": True,
                },
            ],
        },
    ]

    filtered_markets = []
    for market in markets:
        plans = []
        for plan in market["plans"]:
            if plan["cta_type"] in {"free", "contact_sales"} or plan["id"]:
                plans.append(plan)
        filtered_markets.append(
            {
                **market,
                "is_recommended": market["market"] == recommended_market,
                "plans": plans,
            }
        )

    return filtered_markets


def get_available_plans():
    plans = []
    for market in get_pricing_catalog():
        for plan in market["plans"]:
            if plan["cta_type"] in {"free", "subscribe"}:
                plans.append(plan)
    return plans
