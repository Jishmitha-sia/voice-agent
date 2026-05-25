from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class AuthStatusResponse(BaseModel):
    enabled: bool
    providers: list[str]


@router.get("/status")
async def auth_status() -> AuthStatusResponse:
    return AuthStatusResponse(enabled=False, providers=["email", "google"])
