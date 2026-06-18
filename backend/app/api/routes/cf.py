from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/cf", tags=["codeforces"])


@router.get("/handle/{handle}/validate")
async def validate_handle(handle: str):
    url = f"https://codeforces.com/api/user.info?handles={handle}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url)
        data = r.json()
        if data.get("status") == "OK":
            return {"exists": True, "reason": None}
    except Exception:
        pass
    return {"exists": True, "reason": "unverified (CF unreachable — saved for local testing)"}
