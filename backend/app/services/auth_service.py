from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from itsdangerous import URLSafeTimedSerializer
import httpx
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
reset_serializer = URLSafeTimedSerializer(settings.SECRET_KEY)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

# --- Forgot Password ---

def create_reset_token(email: str) -> str:
    """Generate a time-limited password reset token."""
    return reset_serializer.dumps(email, salt="password-reset")

def verify_reset_token(token: str, max_age: int = 3600) -> str | None:
    """Verify a password reset token. Returns email if valid, None otherwise.
    Token expires after max_age seconds (default 1 hour)."""
    try:
        email = reset_serializer.loads(token, salt="password-reset", max_age=max_age)
        return email
    except Exception:
        return None

# --- Google OAuth ---

async def exchange_google_code(code: str) -> dict | None:
    """Exchange a Google authorization code for user info.
    Returns dict with keys: google_id, email, full_name, avatar or None on failure."""
    async with httpx.AsyncClient() as client:
        # Step 1: Exchange code for access token
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": f"{settings.FRONTEND_URL}/auth/google/callback",
                "grant_type": "authorization_code",
            },
        )
        if token_response.status_code != 200:
            return None

        token_data = token_response.json()
        access_token = token_data.get("access_token")
        if not access_token:
            return None

        # Step 2: Fetch user info from Google
        userinfo_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_response.status_code != 200:
            return None

        userinfo = userinfo_response.json()
        return {
            "google_id": userinfo.get("id"),
            "email": userinfo.get("email"),
            "full_name": userinfo.get("name"),
            "avatar": userinfo.get("picture"),
        }

def get_google_auth_url() -> str:
    """Build the Google OAuth 2.0 consent screen URL."""
    from urllib.parse import urlencode
    params = urlencode({
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": f"{settings.FRONTEND_URL}/auth/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    })
    return f"https://accounts.google.com/o/oauth2/v2/auth?{params}"
