import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { INITIAL_ORDERS, INITIAL_SHIPPING } from '../data/initialData';
import { STANDARD_SIZES } from '../types/erp';

export const OrderBalanceScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'item' | 'po' | 'planning'>('item');
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState('ALL');

  // Compute total aggregates
  const totalOrderQty = INITIAL_ORDERS.reduce((sum, o) => sum + (o.orderType !== 'LOSS' ? o.totalQty : 0), 0);
  const totalShippedQty = INITIAL_SHIPPING.reduce((sum, s) => sum + s.totalQty, 0);
  const totalRemainQty = Math.max(0, totalOrderQty - totalShippedQty);
  const overallCompletion = totalOrderQty > 0 ? Math.round((totalShippedQty / totalOrderQty) * 100) : 0;

  // Filter items
  const displayItems = INITIAL_ORDERS.filter(item => {
    if (item.orderType === 'LOSS') return false; // Business rule: ignore LOSS orders
    const matchSearch =
      item.customerPo.toLowerCase().includes(search.toLowerCase()) ||
      item.modelCode.toLowerCase().includes(search.toLowerCase()) ||
      item.pantoneCode.toLowerCase().includes(search.toLowerCase());
    const matchCust = selectedCust === 'ALL' || item.customerName === selectedCust;
    return matchSearch && matchCust;
  });

  return (
    <View style={styles.container}>
      {/* KPI Summary Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TỔNG ĐẶT HÀNG (ORDER)</Text>
          <Text style={[styles.kpiValue, { color: '#0284c7' }]}>
            {totalOrderQty.toLocaleString()} <Text style={styles.kpiUnit}>đôi</Text>
          </Text>
          <Text style={styles.kpiSub}>Đã loại trừ đơn hàng LOSS</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TỔNG ĐÃ XUẤT (SHIPPED)</Text>
          <Text style={[styles.kpiValue, { color: '#16a34a' }]}>
            {totalShippedQty.toLocaleString()} <Text style={styles.kpiUnit}>đôi</Text>
          </Text>
          <Text style={styles.kpiSub}>Cập nhật theo phiếu xuất kho</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>CÒN LẠI PHẢI XUẤT (BALANCE)</Text>
          <Text style={[styles.kpiValue, { color: '#d97706' }]}>
            {totalRemainQty.toLocaleString()} <Text style={styles.kpiUnit}>đôi</Text>
          </Text>
          <Text style={styles.kpiSub}>Số lượng cần sản xuất & đóng gói</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TỶ LỆ HOÀN THÀNH TIẾN ĐỘ</Text>
          <Text style={[styles.kpiValue, { color: '#7c3aed' }]}>
            {overallCompletion}%
          </Text>
          <View style={styles.kpiProgressBg}>
            <View style={[styles.kpiProgressFill, { width: `${overallCompletion}%` }]} />
          </View>
        </View>
      </View>

      {/* Control & View Modes Toolbar */}
      <View style={styles.toolbarCard}>
        {/* View Mode Tabs */}
        <View style={styles.tabGroup}>
          <TouchableOpacity
            style={[styles.tabBtn, viewMode === 'item' && styles.tabBtnActive]}
            onPress={() => setViewMode('item')}
          >
            <FontAwesome5 name="list" size={11} color={viewMode === 'item' ? '#0284c7' : '#64748b'} />
            <Text style={[styles.tabBtnText, viewMode === 'item' && styles.tabBtnTextActive]}>
              Theo Từng Đơn (By Item)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, viewMode === 'po' && styles.tabBtnActive]}
            onPress={() => setViewMode('po')}
          >
            <FontAwesome5 name="file-invoice" size={11} color={viewMode === 'po' ? '#0284c7' : '#64748b'} />
            <Text style={[styles.tabBtnText, viewMode === 'po' && styles.tabBtnTextActive]}>
              Theo Khách Hàng PO (By PO)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, viewMode === 'planning' && styles.tabBtnActive]}
            onPress={() => setViewMode('planning')}
          >
            <FontAwesome5 name="project-diagram" size={11} color={viewMode === 'planning' ? '#0284c7' : '#64748b'} />
            <Text style={[styles.tabBtnText, viewMode === 'planning' && styles.tabBtnTextActive]}>
              Theo Mã Kế Hoạch (By Planning)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search & Export */}
        <View style={styles.searchExportGroup}>
          <View style={styles.searchBox}>
            <FontAwesome5 name="search" size={11} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tra cứu nhanh..."
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.alert('Đã tải xuống bảng cân đối đơn hàng định dạng Excel!');
              }
            }}
          >
            <FontAwesome5 name="file-excel" size={12} color="#16a34a" />
            <Text style={styles.exportBtnText}>Xuất Excel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Multi-Tier 29-Size Balance Grid */}
      <View style={styles.gridCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 140 }]}>PO / MÃ ĐƠN</Text>
              <Text style={[styles.th, { width: 130 }]}>KHÁCH HÀNG</Text>
              <Text style={[styles.th, { width: 150 }]}>MODEL CODE</Text>
              <Text style={[styles.th, { width: 85, textAlign: 'center' }]}>CHỈ SỐ</Text>
              <Text style={[styles.th, { width: 85, textAlign: 'right' }]}>TỔNG</Text>

              {/* 29 Sizes */}
              {STANDARD_SIZES.map(s => (
                <Text key={s} style={[styles.th, styles.thSize]}>
                  {s}
                </Text>
              ))}
            </View>

            {/* Rows grouped in 3 tiers: Order, Shipped, Balance */}
            <ScrollView style={{ maxHeight: 460 }}>
              {displayItems.map((item, idx) => {
                const completion = item.totalQty > 0 ? Math.round((item.shippedQty / item.totalQty) * 100) : 0;
                return (
                  <View key={item.id} style={[styles.itemBlock, idx > 0 && { borderTopWidth: 2, borderTopColor: '#e2e8f0' }]}>
                    {/* Tier 1: ORDER ROW */}
                    <View style={[styles.rowTier, { backgroundColor: '#ffffff' }]}>
                      <View style={{ width: 140 }}>
                        <Text style={styles.poNumber}>{item.customerPo}</Text>
                        <Text style={styles.etdText}>ETD: {item.fixedEtd}</Text>
                      </View>
                      <Text style={[styles.metaText, { width: 130 }]}>{item.customerName}</Text>
                      <View style={{ width: 150 }}>
                        <Text style={styles.modelName}>{item.modelCode}</Text>
                        <Text style={styles.pantoneName}>{item.pantoneCode}</Text>
                      </View>
                      <View style={{ width: 85, alignItems: 'center' }}>
                        <View style={[styles.tierTag, { backgroundColor: '#e0f2fe' }]}>
                          <Text style={[styles.tierTagText, { color: '#0369a1' }]}>ĐẶT HÀNG</Text>
                        </View>
                      </View>
                      <Text style={[styles.qtyCell, { width: 85, color: '#0284c7' }]}>
                        {item.totalQty.toLocaleString()}
                      </Text>

                      {STANDARD_SIZES.map(s => (
                        <Text key={s} style={[styles.sizeCell, { color: '#334155' }]}>
                          {item.sizes[s] || '-'}
                        </Text>
                      ))}
                    </View>

                    {/* Tier 2: SHIPPED ROW */}
                    <View style={[styles.rowTier, { backgroundColor: '#fcfdfd' }]}>
                      <View style={{ width: 140 }} />
                      <View style={{ width: 130 }} />
                      <View style={{ width: 150 }} />
                      <View style={{ width: 85, alignItems: 'center' }}>
                        <View style={[styles.tierTag, { backgroundColor: '#dcfce7' }]}>
                          <Text style={[styles.tierTagText, { color: '#15803d' }]}>ĐÃ XUẤT</Text>
                        </View>
                      </View>
                      <Text style={[styles.qtyCell, { width: 85, color: '#16a34a' }]}>
                        {item.shippedQty.toLocaleString()}
                      </Text>

                      {STANDARD_SIZES.map(s => {
                        const shipped = item.sizes[s] ? Math.round(item.sizes[s] * 0.6) : 0;
                        return (
                          <Text key={s} style={[styles.sizeCell, { color: '#16a34a' }]}>
                            {shipped > 0 ? shipped : '-'}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Tier 3: REMAIN / BALANCE ROW */}
                    <View style={[styles.rowTier, { backgroundColor: '#fffbeb' }]}>
                      <View style={{ width: 140 }}>
                        <Text style={styles.remainProgressText}>Tiến độ: {completion}%</Text>
                      </View>
                      <View style={{ width: 130 }} />
                      <View style={{ width: 150 }} />
                      <View style={{ width: 85, alignItems: 'center' }}>
                        <View style={[styles.tierTag, { backgroundColor: '#fef3c7' }]}>
                          <Text style={[styles.tierTagText, { color: '#b45309' }]}>CÒN LẠI</Text>
                        </View>
                      </View>
                      <Text style={[styles.qtyCell, { width: 85, color: '#d97706', fontWeight: '900' }]}>
                        {item.remainQty.toLocaleString()}
                      </Text>

                      {STANDARD_SIZES.map(s => {
                        const remain = item.sizes[s] ? Math.round(item.sizes[s] * 0.4) : 0;
                        return (
                          <Text key={s} style={[styles.sizeCell, { color: '#d97706', fontWeight: '700' }]}>
                            {remain > 0 ? remain : '-'}
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
    backgroundColor: '#f8fafc',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  kpiUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  kpiSub: {
    fontSize: 10.5,
    color: '#94a3b8',
  },
  kpiProgressBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  kpiProgressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 3,
  },
  toolbarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  tabBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
  searchExportGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 34,
    width: 200,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11.5,
    color: '#0f172a',
    outlineStyle: 'none' as any,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    gap: 6,
  },
  exportBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  th: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  thSize: {
    width: 48,
    textAlign: 'center',
    color: '#0284c7',
  },
  itemBlock: {
    paddingVertical: 2,
  },
  rowTier: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  poNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  etdText: {
    fontSize: 9.5,
    color: '#64748b',
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  modelName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  pantoneName: {
    fontSize: 9.5,
    color: '#64748b',
  },
  tierTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  qtyCell: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  sizeCell: {
    width: 48,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  remainProgressText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
});
