import os
import httpx
from jose import jwt
from jose.exceptions import JWTError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_JWKS_URL = os.getenv("SUPABASE_JWKS_URL")

security = HTTPBearer()

_jwks_cache = None

# we get the jwks (json web key set) and cache it means store it in local storage 
async def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            response = await client.get(SUPABASE_JWKS_URL)
            _jwks_cache = response.json()
    return _jwks_cache



async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    jwks = await get_jwks()

    try:
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = key
                break

        if not rsa_key:
            raise HTTPException(status_code=401, detail="Invalid token: key not found")

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256", "ES256"],
            audience="authenticated",
            issuer=f"{SUPABASE_URL}/auth/v1",
        )
        return payload

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")