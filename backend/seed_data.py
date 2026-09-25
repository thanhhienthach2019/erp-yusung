import asyncio
from datetime import date
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.production import ProductionPlan, Mapping

async def seed():
    print("Connecting to database and creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Seed Admin User
        admin_user = User(
            username="admin",
            full_name="Quản Trị Viên",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            department="IT"
        )
        db.add(admin_user)

        # 2. Seed Mappings
        mappings = [
            Mapping(model_code="ON093", pantone_code="19-4007 TPG", customer_name="NIKE", division="IP 01"),
            Mapping(model_code="ON093", pantone_code="11-0601 TPG", customer_name="NIKE", division="IP 01"),
            Mapping(model_code="AD204", pantone_code="18-1662 TPG", customer_name="ADIDAS", division="IP 02"),
            Mapping(model_code="PU501", pantone_code="19-3911 TPG", customer_name="PUMA", division="SD 160"),
        ]
        db.add_all(mappings)

        # 3. Seed Production Plans (Tờ gạch mẫu)
        today = date.today()
        plans = [
            ProductionPlan(
                schedule_date=today,
                planning_code="PLAN-ON093-01",
                division="IP 01",
                model_code="ON093",
                pantone_code="19-4007 TPG",
                customer_name="NIKE",
                size="40",
                target_qty=120,
                produced_qty=20,
                remain_qty=100,
                fixed_etd="2026-10-15"
            ),
            ProductionPlan(
                schedule_date=today,
                planning_code="PLAN-ON093-01",
                division="IP 01",
                model_code="ON093",
                pantone_code="19-4007 TPG",
                customer_name="NIKE",
                size="41",
                target_qty=150,
                produced_qty=30,
                remain_qty=120,
                fixed_etd="2026-10-15"
            ),
            ProductionPlan(
                schedule_date=today,
                planning_code="PLAN-ON093-01",
                division="IP 01",
                model_code="ON093",
                pantone_code="19-4007 TPG",
                customer_name="NIKE",
                size="42",
                target_qty=100,
                produced_qty=10,
                remain_qty=90,
                fixed_etd="2026-10-15"
            ),
            ProductionPlan(
                schedule_date=today,
                planning_code="PLAN-AD204-02",
                division="IP 02",
                model_code="AD204",
                pantone_code="18-1662 TPG",
                customer_name="ADIDAS",
                size="39",
                target_qty=80,
                produced_qty=0,
                remain_qty=80,
                fixed_etd="2026-10-20"
            )
        ]
        db.add_all(plans)

        await db.commit()
        print("Seed data completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
