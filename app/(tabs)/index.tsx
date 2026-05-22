import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  Platform,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '@/contexts/TaskContext';
import TodayTaskCard from '@/components/TodayTaskCard';
import QuickTaskList from '@/components/QuickTaskList';
import CompletionCelebration from '@/components/CompletionCelebration';
import EmptyState from '@/components/EmptyState';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const {
    tasks,
    todayTasks,
    quickTasks,
    completedToday,
    completeTask,
    uncompleteTask,
    reorderTodayTasks,
    isLoaded,
  } = useTasks();
  const [showCelebration, setShowCelebration] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const hoursRemaining = useMemo(() => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return Math.max(0, hours);
  }, [refreshing]);

  const handleComplete = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (task.status === 'completed') {
          uncompleteTask(id);
        } else {
          completeTask(id);
          setShowCelebration(true);
        }
      }
    },
    [tasks, completeTask, uncompleteTask],
  );

  const handleTaskPress = useCallback(
    (id: string) => {
      router.push({ pathname: '/task-detail', params: { id } });
    },
    [router],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>今日やることは3つだけ</Text>
            {Platform.OS === 'web' ? (
              <Text style={[styles.heroTitle, { color: colors.primary }]}>Tri Do</Text>
            ) : (
              <MaskedView
                style={styles.heroMaskedView}
                maskElement={<Text style={styles.heroTitle}>Tri Do</Text>}
              >
                <LinearGradient
                  colors={['#FF5252', '#FF7A00', '#FFD600']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroGradient}
                />
              </MaskedView>
            )}
          </View>
          <View style={styles.headerRight}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeText}>残り {hoursRemaining}時間</Text>
            </View>
          </View>
        </View>

        {/* 今日やる3つ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今日やる3つ</Text>
            <Text style={styles.sectionCount}>あと {todayTasks.length}/3</Text>
          </View>

          {todayTasks.length === 0 ? (
            <View style={styles.emptyTodayCard}>
              <Text style={styles.emptyTodayEmoji}>🌟</Text>
              <Text style={styles.emptyTodayTitle}>今日やるタスクを選ぼう</Text>
              <Text style={styles.emptyTodayMessage}>
                タスク一覧から「今日やる」に設定できます
              </Text>
            </View>
          ) : (
            <DraggableFlatList
              data={todayTasks}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              animationConfig={{ damping: 20, mass: 0.1, stiffness: 250, overshootClamping: false, restSpeedThreshold: 0.1, restDisplacementThreshold: 0.1 }}
              onDragEnd={({ data }) => reorderTodayTasks(data)}
              renderItem={({ item, drag, isActive, getIndex }: RenderItemParams<Task>) => (
                <ScaleDecorator>
                  <TodayTaskCard
                    task={item}
                    index={(getIndex() ?? 0) + 1}
                    onComplete={() => handleComplete(item.id)}
                    onPress={() => handleTaskPress(item.id)}
                    onLongPress={drag}
                    isActive={isActive}
                  />
                </ScaleDecorator>
              )}
            />
          )}
        </View>

        {/* 5分でできること */}
        <QuickTaskList
          tasks={quickTasks}
          onComplete={(id) => handleComplete(id)}
          onPress={(id) => handleTaskPress(id)}
        />


        {/* 底部の余白 */}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* FAB: タスク追加ボタン */}
      <Pressable
        style={({ pressed }) => [styles.fabContainer, pressed && styles.fabPressed]}
        onPress={() => router.push('/add-task')}
      >
        <LinearGradient
          colors={[colors.todayCardGradientStart, colors.todayCardGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={32} color={colors.textOnPrimary} />
        </LinearGradient>
      </Pressable>
      {/* Theme Toggle FAB (Left) */}
      <Pressable
        style={({ pressed }) => [styles.themeFab, pressed && styles.themeFabPressed]}
        onPress={toggleTheme}
      >
        <Ionicons name={isDark ? "sunny" : "moon"} size={26} color={colors.textPrimary} />
      </Pressable>


      {/* 完了演出 */}
      <CompletionCelebration
        visible={showCelebration}
        onDismiss={() => setShowCelebration(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 200, // Increased for full visibility
  },

  // ヘッダー
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  headerTextContainer: {
    alignItems: 'flex-start',
  },
  greeting: {
    ...Typography.body,
    color: colors.textSecondary,
    marginBottom: 0,
    marginLeft: 0,
  },
  heroMaskedView: {
    height: 60,
    width: 200, // Increased
  },
  heroTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 42,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  heroGradient: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },

  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeBadgeText: {
    ...Typography.bodyBold,
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  // セクション
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.subtitle,
    color: colors.textPrimary,
  },
  sectionCount: {
    ...Typography.bodyBold, // Larger text
    color: isDark ? colors.success : '#43A047', // Slightly brighter green in light mode
    backgroundColor: colors.surface,
    borderColor: isDark ? colors.success : '#43A047', // Slightly brighter green in light mode
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },

  // 空状態カード
  emptyTodayCard: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyTodayEmoji: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyTodayTitle: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyTodayMessage: {
    ...Typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // 進捗カード
  progressCard: {
    backgroundColor: colors.successLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  progressNumber: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  progressCount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.success,
  },
  progressLabel: {
    ...Typography.body,
    color: colors.success,
  },
  progressMessage: {
    ...Typography.caption,
    color: colors.success,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 16,
    ...Shadows.fab,
  },
  fab: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },

  // Theme FAB
  themeFab: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.soft,
  },
  themeFabPressed: {
    backgroundColor: colors.borderLight,
    transform: [{ scale: 0.95 }],
  },
});
