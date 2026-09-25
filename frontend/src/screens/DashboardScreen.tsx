import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { INITIAL_ORDERS, INITIAL_PLANS } from '../data/initialData';

interface DashboardScreenProps {
  onNavigate: (tab: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const kpis = [
    {
      title: 'Sản Lượng Tháng',
      value: '38,450',
      unit: 'đôi',
      change: '+12.4%',
      isPositive: true,
      icon: 'cubes',
      color: '#0284c7',
      bg: '#e0f2fe',
    },
    {
      title: 'Tỷ Lệ Chất Lượng',
      value: '99.2%',
      unit: 'đạt chuẩn',
      change: '+0.5%',
      isPositive: true,
      icon: 'check-circle',
      color: '#16a34a',
      bg: '#dcfce7',
    },
    {
      title: 'Kế Hoạch Đang Chạy',
      value: `${INITIAL_PLANS.length}`,
      unit: 'lệnh sản xuất',
      change: 'Đang gia công',
      isPositive: true,
      icon: 'industry',
      color: '#d97706',
      bg: '#fef3c7',
    },
    {
      title: 'Giao Đúng Hạn (OTD)',
      value: '98.6%',
      unit: 'kế hoạch',
      change: 'A+ Chuẩn',
      isPositive: true,
      icon: 'shipping-fast',
      color: '#7c3aed',
      bg: '#ede9fe',
    },
  ];

  // Weekly trend mock data (Mon - Sat)
  const weeklyData = [
    { day: 'T2', target: 5000, actual: 5200 },
    { day: 'T3', target: 5200, actual: 5350 },
    { day: 'T4', target: 5500, actual: 5400 },
    { day: 'T5', target: 5200, actual: 5600 },
    { day: 'T6', target: 5400, actual: 5750 },
    { day: 'T7', target: 4800, actual: 5100 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner / Welcome */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerSubtitle}>TRUNG TÂM ĐIỀU HÀNH SẢN XUẤT NHÀ MÁY</Text>
          <Text style={styles.bannerTitle}>Hệ Thống Quản Trị ERP Yusung NextGen</Text>
          <Text style={styles.bannerDesc}>
            Theo dõi thời gian thực kế hoạch sản xuất, phân bổ 29 size, tiến độ in tem mã vạch và tình trạng xuất hàng.
          </Text>
        </View>
        <View style={styles.quickActionGroup}>
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => onNavigate('barcode')}>
            <FontAwesome5 name="barcode" size={13} color="#ffffff" />
            <Text style={styles.actionBtnPrimaryText}>In & Quét Mã Vạch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => onNavigate('balance')}>
            <FontAwesome5 name="balance-scale" size={13} color="#0f172a" />
            <Text style={styles.actionBtnSecondaryText}>Cân Đối Đơn Hàng</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        {kpis.map((kpi, idx) => (
          <View key={idx} style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={[styles.kpiIconBox, { backgroundColor: kpi.bg }]}>
                <FontAwesome5 name={kpi.icon as any} size={15} color={kpi.color} />
              </View>
              <View style={[styles.badgeChange, { backgroundColor: kpi.isPositive ? '#dcfce7' : '#fee2e2' }]}>
                <Text style={[styles.badgeChangeText, { color: kpi.isPositive ? '#15803d' : '#b91c1c' }]}>
                  {kpi.change}
                </Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>
              {kpi.value} <Text style={styles.kpiUnit}>{kpi.unit}</Text>
            </Text>
            <Text style={styles.kpiTitle}>{kpi.title}</Text>
          </View>
        ))}
      </View>

