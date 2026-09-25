from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.core.config import settings
from app.core.database import engine, Base
from app.core.redis import redis_service
from app.core.rabbitmq import rabbitmq_service
from app.api import auth, barcode, planning, websocket, orders, dashboard
from app.api.websocket import start_redis_listener

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Khởi tạo Database Tables nếu chưa có
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("PostgreSQL tables checked/created successfully.")
    except Exception as e:
        print(f"Warning: Could not connect to PostgreSQL ({e}). Please ensure Postgres is running.")

    # 2. Kết nối Redis & Khởi động tiến trình lắng nghe Pub/Sub
    try:
        await redis_service.connect()
        asyncio.create_task(start_redis_listener())
        print("Connected to Redis successfully.")
    except Exception as e:
        print(f"Warning: Redis connection failed ({e}).")

    # 3. Kết nối RabbitMQ
    try:
        await rabbitmq_service.connect()
    except Exception as e:
        print(f"Warning: RabbitMQ connection failed ({e}).")

    yield

    # Cleanup resources on shutdown
    await redis_service.close()
    await rabbitmq_service.close()
    await engine.dispose()
    print("Application shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(barcode.router, prefix=f"{settings.API_V1_STR}/barcode", tags=["Barcode Production"])
app.include_router(planning.router, prefix=f"{settings.API_V1_STR}/planning", tags=["Production Planning"])
app.include_router(orders.router, prefix=f"{settings.API_V1_STR}", tags=["Orders & Balance"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}", tags=["Executive Dashboard"])
app.include_router(websocket.router, tags=["Realtime WebSocket"])

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "Online",
        "docs": f"{settings.API_V1_STR}/docs",
        "version": "2.0.0"
    }
