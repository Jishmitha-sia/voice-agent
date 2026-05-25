from fastapi import APIRouter

from app.modules.auth.routes import router as auth_router
from app.modules.livekit.routes import router as livekit_router
from app.modules.realtime.routes import router as realtime_router
from app.modules.system.routes import router as system_router

api_router = APIRouter()
api_router.include_router(system_router, tags=["system"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(livekit_router, prefix="/livekit", tags=["livekit"])
api_router.include_router(realtime_router, prefix="/realtime", tags=["realtime"])
