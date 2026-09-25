from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, and_, or_
from typing import List, Optional
from datetime import datetime, date, timezone
import math
import uuid

from app.core.database import get_db
from app.core.redis import redis_service
from app.core.rabbitmq import rabbitmq_service
from app.models.production import BarcodeLog, ProductionPlan, IpProduction
from app.schemas.barcode import (
    GenerateBarcodeRequest, BarcodeLabelItem,
    ScanBarcodeRequest, ScanBarcodeResponse,
    CommitScanRequest, ReprintFilterRequest
)

router = APIRouter()

@router.post("/generate", response_model=List[BarcodeLabelItem])
async def generate_barcode_labels(req: GenerateBarcodeRequest, db: AsyncSession = Depends(get_db)):
    """
    Sinh danh sách tem mã vạch A4 (chuẩn 6 tem/trang) và lưu đồng bộ vào PostgreSQL
    """
    target_pairs = max(1, req.target_pairs)
    pairs_per_label = max(1, req.pairs_per_label)
    total_labels = math.ceil(target_pairs / pairs_per_label)

    # Làm sạch planning_code và division
    p_code = req.planning_code.strip()
    div = req.division.strip() if req.division else "IP"
    if p_code.startswith("IP|"):
        p_code = p_code[3:]
    elif p_code.startswith("SD|"):
        p_code = p_code[3:]

    labels_result: List[BarcodeLabelItem] = []
    db_items: List[BarcodeLog] = []

    now_str = datetime.now().strftime("%Y%m%d%H%M%S")
    remaining_pairs = target_pairs

    for idx in range(total_labels):
        current_qty = min(pairs_per_label, remaining_pairs)
        remaining_pairs -= current_qty

        # Mã định danh tem duy nhất: BC-YYYYMMDDHHMMSS-STT-RANDOM
        rand_suffix = str(uuid.uuid4())[:4].upper()
        barcode_id = f"BC-{now_str}-{idx+1:03d}-{rand_suffix}"
        
        # Định dạng chuẩn: DIVISION|PLANNING_CODE|SIZE|SHIFT|DATE|QTY|BARCODE_ID
        barcode_payload = f"{div}|{p_code}|{req.size}|{req.shift}|{req.product_date}|{current_qty}|{barcode_id}"

        item = BarcodeLabelItem(
            barcode_id=barcode_id,
            barcode_payload=barcode_payload,
            planning_code=p_code,
            division=div,
            customer_name=req.customer_name or "-",
            model_code=req.model_code,
            pantone_code=req.pantone_code,
            size=req.size,
            produced_qty=current_qty,
            shift=req.shift,
            product_date=req.product_date,
            fixed_etd=req.fixed_etd or "-",
            serial=idx + 1,
            total_serial=total_labels
        )
        labels_result.append(item)

        db_log = BarcodeLog(
            barcode_id=barcode_id,
            barcode_payload=barcode_payload,
            planning_code=p_code,
            division=div,
            customer_name=req.customer_name or "-",
            model_code=req.model_code,
            pantone_code=req.pantone_code,
            size=req.size,
            produced_qty=current_qty,
            shift=req.shift,
            product_date=req.product_date,
            fixed_etd=req.fixed_etd or "-",
            status="Created"
        )
        db_items.append(db_log)

    db.add_all(db_items)
    await db.commit()

    return labels_result

@router.post("/scan", response_model=ScanBarcodeResponse)
async def scan_barcode(req: ScanBarcodeRequest):
    """
    Xử lý quét mã vạch: Chống trùng lặp tức thì qua Redis (Atomic Lock) & Đẩy vào RabbitMQ
    """
    raw = req.raw_barcode.strip()
    if not raw:
        return ScanBarcodeResponse(success=False, message="Mã vạch rỗng!")

    # 1. Chống quét trùng lặp trong 2 giây (Atomic lock trên Redis)
    is_allowed = await redis_service.check_anti_duplicate(raw, expire_seconds=2)
    if not is_allowed:
        return ScanBarcodeResponse(
            success=False,
            is_duplicate=True,
            message="Mã vừa được quét trong 2 giây trước! Đã bỏ qua chống quét lặp."
        )

    # 2. Phân tích chuỗi mã vạch
    parts = raw.split("|")
    planning_code = ""
    division = "IP"
    size = ""
    shift = "Ca A"
    product_date = date.today()
    produced_qty = 1
    barcode_id = ""

    if len(parts) >= 7:
        division = parts[0]
        planning_code = parts[1]
        size = parts[2]
        shift = parts[3]
        try:
            product_date = datetime.strptime(parts[4], "%Y-%m-%d").date()
        except Exception:
            product_date = date.today()
        try:
            produced_qty = int(parts[5])
        except Exception:
            produced_qty = 1
        barcode_id = parts[6]
    elif len(parts) == 3:
        planning_code = parts[0]
        size = parts[1]
        try:
            produced_qty = int(parts[2])
        except Exception:
            produced_qty = 1
    else:
        planning_code = raw

    scan_payload = {
        "raw_barcode": raw,
        "barcode_id": barcode_id,
        "planning_code": planning_code,
        "division": division,
        "size": size,
        "shift": shift,
        "product_date": str(product_date),
        "produced_qty": produced_qty,
        "scanned_by": req.scanned_by,
        "scanned_at": datetime.now(timezone.utc).isoformat()
    }

    # 3. Đẩy vào RabbitMQ để xử lý lưu trữ ngầm không nghẽn mạng
    await rabbitmq_service.publish_message("erp_barcode_scans", scan_payload)

    # 4. Phát sóng Realtime qua Redis Pub/Sub để các màn hình khác cập nhật ngay
    await redis_service.publish("channel:scans", scan_payload)

    return ScanBarcodeResponse(
        success=True,
        message="Quét mã thành công!",
        barcode_id=barcode_id,
        planning_code=planning_code,
        division=division,
        size=size,
        shift=shift,
        product_date=product_date,
        produced_qty=produced_qty
    )

