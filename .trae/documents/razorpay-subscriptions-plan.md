# Razorpay Recurring Subscription System Implementation Plan

## Summary
Implement a recurring subscription system using Razorpay Subscriptions API for the SaaS platform, including backend (FastAPI) and frontend (React) components.

## Current State Analysis
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL, existing models for `Organization`, `User`, `Channel`, etc.
- **Frontend**: React 18 + Redux + Tailwind CSS, existing dashboard with Sidebar and WorkspaceSwitcher
- **Dependencies**: Need to add `razorpay` Python package to backend

## Proposed Changes

### 1. Backend Changes

#### 1.1 Add Razorpay Configuration
- Update [config.py](file:///c:/Users/Yash/Desktop/Team%20collaboration/backend/app/config.py) to add Razorpay environment variables
- Add to [.env.example](file:///c:/Users/Yash/Desktop/Team%20collaboration/backend/.env.example) Razorpay keys example

#### 1.2 Create Subscription Model
- Create new file [app/models/subscription.py](file:///c:/Users/Yash/Desktop/Team%20collaboration/backend/app/models/subscription.py) with:
  - `id` (primary key)
  - `organization_id` (foreign key)
  - `razorpay_subscription_id`
  - `razorpay_plan_id`
  - `status` (pending, active, cancelled, expired)
  - `current_period_start`
  - `current_period_end`
  - `created_at`
  - `updated_at`

#### 1.3 Add Plan Model
- Create new file [app/models/plan.py](file:///c:/Users/Yash/Desktop/Team%20collaboration/backend/app/models/plan.py) or define in same file
  - Predefined plans created in Razorpay dashboard, stored as constants or database models

#### 1.4 Create Subscription Schemas
- Create new file [app/schemas/subscription.py](file:///c:/Users/Yash/Desktop/Team%20collaboration/backend/app/schemas/subscription.py) with:
  - `SubscriptionCreate`
  - `SubscriptionOut`
  - `SubscriptionVerify`
  - `PlanOut`

#### 1.5 Create Subscription Router
- Create new file [app/routers/subscriptions.py](file:///c:/Users/Yash/Desktop/Team%20collaboration/backend/app/routers/subscriptions.py) with:
  - `POST /api/subscriptions/plans` - Get available plans
  - `POST /api/subscriptions/create` - Create Razorpay subscription
  - `POST /api/subscriptions/verify` - Verify payment and activate subscription
  - `POST /api/subscriptions/webhook` - Handle Razorpay webhook events

#### 1.6 Update Main App
- Update [main.py](file:///c:/Users/Yash/Desktop/Team%20collaboration/backend/app/main.py) to include new subscriptions router
- Add CORS for webhooks if needed

#### 1.7 Update Organization Model
- Add optional `plan_id` and `subscription_status` to Organization (or reference via Subscription model)

#### 1.8 Add Dependencies
- Add `razorpay` package to [requirements.txt](file:///c:/Users/Yash/Desktop/Team%20collaboration/backend/requirements.txt)

### 2. Frontend Changes

#### 2.1 Add Subscription API Client
- Create new file [frontend/src/api/subscriptions.js](file:///c:/Users/Yash/Desktop/Team%20collaboration/frontend/src/api/subscriptions.js) with:
  - `getPlans()`
  - `createSubscription(planId)`
  - `verifySubscription(payload)`

#### 2.2 Create Billing Page
- Create [frontend/src/pages/BillingPage.jsx](file:///c:/Users/Yash/Desktop/Team%20collaboration/frontend/src/pages/BillingPage.jsx) with:
  - Plan selection UI
  - Razorpay checkout initialization
  - Success/error handling
  - Current subscription details

#### 2.3 Update App.jsx
- Add route for billing page in [App.jsx](file:///c:/Users/Yash/Desktop/Team%20collaboration/frontend/src/App.jsx)

#### 2.4 Add Billing Link to Sidebar
- Add billing navigation item in Sidebar or WorkspaceSwitcher

#### 2.5 Add Razorpay Script
- Add Razorpay checkout script to [index.html](file:///c:/Users/Yash/Desktop/Team%20collaboration/frontend/index.html)

### 3. Database Migration
- Create Alembic migration for new subscription tables

## Assumptions & Decisions
1. Use **Python Razorpay SDK** instead of Node.js since backend is FastAPI
2. Store subscription data linked to `Organization` (not individual users)
3. Predefined plans created in Razorpay dashboard with IDs:
   - `plan_free` (Free tier, for testing)
   - `plan_monthly` (Monthly paid tier)
   - `plan_yearly` (Yearly paid tier)
4. Webhook events to handle: `subscription.activated`, `payment.captured`, `subscription.cancelled`, `subscription.completed`
5. Signature verification mandatory for both checkout and webhook

## Verification Steps
1. Add Razorpay keys to .env
2. Run backend and frontend
3. Test plan selection
4. Test subscription creation with Razorpay test mode
5. Test webhook handling (using ngrok or similar)
6. Verify database updates
7. Test subscription cancellation
