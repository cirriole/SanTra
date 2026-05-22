import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import PriorityBadge from '@/components/PriorityBadge';
import type { Task } from '@/types/task';

interface QuickTaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onPress: (id: string) => void;
}

export default function QuickTaskList({ tasks, onComplete, onPress }: QuickTaskListProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  if (tasks.length === 0) return null;

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <Pressable
        onPress={() => onPress(item.id)}
        style={styles.card}
      >
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }}>
          <PriorityBadge priority={item.priority} />
          {item.estimatedMinutes != null && (
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={12} color={colors.accent} />
              <Text style={styles.timeBadgeText}>{item.estimatedMinutes}分</Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => onComplete(item.id)}
          hitSlop={8}
          style={styles.completeButton}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
        </Pressable>
      </Pressable>
    ),
    [onComplete, onPress],
  );

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ 5分でできること</Text>
        <Text style={styles.headerSubtitle}>まずは5分だけ</Text>
      </View>

      {/* Horizontal list */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.subtitle,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadows.soft,
  },
  cardTitle: {
    ...Typography.captionBold,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
    minHeight: 36, // reserve space for 2 lines
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: Spacing.md,
  },
  timeBadgeText: {
    ...Typography.small,
    color: colors.accent,
    fontWeight: '600',
  },
  completeButton: {
    alignSelf: 'flex-end',
  },
});
