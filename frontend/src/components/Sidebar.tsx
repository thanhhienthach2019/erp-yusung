import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, userName = 'Admin' }) => {
  const menuItems = [
    { id: 'barcode', label: 'Mã Vạch Sản Xuất', icon: 'barcode' },
    { id: 'planning', label: 'Kế Hoạch Sản Xuất', icon: 'calendar-alt' },
    { id: 'production', label: 'IP Sản Xuất', icon: 'industry' },
    { id: 'orders', label: 'Đơn Hàng & Xuất Hàng', icon: 'boxes' },
  ];

  return (
    <View style={styles.sidebarContainer}>
      {/* Brand Header */}
      <View style={styles.brandBox}>
        <View style={styles.logoBadge}>
          <FontAwesome5 name="industry" size={18} color="#38bdf8" />
        </View>
        <View>
          <Text style={styles.brandTitle}>ERP NEXTGEN</Text>
          <Text style={styles.brandSubtitle}>Hệ Thống Quản Trị Sản Xuất</Text>
        </View>
      </View>

      {/* Navigation List */}
      <View style={styles.navList}>
        <Text style={styles.sectionTitle}>PHÂN HỆ SẢN XUẤT</Text>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onSelectTab(item.id)}
            >
              <FontAwesome5
                name={item.icon as any}
                size={16}
                color={isActive ? '#38bdf8' : '#94a3b8'}
                style={styles.navIcon}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User Info Footer */}
      <View style={styles.userFooter}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userNameText}>{userName}</Text>
          <Text style={styles.userRoleText}>Quản trị viên (Online)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 260,
    backgroundColor: '#0f172a',
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
    paddingVertical: 18,
    paddingHorizontal: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' ? { height: '100vh' as any } : { height: '100%' }),
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  navList: {
    flex: 1,
    paddingTop: 16,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  navIcon: {
    width: 24,
    marginRight: 10,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    flex: 1,
  },
  navLabelActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  userNameText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  userRoleText: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '600',
  },
});
