import os

from dotenv import load_dotenv


load_dotenv()


# ============================================================
# SECURITY CONFIG
# ============================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "MIS3032-DEMO-SECRET-CHANGE-IN-PRODUCTION",
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ============================================================
# SUPABASE CONFIG
# ============================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")

SUPABASE_PUBLISHABLE_KEY = os.getenv(
    "SUPABASE_PUBLISHABLE_KEY"
)

# Giữ mặc định giống main.py cũ
USE_SUPABASE = (
    os.getenv("USE_SUPABASE", "true").lower() == "true"
)