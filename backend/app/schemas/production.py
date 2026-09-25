from typing import Optional, List
from pydantic import BaseModel
from datetime import date, datetime

class ProductionPlanItem(BaseModel):
    id: int
    schedule_date: date
    planning_code: str
    division: Optional[str] = None
    model_code: str
    pantone_code: str
    customer_name: Optional[str] = None
    size: str
    target_qty: int
    produced_qty: int
    remain_qty: int
    fixed_etd: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

class ProductionPlanCreate(BaseModel):
    schedule_date: date
    planning_code: str
    division: Optional[str] = "IP"
    model_code: str
    pantone_code: str
    customer_name: Optional[str] = None
    size: str
    target_qty: int
    fixed_etd: Optional[str] = None

class IpProductionCreate(BaseModel):
    division: Optional[str] = "IP"
    planning_code: str
    model_code: str
    pantone_code: str
    customer_name: Optional[str] = None
    size: str
    shift: str
    product_date: date
    produced_qty: int
    defect_qty: int = 0
    fixed_etd: Optional[str] = None
    created_by: Optional[str] = None

class MappingItem(BaseModel):
    model_code: str
    pantone_code: str
    customer_name: Optional[str] = None
    division: Optional[str] = None

    class Config:
        from_attributes = True
