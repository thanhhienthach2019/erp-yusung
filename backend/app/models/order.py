from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class Order(Base):
    """Bảng Danh sách đơn hàng (ORDER_LIST)"""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(50), index=True, nullable=False)
    customer_po = Column(String(100), index=True, nullable=True)
    customer_name = Column(String(100), nullable=True)
    model_code = Column(String(50), index=True, nullable=False)
    pantone_code = Column(String(50), index=True, nullable=False)
    order_type = Column(String(30), default="PROD") # PROD, SAMPLE, LOSS
    division = Column(String(50), default="IP 1-15")
    stage = Column(String(20), default="PRD") # PRD, CLS
    planning_code = Column(String(50), index=True, nullable=False)
    fixed_etd = Column(String(50), nullable=True)
    order_date = Column(Date, nullable=True)
    period = Column(String(20), nullable=True) # YYYY-MM
    sizes_breakdown = Column(JSON, default=dict) # 29 standard sizes JSON
    total_qty = Column(Integer, default=0, nullable=False)
    shipped_qty = Column(Integer, default=0, nullable=False)
    remain_qty = Column(Integer, default=0, nullable=False)
    status = Column(String(30), default="Open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ShippingList(Base):
    """Bảng Xuất hàng (SHIPPING_LIST)"""
    __tablename__ = "shipping_lists"

    id = Column(Integer, primary_key=True, index=True)
    shipping_code = Column(String(50), unique=True, index=True, nullable=False)
    customer_po = Column(String(100), index=True, nullable=True)
    customer_name = Column(String(100), nullable=True)
    model_code = Column(String(50), nullable=False)
    pantone_code = Column(String(50), nullable=False)
    planning_code = Column(String(50), index=True, nullable=False)
    shipping_date = Column(Date, index=True, nullable=False)
    sizes_breakdown = Column(JSON, default=dict) # 29 standard sizes JSON
    total_qty = Column(Integer, default=0, nullable=False)
    status = Column(String(30), default="Shipped") # Draft, Shipped, Delivered
    created_at = Column(DateTime(timezone=True), server_default=func.now())
