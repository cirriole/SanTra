/**
 * TriDo アプリ テーマ定義
 * オレンジ基調のシンプルで優しいカラーパレット
 */

import { Platform } from 'react-native';

// アプリカラーパレット（デフォルト/ライトモード）
export const AppColors = {
  // メインカラー (オレンジ基調)
  primary: '#FF7A00',
  primaryDark: '#E06300',
  primaryLight: '#FFF2E6',
  primarySoft: '#FFC299',

  // アクセント (ライトブルー)
  accent: '#4A9EFF',
  accentLight: '#E8F4FD',

  // ステータス
  success: '#4CAF50',
  successLight: '#E8F5E9',
  danger: '#FF5252',
  dangerLight: '#FFEBEE',
  warning: '#FFC107',
  warningLight: '#FFF8E1',

  // 優先度カラー
  priorityHigh: '#FF5252',
  priorityHighBg: '#FFEBEE',
  priorityMedium: '#FFC107',
  priorityMediumBg: '#FFF8E1',
  priorityLow: '#4A9EFF',
  priorityLowBg: '#E8F4FD',

  // 背景・テキスト
  background: '#E4E9F0',
  backgroundLight: '#F0F4F8',
  surface: '#F4F7F9',
  surfaceHover: '#EAF0F5',
  textPrimary: '#1A2B3D',
  textSecondary: '#6B7F94',
  textMuted: '#A0B1C2',
  textOnPrimary: '#FFFFFF',

  // ボーダー・シャドウ
  border: '#E3ECF3',
  borderLight: '#F0F5FA',
  borderDark: '#94A3B8',
  shadow: 'rgba(255, 122, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.1)',

  // 特殊
  overlay: 'rgba(0, 0, 0, 0.4)',
  todayCardGradientStart: '#FF7A00',
  todayCardGradientEnd: '#FFA04D',
  quickTaskBg: '#FFF2E6',
  completedBg: '#F8FAF8',
};

export type ThemeColors = typeof AppColors;

export const lightColors: ThemeColors = {
  ...AppColors
};

export const darkColors: ThemeColors = {
  primary: '#FF7A00',
  primaryDark: '#CC6200',
  primaryLight: '#331800',
  primarySoft: '#4D2400',

  accent: '#4A9EFF',
  accentLight: '#0A1C33',

  success: '#4CD964',
  successLight: '#0A1A0B',
  danger: '#FF3B30',
  dangerLight: '#330A0A',
  warning: '#FFC107',
  warningLight: '#332600',

  priorityHigh: '#FF3B30',
  priorityHighBg: '#330A0A',
  priorityMedium: '#FFC107',
  priorityMediumBg: '#332600',
  priorityLow: '#4A9EFF',
  priorityLowBg: '#0A1C33',

  background: '#121212',
  backgroundLight: '#181818',
  surface: '#1E1E1E',
  surfaceHover: '#2A2A2A',
  textPrimary: '#EBEBF5',
  textSecondary: '#EBEBF599',
  textMuted: '#EBEBF54D',
  textOnPrimary: '#FFFFFF',

  border: '#38383A',
  borderLight: '#2C2C2E',
  borderDark: '#475569',
  shadow: 'rgba(0, 0, 0, 0.5)',
  shadowDark: 'rgba(0, 0, 0, 0.8)',

  overlay: 'rgba(0, 0, 0, 0.7)',
  todayCardGradientStart: '#FF8C1A',
  todayCardGradientEnd: '#E66A00',
  quickTaskBg: '#331800',
  completedBg: '#1A1C1A',
};

// スペーシング
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// 角丸
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

// シャドウ
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 12,
  },
  fab: {
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
};

// フォント
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

// タイポグラフィ
export const Typography = {
  hero: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

// レガシーカラー (後方互換性)
const tintColorLight = '#FF7A00';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1A2B3D',
    background: '#F5F9FC',
    tint: tintColorLight,
    icon: '#6B7F94',
    tabIconDefault: '#A0B1C2',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
