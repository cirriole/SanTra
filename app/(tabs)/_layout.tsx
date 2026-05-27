import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Text, Pressable } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/contexts/ThemeContext';
import { Shadows } from '@/constants/theme';

import TodayScreen from './index';
import TasksScreen from './tasks';
import ReviewScreen from './review';
import CustomPager from '@/components/CustomPager';
import { useRef, useState } from 'react';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const pagerRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: 'index', title: '今日', icon: 'today', iconOutline: 'today-outline' },
    { name: 'tasks', title: 'タスク', icon: 'list', iconOutline: 'list-outline' },
    { name: 'review', title: '振り返り', icon: 'bar-chart', iconOutline: 'bar-chart-outline' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <CustomPager
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e: any) => setActiveTab(e.nativeEvent.position)}
      >
        <View key="1">
          <TodayScreen />
        </View>
        <View key="2">
          <TasksScreen />
        </View>
        <View key="3">
          <ReviewScreen />
        </View>
      </CustomPager>

      {/* Custom Tab Bar */}
      <View style={styles.tabBarContainer}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(30, 30, 30, 0.92)' : 'rgba(255, 255, 255, 0.92)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderLight }]} />
        <View style={styles.tabBar}>
          {tabs.map((tab, index) => (
            <Pressable
              key={tab.name}
              style={styles.tabItem}
              onPress={() => {
                pagerRef.current?.setPage(index);
                setActiveTab(index);
              }}
            >
              <Ionicons
                name={activeTab === index ? tab.icon : tab.iconOutline as any}
                size={24}
                color={activeTab === index ? colors.primary : colors.textMuted}
              />
              <Text style={[
                styles.tabLabel,
                { color: activeTab === index ? colors.primary : colors.textMuted }
              ]}>
                {tab.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    borderTopWidth: 0,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    height: '100%',
    paddingBottom: 20, // Safe area space
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
