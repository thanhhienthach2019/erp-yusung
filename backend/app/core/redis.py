import redis.asyncio as aioredis
from typing import Optional
import json
from app.core.config import settings

class RedisService:
    def __init__(self):
        self.client: Optional[aioredis.Redis] = None

    async def connect(self):
        self.client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )

    async def close(self):
        if self.client:
            await self.client.close()

    async def get(self, key: str) -> Optional[str]:
        if not self.client:
            return None
        return await self.client.get(key)

    async def set(self, key: str, value: str, expire: Optional[int] = None) -> bool:
        if not self.client:
            return False
        return await self.client.set(key, value, ex=expire)

    async def check_anti_duplicate(self, barcode: str, expire_seconds: int = 2) -> bool:
        """
        Kiểm tra và ngăn chặn quét trùng lặp mã vạch tức thì bằng cơ chế Atomic Lock (SET NX)
        Trả về True nếu mã hợp lệ (chưa bị quét trong 2 giây vừa qua).
        Trả về False nếu mã vừa mới được quét.
        """
        if not self.client:
            return True
        key = f"anti_dup:{barcode.strip()}"
        # setnx returns True if key was set, False if it already existed
        is_new = await self.client.set(key, "1", ex=expire_seconds, nx=True)
        return bool(is_new)

    async def publish(self, channel: str, message: dict):
        """
        Phát sóng tin nhắn Realtime qua Redis Pub/Sub đến các WebSocket clients
        """
        if not self.client:
            return
        await self.client.publish(channel, json.dumps(message, ensure_ascii=False))

redis_service = RedisService()
