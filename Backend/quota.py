from db import supabase_admin
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException

FREE_LIMIT = 5

def get_or_create_usage(user_id: str):
    result = supabase_admin.table("user_usage").select("*").eq("user_id", user_id).execute()
    
    if len(result.data) == 0:
        # first time this user is checked — create their row
        new_row = supabase_admin.table("user_usage").insert({"user_id": user_id}).execute()
        return new_row.data[0]
    
    return result.data[0]



def check_and_use_quota(user_id: str):
    usage = get_or_create_usage(user_id)

    now = datetime.now(timezone.utc)
    reset_at = datetime.fromisoformat(usage["reset_at"])

    if now >= reset_at:
        usage = supabase_admin.table("user_usage").update({
            "usage_count": 0,
            "reset_at": (now + timedelta(hours=24)).isoformat()
        }).eq("user_id", user_id).execute().data[0]

    limit = None if usage["plan"] == "pro" else FREE_LIMIT

    if limit is not None and usage["usage_count"] >= limit:
        raise HTTPException(
            status_code=403,
            detail={"message": "Free limit reached", "reset_at": usage["reset_at"]}
        )

    updated = supabase_admin.table("user_usage").update({
        "usage_count": usage["usage_count"] + 1
    }).eq("user_id", user_id).execute()

    return updated.data[0]



#real time status update:
def get_usage_status(user_id: str):
    usage = get_or_create_usage(user_id)

    now = datetime.now(timezone.utc)
    reset_at = datetime.fromisoformat(usage["reset_at"])

    if now >= reset_at:
        usage = supabase_admin.table("user_usage").update({
            "usage_count": 0,
            "reset_at": (now + timedelta(hours=1)).isoformat()
        }).eq("user_id", user_id).execute().data[0]

    return usage









