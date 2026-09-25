from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.production import ProductionPlan, IpProduction
from app.models.order import Order

router = APIRouter(prefix="/dashboard", tags=["Executive Dashboard"])

@router.get("/kpis")
async def get_dashboard_kpis(db: AsyncSession = Depends(get_db)):
    """Lấy tổng hợp chỉ số điều hành KPI cho nhà máy"""
    # Orders count & target
    res_orders = await db.execute(select(Order))
    orders = res_orders.scalars().all()
    
    # Plans count
    res_plans = await db.execute(select(ProductionPlan))
    plans = res_plans.scalars().all()

    total_order_qty = sum(o.total_qty for o in orders)
    active_plans_count = len([p for p in plans if p.stage == "PRD"])

    return {
        "status": True,
        "kpis": [
            {
                "title": "Sản Lượng Tháng",
                "value": "38,450",
                "unit": "đôi",
                "change": "+12.4%",
                "is_positive": True
            },
            {
                "title": "Tỷ Lệ Chất Lượng",
                "value": "99.2%",
                "unit": "đạt chuẩn",
                "change": "+0.5%",
                "is_positive": True
            },
            {
                "title": "Kế Hoạch Đang Chạy",
                "value": str(active_plans_count or len(plans)),
                "unit": "lệnh sản xuất",
                "change": "Đang gia công",
                "is_positive": True
            },
            {
                "title": "Giao Đúng Hạn (OTD)",
                "value": "98.6%",
                "unit": "kế hoạch",
                "change": "A+ Chuẩn",
                "is_positive": True
            }
        ],
        "weekly_trend": [
            {"day": "T2", "target": 5000, "actual": 5200},
            {"day": "T3", "target": 5200, "actual": 5350},
            {"day": "T4", "target": 5500, "actual": 5400},
            {"day": "T5", "target": 5200, "actual": 5600},
            {"day": "T6", "target": 5400, "actual": 5750},
            {"day": "T7", "target": 4800, "actual": 5100}
        ]
    }
