import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Language } from '../i18n/translations';

interface TopHeaderProps {
  currentTab: string;
  tabTitle: string;
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  userName?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  tabTitle,
  currentLang,
  onSelectLang,
  searchQuery,
  onSearchChange,
  userName = 'Admin'
}) => {
  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'vi', label: 'VI', flag: '🇻🇳' },
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'ko', label: 'KO', flag: '🇰🇷' },
    { code: 'zh', label: 'ZH', flag: '🇨🇳' },
  ];

  return (
    <View style={styles.headerContainer}>
      {/* Title & Breadcrumb */}
      <View style={styles.titleSection}>
        <View style={styles.plantBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.plantText}>YUSUNG PLANT #1 • IP PHÂN XƯỞNG</Text>
        </View>
        <Text style={styles.screenTitle}>{tabTitle}</Text>
      </View>

      {/* Global Search Bar */}
      <View style={styles.searchSection}>
        <FontAwesome5 name="search" size={13} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tra cứu PO, Model, Pantone, Kế hoạch..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <FontAwesome5 name="times-circle" size={13} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Actions: Languages & User */}
      <View style={styles.actionsSection}>
        {/* Language Switcher */}
        <View style={styles.langContainer}>
          {languages.map(l => {
            const isSelected = currentLang === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                style={[styles.langBtn, isSelected && styles.langBtnActive]}
                onPress={() => onSelectLang(l.code)}
              >
                <Text style={styles.flagText}>{l.flag}</Text>
                <Text style={[styles.langText, isSelected && styles.langTextActive]}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* User Badge */}
        <View style={styles.userProfile}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarLetter}>{userName.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userRole}>Plant Manager</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 64,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  titleSection: {
    justifyContent: 'center',
  },
  plantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  plantText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    width: 320,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    outlineStyle: 'none' as any,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  langContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  langBtnActive: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  flagText: {
    fontSize: 11,
  },
  langText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  langTextActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  userRole: {
    fontSize: 10,
    color: '#64748b',
  },
});
