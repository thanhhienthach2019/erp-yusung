from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.models.order import Order, ShippingList

router = APIRouter(prefix="/orders", tags=["Orders & Balance"])

@router.get("/")
async def get_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(40, ge=10, le=200),
    search: Optional[str] = None,
    customer: Optional[str] = None,
    order_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lấy danh sách đơn hàng (ORDER_LIST) kèm 29 kích thước chuẩn"""
    stmt = select(Order).order_by(Order.id.desc())
    if customer and customer != "ALL":
        stmt = stmt.where(Order.customer_name == customer)
    if order_type and order_type != "ALL":
        stmt = stmt.where(Order.order_type == order_type)
    
    result = await db.execute(stmt)
    orders = result.scalars().all()

    if search:
        s = search.lower()
        orders = [
            o for o in orders
            if s in o.order_code.lower()
            or (o.customer_po and s in o.customer_po.lower())
            or s in o.model_code.lower()
            or s in o.pantone_code.lower()
            or s in o.planning_code.lower()
        ]

    total_rows = len(orders)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = orders[start:end]

    return {
        "status": True,
        "data": {
            "total_rows": total_rows,
            "page": page,
            "page_size": page_size,
            "items": [
                {
                    "id": o.id,
                    "order_code": o.order_code,
                    "customer_po": o.customer_po,
                    "customer_name": o.customer_name,
                    "model_code": o.model_code,
                    "pantone_code": o.pantone_code,
                    "order_type": o.order_type,
                    "division": o.division,
                    "stage": o.stage,
                    "planning_code": o.planning_code,
                    "fixed_etd": o.fixed_etd,
                    "sizes_breakdown": o.sizes_breakdown,
                    "total_qty": o.total_qty,
                    "shipped_qty": o.shipped_qty,
                    "remain_qty": o.remain_qty,
                    "status": o.status
                }
                for o in paginated
            ]
        }
    }

@router.get("/balance")
async def get_order_balance(
    view_mode: str = Query("item"), # item, po, planning
    db: AsyncSession = Depends(get_db)
):
    """Báo cáo cân đối đơn hàng & Số lượng còn lại (Order Balance)"""
    stmt_orders = select(Order).where(Order.order_type != "LOSS")
    res_orders = await db.execute(stmt_orders)
    orders = res_orders.scalars().all()

    stmt_ship = select(ShippingList)
    res_ship = await db.execute(stmt_ship)
    shippings = res_ship.scalars().all()

    total_order = sum(o.total_qty for o in orders)
    total_shipped = sum(s.total_qty for s in shippings)
    total_balance = max(0, total_order - total_shipped)
    completion_rate = round((total_shipped / total_order * 100), 1) if total_order > 0 else 0

    return {
        "status": True,
        "summary": {
            "total_order": total_order,
            "total_shipped": total_shipped,
            "total_balance": total_balance,
            "completion_rate": completion_rate,
        },
        "view_mode": view_mode,
        "items": [
            {
                "customer_po": o.customer_po or o.order_code,
                "customer_name": o.customer_name,
                "model_code": o.model_code,
                "pantone_code": o.pantone_code,
                "order_total": o.total_qty,
                "shipped_total": o.shipped_qty,
                "balance_total": o.remain_qty,
                "sizes": o.sizes_breakdown,
            }
            for o in orders
        ]
    }

@router.get("/shipping")
async def get_shipping_list(db: AsyncSession = Depends(get_db)):
    """Danh sách xuất hàng (SHIPPING_LIST)"""
    stmt = select(ShippingList).order_by(ShippingList.shipping_date.desc())
    res = await db.execute(stmt)
    records = res.scalars().all()

    return {
        "status": True,
        "items": [
            {
                "id": r.id,
                "shipping_code": r.shipping_code,
                "customer_po": r.customer_po,
                "customer_name": r.customer_name,
                "model_code": r.model_code,
                "pantone_code": r.pantone_code,
                "shipping_date": str(r.shipping_date),
                "total_qty": r.total_qty,
                "sizes": r.sizes_breakdown,
                "status": r.status,
            }
            for r in records
        ]
    }
