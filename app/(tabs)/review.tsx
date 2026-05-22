import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '@/contexts/TaskContext';
import EmptyState from '@/components/EmptyState';
import { formatDateTime } from '@/utils/date';
import type { ProcrastinationReason } from '@/types/task';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { completedToday, completedThisWeek, tasks } = useTasks();

  // よくある先延ばし理由を集計
  const procrastinationStats = useMemo(() => {
    const counts: Partial<Record<ProcrastinationReason, number>> = {};
    tasks.forEach((t) => {
      if (t.procrastinationReason) {
        counts[t.procrastinationReason] = (counts[t.procrastinationReason] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3) as [ProcrastinationReason, number][];
  }, [tasks]);

  // 最近の完了履歴（最新20件）
  const recentCompleted = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'completed' && t.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 20);
  }, [tasks]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <Text style={styles.title}>振り返り</Text>
        <Text style={styles.subtitle}>あなたの頑張りを確認しましょう</Text>

        {/* サマリーカード */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryToday]}>
            <Text style={styles.summaryEmoji}>☀️</Text>
            <Text style={styles.summaryNumber}>{completedToday.length}</Text>
            <Text style={styles.summaryLabel}>今日やった</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryWeek]}>
            <Text style={styles.summaryEmoji}>📊</Text>
            <Text style={[styles.summaryNumber, { color: colors.accent }]}>
              {completedThisWeek.length}
            </Text>
            <Text style={styles.summaryLabel}>今週やった</Text>
          </View>
        </View>

        {/* 励ましメッセージ */}
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            {completedToday.length >= 3
              ? '🎉 素晴らしい一日です！たくさん進みましたね！'
              : completedToday.length >= 1
              ? '👏 いい調子です！一歩ずつ進んでいますね。'
              : '🌱 小さく始めよう。まずは1つだけ。'}
          </Text>
        </View>

        {/* よくある先延ばし理由 */}
        {procrastinationStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>よくある先延ばし理由</Text>
            {procrastinationStats.map(([reason, count]) => (
              <View key={reason} style={styles.reasonRow}>
                <Text style={styles.reasonText}>{reason}</Text>
                <View style={styles.reasonBarContainer}>
                  <View
                    style={[
                      styles.reasonBar,
                      {
                        width: `${Math.min(
                          (count / Math.max(...procrastinationStats.map(([, c]) => c))) * 100,
                          100,
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.reasonCount}>{count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 完了履歴 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>完了履歴</Text>
          {recentCompleted.length === 0 ? (
            <EmptyState
              emoji="💪"
              title="まだ完了したタスクはありません"
              message="最初の一歩を踏み出しましょう"
            />
          ) : (
            recentCompleted.map((task) => (
              <View key={task.id} style={styles.historyItem}>
                <View style={styles.historyCheck}>
                  <Ionicons name="checkmark" size={24} color={colors.success} />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>{task.title}</Text>
                  <Text style={styles.historyDate}>
                    {task.completedAt ? formatDateTime(task.completedAt) : ''}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  title: {
    ...Typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.xxl,
  },

  // サマリーカード
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.card,
  },
  summaryToday: {
    backgroundColor: colors.primaryLight,
  },
  summaryWeek: {
    backgroundColor: colors.accentLight,
  },
  summaryEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  summaryNumber: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  summaryLabel: {
    ...Typography.caption,
    color: colors.textSecondary,
  },

  // メッセージ
  messageCard: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    ...Shadows.soft,
  },
  messageText: {
    ...Typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // セクション
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.subtitle,
    color: colors.textPrimary,
    marginBottom: Spacing.lg,
  },

  // 先延ばし理由
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  reasonText: {
    ...Typography.caption,
    color: colors.textPrimary,
    width: 80,
  },
  reasonBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  reasonBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  reasonCount: {
    ...Typography.captionBold,
    color: colors.textSecondary,
    width: 24,
    textAlign: 'right',
  },

  // 完了履歴
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.soft,
  },
  historyCheck: {
    marginRight: Spacing.md,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    ...Typography.body,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  historyDate: {
    ...Typography.small,
    color: colors.textMuted,
  },
});
