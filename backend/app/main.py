from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import create_database_pool, init_database
from app.core.logging import configure_logging

settings = get_settings()
configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_pool = await create_database_pool(settings)
    await init_database(app.state.db_pool)
    yield
    await app.state.db_pool.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
