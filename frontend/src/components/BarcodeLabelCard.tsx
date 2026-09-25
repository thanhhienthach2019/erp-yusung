import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export interface LabelData {
  barcodeId: string;
  barcodePayload: string;
  planningCode: string;
  division: string;
  customerName: string;
  modelCode: string;
  pantoneCode: string;
  size: string;
  producedQty: number;
  shift: string;
  productDate: string;
  fixedETD: string;
  serial: number;
  totalSerial: number;
}

interface BarcodeLabelCardProps {
  label: LabelData;
}

export const BarcodeLabelCard: React.FC<BarcodeLabelCardProps> = ({ label }) => {
  const svgRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const JsBarcode = (window as any).JsBarcode || require('jsbarcode');
        if (JsBarcode && svgRef.current) {
          JsBarcode(svgRef.current, label.barcodePayload, {
            format: 'CODE128',
            lineColor: '#000000',
            width: 2.1,
            height: 52,
            displayValue: false,
            margin: 2,
          });
        }
      } catch (e) {
        console.warn('JsBarcode render warning:', e);
      }
    }
  }, [label.barcodePayload]);

  return (
    <View style={styles.cardContainer}>
      {/* 1. Header: Company & Shift */}
      <View style={styles.headerRow}>
        <Text style={styles.companyName}>
          CÔNG TY TNHH BÌNH TIÊN ĐỒNG NAI (B release)
        </Text>
        <Text style={styles.shiftBadge}>
          {label.shift ? label.shift.toUpperCase() : 'CA A'}
        </Text>
      </View>

      {/* 2. Model Code */}
      <View style={styles.modelRow}>
        <Text style={styles.modelText}>{label.modelCode || '-'}</Text>
      </View>

      {/* 3. Pantone Code */}
      <View style={styles.pantoneRow}>
        <Text style={styles.pantoneText}>{label.pantoneCode || '-'}</Text>
      </View>

      {/* 4. Size & Quantity */}
      <View style={styles.sizeQtyRow}>
        <View style={[styles.sizeCell, { borderRightWidth: 1.5, borderRightColor: '#000000' }]}>
          <Text style={styles.cellLabel}>SIZE</Text>
          <Text style={styles.cellValue}>{label.size || '-'}</Text>
        </View>
        <View style={styles.qtyCell}>
          <Text style={styles.cellLabel}>SỐ LƯỢNG (ĐÔI)</Text>
          <Text style={styles.cellValue}>{label.producedQty || 1}</Text>
        </View>
      </View>

      {/* 5. Barcode Vector / Display */}
      <View style={styles.barcodeBox}>
        {Platform.OS === 'web' ? (
          <svg
            ref={svgRef}
            style={{ maxWidth: '100%', height: 52, display: 'block', margin: '0 auto' }}
          />
        ) : (
          <View style={styles.mobileBarcodeFallback}>
            <Text style={styles.barcodeFallbackText}>{label.barcodePayload}</Text>
          </View>
        )}
      </View>

      {/* 6. Footer: Planning, ETD, Date & Serial */}
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerSmallText}>
            Kế hoạch: <Text style={styles.boldText}>{label.planningCode}</Text>
          </Text>
          <Text style={styles.footerSmallText}>
            Ngày SX: <Text style={styles.boldText}>{label.productDate}</Text>
          </Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.footerSmallText}>
            ETD: <Text style={styles.boldText}>{label.fixedETD || '-'}</Text>
          </Text>
          <Text style={styles.serialBadge}>
            TEM: {String(label.serial).padStart(2, '0')} / {String(label.totalSerial).padStart(2, '0')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: Platform.OS === 'web' ? ('96mm' as any) : 340,
    height: Platform.OS === 'web' ? ('88mm' as any) : 310,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 4,
    padding: 6,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    boxSizing: 'border-box' as any,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    paddingBottom: 3,
  },
  companyName: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    flex: 1,
  },
  shiftBadge: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#000000',
    borderLeftWidth: 1.5,
    borderLeftColor: '#000000',
    paddingLeft: 6,
  },
  modelRow: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    paddingVertical: 3,
    alignItems: 'center',
  },
  modelText: {
    fontSize: 23,
    fontWeight: '900',
    color: '#000000',
    lineHeight: 26,
    letterSpacing: 0.5,
  },
  pantoneRow: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    paddingVertical: 2,
    alignItems: 'center',
  },
  pantoneText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#000000',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  sizeQtyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
  },
  sizeCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
  },
  qtyCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
  },
  cellLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#475569',
    textTransform: 'uppercase',
  },
  cellValue: {
    fontSize: 30,
    fontWeight: '900',
    color: '#000000',
    lineHeight: 32,
  },
  barcodeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    paddingVertical: 4,
    minHeight: 56,
  },
  mobileBarcodeFallback: {
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 4,
  },
  barcodeFallbackText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 3,
  },
  footerLeft: {
    gap: 1,
  },
  footerRight: {
    alignItems: 'flex-end',
    gap: 1,
  },
  footerSmallText: {
    fontSize: 8,
    color: '#1e293b',
  },
  boldText: {
    fontWeight: '800',
    color: '#000000',
  },
  serialBadge: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#000000',
  },
});
