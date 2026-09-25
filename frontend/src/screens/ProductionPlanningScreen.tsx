import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { INITIAL_PLANS } from '../data/initialData';
import { ProductionPlanItem, STANDARD_SIZES } from '../types/erp';

export const ProductionPlanningScreen: React.FC = () => {
  const [plans, setPlans] = useState<ProductionPlanItem[]>(INITIAL_PLANS);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'ALL' | 'PRD' | 'CLS'>('ALL');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // New Plan Form
  const [planCode, setPlanCode] = useState('');
  const [customer, setCustomer] = useState('NIKE GLOBAL');
  const [model, setModel] = useState('');
  const [pantone, setPantone] = useState('');
  const [date, setDate] = useState('2026-09-26');
  const [division, setDivision] = useState('IP 1-15');
  const [planSizes, setPlanSizes] = useState<{ [size: string]: number }>({});

  const filteredPlans = plans.filter(p => {
    const matchSearch =
      p.planningCode.toLowerCase().includes(search.toLowerCase()) ||
      p.modelCode.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'ALL' || p.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const toggleStage = (id: string) => {
    setPlans(
      plans.map(p => {
        if (p.id === id) {
          const nextStage = p.stage === 'PRD' ? 'CLS' : 'PRD';
          return { ...p, stage: nextStage };
        }
        return p;
      })
    );
  };

  const handleCreatePlan = () => {
    if (!planCode || !model || !pantone) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập Mã Kế Hoạch, Model và Pantone!');
      }
      return;
    }

    const total = Object.values(planSizes).reduce((sum, v) => sum + (v || 0), 0);
    const newPlan: ProductionPlanItem = {
      id: `PLN-${Date.now().toString().slice(-4)}`,
      scheduleDate: date,
      planningCode: planCode,
      division,
      modelCode: model.toUpperCase(),
      pantoneCode: pantone,
      customerName: customer,
      sizes: planSizes,
      targetQty: total || 1000,
      producedQty: 0,
      remainQty: total || 1000,
      stage: 'PRD',
      status: 'InProgress',
    };

    setPlans([newPlan, ...plans]);
    setIsModalVisible(false);
    setPlanCode('');
    setModel('');
    setPantone('');
    setPlanSizes({});
  };

  return (
    <View style={styles.container}>
      {/* Top Action & Filter Bar */}
      <View style={styles.controlCard}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <FontAwesome5 name="search" size={12} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm mã kế hoạch, model, khách hàng..."
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.actionBtnRow}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsModalVisible(true)}>
              <FontAwesome5 name="plus" size={11} color="#ffffff" />
              <Text style={styles.btnPrimaryText}>Tạo Kế Hoạch Mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.alert('Đã xuất lịch kế hoạch sản xuất tờ gạch!');
                }
              }}
            >
              <FontAwesome5 name="file-pdf" size={12} color="#ef4444" />
              <Text style={styles.btnSecondaryText}>Xuất Tờ Gạch</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stage Filter */}
        <View style={styles.stageFilterRow}>
          <Text style={styles.filterTitle}>Trạng Thái Kế Hoạch:</Text>
          <View style={styles.stageToggleGroup}>
            {(['ALL', 'PRD', 'CLS'] as const).map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.stageToggleBtn, stageFilter === s && styles.stageToggleBtnActive]}
                onPress={() => setStageFilter(s)}
              >
                <Text style={[styles.stageToggleText, stageFilter === s && styles.stageToggleTextActive]}>
                  {s === 'ALL' ? 'TẤT CẢ' : s === 'PRD' ? 'ĐANG CHẠY (PRD)' : 'ĐÃ ĐÓNG (CLS)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Main Planning 29-Size Table */}
      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 140 }]}>MÃ KẾ HOẠCH</Text>
              <Text style={[styles.th, { width: 110 }]}>NGÀY LỊCH</Text>
              <Text style={[styles.th, { width: 90 }]}>PHÂN BỔ</Text>
              <Text style={[styles.th, { width: 140 }]}>MODEL CODE</Text>
              <Text style={[styles.th, { width: 130 }]}>PANTONE</Text>
              <Text style={[styles.th, { width: 85, textAlign: 'right', color: '#0284c7' }]}>KẾ HOẠCH</Text>
              <Text style={[styles.th, { width: 85, textAlign: 'right', color: '#10b981' }]}>ĐÃ LÀM</Text>
              <Text style={[styles.th, { width: 85, textAlign: 'right', color: '#f59e0b' }]}>CÒN LẠI</Text>
              <Text style={[styles.th, { width: 90, textAlign: 'center' }]}>TRẠNG THÁI</Text>

              {STANDARD_SIZES.map(s => (
                <Text key={s} style={[styles.th, styles.thSize]}>
                  {s}
                </Text>
              ))}

              <Text style={[styles.th, { width: 90, textAlign: 'center' }]}>ĐÓNG/MỞ</Text>
            </View>

            <ScrollView style={{ maxHeight: 480 }}>
              {filteredPlans.map((plan, idx) => (
                <View key={plan.id} style={[styles.tr, idx % 2 === 1 && { backgroundColor: '#fcfdfe' }]}>
                  <View style={{ width: 140 }}>
                    <Text style={styles.planCodeText}>{plan.planningCode}</Text>
                    <Text style={styles.custText}>{plan.customerName}</Text>
                  </View>
                  <Text style={[styles.td, { width: 110, fontSize: 11, color: '#475569' }]}>
                    {plan.scheduleDate}
                  </Text>
                  <Text style={[styles.td, { width: 90, fontWeight: '600', color: '#64748b' }]}>
                    {plan.division}
                  </Text>
                  <Text style={[styles.td, { width: 140, fontWeight: '700', color: '#0f172a' }]}>
                    {plan.modelCode}
                  </Text>
                  <Text style={[styles.td, { width: 130, fontSize: 10.5, color: '#64748b' }]}>
                    {plan.pantoneCode}
                  </Text>
                  <Text style={[styles.td, { width: 85, textAlign: 'right', fontWeight: '800', color: '#0284c7' }]}>
                    {plan.targetQty.toLocaleString()}
                  </Text>
                  <Text style={[styles.td, { width: 85, textAlign: 'right', fontWeight: '700', color: '#10b981' }]}>
                    {plan.producedQty.toLocaleString()}
                  </Text>
                  <Text style={[styles.td, { width: 85, textAlign: 'right', fontWeight: '800', color: '#f59e0b' }]}>
                    {plan.remainQty.toLocaleString()}
                  </Text>

                  {/* Stage Badge */}
                  <View style={{ width: 90, alignItems: 'center' }}>
                    <View style={[styles.stageBadge, plan.stage === 'PRD' ? styles.stagePrd : styles.stageCls]}>
                      <Text style={[styles.stageBadgeText, plan.stage === 'PRD' ? styles.textPrd : styles.textCls]}>
                        {plan.stage === 'PRD' ? 'Đang chạy' : 'Đã đóng'}
                      </Text>
                    </View>
                  </View>

                  {/* 29 Size values */}
                  {STANDARD_SIZES.map(s => {
                    const q = plan.sizes[s] || 0;
                    return (
                      <Text
                        key={s}
                        style={[
                          styles.td,
                          styles.tdSize,
                          q > 0 ? { color: '#0f172a', fontWeight: '700' } : { color: '#cbd5e1' },
                        ]}
                      >
                        {q > 0 ? q : '-'}
                      </Text>
                    );
                  })}

                  {/* Toggle Stage Button */}
                  <View style={{ width: 90, alignItems: 'center' }}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, plan.stage === 'PRD' ? styles.toggleBtnClose : styles.toggleBtnOpen]}
                      onPress={() => toggleStage(plan.id)}
                    >
                      <Text style={[styles.toggleBtnText, plan.stage === 'PRD' ? styles.textClose : styles.textOpen]}>
                        {plan.stage === 'PRD' ? 'Đóng' : 'Mở lại'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Modal Add Plan */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo Lệnh Sản Xuất Kế Hoạch (Planning Code)</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <FontAwesome5 name="times" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Mã Kế Hoạch (Planning Code) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: PLN-2026-005"
                    value={planCode}
                    onChangeText={setPlanCode}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Ngày Lịch Chạy *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Model Code *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: AIR-MAX-2026"
                    value={model}
                    onChangeText={setModel}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Pantone Code *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: 19-4052 TCX"
                    value={pantone}
                    onChangeText={setPantone}
                  />
                </View>
              </View>

              <View style={styles.sizeMatrixBox}>
                <Text style={styles.sizeMatrixTitle}>Phân bổ số lượng theo Size (1 -> 15):</Text>
                <View style={styles.sizeGrid}>
                  {STANDARD_SIZES.map(s => (
                    <View key={s} style={styles.sizeItem}>
                      <Text style={styles.sizeLabel}>Sz {s}</Text>
                      <TextInput
                        style={styles.sizeInput}
                        keyboardType="numeric"
                        placeholder="0"
                        value={planSizes[s] ? String(planSizes[s]) : ''}
                        onChangeText={v => {
                          const n = parseInt(v, 10) || 0;
                          setPlanSizes({ ...planSizes, [s]: n });
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
              <TouchableOpacity style={styles.btnPrimary} onPress={handleCreatePlan}>
                <Text style={styles.btnPrimaryText}>Lưu Kế Hoạch</Text>
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
    gap: 12,
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
  actionBtnRow: {
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
  stageFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  stageToggleGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  stageToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  stageToggleBtnActive: {
    backgroundColor: '#0284c7',
  },
  stageToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  stageToggleTextActive: {
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
  planCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7',
  },
  custText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  tdSize: {
    width: 48,
    textAlign: 'center',
    fontSize: 11,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stagePrd: {
    backgroundColor: '#dbeafe',
  },
  textPrd: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1e40af',
  },
  stageCls: {
    backgroundColor: '#f1f5f9',
  },
  textCls: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  toggleBtnClose: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  toggleBtnOpen: {
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textClose: {
    color: '#dc2626',
  },
  textOpen: {
    color: '#2563eb',
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
