from supabase import Client, create_client

from config import (
    USE_SUPABASE,
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
)


supabase: Client | None = None


if USE_SUPABASE:
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required"
        )

    supabase = create_client(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
    )