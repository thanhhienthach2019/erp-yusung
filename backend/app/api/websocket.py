from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import asyncio
import json
import redis.asyncio as aioredis
from app.core.config import settings

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Nhận tin nhắn từ client (ping/pong, v.v.)
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

async def start_redis_listener():
    """
    Tiến trình nền lắng nghe các kênh Redis Pub/Sub và phát sóng đến tất cả WebSocket clients
    """
    while True:
        try:
            r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            pubsub = r.pubsub()
            await pubsub.subscribe("channel:scans", "channel:production")
            print("WebSocket Redis listener subscribed to channel:scans & channel:production")
            
            async for message in pubsub.listen():
                if message["type"] == "message":
                    channel = message["channel"]
                    payload = message["data"]
                    # Gửi tới tất cả React Native Web/Mobile clients
                    await manager.broadcast(json.dumps({
                        "channel": channel,
                        "data": json.loads(payload) if isinstance(payload, str) else payload
                    }))
        except Exception as e:
            print(f"Redis listener error: {e}. Reconnecting in 5s...")
            await asyncio.sleep(5)
