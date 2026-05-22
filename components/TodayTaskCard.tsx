import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { formatDeadline } from '@/utils/date';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import PriorityBadge from '@/components/PriorityBadge';
import type { Task } from '@/types/task';

interface TodayTaskCardProps {
  task: Task;
  index: number;
  onComplete: () => void;
  onPress: () => void;
  onLongPress?: () => void;
  isActive?: boolean;
}

export default function TodayTaskCard({
  task,
  index,
  onComplete,
  onPress,
  onLongPress,
  isActive,
}: TodayTaskCardProps) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const swipeableRef = useRef<Swipeable>(null);
  const isCompleted = task.status === 'completed';

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: isCompleted ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isCompleted]);

  const handleComplete = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onComplete();
  };

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
      <View style={styles.swipeLeftAction}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="checkmark-sharp" size={24} color="#fff" />
        </Animated.View>
      </View>
    );
  };

  // Format deadline for display
  const deadlineLabel = task.deadline
    ? formatDeadline(task.deadline)
    : null;

  const checkBgColor = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.success],
    extrapolate: 'clamp',
  });

  const checkBorderColor = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.success],
    extrapolate: 'clamp',
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.pressable,
        isActive && { opacity: 0.9, transform: [{ scale: 1.02 }] }
      ]}
    >
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={isCompleted ? undefined : renderLeftActions}
        onSwipeableWillOpen={(direction) => {
          if (direction === 'left') {
            onComplete();
            swipeableRef.current?.close();
          }
        }}
        friction={1}
        overshootFriction={8}
        leftThreshold={80}
        rightThreshold={80}
        overshootRight={false}
        overshootLeft={false}
        enabled={!isActive} // Disable swipe while dragging
      >
        <View style={[styles.card, isActive && { borderColor: colors.primary, borderWidth: 1 }]}>
          {index !== undefined && (
            <View style={styles.indexContainer}>
              <Text style={styles.indexText}>{index}</Text>
            </View>
          )}
          {/* Content area */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>

          {/* Badges row */}
          <View style={styles.badgesRow}>
            <PriorityBadge priority={task.priority} />
            {task.estimatedMinutes != null && (
              <View style={styles.badge}>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.badgeText}>{task.estimatedMinutes}分</Text>
              </View>
            )}
            {task.deadline && (
              <View style={styles.badge}>
                <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.badgeText}>{formatDeadline(task.deadline)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Check button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable onPress={handleComplete} hitSlop={8}>
            <Animated.View
              style={[
                styles.checkButton,
                {
                  backgroundColor: isCompleted ? colors.success : checkBgColor,
                  borderColor: isCompleted ? colors.success : checkBorderColor,
                },
              ]}
            >
              <Ionicons
                name="checkmark-sharp"
                size={28}
                color={isCompleted ? colors.surface : 'transparent'}
              />
            </Animated.View>
          </Pressable>
        </Animated.View>
        </View>
      </Swipeable>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  pressable: {
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    height: 120,
    ...(isDark ? Shadows.soft : {}),
    overflow: 'hidden', // Add clipping
  },
  content: {
    flex: 1,
    marginRight: Spacing.lg,
    justifyContent: 'center',
    paddingTop: 25, // Slightly up from 35
  },
  title: {
    ...Typography.bodyBold,
    fontSize: 26, // Increased
    lineHeight: 32,
    color: colors.textPrimary,
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
  checkButton: {
    width: 52,
    height: 52,
    borderRadius: 8, // More rectangular
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeLeftAction: {
    backgroundColor: '#4CD964', // iOS Green
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: Spacing.xl,
    borderRadius: BorderRadius.lg,
    flex: 1,
  },
  indexContainer: {
    position: 'absolute',
    left: -Spacing.sm,
    top: -Spacing.lg, // Moved up from -Spacing.sm
    zIndex: 0,
    opacity: 0.05,
  },
  indexText: {
    fontSize: 150,
    fontWeight: '900',
    color: colors.textPrimary,
  },
});
