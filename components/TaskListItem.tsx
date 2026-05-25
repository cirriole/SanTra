import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { Task } from '@/types/task';
import PriorityBadge from '@/components/PriorityBadge';

interface TaskListItemProps {
  task: Task;
  index?: number;
  onPress: () => void;
  onComplete: () => void;
  onToggleToday: () => void;
  onDelete: () => void;
}

export default function TaskListItem({
  task,
  index,
  onPress,
  onComplete,
  onToggleToday,
  onDelete,
}: TaskListItemProps) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const isCompleted = task.status === 'completed';
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return (
      <View style={[styles.swipeLeftAction, { backgroundColor: isCompleted ? colors.warning : colors.success }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name={isCompleted ? "arrow-undo-outline" : "checkmark-sharp"} size={24} color="#fff" />
        </Animated.View>
      </View>
    );
  };


  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      onSwipeableWillOpen={(direction) => {
        if (direction === 'left') {
          onComplete();
          swipeableRef.current?.close();
        }
      }}
      friction={1}
      overshootFriction={8}
      leftThreshold={80}
      overshootLeft={false}
    >
      <Pressable onPress={onPress} style={styles.card}>
        {index !== undefined && (
          <View style={[
            styles.indexContainer,
            index === 1 && { left: -Spacing.sm } // Move '1' slightly right from default -Spacing.md
          ]}>
            <Text style={styles.indexText}>{index}</Text>
          </View>
        )}
        {/* Left: check button */}
      <Pressable onPress={onComplete} hitSlop={8} style={styles.checkArea}>
        <View
          style={[
            styles.checkCircle,
            isCompleted && styles.checkCircleCompleted,
          ]}
        >
          {isCompleted && (
            <Ionicons name="checkmark-sharp" size={22} color={colors.surface} />
          )}
        </View>
      </Pressable>

      {/* Center: title + badges */}
      <View style={styles.center}>
        <Text
          style={[
            styles.title,
            isCompleted && styles.titleCompleted,
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        <View style={styles.badgesRow}>
          <PriorityBadge priority={task.priority} />

          {task.estimatedMinutes != null && (
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
              <Text style={styles.badgeText}>{task.estimatedMinutes}分</Text>
            </View>
          )}

          {task.deadline && (
            <View style={styles.badge}>
              <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} />
              <Text style={styles.badgeText}>{formatShortDate(task.deadline)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Right: today star */}
      <Pressable onPress={onToggleToday} hitSlop={8} style={styles.starArea}>
        <Ionicons
          name={task.isToday ? 'star' : 'star-outline'}
          size={26}
          color={task.isToday ? colors.accent : colors.textMuted}
        />
      </Pressable>
    </Pressable>
    </Swipeable>
  );
}

function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 110,
    marginBottom: Spacing.md,
    ...(isDark ? Shadows.soft : {}),
  },
  checkArea: {
    marginRight: Spacing.md,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 6, // More rectangular
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  center: {
    flex: 1,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    paddingTop: 22, // Slightly up from 30
  },
  title: {
    ...Typography.bodyBold,
    fontSize: 26, // Increased
    lineHeight: 32,
    color: colors.textPrimary,
  },
  titleCompleted: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md, // Move badges even lower from title
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4, // More rectangular
    gap: 4,
  },
  badgeText: {
    ...Typography.captionBold,
    fontSize: 14, // Increased
    color: colors.textSecondary,
  },
  starArea: {
    padding: Spacing.xs,
  },
  swipeLeftAction: {
    backgroundColor: '#4CD964', // iOS Green
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: Spacing.xl,
    borderRadius: BorderRadius.md,
    flex: 1,
    marginBottom: Spacing.md,
  },
  swipeDeleteAction: {
    backgroundColor: '#FF3B30', // iOS Red
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: Spacing.xl,
    borderRadius: BorderRadius.md,
    flex: 1,
    marginBottom: Spacing.md,
  },
  indexContainer: {
    position: 'absolute',
    left: -Spacing.md, // Back to md from sm
    top: -Spacing.md, // Moved up from 0
    zIndex: 0,
    opacity: 0.05,
  },
  indexText: {
    fontSize: 150, // Keep larger size
    fontWeight: '900',
    color: colors.textPrimary,
  },
});
