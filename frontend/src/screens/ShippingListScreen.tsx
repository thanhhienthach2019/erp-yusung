import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { INITIAL_SHIPPING } from '../data/initialData';
import { ShippingItem, STANDARD_SIZES } from '../types/erp';

export const ShippingListScreen: React.FC = () => {
  const [shippingList, setShippingList] = useState<ShippingItem[]>(INITIAL_SHIPPING);
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // New Shipping Form
  const [shippingCode, setShippingCode] = useState('');
  const [customerPo, setCustomerPo] = useState('');
  const [customerName, setCustomerName] = useState('NIKE GLOBAL');
  const [modelCode, setModelCode] = useState('AIR-MAX-2026');
  const [pantoneCode, setPantoneCode] = useState('19-4052 TCX');
  const [shipDate, setShipDate] = useState('2026-09-25');
  const [shipSizes, setShipSizes] = useState<{ [size: string]: number }>({});

  const filteredShipping = shippingList.filter(s => {
    return (
      s.shippingCode.toLowerCase().includes(search.toLowerCase()) ||
      s.customerPo.toLowerCase().includes(search.toLowerCase()) ||
      s.modelCode.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCreateShipping = () => {
    if (!shippingCode || !customerPo) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập Mã Phiếu Xuất và Customer PO!');
      }
      return;
    }

    const total = Object.values(shipSizes).reduce((sum, v) => sum + (v || 0), 0);
    const newShipping: ShippingItem = {
      id: `SHP-${Date.now().toString().slice(-4)}`,
      shippingCode,
      customerPo,
      customerName,
      modelCode,
      pantoneCode,
      planningCode: `PLN-${Date.now().toString().slice(-4)}`,
      shippingDate: shipDate,
      sizes: shipSizes,
      totalQty: total || 500,
      status: 'Shipped',
    };

    setShippingList([newShipping, ...shippingList]);
    setIsModalVisible(false);
    setShippingCode('');
    setCustomerPo('');
    setShipSizes({});
  };

  return (
    <View style={styles.container}>
      {/* Action Header Card */}
      <View style={styles.controlCard}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <FontAwesome5 name="search" size={12} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm mã phiếu xuất, PO, model..."
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsModalVisible(true)}>
              <FontAwesome5 name="plus" size={11} color="#ffffff" />
              <Text style={styles.btnPrimaryText}>Tạo Phiếu Xuất Kho</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.alert('Đã xuất Packing List danh sách xuất hàng!');
                }
              }}
            >
              <FontAwesome5 name="print" size={12} color="#0284c7" />
              <Text style={styles.btnSecondaryText}>In Packing List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main 29-Size Shipping Table */}
      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 140 }]}>MÃ PHIẾU XUẤT</Text>
              <Text style={[styles.th, { width: 130 }]}>CUSTOMER PO</Text>
              <Text style={[styles.th, { width: 120 }]}>KHÁCH HÀNG</Text>
              <Text style={[styles.th, { width: 130 }]}>MODEL CODE</Text>
              <Text style={[styles.th, { width: 100 }]}>NGÀY XUẤT</Text>
              <Text style={[styles.th, { width: 85, textAlign: 'right', color: '#16a34a' }]}>TỔNG XUẤT</Text>
              <Text style={[styles.th, { width: 90, textAlign: 'center' }]}>TRẠNG THÁI</Text>

              {STANDARD_SIZES.map(s => (
                <Text key={s} style={[styles.th, styles.thSize]}>
                  {s}
                </Text>
              ))}
            </View>

            <ScrollView style={{ maxHeight: 480 }}>
              {filteredShipping.map((ship, idx) => (
                <View key={ship.id} style={[styles.tr, idx % 2 === 1 && { backgroundColor: '#fcfdfe' }]}>
                  <Text style={[styles.td, { width: 140, fontWeight: '800', color: '#0284c7' }]}>
                    {ship.shippingCode}
                  </Text>
                  <Text style={[styles.td, { width: 130, fontWeight: '700', color: '#0f172a' }]}>
                    {ship.customerPo}
                  </Text>
                  <Text style={[styles.td, { width: 120, color: '#334155' }]}>{ship.customerName}</Text>
                  <Text style={[styles.td, { width: 130, fontWeight: '700', color: '#1e293b' }]}>
                    {ship.modelCode}
                  </Text>
                  <Text style={[styles.td, { width: 100, fontSize: 11, color: '#64748b' }]}>
                    {ship.shippingDate}
                  </Text>
                  <Text style={[styles.td, { width: 85, textAlign: 'right', fontWeight: '800', color: '#16a34a' }]}>
                    {ship.totalQty.toLocaleString()}
                  </Text>

                  {/* Status Badge */}
                  <View style={{ width: 90, alignItems: 'center' }}>
                    <View style={[styles.statusBadge, ship.status === 'Delivered' ? styles.badgeDelivered : styles.badgeShipped]}>
                      <Text style={[styles.statusText, ship.status === 'Delivered' ? styles.textDelivered : styles.textShipped]}>
                        {ship.status === 'Delivered' ? 'Đã giao' : 'Đang xuất'}
                      </Text>
                    </View>
                  </View>

                  {/* 29 Size values */}
                  {STANDARD_SIZES.map(s => {
                    const q = ship.sizes[s] || 0;
                    return (
                      <Text
                        key={s}
                        style={[
                          styles.td,
                          styles.tdSize,
                          q > 0 ? { color: '#16a34a', fontWeight: '700' } : { color: '#cbd5e1' },
                        ]}
                      >
                        {q > 0 ? q : '-'}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Modal Add Shipping */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo Phiếu Xuất Hàng Mới (Shipping Record)</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <FontAwesome5 name="times" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Mã Phiếu Xuất (XK Code) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: XK-2026-09-005"
                    value={shippingCode}
                    onChangeText={setShippingCode}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Customer PO *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: PO-NIKE-450912"
                    value={customerPo}
                    onChangeText={setCustomerPo}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Model Code *</Text>
                  <TextInput
                    style={styles.input}
                    value={modelCode}
                    onChangeText={setModelCode}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Ngày Xuất Hàng *</Text>
                  <TextInput
                    style={styles.input}
                    value={shipDate}
                    onChangeText={setShipDate}
                  />
                </View>
              </View>

              <View style={styles.sizeMatrixBox}>
                <Text style={styles.sizeMatrixTitle}>Số lượng xuất theo từng Size (1 -> 15):</Text>
                <View style={styles.sizeGrid}>
                  {STANDARD_SIZES.map(s => (
                    <View key={s} style={styles.sizeItem}>
                      <Text style={styles.sizeLabel}>Sz {s}</Text>
                      <TextInput
                        style={styles.sizeInput}
                        keyboardType="numeric"
                        placeholder="0"
                        value={shipSizes[s] ? String(shipSizes[s]) : ''}
                        onChangeText={v => {
                          const n = parseInt(v, 10) || 0;
                          setShipSizes({ ...shipSizes, [s]: n });
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleCreateShipping}>
                <Text style={styles.btnPrimaryText}>Lưu Phiếu Xuất</Text>
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
  controlCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    minWidth: 260,
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
    fontSize: 12,
    outlineStyle: 'none' as any,
  },
  btnRow: {
    flexDirection: 'row',
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
  tableCard: {
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
  tdSize: {
    width: 48,
    textAlign: 'center',
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeShipped: {
    backgroundColor: '#dbeafe',
  },
  textShipped: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1e40af',
  },
  badgeDelivered: {
    backgroundColor: '#dcfce7',
  },
  textDelivered: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803d',
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
    maxWidth: 720,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalBody: {
    padding: 18,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  formField: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 36,
    fontSize: 12,
    outlineStyle: 'none' as any,
  },
  sizeMatrixBox: {
    gap: 8,
    marginTop: 8,
  },
  sizeMatrixTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sizeItem: {
    width: 64,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sizeLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0284c7',
  },
  sizeInput: {
    width: '100%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    height: 24,
    fontSize: 10.5,
    backgroundColor: '#ffffff',
    outlineStyle: 'none' as any,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  btnCancel: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  btnCancelText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
});
