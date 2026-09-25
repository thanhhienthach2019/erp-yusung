import { OrderItem, ProductionPlanItem, ShippingItem, IpProductionDailyRecord, STANDARD_SIZES } from '../types/erp';

// Helper to generate sample size distribution
const createSizeDistribution = (baseQty: number, activeSizes: string[]): { [size: string]: number } => {
  const result: { [size: string]: number } = {};
  STANDARD_SIZES.forEach(s => {
    if (activeSizes.includes(s)) {
      result[s] = Math.round(baseQty * (0.8 + Math.random() * 0.4));
    } else {
      result[s] = 0;
    }
  });
  return result;
};

const sumSizes = (sizes: { [size: string]: number }): number => {
  return Object.values(sizes).reduce((acc, curr) => acc + curr, 0);
};

// 1. Initial Orders (ORDER_LIST)
const order1Sizes = createSizeDistribution(250, ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10']);
const order2Sizes = createSizeDistribution(180, ['4', '4.5', '5', '5.5', '6', '6.5', '7']);
const order3Sizes = createSizeDistribution(320, ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11']);
const order4Sizes = createSizeDistribution(150, ['8', '8.5', '9', '9.5', '10', '11']);

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ORD-001',
    orderCode: 'PO-2026-NK089',
    customerPo: 'PO-NIKE-450912',
    customerName: 'NIKE GLOBAL',
    modelCode: 'AIR-MAX-2026',
    pantoneCode: '19-4052 TCX (Classic Blue)',
    orderType: 'PROD',
    division: 'IP 1-15',
    stage: 'PRD',
    planningCode: 'PLN-2026-001',
    fixedEtd: '2026-10-15',
    orderDate: '2026-09-01',
    period: '2026-09',
    sizes: order1Sizes,
    totalQty: sumSizes(order1Sizes),
    shippedQty: 1200,
    remainQty: sumSizes(order1Sizes) - 1200,
  },
  {
    id: 'ORD-002',
    orderCode: 'PO-2026-AD104',
    customerPo: 'PO-ADIDAS-88910',
    customerName: 'ADIDAS GROUP',
    modelCode: 'ULTRA-BOOST-V5',
    pantoneCode: '11-0601 TCX (Bright White)',
    orderType: 'PROD',
    division: 'IP 1-15',
    stage: 'PRD',
    planningCode: 'PLN-2026-002',
    fixedEtd: '2026-10-20',
    orderDate: '2026-09-05',
    period: '2026-09',
    sizes: order2Sizes,
    totalQty: sumSizes(order2Sizes),
    shippedQty: 800,
    remainQty: sumSizes(order2Sizes) - 800,
  },
  {
    id: 'ORD-003',
    orderCode: 'PO-2026-PM055',
    customerPo: 'PO-PUMA-33120',
    customerName: 'PUMA SE',
    modelCode: 'NITRO-RUNNER',
    pantoneCode: '19-0303 TCX (Jet Black)',
    orderType: 'PROD',
    division: 'IP 1-15',
    stage: 'PRD',
    planningCode: 'PLN-2026-003',
    fixedEtd: '2026-11-05',
    orderDate: '2026-09-10',
    period: '2026-09',
    sizes: order3Sizes,
    totalQty: sumSizes(order3Sizes),
    shippedQty: 500,
    remainQty: sumSizes(order3Sizes) - 500,
  },
  {
    id: 'ORD-004',
    orderCode: 'PO-2026-NB772',
    customerPo: 'PO-NB-99014',
    customerName: 'NEW BALANCE',
    modelCode: 'NB-990-V6',
    pantoneCode: '17-1502 TCX (Cloud Gray)',
    orderType: 'SAMPLE',
    division: 'IP 1-15',
    stage: 'CLS',
    planningCode: 'PLN-2026-004',
    fixedEtd: '2026-09-28',
    orderDate: '2026-09-12',
    period: '2026-09',
    sizes: order4Sizes,
    totalQty: sumSizes(order4Sizes),
    shippedQty: sumSizes(order4Sizes),
    remainQty: 0,
  },
];

