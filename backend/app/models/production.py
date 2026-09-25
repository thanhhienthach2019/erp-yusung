from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, Index
from sqlalchemy.sql import func
from app.core.database import Base

class ProductionPlan(Base):
    """Bảng Kế hoạch sản xuất tờ gạch (Tương ứng IP_PRODUCTION_PLAN)"""
    __tablename__ = "production_plans"

    id = Column(Integer, primary_key=True, index=True)
    schedule_date = Column(Date, index=True, nullable=False) # Ngày tờ gạch
    planning_code = Column(String(50), index=True, nullable=False)
    division = Column(String(50), index=True, nullable=True) # IP 1-15, SD 160-300
    model_code = Column(String(50), index=True, nullable=False)
    pantone_code = Column(String(50), index=True, nullable=False)
    customer_name = Column(String(100), nullable=True)
    size = Column(String(20), nullable=False)
    target_qty = Column(Integer, default=0, nullable=False) # Kế hoạch
    produced_qty = Column(Integer, default=0, nullable=False) # Đã làm
    remain_qty = Column(Integer, default=0, nullable=False) # Còn lại
    sizes_breakdown = Column(JSON, default=dict) # 29 standard sizes JSON
    fixed_etd = Column(String(50), nullable=True)
    stage = Column(String(20), default="PRD") # PRD, CLS
    status = Column(String(30), default="Pending") # Pending, InProgress, Completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("idx_plan_date_code", "schedule_date", "planning_code"),
    )

class BarcodeLog(Base):
    """Bảng Lưu trữ tem mã vạch (Tương ứng IP_BARCODE_LOG)"""
    __tablename__ = "barcode_logs"

    id = Column(Integer, primary_key=True, index=True)
    barcode_id = Column(String(50), unique=True, index=True, nullable=False) # BC-XXXXXX
    barcode_payload = Column(String(255), index=True, nullable=False) # IP|PCODE|SIZE|SHIFT|DATE|QTY|ID
    planning_code = Column(String(50), index=True, nullable=False)
    division = Column(String(50), nullable=True)
    customer_name = Column(String(100), nullable=True)
    model_code = Column(String(50), index=True, nullable=False)
    pantone_code = Column(String(50), index=True, nullable=False)
    size = Column(String(20), nullable=False)
    produced_qty = Column(Integer, default=1, nullable=False) # Số đôi trong tem
    shift = Column(String(20), default="Ca A") # Ca A, Ca B
    product_date = Column(Date, index=True, nullable=False) # Ngày sản xuất
    fixed_etd = Column(String(50), nullable=True)
    status = Column(String(30), default="Created", index=True) # Created, Scanned, Committed
    created_by = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    scanned_at = Column(DateTime(timezone=True), nullable=True)
    scanned_by = Column(String(50), nullable=True)

class IpProduction(Base):
    """Bảng Ghi nhận sản xuất IP (Tương ứng IP_PRODUCTION)"""
    __tablename__ = "ip_productions"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(String(50), unique=True, index=True, nullable=False)
    division = Column(String(50), nullable=True)
    planning_code = Column(String(50), index=True, nullable=False)
    model_code = Column(String(50), index=True, nullable=False)
    pantone_code = Column(String(50), index=True, nullable=False)
    customer_name = Column(String(100), nullable=True)
    size = Column(String(20), nullable=False)
    shift = Column(String(20), nullable=False) # Ca A, Ca B
    product_date = Column(Date, index=True, nullable=False)
    produced_qty = Column(Integer, default=0, nullable=False)
    defect_qty = Column(Integer, default=0, nullable=False)
    fixed_etd = Column(String(50), nullable=True)
    status = Column(String(30), default="Approved")
    created_by = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Mapping(Base):
    """Bảng Mapping Model, Pantone, Khách hàng, Division"""
    __tablename__ = "mappings"

    id = Column(Integer, primary_key=True, index=True)
    model_code = Column(String(50), index=True, nullable=False)
    pantone_code = Column(String(50), index=True, nullable=False)
    customer_name = Column(String(100), nullable=True)
    division = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_map_model_pantone", "model_code", "pantone_code"),
    )
