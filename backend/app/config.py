from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/teamcollabdb"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    FRONTEND_URL: str = "http://localhost:5173"

    # Razorpay Configuration
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    RAZORPAY_INR_STARTER_PLAN_ID: str = ""
    RAZORPAY_INR_PRO_PLAN_ID: str = ""
    RAZORPAY_USD_STARTER_PLAN_ID: str = ""
    RAZORPAY_USD_PRO_PLAN_ID: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
