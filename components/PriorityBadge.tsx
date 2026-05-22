import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Priority, PRIORITY_LABELS } from '@/types/task';

interface PriorityBadgeProps {
  priority: Priority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { colors } = useTheme();

  const PRIORITY_STYLES: Record<Priority, { background: string; text: string }> = {
    high: { background: colors.priorityHighBg, text: colors.priorityHigh },
    medium: { background: colors.priorityMediumBg, text: colors.priorityMedium },
    low: { background: colors.priorityLowBg, text: colors.priorityLow },
  };

  const badgeColors = PRIORITY_STYLES[priority];

  return (
    <View style={[styles.badge, { backgroundColor: badgeColors.background }]}>
      <Text style={[styles.label, { color: badgeColors.text }]}>
        {PRIORITY_LABELS[priority]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  label: {
    ...Typography.captionBold,
  },
});
