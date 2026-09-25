import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Sidebar } from './src/components/Sidebar';
import { TopHeader } from './src/components/TopHeader';
import { Language, useTranslation } from './src/i18n/translations';

// Functional Screens
import { DashboardScreen } from './src/screens/DashboardScreen';
import { OrderListScreen } from './src/screens/OrderListScreen';
import { OrderBalanceScreen } from './src/screens/OrderBalanceScreen';
import { ProductionPlanningScreen } from './src/screens/ProductionPlanningScreen';
import { IpProductionScreen } from './src/screens/IpProductionScreen';
import { BarcodeProductionScreen } from './src/screens/BarcodeProductionScreen';
import { ShippingListScreen } from './src/screens/ShippingListScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentLang, setCurrentLang] = useState<Language>('vi');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const t = useTranslation(currentLang);

  const getTabTitle = (tab: string): string => {
    switch (tab) {
      case 'dashboard':
        return t('nav_dashboard');
      case 'orders':
        return t('nav_order_list');
      case 'balance':
        return t('nav_order_balance');
      case 'planning':
        return t('nav_planning');
      case 'ipproduction':
        return t('nav_ip_production');
      case 'barcode':
        return t('nav_barcode');
      case 'shipping':
        return t('nav_shipping');
      default:
        return 'ERP NextGen';
    }
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="light" />
      <View style={styles.mainLayout}>
        {/* Modern Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userName="Admin Yusung"
          lang={currentLang}
        />

        {/* Content Body Area */}
        <View style={styles.bodyContainer}>
          {/* Top Global Header */}
          <TopHeader
            currentTab={currentTab}
            tabTitle={getTabTitle(currentTab)}
            currentLang={currentLang}
            onSelectLang={setCurrentLang}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userName="Admin Yusung"
          />

          {/* Active Screen Router */}
          <View style={styles.screenContainer}>
            {currentTab === 'dashboard' && <DashboardScreen onNavigate={setCurrentTab} />}
            {currentTab === 'orders' && <OrderListScreen />}
            {currentTab === 'balance' && <OrderBalanceScreen />}
            {currentTab === 'planning' && <ProductionPlanningScreen />}
            {currentTab === 'ipproduction' && <IpProductionScreen />}
            {currentTab === 'barcode' && <BarcodeProductionScreen />}
            {currentTab === 'shipping' && <ShippingListScreen />}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#0b1329',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
    ...(Platform.OS === 'web' ? { height: '100vh' as any } : {}),
  },
  bodyContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
  },
  screenContainer: {
    flex: 1,
    overflow: 'hidden',
  },
});
