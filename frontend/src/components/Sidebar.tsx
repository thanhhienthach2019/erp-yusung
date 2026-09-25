import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Language, useTranslation } from '../i18n/translations';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userName?: string;
  lang?: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userName = 'Admin',
  lang = 'vi'
}) => {
  const t = useTranslation(lang);

  const mainModules = [
    { id: 'dashboard', labelKey: 'nav_dashboard', icon: 'chart-pie', badge: 'KPI' },
    { id: 'orders', labelKey: 'nav_order_list', icon: 'clipboard-list', badge: 'PO' },
    { id: 'balance', labelKey: 'nav_order_balance', icon: 'balance-scale', badge: '29 Size' },
    { id: 'planning', labelKey: 'nav_planning', icon: 'calendar-alt', badge: 'Lịch' },
    { id: 'ipproduction', labelKey: 'nav_ip_production', icon: 'industry', badge: 'Ca A/B' },
    { id: 'barcode', labelKey: 'nav_barcode', icon: 'barcode', badge: 'A4 In' },
    { id: 'shipping', labelKey: 'nav_shipping', icon: 'truck-loading', badge: 'Xuất' },
  ];

  return (
    <View style={styles.sidebarContainer}>
      {/* Brand Header */}
      <View style={styles.brandBox}>
        <View style={styles.logoBadge}>
          <FontAwesome5 name="gem" size={18} color="#38bdf8" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandTitle}>YUSUNG ERP</Text>
          <Text style={styles.brandSubtitle}>Intelligent Manufacturing</Text>
        </View>
      </View>

      {/* Navigation List */}
      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PHÂN HỆ NGHIỆP VỤ NHÀ MÁY</Text>
        </View>

        <View style={styles.navList}>
          {mainModules.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => onSelectTab(item.id)}
                activeOpacity={0.7}
              >
                <FontAwesome5
                  name={item.icon as any}
                  size={15}
                  color={isActive ? '#38bdf8' : '#94a3b8'}
                  style={styles.navIcon}
                />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {t(item.labelKey)}
                </Text>
                {item.badge && (
                  <View style={[styles.badge, isActive && styles.badgeActive]}>
                    <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                      {item.badge}
                    </Text>
                  </View>
                )}
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* System Status & User Info */}
      <View style={styles.footerContainer}>
        <View style={styles.systemStatus}>
          <View style={styles.pulseDot} />
          <Text style={styles.systemStatusText}>Postgres • Redis • Cloudflare</Text>
        </View>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userNameText}>{userName}</Text>
            <Text style={styles.userRoleText}>Quản trị viên (Online)</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 250,
    backgroundColor: '#0b1329',
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
    display: 'flex',
    flexDirection: 'column',
    ...(Platform.OS === 'web' ? { height: '100vh' as any } : { height: '100%' }),
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  navScroll: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
  },
  navList: {
    gap: 3,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  navIcon: {
    width: 22,
    marginRight: 10,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 12.5,
    color: '#94a3b8',
    fontWeight: '600',
    flex: 1,
  },
  navLabelActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  badgeText: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#38bdf8',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3.5,
    borderRadius: 2,
    backgroundColor: '#38bdf8',
  },
  footerContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 10,
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  systemStatusText: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '500',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#131e38',
    borderRadius: 8,
    gap: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  userNameText: {
    color: '#f8fafc',
    fontSize: 11.5,
    fontWeight: '700',
  },
  userRoleText: {
    color: '#22c55e',
    fontSize: 9.5,
    fontWeight: '500',
  },
});
