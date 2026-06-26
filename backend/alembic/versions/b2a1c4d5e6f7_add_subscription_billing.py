"""add subscription billing

Revision ID: b2a1c4d5e6f7
Revises: 82ec6ffc77d2
Create Date: 2026-06-25 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b2a1c4d5e6f7"
down_revision: Union[str, None] = "82ec6ffc77d2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("organizations", sa.Column("plan_id", sa.String(), nullable=True))
    op.add_column("organizations", sa.Column("subscription_status", sa.String(), nullable=True))

    op.execute("UPDATE organizations SET plan_id = 'plan_free' WHERE plan_id IS NULL")
    op.execute("UPDATE organizations SET subscription_status = 'inactive' WHERE subscription_status IS NULL")

    op.alter_column("organizations", "plan_id", nullable=False)
    op.alter_column("organizations", "subscription_status", nullable=False)

    op.create_table(
        "subscriptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("razorpay_subscription_id", sa.String(), nullable=False),
        sa.Column("razorpay_plan_id", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_subscriptions_id"), "subscriptions", ["id"], unique=False)
    op.create_index(
        op.f("ix_subscriptions_razorpay_subscription_id"),
        "subscriptions",
        ["razorpay_subscription_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_subscriptions_razorpay_subscription_id"), table_name="subscriptions")
    op.drop_index(op.f("ix_subscriptions_id"), table_name="subscriptions")
    op.drop_table("subscriptions")
    op.drop_column("organizations", "subscription_status")
    op.drop_column("organizations", "plan_id")
