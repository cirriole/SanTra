import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Subtask } from '@/types/task';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: () => void;
  onDelete: () => void;
}

export default function SubtaskItem({
  subtask,
  onToggle,
  onDelete,
}: SubtaskItemProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(subtask.isCompleted ? 0.6 : 1, { duration: 250 }),
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.container, animatedStyle]}>
      <Pressable onPress={onToggle} style={styles.checkArea} hitSlop={8}>
        <Ionicons
          name={subtask.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={subtask.isCompleted ? colors.success : colors.textMuted}
        />
      </Pressable>

      <Text
        style={[
          styles.title,
          subtask.isCompleted && styles.titleCompleted,
        ]}
        numberOfLines={1}
      >
        {subtask.title}
      </Text>

      <Pressable onPress={onDelete} style={styles.deleteButton} hitSlop={8}>
        <Ionicons name="close" size={18} color={colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  checkArea: {
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  deleteButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
});
