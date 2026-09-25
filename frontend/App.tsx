import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Sidebar } from './src/components/Sidebar';
import { BarcodeProductionScreen } from './src/screens/BarcodeProductionScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('barcode');

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="light" />
      <View style={styles.mainLayout}>
        {/* Left Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} userName="Admin" />

        {/* Right Content Area */}
        <View style={styles.screenContainer}>
          {currentTab === 'barcode' && <BarcodeProductionScreen />}
          {currentTab !== 'barcode' && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                Phân hệ đang được hoàn thiện. Vui lòng chọn "Mã Vạch Sản Xuất"!
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
    ...(Platform.OS === 'web' ? { height: '100vh' as any } : {}),
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
});
