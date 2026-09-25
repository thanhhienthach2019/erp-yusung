from typing import Optional, List
from pydantic import BaseModel
from datetime import date, datetime

class GenerateBarcodeRequest(BaseModel):
    planning_code: str
    schedule_date: Optional[date] = None
    division: Optional[str] = "IP"
    model_code: str
    pantone_code: str
    customer_name: Optional[str] = None
    size: str
    shift: str = "Ca A"
    product_date: date
    target_pairs: int
    pairs_per_label: int = 1
    fixed_etd: Optional[str] = None
    is_outside_plan: bool = False

class BarcodeLabelItem(BaseModel):
    barcode_id: str
    barcode_payload: str
    planning_code: str
    division: str
    customer_name: str
    model_code: str
    pantone_code: str
    size: str
    produced_qty: int
    shift: str
    product_date: date
    fixed_etd: str
    serial: int
    total_serial: int

    class Config:
        from_attributes = True

class ScanBarcodeRequest(BaseModel):
    raw_barcode: str
    scanned_by: Optional[str] = "Operator"

class ScanBarcodeResponse(BaseModel):
    success: bool
    message: str
    is_duplicate: bool = False
    barcode_id: Optional[str] = None
    planning_code: Optional[str] = None
    division: Optional[str] = None
    model_code: Optional[str] = None
    pantone_code: Optional[str] = None
    customer_name: Optional[str] = None
    size: Optional[str] = None
    shift: Optional[str] = None
    product_date: Optional[date] = None
    produced_qty: int = 0
    fixed_etd: Optional[str] = None

class CommitScanBatchItem(BaseModel):
    planning_code: str
    division: Optional[str] = "IP"
    model_code: str
    pantone_code: str
    customer_name: Optional[str] = "-"
    size: str
    shift: str
    product_date: date
    total_pairs: int
    scanned_count: int
    barcode_ids: List[str]

class CommitScanRequest(BaseModel):
    items: List[CommitScanBatchItem]
    operator_name: Optional[str] = "Operator"

class ReprintFilterRequest(BaseModel):
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    planning_code: Optional[str] = None
    model_code: Optional[str] = None
    status: Optional[str] = None
    limit: int = 200
    offset: int = 0
