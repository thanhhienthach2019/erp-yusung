import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { INITIAL_ORDERS, INITIAL_IP_PRODUCTION } from '../data/initialData';
import { STANDARD_SIZES, IpProductionDailyRecord } from '../types/erp';

export const IpProductionScreen: React.FC = () => {
  // Model tabs
  const models = ['AIR-MAX-2026', 'ULTRA-BOOST-V5', 'NITRO-RUNNER', 'NB-990-V6'];
  const [activeModel, setActiveModel] = useState(models[0]);
  const [shiftRecords, setShiftRecords] = useState<IpProductionDailyRecord[]>(INITIAL_IP_PRODUCTION);
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);

  // New Shift Log State
  const [shiftDate, setShiftDate] = useState('2026-09-25');
  const [shiftType, setShiftType] = useState<'Ca A' | 'Ca B'>('Ca A');
  const [shiftLeader, setShiftLeader] = useState('Trần Văn Hưng (Tổ Trưởng Ca A)');
  const [logSizes, setLogSizes] = useState<{ [size: string]: number }>({});
  const [defectCount, setDefectCount] = useState('0');

  // Find order for active model
  const currentOrder = INITIAL_ORDERS.find(o => o.modelCode === activeModel) || INITIAL_ORDERS[0];

  // Records for this model
  const modelRecords = shiftRecords.filter(r => r.modelCode === activeModel);

  // Calculate total produced for this model
  const totalProduced = modelRecords.reduce((sum, r) => sum + r.totalQty, 0);
  const remainQty = Math.max(0, currentOrder.totalQty - totalProduced);

  const handleSaveShiftLog = () => {
    const total = Object.values(logSizes).reduce((sum, v) => sum + (v || 0), 0);
    if (total === 0) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập số lượng sản xuất ít nhất cho 1 size!');
      }
      return;
    }

    const newRecord: IpProductionDailyRecord = {
      id: `IP-${Date.now().toString().slice(-4)}`,
      modelCode: activeModel,
      planningCode: currentOrder.planningCode,
      productDate: shiftDate,
      shift: shiftType,
      sizes: logSizes,
      totalQty: total,
      defectQty: parseInt(defectCount, 10) || 0,
      loggedBy: shiftLeader,
    };

    setShiftRecords([...shiftRecords, newRecord]);
    setIsLogModalVisible(false);
    setLogSizes({});
    setDefectCount('0');
  };

  return (
    <View style={styles.container}>
      {/* Top Model Navigation Tabs */}
      <View style={styles.tabCard}>
        <View style={styles.tabHeader}>
          <Text style={styles.tabSectionTitle}>DANH MỤC DÒNG SẢN PHẨM (MODEL TABS):</Text>
          <TouchableOpacity style={styles.logBtn} onPress={() => setIsLogModalVisible(true)}>
            <FontAwesome5 name="plus-circle" size={12} color="#ffffff" />
            <Text style={styles.logBtnText}>Nhập Sản Lượng Ca Làm Việc</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {models.map(m => {
            const isActive = activeModel === m;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.modelTab, isActive && styles.modelTabActive]}
                onPress={() => setActiveModel(m)}
              >
                <FontAwesome5
                  name="shoe-prints"
                  size={12}
                  color={isActive ? '#0284c7' : '#64748b'}
                />
                <Text style={[styles.modelTabText, isActive && styles.modelTabTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Overview Cards for Active Model */}
      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>MÃ KẾ HOẠCH (PLANNING CODE)</Text>
          <Text style={styles.metricValueCode}>{currentOrder.planningCode}</Text>
          <Text style={styles.metricSub}>{currentOrder.customerName} • {currentOrder.pantoneCode}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>TỔNG ĐƠN HÀNG (ORDER QTY)</Text>
          <Text style={[styles.metricValue, { color: '#0284c7' }]}>
            {currentOrder.totalQty.toLocaleString()} <Text style={styles.unitText}>đôi</Text>
          </Text>
          <Text style={styles.metricSub}>ETD: {currentOrder.fixedEtd}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>ĐÃ SẢN XUẤT (CA A + CA B)</Text>
          <Text style={[styles.metricValue, { color: '#16a34a' }]}>
            {totalProduced.toLocaleString()} <Text style={styles.unitText}>đôi</Text>
          </Text>
          <Text style={styles.metricSub}>{modelRecords.length} bản ghi ca máy</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>CÒN LẠI (REMAIN QTY)</Text>
          <Text style={[styles.metricValue, { color: '#d97706' }]}>
            {remainQty.toLocaleString()} <Text style={styles.unitText}>đôi</Text>
          </Text>
          <Text style={styles.metricSub}>Cần hoàn tất kế hoạch</Text>
        </View>
      </View>

      {/* Main 3-Tier Production Table */}
      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 120 }]}>PHÂN LOẠI</Text>
              <Text style={[styles.th, { width: 120 }]}>NGÀY / CA</Text>
              <Text style={[styles.th, { width: 180 }]}>NGƯỜI GHI NHẬN</Text>
              <Text style={[styles.th, { width: 85, textAlign: 'right', color: '#0284c7' }]}>TỔNG ĐÔI</Text>
              <Text style={[styles.th, { width: 65, textAlign: 'center', color: '#ef4444' }]}>LỖI</Text>

              {STANDARD_SIZES.map(s => (
                <Text key={s} style={[styles.th, styles.thSize]}>
                  {s}
                </Text>
              ))}
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              {/* Row 1: ORDER ROW */}
              <View style={[styles.tr, { backgroundColor: '#f0f9ff' }]}>
                <View style={[styles.badgeTag, { backgroundColor: '#bae6fd' }]}>
                  <Text style={[styles.badgeTagText, { color: '#0369a1' }]}>1. ĐƠN ĐẶT</Text>
                </View>
                <Text style={[styles.td, { width: 120, fontWeight: '700', color: '#0369a1' }]}>
                  ORDER LIST
                </Text>
                <Text style={[styles.td, { width: 180, color: '#64748b', fontSize: 11 }]}>
                  {currentOrder.customerName}
                </Text>
                <Text style={[styles.td, { width: 85, textAlign: 'right', fontWeight: '800', color: '#0284c7' }]}>
                  {currentOrder.totalQty.toLocaleString()}
                </Text>
                <Text style={[styles.td, { width: 65, textAlign: 'center', color: '#94a3b8' }]}>-</Text>

                {STANDARD_SIZES.map(s => (
                  <Text key={s} style={[styles.td, styles.tdSize, { fontWeight: '700', color: '#0369a1' }]}>
                    {currentOrder.sizes[s] || '-'}
                  </Text>
                ))}
              </View>

              {/* Rows: Daily Shift Production Records */}
              {modelRecords.map((rec) => (
                <View key={rec.id} style={styles.tr}>
                  <View style={[styles.badgeTag, rec.shift === 'Ca A' ? styles.badgeCaA : styles.badgeCaB]}>
                    <Text style={[styles.badgeTagText, rec.shift === 'Ca A' ? styles.textCaA : styles.textCaB]}>
                      {rec.shift}
                    </Text>
                  </View>
                  <Text style={[styles.td, { width: 120, fontSize: 11.5, color: '#334155' }]}>
                    {rec.productDate}
                  </Text>
                  <Text style={[styles.td, { width: 180, fontSize: 11, color: '#64748b' }]}>
                    {rec.loggedBy}
                  </Text>
                  <Text style={[styles.td, { width: 85, textAlign: 'right', fontWeight: '800', color: '#16a34a' }]}>
                    {rec.totalQty.toLocaleString()}
                  </Text>
                  <Text style={[styles.td, { width: 65, textAlign: 'center', fontWeight: '700', color: '#ef4444' }]}>
                    {rec.defectQty}
                  </Text>

                  {STANDARD_SIZES.map(s => {
                    const val = rec.sizes[s] || 0;
                    return (
                      <Text
                        key={s}
                        style={[
                          styles.td,
                          styles.tdSize,
                          val > 0 ? { color: '#16a34a', fontWeight: '700' } : { color: '#cbd5e1' },
                        ]}
                      >
                        {val > 0 ? val : '-'}
                      </Text>
                    );
                  })}
                </View>
              ))}

              {/* Row 3: REMAIN ROW */}
              <View style={[styles.tr, { backgroundColor: '#fffbeb', borderTopWidth: 2, borderTopColor: '#fde68a' }]}>
                <View style={[styles.badgeTag, { backgroundColor: '#fde68a' }]}>
                  <Text style={[styles.badgeTagText, { color: '#b45309' }]}>3. CÒN LẠI</Text>
                </View>
                <Text style={[styles.td, { width: 120, fontWeight: '800', color: '#b45309' }]}>
                  REMAIN
                </Text>
                <Text style={[styles.td, { width: 180, color: '#92400e', fontSize: 11 }]}>
                  Order - Sản xuất (Ca A + Ca B)
                </Text>
                <Text style={[styles.td, { width: 85, textAlign: 'right', fontWeight: '900', color: '#d97706' }]}>
                  {remainQty.toLocaleString()}
                </Text>
                <Text style={[styles.td, { width: 65, textAlign: 'center', color: '#94a3b8' }]}>-</Text>

                {STANDARD_SIZES.map(s => {
                  const produced = modelRecords.reduce((sum, r) => sum + (r.sizes[s] || 0), 0);
                  const rem = Math.max(0, (currentOrder.sizes[s] || 0) - produced);
                  return (
                    <Text
                      key={s}
                      style={[
                        styles.td,
                        styles.tdSize,
                        rem > 0 ? { color: '#d97706', fontWeight: '800' } : { color: '#cbd5e1' },
                      ]}
                    >
                      {rem > 0 ? rem : '-'}
                    </Text>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Modal Shift Entry */}
      <Modal visible={isLogModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Ghi Nhận Sản Lượng Ca Máy ({activeModel})</Text>
                <Text style={styles.modalSubtitle}>Nhập số lượng thành phẩm theo từng kích thước của ca sản xuất</Text>
              </View>
              <TouchableOpacity onPress={() => setIsLogModalVisible(false)}>
                <FontAwesome5 name="times" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalRow}>
                <View style={styles.modalField}>
                  <Text style={styles.fieldLabel}>Ngày Sản Xuất *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={shiftDate}
                    onChangeText={setShiftDate}
                  />
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.fieldLabel}>Ca Làm Việc *</Text>
                  <View style={styles.shiftToggle}>
                    {(['Ca A', 'Ca B'] as const).map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.shiftBtn, shiftType === s && styles.shiftBtnActive]}
                        onPress={() => setShiftType(s)}
                      >
                        <Text style={[styles.shiftBtnText, shiftType === s && styles.shiftBtnTextActive]}>
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalRow}>
                <View style={[styles.modalField, { flex: 2 }]}>
                  <Text style={styles.fieldLabel}>Tổ Trưởng Ca *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={shiftLeader}
                    onChangeText={setShiftLeader}
                  />
                </View>

                <View style={[styles.modalField, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Số Đôi Lỗi (Defect)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    keyboardType="numeric"
                    value={defectCount}
                    onChangeText={setDefectCount}
                  />
                </View>
              </View>

              <View style={styles.sizeSection}>
                <Text style={styles.sizeTitle}>Số lượng từng Size (1 -> 15):</Text>
                <View style={styles.sizeGrid}>
                  {STANDARD_SIZES.map(s => (
                    <View key={s} style={styles.sizeBox}>
                      <Text style={styles.sizeTag}>Sz {s}</Text>
                      <TextInput
                        style={styles.sizeInput}
                        keyboardType="numeric"
                        placeholder="0"
                        value={logSizes[s] ? String(logSizes[s]) : ''}
                        onChangeText={v => {
                          const n = parseInt(v, 10) || 0;
                          setLogSizes({ ...logSizes, [s]: n });
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setIsLogModalVisible(false)}>
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleSaveShiftLog}>
                <FontAwesome5 name="check" size={12} color="#ffffff" />
                <Text style={styles.btnSubmitText}>Lưu Bản Ghi Ca</Text>
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
  tabCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  tabSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  logBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  tabScroll: {
    flexDirection: 'row',
  },
  modelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
    gap: 8,
  },
  modelTabActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    borderWidth: 1.5,
    borderColor: '#0284c7',
  },
  modelTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748b',
  },
  modelTabTextActive: {
    color: '#0284c7',
    fontWeight: '800',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricValueCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  unitText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  metricSub: {
    fontSize: 10.5,
    color: '#94a3b8',
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
    paddingVertical: 9,
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
  badgeTag: {
    width: 100,
    alignItems: 'center',
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  badgeTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeCaA: {
    backgroundColor: '#dcfce7',
  },
  textCaA: {
    color: '#15803d',
  },
  badgeCaB: {
    backgroundColor: '#fef3c7',
  },
  textCaB: {
    color: '#b45309',
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
  modalSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  modalBody: {
    padding: 18,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modalField: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 36,
    fontSize: 12,
    outlineStyle: 'none' as any,
  },
  shiftToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  shiftBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    height: 36,
    backgroundColor: '#f8fafc',
  },
  shiftBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  shiftBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  shiftBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sizeSection: {
    gap: 8,
    marginTop: 10,
  },
  sizeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sizeBox: {
    width: 64,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sizeTag: {
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
  btnSubmit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#0284c7',
  },
  btnSubmitText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
});
