from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric
from sqlalchemy.sql import func
from app.core.database import Base

class Order(Base):
    """Bảng Danh sách đơn hàng (ORDER_LIST)"""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(50), index=True, nullable=False)
    planning_code = Column(String(50), index=True, nullable=False)
    customer_name = Column(String(100), nullable=True)
    model_code = Column(String(50), index=True, nullable=False)
    pantone_code = Column(String(50), index=True, nullable=False)
    order_qty = Column(Integer, default=0, nullable=False)
    shipped_qty = Column(Integer, default=0, nullable=False)
    remain_qty = Column(Integer, default=0, nullable=False)
    etd = Column(String(50), nullable=True)
    status = Column(String(30), default="Open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ShippingList(Base):
    """Bảng Xuất hàng (SHIPPING_LIST)"""
    __tablename__ = "shipping_lists"

    id = Column(Integer, primary_key=True, index=True)
    shipping_code = Column(String(50), unique=True, index=True, nullable=False)
    planning_code = Column(String(50), index=True, nullable=False)
    customer_name = Column(String(100), nullable=True)
    model_code = Column(String(50), nullable=False)
    pantone_code = Column(String(50), nullable=False)
    size = Column(String(20), nullable=False)
    shipped_qty = Column(Integer, default=0, nullable=False)
    shipping_date = Column(Date, index=True, nullable=False)
    status = Column(String(30), default="Shipped")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