// 2. Initial Production Plans (IP_PRODUCTION_PLAN / Tờ gạch)
export const INITIAL_PLANS: ProductionPlanItem[] = [
  {
    id: 'PLN-001',
    scheduleDate: '2026-09-25',
    planningCode: 'PLN-2026-001',
    division: 'IP 1-15',
    modelCode: 'AIR-MAX-2026',
    pantoneCode: '19-4052 TCX',
    customerName: 'NIKE GLOBAL',
    sizes: order1Sizes,
    targetQty: 2200,
    producedQty: 1850,
    remainQty: 350,
    stage: 'PRD',
    status: 'InProgress',
  },
  {
    id: 'PLN-002',
    scheduleDate: '2026-09-25',
    planningCode: 'PLN-2026-002',
    division: 'IP 1-15',
    modelCode: 'ULTRA-BOOST-V5',
    pantoneCode: '11-0601 TCX',
    customerName: 'ADIDAS GROUP',
    sizes: order2Sizes,
    targetQty: 1250,
    producedQty: 950,
    remainQty: 300,
    stage: 'PRD',
    status: 'InProgress',
  },
  {
    id: 'PLN-003',
    scheduleDate: '2026-09-26',
    planningCode: 'PLN-2026-003',
    division: 'IP 1-15',
    modelCode: 'NITRO-RUNNER',
    pantoneCode: '19-0303 TCX',
    customerName: 'PUMA SE',
    sizes: order3Sizes,
    targetQty: 2500,
    producedQty: 600,
    remainQty: 1900,
    stage: 'PRD',
    status: 'InProgress',
  },
];

// 3. Initial Shipping Records (SHIPPED_LIST)
export const INITIAL_SHIPPING: ShippingItem[] = [
  {
    id: 'SHP-001',
    shippingCode: 'XK-2026-09-001',
    customerPo: 'PO-NIKE-450912',
    customerName: 'NIKE GLOBAL',
    modelCode: 'AIR-MAX-2026',
    pantoneCode: '19-4052 TCX',
    planningCode: 'PLN-2026-001',
    shippingDate: '2026-09-20',
    sizes: createSizeDistribution(80, ['6', '6.5', '7', '7.5', '8']),
    totalQty: 600,
    status: 'Delivered',
  },
  {
    id: 'SHP-002',
    shippingCode: 'XK-2026-09-002',
    customerPo: 'PO-NIKE-450912',
    customerName: 'NIKE GLOBAL',
    modelCode: 'AIR-MAX-2026',
    pantoneCode: '19-4052 TCX',
    planningCode: 'PLN-2026-001',
    shippingDate: '2026-09-24',
    sizes: createSizeDistribution(80, ['8', '8.5', '9', '9.5', '10']),
    totalQty: 600,
    status: 'Shipped',
  },
  {
    id: 'SHP-003',
    shippingCode: 'XK-2026-09-003',
    customerPo: 'PO-ADIDAS-88910',
    customerName: 'ADIDAS GROUP',
    modelCode: 'ULTRA-BOOST-V5',
    pantoneCode: '11-0601 TCX',
    planningCode: 'PLN-2026-002',
    shippingDate: '2026-09-22',
    sizes: createSizeDistribution(100, ['4', '4.5', '5', '5.5']),
    totalQty: 800,
    status: 'Delivered',
  },
];

// 4. Initial IP Production Daily Records (Ca A & Ca B)
export const INITIAL_IP_PRODUCTION: IpProductionDailyRecord[] = [
  {
    id: 'IP-REC-001',
    modelCode: 'AIR-MAX-2026',
    planningCode: 'PLN-2026-001',
    productDate: '2026-09-24',
    shift: 'Ca A',
    sizes: createSizeDistribution(50, ['6', '6.5', '7', '7.5', '8', '8.5', '9']),
    totalQty: 420,
    defectQty: 3,
    loggedBy: 'Trần Văn Hưng (Tổ Trưởng Ca A)',
  },
  {
    id: 'IP-REC-002',
    modelCode: 'AIR-MAX-2026',
    planningCode: 'PLN-2026-001',
    productDate: '2026-09-24',
    shift: 'Ca B',
    sizes: createSizeDistribution(48, ['6', '6.5', '7', '7.5', '8', '8.5', '9']),
    totalQty: 410,
    defectQty: 2,
    loggedBy: 'Lê Hoàng Nam (Tổ Trưởng Ca B)',
  },
  {
    id: 'IP-REC-003',
    modelCode: 'ULTRA-BOOST-V5',
    planningCode: 'PLN-2026-002',
    productDate: '2026-09-24',
    shift: 'Ca A',
    sizes: createSizeDistribution(45, ['4', '4.5', '5', '5.5', '6']),
    totalQty: 310,
    defectQty: 1,
    loggedBy: 'Nguyễn Văn Đức (Tổ Trưởng Ca A)',
  },
];