@router.post("/commit")
async def commit_scans(req: CommitScanRequest, db: AsyncSession = Depends(get_db)):
    """
    Xác nhận lưu danh sách tem đã quét vào IP_PRODUCTION và cập nhật số đôi còn lại (Remain)
    """
    if not req.items:
        raise HTTPException(status_code=400, detail="Danh sách lưu rỗng!")

    now = datetime.now()
    created_productions = []

    for item in req.items:
        rec_id = f"PROD-{now.strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
        
        prod_record = IpProduction(
            record_id=rec_id,
            division=item.division,
            planning_code=item.planning_code,
            model_code=item.model_code,
            pantone_code=item.pantone_code,
            customer_name=item.customer_name,
            size=item.size,
            shift=item.shift,
            product_date=item.product_date,
            produced_qty=item.total_pairs,
            defect_qty=0,
            status="Approved",
            created_by=req.operator_name
        )
        created_productions.append(prod_record)

        # Cập nhật số lượng trong Kế hoạch sản xuất nếu có
        plan_res = await db.execute(
            select(ProductionPlan).where(
                and_(
                    ProductionPlan.planning_code == item.planning_code,
                    ProductionPlan.size == item.size
                )
            )
        )
        plan = plan_res.scalars().first()
        if plan:
            plan.produced_qty += item.total_pairs
            plan.remain_qty = max(0, plan.target_qty - plan.produced_qty)
            if plan.remain_qty == 0:
                plan.status = "Completed"

        # Cập nhật trạng thái các mã tem tương ứng sang Committed
        if item.barcode_ids:
            barcode_res = await db.execute(
                select(BarcodeLog).where(BarcodeLog.barcode_id.in_(item.barcode_ids))
            )
            for b_log in barcode_res.scalars().all():
                b_log.status = "Committed"
                b_log.scanned_at = now
                b_log.scanned_by = req.operator_name

    db.add_all(created_productions)
    await db.commit()

    # Phát sóng sự kiện Realtime cập nhật số liệu sản xuất
    await redis_service.publish("channel:production", {
        "event": "PRODUCTION_COMMITTED",
        "count": len(created_productions),
        "operator": req.operator_name,
        "timestamp": now.isoformat()
    })

    return {
        "success": True,
        "message": f"Đã ghi nhận thành công {len(created_productions)} nhóm đơn vào IP Sản Xuất!"
    }

@router.get("/history")
async def get_barcode_history(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    planning_code: Optional[str] = None,
    model_code: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(200, le=1000),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Tra cứu lịch sử tem mã vạch để in lại (Reprint)
    """
    query = select(BarcodeLog)
    conditions = []

    if date_from:
        conditions.append(BarcodeLog.product_date >= date_from)
    if date_to:
        conditions.append(BarcodeLog.product_date <= date_to)
    if planning_code:
        conditions.append(BarcodeLog.planning_code.ilike(f"%{planning_code.strip()}%"))
    if model_code:
        conditions.append(BarcodeLog.model_code.ilike(f"%{model_code.strip()}%"))
    if status:
        conditions.append(BarcodeLog.status == status)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(desc(BarcodeLog.created_at)).limit(limit).offset(offset)
    result = await db.execute(query)
    rows = result.scalars().all()

    return [
        {
            "id": r.id,
            "barcodeId": r.barcode_id,
            "barcodePayload": r.barcode_payload,
            "planningCode": r.planning_code,
            "division": r.division,
            "customerName": r.customer_name,
            "modelCode": r.model_code,
            "pantoneCode": r.pantone_code,
            "size": r.size,
            "producedQty": r.produced_qty,
            "shift": r.shift,
            "productDate": str(r.product_date),
            "fixedETD": r.fixed_etd,
            "status": r.status,
            "createdAt": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else ""
        }
        for r in rows
    ]
