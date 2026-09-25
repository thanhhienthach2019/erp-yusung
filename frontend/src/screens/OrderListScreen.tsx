import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { INITIAL_ORDERS } from '../data/initialData';
import { OrderItem, STANDARD_SIZES } from '../types/erp';

export const OrderListScreen: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // New Order Form State
  const [newPo, setNewPo] = useState('');
  const [newCustomer, setNewCustomer] = useState('NIKE GLOBAL');
  const [newModel, setNewModel] = useState('');
  const [newPantone, setNewPantone] = useState('');
  const [newEtd, setNewEtd] = useState('2026-11-15');
  const [newType, setNewType] = useState('PROD');
  const [newSizes, setNewSizes] = useState<{ [size: string]: number }>({});

  const customers = ['ALL', 'NIKE GLOBAL', 'ADIDAS GROUP', 'PUMA SE', 'NEW BALANCE'];
  const orderTypes = ['ALL', 'PROD', 'SAMPLE', 'LOSS'];

  // Filter logic
  const filteredOrders = orders.filter(item => {
    const matchSearch =
      item.customerPo.toLowerCase().includes(search.toLowerCase()) ||
      item.modelCode.toLowerCase().includes(search.toLowerCase()) ||
      item.pantoneCode.toLowerCase().includes(search.toLowerCase()) ||
      item.planningCode.toLowerCase().includes(search.toLowerCase());

    const matchCust = selectedCustomer === 'ALL' || item.customerName === selectedCustomer;
    const matchType = selectedType === 'ALL' || item.orderType === selectedType;

    return matchSearch && matchCust && matchType;
  });

  const handleSaveNewOrder = () => {
    if (!newPo || !newModel || !newPantone) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập đầy đủ Số PO, Model Code và Pantone Code!');
      } else {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      }
      return;
    }

    const total = Object.values(newSizes).reduce((acc, curr) => acc + (curr || 0), 0);
    const newOrder: OrderItem = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      orderCode: `PO-${newPo}`,
      customerPo: newPo,
      customerName: newCustomer,
      modelCode: newModel.toUpperCase(),
      pantoneCode: newPantone,
      orderType: newType,
      division: 'IP 1-15',
      stage: 'PRD',
      planningCode: `PLN-${Date.now().toString().slice(-4)}`,
      fixedEtd: newEtd,
      orderDate: new Date().toISOString().split('T')[0],
      period: newEtd.slice(0, 7),
      sizes: newSizes,
      totalQty: total,
      shippedQty: 0,
      remainQty: total,
    };

    setOrders([newOrder, ...orders]);
    setIsModalVisible(false);
    // Reset form
    setNewPo('');
    setNewModel('');
    setNewPantone('');
    setNewSizes({});
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* Control Action Bar */}
      <View style={styles.actionCard}>
        <View style={styles.searchRow}>
          {/* Search Box */}
          <View style={styles.searchBox}>
            <FontAwesome5 name="search" size={12} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm PO Number, Model Code, Pantone, Planning Code..."
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <FontAwesome5 name="times-circle" size={12} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsModalVisible(true)}>
              <FontAwesome5 name="plus" size={11} color="#ffffff" />
              <Text style={styles.btnPrimaryText}>Thêm Đơn Hàng Mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.alert('Đã xuất báo cáo danh sách đơn hàng sang Excel thành công!');
                }
              }}
            >
              <FontAwesome5 name="file-excel" size={12} color="#16a34a" />
              <Text style={styles.btnSecondaryText}>Xuất Excel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Badges */}
        <View style={styles.filterRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Khách Hàng:</Text>
            <View style={styles.chipRow}>
              {customers.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, selectedCustomer === c && styles.chipActive]}
                  onPress={() => setSelectedCustomer(c)}
                >
                  <Text style={[styles.chipText, selectedCustomer === c && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Loại Đơn:</Text>
            <View style={styles.chipRow}>
              {orderTypes.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, selectedType === t && styles.chipActive]}
                  onPress={() => setSelectedType(t)}
                >
                  <Text style={[styles.chipText, selectedType === t && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Main 29-Size Horizontal Table */}
      <View style={styles.tableCard}>
        <View style={styles.tableSummaryBar}>
          <Text style={styles.tableSummaryText}>
            Hiển thị <Text style={{ fontWeight: '800', color: '#0284c7' }}>{filteredOrders.length}</Text> đơn hàng
            • Tổng số lượng: <Text style={{ fontWeight: '800', color: '#0f172a' }}>
              {filteredOrders.reduce((sum, o) => sum + o.totalQty, 0).toLocaleString()} đôi
            </Text>
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
          <View>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 140 }]}>CUSTOMER PO</Text>
              <Text style={[styles.th, { width: 130 }]}>KHÁCH HÀNG</Text>
              <Text style={[styles.th, { width: 140 }]}>MODEL CODE</Text>
              <Text style={[styles.th, { width: 140 }]}>PANTONE</Text>
              <Text style={[styles.th, { width: 80, textAlign: 'center' }]}>LOẠI</Text>
              <Text style={[styles.th, { width: 90, textAlign: 'center' }]}>FIXED ETD</Text>
              <Text style={[styles.th, { width: 85, textAlign: 'right', color: '#0284c7' }]}>TỔNG ĐẶT</Text>
              <Text style={[styles.th, { width: 85, textAlign: 'right', color: '#16a34a' }]}>ĐÃ XUẤT</Text>
              <Text style={[styles.th, { width: 85, textAlign: 'right', color: '#f59e0b' }]}>CÒN LẠI</Text>

              {/* 29 Standard Size Columns */}
              {STANDARD_SIZES.map(size => (
                <Text key={size} style={[styles.th, styles.thSize]}>
                  {size}
                </Text>
              ))}

              <Text style={[styles.th, { width: 70, textAlign: 'center' }]}>THAO TÁC</Text>
            </View>

            {/* Table Rows */}
            <ScrollView style={{ maxHeight: 520 }}>
              {filteredOrders.map((ord, idx) => (
                <View key={ord.id} style={[styles.tr, idx % 2 === 1 && { backgroundColor: '#fcfdfe' }]}>
                  <View style={{ width: 140 }}>
                    <Text style={styles.tdPo}>{ord.customerPo}</Text>
                    <Text style={styles.tdSub}>{ord.planningCode}</Text>
                  </View>
                  <Text style={[styles.td, { width: 130, fontWeight: '600', color: '#334155' }]}>
                    {ord.customerName}
                  </Text>
                  <Text style={[styles.td, { width: 140, fontWeight: '700', color: '#0f172a' }]}>
                    {ord.modelCode}
                  </Text>
                  <Text style={[styles.td, { width: 140, color: '#64748b', fontSize: 11 }]}>
                    {ord.pantoneCode}
                  </Text>

                  {/* Order Type Badge */}
                  <View style={{ width: 80, alignItems: 'center' }}>
                    <View style={[styles.typeBadge, ord.orderType === 'LOSS' ? styles.badgeLoss : styles.badgeProd]}>
                      <Text style={[styles.typeBadgeText, ord.orderType === 'LOSS' ? styles.textLoss : styles.textProd]}>
                        {ord.orderType}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.td, { width: 90, textAlign: 'center', fontSize: 11, color: '#475569' }]}>
                    {ord.fixedEtd}
                  </Text>
                  <Text style={[styles.td, { width: 85, textAlign: 'right', fontWeight: '800', color: '#0284c7' }]}>
                    {ord.totalQty.toLocaleString()}
                  </Text>
                  <Text style={[styles.td, { width: 85, textAlign: 'right', fontWeight: '700', color: '#16a34a' }]}>
                    {ord.shippedQty.toLocaleString()}
                  </Text>
                  <Text style={[styles.td, { width: 85, textAlign: 'right', fontWeight: '800', color: '#f59e0b' }]}>
                    {ord.remainQty.toLocaleString()}
                  </Text>

                  {/* 29 Size Values */}
                  {STANDARD_SIZES.map(s => {
                    const qty = ord.sizes[s] || 0;
                    return (
                      <Text
                        key={s}
                        style={[
                          styles.td,
                          styles.tdSize,
                          qty > 0 ? { color: '#0f172a', fontWeight: '700' } : { color: '#cbd5e1' },
                        ]}
                      >
                        {qty > 0 ? qty : '-'}
                      </Text>
                    );
                  })}

                  {/* Delete Action */}
                  <View style={{ width: 70, alignItems: 'center' }}>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteOrder(ord.id)}
                    >
                      <FontAwesome5 name="trash-alt" size={11} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Add New Order Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Thêm Đơn Hàng Mới (New Order)</Text>
                <Text style={styles.modalSubtitle}>Nhập thông tin PO và số lượng theo 29 kích thước chuẩn</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <FontAwesome5 name="times" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Customer PO Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: PO-NIKE-99201"
                    value={newPo}
                    onChangeText={setNewPo}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Khách Hàng</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Khách hàng"
                    value={newCustomer}
                    onChangeText={setNewCustomer}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Model Code *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: AIR-MAX-2026"
                    value={newModel}
                    onChangeText={setNewModel}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Pantone Code *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: 19-4052 TCX"
                    value={newPantone}
                    onChangeText={setNewPantone}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Fixed ETD (Ngày xuất)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={newEtd}
                    onChangeText={setNewEtd}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Loại Đơn Hàng</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="PROD / SAMPLE"
                    value={newType}
                    onChangeText={setNewType}
                  />
                </View>
              </View>

              {/* 29 Size Input Matrix */}
              <View style={styles.sizeSection}>
                <Text style={styles.sizeSectionTitle}>Số lượng theo 29 Size (1 -> 15):</Text>
                <View style={styles.sizeInputGrid}>
                  {STANDARD_SIZES.map(s => (
                    <View key={s} style={styles.sizeInputItem}>
                      <Text style={styles.sizeInputLabel}>Size {s}</Text>
                      <TextInput
                        style={styles.sizeInputField}
                        keyboardType="numeric"
                        placeholder="0"
                        value={newSizes[s] ? String(newSizes[s]) : ''}
                        onChangeText={val => {
                          const num = parseInt(val, 10) || 0;
                          setNewSizes({ ...newSizes, [s]: num });
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.btnCancelText}>Hủy Bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleSaveNewOrder}>
                <FontAwesome5 name="check" size={12} color="#ffffff" />
                <Text style={styles.btnSubmitText}>Lưu Đơn Hàng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0f172a',
    outlineStyle: 'none' as any,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  btnSecondaryText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  chipActive: {
    backgroundColor: '#0284c7',
  },
  chipText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tableCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  tableSummaryBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableSummaryText: {
    fontSize: 12,
    color: '#64748b',
  },
  horizontalScroll: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    letterSpacing: 0.5,
  },
  thSize: {
    width: 48,
    textAlign: 'center',
    color: '#0284c7',
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  td: {
    fontSize: 12,
    color: '#0f172a',
  },
  tdPo: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7',
  },
  tdSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  tdSize: {
    width: 48,
    textAlign: 'center',
    fontSize: 11,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeProd: {
    backgroundColor: '#dbeafe',
  },
  textProd: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  badgeLoss: {
    backgroundColor: '#fee2e2',
  },
  textLoss: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#b91c1c',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    width: '100%',
    maxWidth: 760,
    maxHeight: '90%',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  modalBody: {
    padding: 20,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 20,
  },
  formField: {
    width: '48%',
    gap: 6,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    fontSize: 12.5,
    backgroundColor: '#ffffff',
    outlineStyle: 'none' as any,
  },
  sizeSection: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  sizeSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  sizeInputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeInputItem: {
    width: 68,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sizeInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
    marginBottom: 4,
  },
  sizeInputField: {
    width: '100%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    height: 28,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#ffffff',
    outlineStyle: 'none' as any,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  btnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  btnCancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  btnSubmit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#0284c7',
  },
  btnSubmitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
