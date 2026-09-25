export type Language = 'vi' | 'en' | 'ko' | 'zh';

export interface Translations {
  [key: string]: {
    vi: string;
    en: string;
    ko: string;
    zh: string;
  };
}

export const dictionary: Translations = {
  // Navigation
  nav_dashboard: { vi: 'Bảng Điều Khiển', en: 'Dashboard', ko: '대시보드', zh: '仪表盘' },
  nav_order_list: { vi: 'Danh Sách Đơn Hàng', en: 'Order List', ko: '주문 목록', zh: '订单列表' },
  nav_order_balance: { vi: 'Cân Đối Đơn Hàng', en: 'Order Balance', ko: '주문 잔량', zh: '订单余量' },
  nav_planning: { vi: 'Kế Hoạch Sản Xuất', en: 'Production Planning', ko: '생산 계획', zh: '生产计划' },
  nav_ip_production: { vi: 'IP Sản Xuất', en: 'IP Production', ko: 'IP 생산 관리', zh: 'IP 生产管理' },
  nav_barcode: { vi: 'Mã Vạch & Tem A4', en: 'Barcode & Labels', ko: '바코드 라벨', zh: '条形码与标签' },
  nav_shipping: { vi: 'Danh Sách Xuất Hàng', en: 'Shipping List', ko: '출하 목록', zh: '出货列表' },
  nav_settings: { vi: 'Cài Đặt Hệ Thống', en: 'Settings', ko: '시스템 설정', zh: '系统设置' },

  // Topbar
  top_search: { vi: 'Tìm mã đơn, PO, Model, Pantone...', en: 'Search PO, Model, Pantone...', ko: 'PO, 모델, 색상 검색...', zh: '搜索 PO、型号、颜色...' },
  top_user_role: { vi: 'Quản Trị Viên Nhà Máy', en: 'Plant Administrator', ko: '공장 관리자', zh: '工厂管理员' },

  // Common Actions
  btn_add_order: { vi: 'Thêm Đơn Hàng', en: 'Add Order', ko: '주문 추가', zh: '新增订单' },
  btn_add_plan: { vi: 'Tạo Kế Hoạch', en: 'Create Plan', ko: '계획 작성', zh: '创建计划' },
  btn_add_shipping: { vi: 'Tạo Phiếu Xuất', en: 'Create Shipping', ko: '출하 작성', zh: '创建出货' },
  btn_export_excel: { vi: 'Xuất Báo Cáo', en: 'Export Excel', ko: '엑셀 내보내기', zh: '导出报表' },
  btn_filter: { vi: 'Bộ Lọc', en: 'Filters', ko: '필터', zh: '筛选' },
  btn_save: { vi: 'Lưu Dữ Liệu', en: 'Save', ko: '저장', zh: '保存' },
  btn_cancel: { vi: 'Hủy Bỏ', en: 'Cancel', ko: '취소', zh: '取消' },
  btn_delete: { vi: 'Xóa', en: 'Delete', ko: '삭제', zh: '删除' },
  btn_refresh: { vi: 'Làm Mới', en: 'Refresh', ko: '새로고침', zh: '刷新' },

  // KPIs
  kpi_output: { vi: 'Tổng Sản Lượng', en: 'Total Output', ko: '총 생산량', zh: '总产量' },
  kpi_orders: { vi: 'Tổng Đơn Hàng', en: 'Total Orders', ko: '총 주문', zh: '订单总数' },
  kpi_quality: { vi: 'Tỷ Lệ Chất Lượng', en: 'Quality Pass Rate', ko: '품질 적합률', zh: '质量合格率' },
  kpi_otd: { vi: 'Giao Đúng Hạn (OTD)', en: 'On-Time Delivery', ko: '정시 납품률', zh: '准时交付率' },

  // Units
  unit_pairs: { vi: 'đôi', en: 'prs', ko: '족', zh: '双' },
  unit_orders: { vi: 'đơn', en: 'orders', ko: '건', zh: '单' },
};

export const useTranslation = (lang: Language = 'vi') => {
  return (key: string): string => {
    return dictionary[key]?.[lang] || key;
  };
};
