from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PlanOut(BaseModel):
    """Plan information returned to frontend"""
    id: str
    code: str
    market: str
    name: str
    description: str
    price: int
    display_price: str
    currency: str
    interval: str
    max_members: Optional[int] = None
    max_channels: Optional[int] = None
    cta_type: str
    cta_label: str
    is_popular: bool = False
    is_enterprise: bool = False


class PricingMarketOut(BaseModel):
    market: str
    title: str
    subtitle: str
    badge: str
    currency: str
    is_recommended: bool
    plans: list[PlanOut]


class PricingCatalogOut(BaseModel):
    detected_country: str
    recommended_market: str
    markets: list[PricingMarketOut]


class SubscriptionCreate(BaseModel):
    """Request to create a new subscription"""
    plan_id: str


class SubscriptionVerify(BaseModel):
    """Verify payment after Razorpay checkout"""
    razorpay_payment_id: str
    razorpay_subscription_id: str
    razorpay_signature: str


class SubscriptionOut(BaseModel):
    """Subscription information returned to frontend"""
    id: int
    organization_id: int
    razorpay_subscription_id: str
    razorpay_plan_id: str
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RazorpayKeyOut(BaseModel):
    """Public Razorpay key for frontend"""
    key_id: str