      {/* Charts & Status Section */}
      <View style={styles.twoColumnSection}>
        {/* Left: Weekly Production Chart */}
        <View style={[styles.panelCard, { flex: 1.5 }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Sản Lượng Thực Tế vs Kế Hoạch Theo Tuần</Text>
              <Text style={styles.panelSubtitle}>Cập nhật theo từng ca sản xuất (đôi/ngày)</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#cbd5e1' }]} />
                <Text style={styles.legendText}>Kế hoạch</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#0284c7' }]} />
                <Text style={styles.legendText}>Thực tế</Text>
              </View>
            </View>
          </View>

          {/* Bar Chart Visualizer */}
          <View style={styles.chartArea}>
            {weeklyData.map((item, idx) => {
              const maxVal = 6000;
              const targetHeight = (item.target / maxVal) * 140;
              const actualHeight = (item.actual / maxVal) * 140;
              return (
                <View key={idx} style={styles.barGroup}>
                  <View style={styles.barsContainer}>
                    <View style={[styles.targetBar, { height: targetHeight }]} />
                    <View style={[styles.actualBar, { height: actualHeight }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.day}</Text>
                  <Text style={styles.barValue}>{item.actual.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Right: Model Distribution */}
        <View style={[styles.panelCard, { flex: 1 }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Cơ Cấu Sản Lượng Theo Model</Text>
              <Text style={styles.panelSubtitle}>Tỷ trọng các dòng sản phẩm đang chạy</Text>
            </View>
          </View>

          <View style={styles.modelList}>
            {INITIAL_ORDERS.map((ord, idx) => {
              const pct = Math.round((ord.totalQty / 7800) * 100);
              const colors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6'];
              const color = colors[idx % colors.length];
              return (
                <View key={ord.id} style={styles.modelItem}>
                  <View style={styles.modelItemHeader}>
                    <Text style={styles.modelItemName}>{ord.modelCode}</Text>
                    <Text style={styles.modelItemQty}>
                      {ord.totalQty.toLocaleString()} đôi ({pct}%)
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.modelSubtext}>{ord.customerName} • {ord.pantoneCode}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Recent Production Plans Table */}
      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>Lệnh Sản Xuất Đang Triển Khai (IP Production Plans)</Text>
            <Text style={styles.panelSubtitle}>Kế hoạch tờ gạch phân bổ tại xưởng</Text>
          </View>
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => onNavigate('planning')}>
            <Text style={styles.viewAllBtnText}>Xem tất cả kế hoạch</Text>
            <FontAwesome5 name="arrow-right" size={10} color="#0284c7" />
          </TouchableOpacity>
        </View>

        <View style={styles.tableWrapper}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thCell, { flex: 1.2 }]}>MÃ KẾ HOẠCH</Text>
            <Text style={[styles.thCell, { flex: 1.2 }]}>KHÁCH HÀNG</Text>
            <Text style={[styles.thCell, { flex: 1.5 }]}>MODEL & PANTONE</Text>
            <Text style={[styles.thCell, { flex: 1 }]}>KẾ HOẠCH</Text>
            <Text style={[styles.thCell, { flex: 1 }]}>ĐÃ SẢN XUẤT</Text>
            <Text style={[styles.thCell, { flex: 1 }]}>CÒN LẠI</Text>
            <Text style={[styles.thCell, { flex: 1 }]}>TIẾN ĐỘ</Text>
          </View>

          {INITIAL_PLANS.map((plan) => {
            const progress = Math.min(100, Math.round((plan.producedQty / plan.targetQty) * 100));
            return (
              <View key={plan.id} style={styles.tableDataRow}>
                <View style={[styles.tdCell, { flex: 1.2 }]}>
                  <Text style={styles.codeText}>{plan.planningCode}</Text>
                  <Text style={styles.dateText}>{plan.scheduleDate}</Text>
                </View>
                <Text style={[styles.tdCell, { flex: 1.2, fontWeight: '600', color: '#1e293b' }]}>
                  {plan.customerName}
                </Text>
                <View style={[styles.tdCell, { flex: 1.5 }]}>
                  <Text style={styles.modelText}>{plan.modelCode}</Text>
                  <Text style={styles.pantoneText}>{plan.pantoneCode}</Text>
                </View>
                <Text style={[styles.tdCell, { flex: 1, fontWeight: '700', color: '#0f172a' }]}>
                  {plan.targetQty.toLocaleString()}
                </Text>
                <Text style={[styles.tdCell, { flex: 1, fontWeight: '700', color: '#10b981' }]}>
                  {plan.producedQty.toLocaleString()}
                </Text>
                <Text style={[styles.tdCell, { flex: 1, fontWeight: '700', color: '#f59e0b' }]}>
                  {plan.remainQty.toLocaleString()}
                </Text>
                <View style={[styles.tdCell, { flex: 1 }]}>
                  <View style={styles.rowProgressContainer}>
                    <View style={styles.rowProgressBg}>
                      <View style={[styles.rowProgressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.rowProgressText}>{progress}%</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    gap: 20,
  },
  bannerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
  },
  bannerInfo: {
    flex: 1,
    minWidth: 280,
  },
  bannerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  bannerDesc: {
    fontSize: 12.5,
    color: '#94a3b8',
    lineHeight: 18,
    maxWidth: 620,
  },
  quickActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  actionBtnPrimaryText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  actionBtnSecondaryText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeChange: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeChangeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  kpiUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  twoColumnSection: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  panelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    minWidth: 320,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  panelSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748b',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
    paddingTop: 10,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 140,
  },
  targetBar: {
    width: 14,
    backgroundColor: '#cbd5e1',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  actualBar: {
    width: 14,
    backgroundColor: '#0284c7',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 6,
  },
  barValue: {
    fontSize: 9.5,
    color: '#94a3b8',
    fontWeight: '500',
  },
  modelList: {
    gap: 14,
  },
  modelItem: {
    gap: 4,
  },
  modelItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modelItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  modelItemQty: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  modelSubtext: {
    fontSize: 10,
    color: '#94a3b8',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewAllBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284c7',
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  thCell: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tdCell: {
    fontSize: 12,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  dateText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  modelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  pantoneText: {
    fontSize: 10,
    color: '#64748b',
  },
  rowProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rowProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  rowProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    width: 32,
  },
});
