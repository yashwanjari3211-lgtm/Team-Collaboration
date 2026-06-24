from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    LoginRequest, TokenResponse, ForgotPasswordRequest,
    ResetPasswordRequest, GoogleAuthRequest, GoogleAuthUrlResponse,
)
from app.schemas.user import UserCreate, UserOut
from app.models.user import User
from app.services.auth_service import (
    create_access_token, hash_password, verify_password,
    create_reset_token, verify_reset_token,
    exchange_google_code, get_google_auth_url,
)

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
        full_name=user.full_name,
        auth_provider="local",
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not user.hashed_password or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)

# --- Forgot Password ---

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a password reset token. Prints the reset link to the console
    (in production, this would send an email)."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Return success even if user not found to prevent email enumeration
        return {"message": "If an account exists with that email, a reset link has been sent."}

    if user.auth_provider == "google" and not user.hashed_password:
        return {"message": "This account uses Google Sign-In. Please sign in with Google instead."}

    token = create_reset_token(request.email)
    # In production, send this via email. For now, print to console.
    reset_url = f"http://localhost:5173/reset-password?token={token}"
    print("\n" + "=" * 60)
    print("🔑 PASSWORD RESET LINK (copy this into your browser):")
    print(f"   {reset_url}")
    print("=" * 60 + "\n")

    return {"message": "If an account exists with that email, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset the user's password using a valid reset token."""
    email = verify_reset_token(request.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(request.new_password)
    db.commit()
    return {"message": "Password has been reset successfully"}

# --- Google OAuth ---

@router.get("/google/url", response_model=GoogleAuthUrlResponse)
def google_auth_url():
    """Return the Google OAuth consent URL for the frontend to redirect to."""
    url = get_google_auth_url()
    return GoogleAuthUrlResponse(url=url)

@router.post("/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Exchange a Google authorization code for a JWT access token."""
    google_user = await exchange_google_code(request.code)
    if not google_user:
        raise HTTPException(status_code=400, detail="Failed to authenticate with Google")

    # Check if user exists by google_id
    user = db.query(User).filter(User.google_id == google_user["google_id"]).first()

    if not user:
        # Check if user exists by email (may have registered locally first)
        user = db.query(User).filter(User.email == google_user["email"]).first()
        if user:
            # Link Google account to existing local user
            user.google_id = google_user["google_id"]
            if not user.avatar and google_user.get("avatar"):
                user.avatar = google_user["avatar"]
            if not user.full_name and google_user.get("full_name"):
                user.full_name = google_user["full_name"]
            db.commit()
        else:
            # Create new user from Google info
            user = User(
                email=google_user["email"],
                full_name=google_user.get("full_name"),
                avatar=google_user.get("avatar"),
                google_id=google_user["google_id"],
                auth_provider="google",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)
