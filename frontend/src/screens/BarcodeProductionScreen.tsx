import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { erpApi, getWebSocketUrl } from '../api/client';
import { BarcodeLabelCard, LabelData } from '../components/BarcodeLabelCard';
import { playSuccessBeep, playErrorBeep } from '../utils/audio';

export const BarcodeProductionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan' | 'reprint'>('generate');
  const [loading, setLoading] = useState(false);

  // --- TAB 1: TẠO TEM STATE ---
  const [isOutsidePlan, setIsOutsidePlan] = useState(false);
  const [scheduleDates, setScheduleDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [allPlans, setAllPlans] = useState<any[]>([]);
  
  // Selections
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedPantone, setSelectedPantone] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<string>('Ca A');
  const [targetPairs, setTargetPairs] = useState<number>(0);
  const [pairsPerLabel, setPairsPerLabel] = useState<number>(1);
  const [remainQty, setRemainQty] = useState<number>(0);
  const [productDate, setProductDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Generated Labels Preview
  const [generatedLabels, setGeneratedLabels] = useState<LabelData[]>([]);

  // --- TAB 2: QUÉT MÃ VẠCH STATE ---
  const [gunInput, setGunInput] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stagedScans, setStagedScans] = useState<any[]>([]);
  const [lastScannedText, setLastScannedText] = useState<string>('');
  const [totalScannedPairs, setTotalScannedPairs] = useState<number>(0);

  // --- TAB 3: LỊCH SỬ & IN LẠI STATE ---
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historySearchCode, setHistorySearchCode] = useState<string>('');
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);

  // WebSocket for Realtime updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(getWebSocketUrl());
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.channel === 'channel:scans') {
            console.log('Realtime scan event received:', msg.data);
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('WebSocket connection error:', e);
    }
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    loadScheduleDates();
    loadPlans();
  }, [selectedDate, isOutsidePlan]);

  const loadScheduleDates = async () => {
    try {
      const res = await erpApi.getScheduleDates();
      if (res.data && res.data.length > 0) {
        setScheduleDates(res.data);
        if (!selectedDate) {
          setSelectedDate(res.data[0]);
        }
      }
    } catch (e) {
      console.warn('Lỗi tải danh sách ngày:', e);
    }
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await erpApi.getPlans({
        schedule_date: !isOutsidePlan ? selectedDate : undefined,
        remain_only: isOutsidePlan,
      });
      setAllPlans(res.data || []);
    } catch (e) {
      console.warn('Lỗi tải kế hoạch:', e);
    } finally {
      setLoading(false);
    }
  };

  // Lọc Model, Pantone, Size từ allPlans
  const availableModels = Array.from(new Set(allPlans.map((p) => p.model_code)));
  const availablePantones = Array.from(
    new Set(allPlans.filter((p) => p.model_code === selectedModel).map((p) => p.pantone_code))
  );
  const availableSizes = allPlans
    .filter((p) => p.model_code === selectedModel && p.pantone_code === selectedPantone)
    .map((p) => ({ size: p.size, remain: p.remain_qty, plan: p }));

  const handleSelectSize = (sz: string) => {
    setSelectedSize(sz);
    const matched = availableSizes.find((s) => s.size === sz);
    if (matched) {
      setRemainQty(matched.remain);
      setTargetPairs(matched.remain);
    }
  };

  // --- XỬ LÝ TẠO TEM ---
  const handleGenerateLabels = async () => {
    if (!selectedModel || !selectedPantone || !selectedSize) {
      Alert.alert('Cảnh báo', 'Vui lòng chọn đầy đủ Model, Pantone và Size!');
      return;
    }
    if (targetPairs <= 0) {
      Alert.alert('Cảnh báo', 'Số lượng đôi cần tạo phải lớn hơn 0!');
      return;
    }

    const currentPlan = availableSizes.find((s) => s.size === selectedSize)?.plan;
    const planningCode = currentPlan ? currentPlan.planning_code : `MANUAL-${selectedModel}`;

    try {
      setLoading(true);
      const res = await erpApi.generateBarcode({
        planning_code: planningCode,
        schedule_date: selectedDate || undefined,
        division: currentPlan?.division || 'IP',
        model_code: selectedModel,
        pantone_code: selectedPantone,
        customer_name: currentPlan?.customer_name || '-',
        size: selectedSize,
        shift: selectedShift,
        product_date: productDate,
        target_pairs: targetPairs,
        pairs_per_label: pairsPerLabel,
        fixed_etd: currentPlan?.fixed_etd || '-',
        is_outside_plan: isOutsidePlan,
      });

      setGeneratedLabels(res.data || []);
      playSuccessBeep();
      Alert.alert('Thành công', `Đã tạo thành công ${res.data.length} tem A4!`);
    } catch (e: any) {
      playErrorBeep();
      Alert.alert('Lỗi', e.response?.data?.detail || 'Không thể tạo tem');
    } finally {
      setLoading(false);
    }
  };

  // --- IN TEM A4 CHUẨN ---
  const handlePrintLabels = () => {
    if (generatedLabels.length === 0) {
      Alert.alert('Thông báo', 'Chưa có tem để in!');
      return;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    } else {
      Alert.alert('In ấn', 'Chức năng gửi trực tiếp máy in A4 đang được kích hoạt.');
    }
  };

  // --- XỬ LÝ QUÉT MÃ VẠCH ---
  const processScanCode = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    try {
      const res = await erpApi.scanBarcode({ raw_barcode: code, scanned_by: 'Operator' });
      if (res.data.is_duplicate) {
        playErrorBeep();
        Alert.alert('Cảnh báo quét lặp', res.data.message);
        return;
      }

      if (res.data.success) {
        playSuccessBeep();
        setLastScannedText(code);

        // Cập nhật danh sách chờ lưu (Staging List)
        const pCode = res.data.planning_code || 'UNKNOWN';
        const sz = res.data.size || '-';
        const qty = res.data.produced_qty || 1;

        setStagedScans((prev) => {
          const existingIdx = prev.findIndex(
            (item) => item.planning_code === pCode && item.size === sz
          );
          if (existingIdx !== -1) {
            const updated = [...prev];
            updated[existingIdx].total_pairs += qty;
            updated[existingIdx].scanned_count += 1;
            updated[existingIdx].barcode_ids.push(res.data.barcode_id);
            return updated;
          } else {
            return [
              ...prev,
              {
                planning_code: pCode,
                division: res.data.division || 'IP',
                model_code: res.data.model_code || '-',
                pantone_code: res.data.pantone_code || '-',
                customer_name: res.data.customer_name || '-',
                size: sz,
                shift: res.data.shift || 'Ca A',
                product_date: res.data.product_date || productDate,
                total_pairs: qty,
                scanned_count: 1,
                barcode_ids: [res.data.barcode_id],
              },
            ];
          }
        });

        setTotalScannedPairs((prev) => prev + qty);
      }
    } catch (e: any) {
      playErrorBeep();
      console.warn('Lỗi khi quét mã:', e);
    }
  };

  // --- XÁC NHẬN LƯU VÀO IP SẢN XUẤT ---
  const handleCommitScans = async () => {
    if (stagedScans.length === 0) {
      Alert.alert('Thông báo', 'Chưa có tem nào được quét để lưu!');
      return;
    }

    try {
      setLoading(true);
      const res = await erpApi.commitScans({
        items: stagedScans,
        operator_name: 'Operator',
      });
      playSuccessBeep();
      Alert.alert('Thành công', res.data.message);
      setStagedScans([]);
      setTotalScannedPairs(0);
      loadPlans(); // Làm mới số liệu còn lại
    } catch (e: any) {
      playErrorBeep();
      Alert.alert('Lỗi lưu đơn', e.response?.data?.detail || 'Lỗi khi lưu vào IP Sản Xuất');
    } finally {
      setLoading(false);
    }
  };

  // --- TRA CỨU LỊCH SỬ TEM ĐỂ IN LẠI ---
  const handleSearchHistory = async () => {
    try {
      setLoading(true);
      const res = await erpApi.getBarcodeHistory({
        planning_code: historySearchCode || undefined,
        limit: 100,
      });
      setHistoryList(res.data || []);
    } catch (e) {
      console.warn('Lỗi tra cứu lịch sử:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReprintSelected = () => {
    const selectedLabels = historyList
      .filter((h) => selectedHistoryIds.includes(h.barcodeId))
      .map((h, idx, arr) => ({
        barcodeId: h.barcodeId,
        barcodePayload: h.barcodePayload,
        planningCode: h.planningCode,
        division: h.division,
        customerName: h.customerName,
        modelCode: h.modelCode,
        pantoneCode: h.pantoneCode,
        size: h.size,
        producedQty: h.producedQty,
        shift: h.shift,
        productDate: h.productDate,
        fixedETD: h.fixedETD,
        serial: idx + 1,
        totalSerial: arr.length,
      }));

    if (selectedLabels.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 tem để in lại!');
      return;
    }

    setGeneratedLabels(selectedLabels);
    setActiveTab('generate');
    Alert.alert('Thông báo', `Đã chuyển ${selectedLabels.length} tem vào bản xem trước A4!`);
  };

  // Chia danh sách tem thành các tờ A4 (mỗi tờ đúng 6 tem = 2 cột x 3 hàng)
  const a4Sheets: LabelData[][] = [];
  for (let i = 0; i < generatedLabels.length; i += 6) {
    a4Sheets.push(generatedLabels.slice(i, i + 6));
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <FontAwesome5 name="barcode" size={22} color="#38bdf8" />
          <View>
            <Text style={styles.headerTitle}>MÃ VẠCH SẢN XUẤT (BARCODE PRODUCTION)</Text>
            <Text style={styles.headerSubtitle}>
              Tạo tem A4 chuẩn 6 tem/trang • Quét liên tục chống trùng • Đồng bộ Realtime
            </Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'generate' && styles.tabBtnActive]}
            onPress={() => setActiveTab('generate')}
          >
            <FontAwesome5
              name="print"
              size={13}
              color={activeTab === 'generate' ? '#ffffff' : '#64748b'}
            />
            <Text
              style={[styles.tabBtnText, activeTab === 'generate' && styles.tabBtnTextActive]}
            >
              1. Tạo & In Tem A4
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'scan' && styles.tabBtnActive]}
            onPress={() => setActiveTab('scan')}
          >
            <FontAwesome5
              name="qrcode"
              size={13}
              color={activeTab === 'scan' ? '#ffffff' : '#64748b'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'scan' && styles.tabBtnTextActive]}>
              2. Quét Mã Vạch
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'reprint' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('reprint');
              handleSearchHistory();
            }}
          >
            <FontAwesome5
              name="history"
              size={13}
              color={activeTab === 'reprint' ? '#ffffff' : '#64748b'}
            />
            <Text
              style={[styles.tabBtnText, activeTab === 'reprint' && styles.tabBtnTextActive]}
            >
              3. Lịch Sử & In Lại
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ============================================================ */}
        {/* TAB 1: TẠO & IN TEM MÃ VẠCH A4 */}
        {/* ============================================================ */}
        {activeTab === 'generate' && (
          <View style={styles.tabContent}>
            {/* Chế độ tạo: Theo tờ gạch vs Ngoài tờ gạch */}
            <View style={styles.modeCard}>
              <View style={styles.modeToggleGroup}>
                <TouchableOpacity
                  style={[styles.modeToggleBtn, !isOutsidePlan && styles.modeToggleBtnActive]}
                  onPress={() => {
                    setIsOutsidePlan(false);
                    setSelectedModel('');
                    setSelectedPantone('');
                    setSelectedSize('');
                  }}
                >
                  <FontAwesome5
                    name="calendar-check"
                    size={13}
                    color={!isOutsidePlan ? '#ffffff' : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.modeToggleText,
                      !isOutsidePlan && styles.modeToggleTextActive,
                    ]}
                  >
                    Theo Kế Hoạch Tờ Gạch
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeToggleBtn, isOutsidePlan && styles.modeToggleBtnActive]}
                  onPress={() => {
                    setIsOutsidePlan(true);
                    setSelectedModel('');
                    setSelectedPantone('');
                    setSelectedSize('');
                  }}
                >
                  <FontAwesome5
                    name="external-link-alt"
                    size={13}
                    color={isOutsidePlan ? '#ffffff' : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.modeToggleText,
                      isOutsidePlan && styles.modeToggleTextActive,
                    ]}
                  >
                    Ngoài Tờ Gạch (Đơn Còn Remain)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Grid Nhập Liệu Tạo Tem */}
              <View style={styles.formGrid}>
                {/* 1. Chọn ngày tờ gạch (nếu theo kế hoạch) */}
                {!isOutsidePlan && (
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>NGÀY TỜ GẠCH</Text>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.textInput}
                        value={selectedDate}
                        onChangeText={setSelectedDate}
                        placeholder="YYYY-MM-DD"
                      />
                    </View>
                  </View>
                )}

                {/* 2. Model Code */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>MODEL CODE</Text>
                  <View style={styles.selectOptionsRow}>
                    {availableModels.map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.chipOption,
                          selectedModel === m && styles.chipOptionActive,
                        ]}
                        onPress={() => {
                          setSelectedModel(m);
                          setSelectedPantone('');
                          setSelectedSize('');
                        }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedModel === m && styles.chipTextActive,
                          ]}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {availableModels.length === 0 && (
                      <Text style={styles.emptyNote}>Không có model nào cho ngày này</Text>
                    )}
                  </View>
                </View>

                {/* 3. Pantone Code */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>PANTONE CODE</Text>
                  <View style={styles.selectOptionsRow}>
                    {availablePantones.map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.chipOption,
                          selectedPantone === p && styles.chipOptionActive,
                        ]}
                        onPress={() => {
                          setSelectedPantone(p);
                          setSelectedSize('');
                        }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedPantone === p && styles.chipTextActive,
                          ]}
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 4. Size */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>SIZE & REMAIN</Text>
                  <View style={styles.selectOptionsRow}>
                    {availableSizes.map((s) => (
                      <TouchableOpacity
                        key={s.size}
                        style={[
                          styles.chipOption,
                          selectedSize === s.size && styles.chipOptionActive,
                        ]}
                        onPress={() => handleSelectSize(s.size)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedSize === s.size && styles.chipTextActive,
                          ]}
                        >
                          Size {s.size} ({s.remain} đôi)
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 5. Số đôi cần tạo & Ca SX */}
                <View style={styles.formRowTwo}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>SỐ ĐÔI CẦN TẠO TEM</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={String(targetPairs)}
                      onChangeText={(val) => setTargetPairs(parseInt(val) || 0)}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>SỐ ĐÔI TRÊN 1 TEM</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={String(pairsPerLabel)}
                      onChangeText={(val) => setPairsPerLabel(parseInt(val) || 1)}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>CA SẢN XUẤT</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {['Ca A', 'Ca B'].map((sh) => (
                        <TouchableOpacity
                          key={sh}
                          style={[
                            styles.shiftBtn,
                            selectedShift === sh && styles.shiftBtnActive,
                          ]}
                          onPress={() => setSelectedShift(sh)}
                        >
                          <Text
                            style={[
                              styles.shiftBtnText,
                              selectedShift === sh && styles.shiftBtnTextActive,
                            ]}
                          >
                            {sh}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Button Action */}
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={handleGenerateLabels}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <FontAwesome5 name="qrcode" size={14} color="#ffffff" />
                        <Text style={styles.btnPrimaryText}>Tạo & Xem Bản In Tem</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {generatedLabels.length > 0 && (
                    <TouchableOpacity style={styles.btnPrintA4} onPress={handlePrintLabels}>
                      <FontAwesome5 name="print" size={14} color="#ffffff" />
                      <Text style={styles.btnPrintA4Text}>
                        In Tất Cả {generatedLabels.length} Tem Khổ A4 ({a4Sheets.length} trang)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* KHUNG XEM TRƯỚC BẢN IN A4 (6 TEM / TRANG) */}
            {a4Sheets.length > 0 && (
              <View style={styles.previewContainer}>
                <View style={styles.previewHeaderBar}>
                  <Text style={styles.previewTitle}>
                    BẢN XEM TRƯỚC IN ẤN A4 (TỔNG {generatedLabels.length} TEM -{' '}
                    {a4Sheets.length} TRANG A4)
                  </Text>
                  <TouchableOpacity style={styles.btnPrintSmall} onPress={handlePrintLabels}>
                    <FontAwesome5 name="print" size={12} color="#ffffff" />
                    <Text style={styles.btnPrintSmallText}>In Ngay</Text>
                  </TouchableOpacity>
                </View>

                {/* Danh sách các trang A4 */}
                {a4Sheets.map((sheet, sheetIdx) => (
                  <View key={`sheet-${sheetIdx}`} style={styles.a4Sheet}>
                    <View style={styles.sheetGrid}>
                      {sheet.map((lbl) => (
                        <BarcodeLabelCard key={lbl.barcodeId} label={lbl} />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ============================================================ */}
        {/* TAB 2: QUÉT MÃ VẠCH (CONTINUOUS SCAN & ANTI-DUPLICATE) */}
        {/* ============================================================ */}
        {activeTab === 'scan' && (
          <View style={styles.tabContent}>
            <View style={styles.scanLayout}>
              {/* Cột trái: Máy quét & Camera */}
              <View style={styles.scanLeftCol}>
                {/* Súng quét cầm tay USB/Bluetooth */}
                <View style={styles.scanCard}>
                  <View style={styles.scanCardHeader}>
                    <FontAwesome5 name="barcode" size={16} color="#3b82f6" />
                    <Text style={styles.scanCardTitle}>Súng Quét Mã Vạch Cầm Tay</Text>
                  </View>
                  <Text style={styles.scanCardHint}>
                    Tự động nhận tín hiệu súng scan USB/Bluetooth. Chỉ cần bóp cò máy scan!
                  </Text>
                  <TextInput
                    style={styles.gunScanInput}
                    placeholder="Bóp cò súng quét hoặc nhập mã rồi nhấn Enter..."
                    value={gunInput}
                    onChangeText={setGunInput}
                    onSubmitEditing={() => {
                      processScanCode(gunInput);
                      setGunInput('');
                    }}
                    autoFocus
                  />
                </View>

                {/* Camera Quét Trực Tiếp (1 Nút Duy Nhất Bật/Tắt) */}
                <View style={styles.scanCard}>
                  <View style={styles.cameraHeaderRow}>
                    <Text style={styles.scanCardTitle}>Camera Quét Trực Tiếp</Text>
                    <TouchableOpacity
                      style={[
                        styles.btnCameraToggle,
                        isCameraActive && styles.btnCameraToggleActive,
                      ]}
                      onPress={() => setIsCameraActive(!isCameraActive)}
                    >
                      <FontAwesome5
                        name={isCameraActive ? 'stop' : 'camera'}
                        size={12}
                        color="#ffffff"
                      />
                      <Text style={styles.btnCameraToggleText}>
                        {isCameraActive ? 'Tắt Camera' : 'Bật Camera Quét'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isCameraActive && (
                    <View style={styles.cameraViewport}>
                      <View style={styles.laserLine} />
                      <Text style={styles.cameraScanNote}>
                        Đang quét liên tục... Hướng camera vào tem để nhận diện!
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Cột phải: Thống kê & Xác nhận lưu vào IP Sản Xuất */}
              <View style={styles.scanRightCol}>
                <View style={styles.scanCard}>
                  <Text style={styles.scanCardTitle}>Thống Kê Phiên Quét Hiện Tại</Text>
                  <View style={styles.kpiRow}>
                    <View style={styles.kpiBoxGreen}>
                      <Text style={styles.kpiLabel}>TỔNG ĐÔI ĐÃ QUÉT</Text>
                      <Text style={styles.kpiValGreen}>{totalScannedPairs}</Text>
                    </View>
                    <View style={styles.kpiBoxBlue}>
                      <Text style={styles.kpiLabel}>SỐ ĐƠN (GỘP)</Text>
                      <Text style={styles.kpiValBlue}>{stagedScans.length}</Text>
                    </View>
                  </View>

                  {/* Bảng tạm Staging Table */}
                  <View style={styles.stagingTableWrap}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.thCell, { flex: 2 }]}>Kế hoạch</Text>
                      <Text style={[styles.thCell, { flex: 1 }]}>Size</Text>
                      <Text style={[styles.thCell, { flex: 1 }]}>Số đôi</Text>
                      <Text style={[styles.thCell, { flex: 1 }]}>Số tem</Text>
                    </View>
                    {stagedScans.map((item, idx) => (
                      <View key={idx} style={styles.tableDataRow}>
                        <Text style={[styles.tdCell, { flex: 2, fontWeight: '700' }]}>
                          {item.planning_code}
                        </Text>
                        <Text style={[styles.tdCell, { flex: 1 }]}>{item.size}</Text>
                        <Text style={[styles.tdCell, { flex: 1, color: '#16a34a', fontWeight: '800' }]}>
                          {item.total_pairs}
                        </Text>
                        <Text style={[styles.tdCell, { flex: 1 }]}>{item.scanned_count}</Text>
                      </View>
                    ))}
                    {stagedScans.length === 0 && (
                      <Text style={styles.emptyTableText}>Chưa có tem nào được quét</Text>
                    )}
                  </View>

                  {/* Nút Xác nhận lưu */}
                  <TouchableOpacity
                    style={styles.btnCommit}
                    onPress={handleCommitScans}
                    disabled={loading || stagedScans.length === 0}
                  >
                    <FontAwesome5 name="cloud-upload-alt" size={14} color="#ffffff" />
                    <Text style={styles.btnCommitText}>Xác Nhận Lưu Vào IP Sản Xuất</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* TAB 3: LỊCH SỬ & IN LẠI TEM (REPRINT) */}
        {/* ============================================================ */}
        {activeTab === 'reprint' && (
          <View style={styles.tabContent}>
            <View style={styles.reprintHeaderCard}>
              <View style={{ flexDirection: 'row', gap: 10, flex: 1 }}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Tìm theo Planning Code hoặc Model Code..."
                  value={historySearchCode}
                  onChangeText={setHistorySearchCode}
                  onSubmitEditing={handleSearchHistory}
                />
                <TouchableOpacity style={styles.btnSearch} onPress={handleSearchHistory}>
                  <FontAwesome5 name="search" size={13} color="#ffffff" />
                  <Text style={styles.btnSearchText}>Tìm Kiếm</Text>
                </TouchableOpacity>
              </View>

              {selectedHistoryIds.length > 0 && (
                <TouchableOpacity style={styles.btnReprintSelected} onPress={handleReprintSelected}>
                  <FontAwesome5 name="print" size={13} color="#ffffff" />
                  <Text style={styles.btnReprintSelectedText}>
                    In Lại {selectedHistoryIds.length} Tem Đã Chọn
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Bảng lịch sử */}
            <View style={styles.historyTableContainer}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thCell, { width: 50 }]}>Chọn</Text>
                <Text style={[styles.thCell, { flex: 2 }]}>Mã Tem (Barcode ID)</Text>
                <Text style={[styles.thCell, { flex: 2 }]}>Planning Code</Text>
                <Text style={[styles.thCell, { flex: 1.5 }]}>Model</Text>
                <Text style={[styles.thCell, { flex: 1 }]}>Size</Text>
                <Text style={[styles.thCell, { flex: 1 }]}>Số đôi</Text>
                <Text style={[styles.thCell, { flex: 1 }]}>Ca</Text>
                <Text style={[styles.thCell, { flex: 1.5 }]}>Ngày Tạo</Text>
              </View>

              {historyList.map((row) => {
                const isChecked = selectedHistoryIds.includes(row.barcodeId);
                return (
                  <TouchableOpacity
                    key={row.barcodeId}
                    style={[styles.tableDataRow, isChecked && { backgroundColor: '#f0fdf4' }]}
                    onPress={() => {
                      if (isChecked) {
                        setSelectedHistoryIds((prev) => prev.filter((id) => id !== row.barcodeId));
                      } else {
                        setSelectedHistoryIds((prev) => [...prev, row.barcodeId]);
                      }
                    }}
                  >
                    <View style={{ width: 50, alignItems: 'center' }}>
                      <FontAwesome5
                        name={isChecked ? 'check-square' : 'square'}
                        size={16}
                        color={isChecked ? '#16a34a' : '#cbd5e1'}
                      />
                    </View>
                    <Text style={[styles.tdCell, { flex: 2, fontWeight: '700' }]}>
                      {row.barcodeId}
                    </Text>
                    <Text style={[styles.tdCell, { flex: 2 }]}>{row.planningCode}</Text>
                    <Text style={[styles.tdCell, { flex: 1.5 }]}>{row.modelCode}</Text>
                    <Text style={[styles.tdCell, { flex: 1, fontWeight: '800' }]}>{row.size}</Text>
                    <Text style={[styles.tdCell, { flex: 1, color: '#16a34a', fontWeight: '800' }]}>
                      {row.producedQty}
                    </Text>
                    <Text style={[styles.tdCell, { flex: 1 }]}>{row.shift}</Text>
                    <Text style={[styles.tdCell, { flex: 1.5, fontSize: 11, color: '#64748b' }]}>
                      {row.createdAt}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {historyList.length === 0 && (
                <Text style={styles.emptyTableText}>Không tìm thấy tem nào</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#0284c7',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    gap: 16,
  },
  modeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modeToggleGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    gap: 8,
  },
  modeToggleBtnActive: {
    backgroundColor: '#0f172a',
  },
  modeToggleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b',
  },
  modeToggleTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  formGrid: {
    gap: 12,
  },
  formField: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.4,
  },
  inputWrap: {
    width: 220,
  },
  textInput: {
    height: 38,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    fontSize: 13,
  },
  selectOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  chipOptionActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  formRowTwo: {
    flexDirection: 'row',
    gap: 14,
  },
  shiftBtn: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  shiftBtnActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  shiftBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  shiftBtnTextActive: {
    color: '#ffffff',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  btnPrintA4: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  btnPrintA4Text: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  previewContainer: {
    marginTop: 16,
    gap: 16,
  },
  previewHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  previewTitle: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  btnPrintSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  btnPrintSmallText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  a4Sheet: {
    width: Platform.OS === 'web' ? ('198mm' as any) : '100%',
    minHeight: Platform.OS === 'web' ? ('274mm' as any) : 600,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignSelf: 'center',
    padding: 6,
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)' as any,
  },
  sheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  scanLayout: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  scanLeftCol: {
    flex: 1,
    minWidth: 320,
    gap: 16,
  },
  scanRightCol: {
    flex: 1,
    minWidth: 320,
  },
  scanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scanCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  scanCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  scanCardHint: {
    fontSize: 11.5,
    color: '#64748b',
    marginBottom: 10,
  },
  gunScanInput: {
    height: 42,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  cameraHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnCameraToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 6,
    gap: 6,
  },
  btnCameraToggleActive: {
    backgroundColor: '#dc2626',
  },
  btnCameraToggleText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  cameraViewport: {
    height: 280,
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  laserLine: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '50%',
    height: 2,
    backgroundColor: '#ef4444',
  },
  cameraScanNote: {
    color: '#ffffff',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  kpiBoxGreen: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  kpiValGreen: {
    fontSize: 26,
    fontWeight: '900',
    color: '#15803d',
  },
  kpiBoxBlue: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  kpiValBlue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1d4ed8',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  stagingTableWrap: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginVertical: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  thCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tableDataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  tdCell: {
    fontSize: 12,
    color: '#0f172a',
  },
  emptyTableText: {
    textAlign: 'center',
    paddingVertical: 16,
    color: '#94a3b8',
    fontSize: 12,
  },
  btnCommit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  btnCommitText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  reprintHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  btnSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    height: 38,
  },
  btnSearchText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  btnReprintSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    height: 38,
  },
  btnReprintSelectedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  historyTableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  emptyNote: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    padding: 6,
  },
});
