import aio_pika
import json
from typing import Optional
from app.core.config import settings

class RabbitMQService:
    def __init__(self):
        self.connection: Optional[aio_pika.RobustConnection] = None
        self.channel: Optional[aio_pika.RobustChannel] = None

    async def connect(self):
        try:
            self.connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
            self.channel = await self.connection.channel()
            # Declare core queues
            await self.channel.declare_queue("erp_barcode_scans", durable=True)
            await self.channel.declare_queue("erp_production_sync", durable=True)
            print("Successfully connected to RabbitMQ.")
        except Exception as e:
            print(f"Warning: Could not connect to RabbitMQ ({e}). Running in fallback mode.")

    async def close(self):
        if self.connection and not self.connection.is_closed:
            await self.connection.close()

    async def publish_message(self, queue_name: str, message: dict):
        if not self.channel:
            print(f"RabbitMQ not connected, skipping queue publish for {queue_name}")
            return False
        
        body = json.dumps(message, ensure_ascii=False).encode()
        await self.channel.default_exchange.publish(
            aio_pika.Message(
                body=body,
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            ),
            routing_key=queue_name
        )
        return True

rabbitmq_service = RabbitMQService()
