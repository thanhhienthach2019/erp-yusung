// 29 Standard Shoe Sizes: 1, 1.5, 2, ..., 15
export const STANDARD_SIZES: string[] = [
  '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5',
  '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5',
  '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15'
];

export interface SizeBreakdown {
  [size: string]: number;
}

export interface OrderItem {
  id: string;
  orderCode: string;
  customerPo: string;
  customerName: string;
  modelCode: string;
  pantoneCode: string;
  orderType: string; // 'PROD', 'SAMPLE', 'LOSS'
  separator?: string;
  division: string; // 'IP 1-15', 'SD 160-300'
  stage: 'PRD' | 'CLS';
  planningCode: string;
  fixedEtd: string; // YYYY-MM-DD
  orderDate: string; // YYYY-MM-DD
  period: string; // YYYY-MM
  sizes: SizeBreakdown;
  totalQty: number;
  shippedQty: number;
  remainQty: number;
}

export interface ShippingItem {
  id: string;
  shippingCode: string;
  customerPo: string;
  customerName: string;
  modelCode: string;
  pantoneCode: string;
  planningCode: string;
  shippingDate: string;
  sizes: SizeBreakdown;
  totalQty: number;
  status: 'Draft' | 'Shipped' | 'Delivered';
}

export interface ProductionPlanItem {
  id: string;
  scheduleDate: string;
  planningCode: string;
  division: string;
  modelCode: string;
  pantoneCode: string;
  customerName: string;
  sizes: SizeBreakdown;
  targetQty: number;
  producedQty: number;
  remainQty: number;
  stage: 'PRD' | 'CLS';
  status: 'Pending' | 'InProgress' | 'Completed';
}

export interface IpProductionDailyRecord {
  id: string;
  modelCode: string;
  planningCode: string;
  productDate: string;
  shift: 'Ca A' | 'Ca B';
  sizes: SizeBreakdown;
  totalQty: number;
  defectQty: number;
  loggedBy: string;
}

export interface OrderBalanceRow {
  key: string;
  customerPo: string;
  customerName: string;
  modelCode: string;
  pantoneCode: string;
  planningCode: string;
  orderType: string;
  fixedEtd: string;
  orderTotal: number;
  shippedTotal: number;
  balanceTotal: number;
  completionRate: number; // 0 - 100%
  orderSizes: SizeBreakdown;
  shippedSizes: SizeBreakdown;
  balanceSizes: SizeBreakdown;
}
