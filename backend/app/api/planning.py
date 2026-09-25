from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import distinct, and_
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.models.production import ProductionPlan, Mapping
from app.schemas.production import ProductionPlanItem, ProductionPlanCreate, MappingItem

router = APIRouter()

@router.get("/dates", response_model=List[str])
async def get_schedule_dates(db: AsyncSession = Depends(get_db)):
    """
    Lấy danh sách các ngày tờ gạch có sẵn trong hệ thống (sắp xếp giảm dần)
    """
    res = await db.execute(
        select(distinct(ProductionPlan.schedule_date)).order_by(ProductionPlan.schedule_date.desc())
    )
    dates = res.scalars().all()
    return [d.strftime("%Y-%m-%d") for d in dates if d]

@router.get("/plans", response_model=List[ProductionPlanItem])
async def get_production_plans(
    schedule_date: Optional[date] = None,
    remain_only: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """
    Lấy kế hoạch sản xuất:
    - Nếu có schedule_date: lấy theo ngày tờ gạch
    - Nếu remain_only: lấy tất cả các đơn còn remain_qty > 0 (dành cho tạo tem ngoài tờ gạch)
    """
    query = select(ProductionPlan)
    conditions = []

    if schedule_date:
        conditions.append(ProductionPlan.schedule_date == schedule_date)
    if remain_only:
        conditions.append(ProductionPlan.remain_qty > 0)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(ProductionPlan.planning_code, ProductionPlan.size)
    res = await db.execute(query)
    return res.scalars().all()

@router.get("/mappings", response_model=List[MappingItem])
async def get_mappings(db: AsyncSession = Depends(get_db)):
    """
    Lấy danh sách mapping Model Code, Pantone Code, Khách hàng, Division
    """
    res = await db.execute(select(Mapping).order_by(Mapping.model_code))
    return res.scalars().all()

@router.post("/plans", response_model=ProductionPlanItem)
async def create_plan(item: ProductionPlanCreate, db: AsyncSession = Depends(get_db)):
    """
    Tạo một mục kế hoạch sản xuất mới
    """
    plan = ProductionPlan(
        schedule_date=item.schedule_date,
        planning_code=item.planning_code.strip(),
        division=item.division,
        model_code=item.model_code.strip(),
        pantone_code=item.pantone_code.strip(),
        customer_name=item.customer_name,
        size=item.size.strip(),
        target_qty=item.target_qty,
        produced_qty=0,
        remain_qty=item.target_qty,
        fixed_etd=item.fixed_etd,
        status="Pending"
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan
