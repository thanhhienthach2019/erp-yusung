import asyncio
import json
import aio_pika
from datetime import datetime, timezone
from sqlalchemy.future import select
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.production import BarcodeLog

async def process_scan_message(message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            payload = json.loads(message.body.decode())
            barcode_id = payload.get("barcode_id")
            scanned_by = payload.get("scanned_by", "Operator")
            
            if barcode_id:
                async with AsyncSessionLocal() as db:
                    result = await db.execute(select(BarcodeLog).where(BarcodeLog.barcode_id == barcode_id))
                    b_log = result.scalars().first()
                    if b_log:
                        b_log.status = "Scanned"
                        b_log.scanned_at = datetime.now(timezone.utc)
                        b_log.scanned_by = scanned_by
                        await db.commit()
                        print(f"[RabbitMQ Worker] Successfully processed scan for {barcode_id}")
        except Exception as e:
            print(f"[RabbitMQ Worker] Error processing message: {e}")

async def start_scan_consumer():
    """
    Background worker lắng nghe hàng đợi RabbitMQ erp_barcode_scans
    """
    while True:
        try:
            connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
            async with connection:
                channel = await connection.channel()
                await channel.set_qos(prefetch_count=20)
                queue = await channel.declare_queue("erp_barcode_scans", durable=True)
                print("[RabbitMQ Worker] Waiting for barcode scan messages...")
                await queue.consume(process_scan_message)
                await asyncio.Future() # run forever
        except Exception as e:
            print(f"[RabbitMQ Worker] Connection error: {e}. Retrying in 5s...")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(start_scan_consumer())
