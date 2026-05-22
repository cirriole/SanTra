import React from 'react';
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { TaskFilter, FILTER_LABELS } from '@/types/task';

interface FilterBarProps {
  selectedFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

const FILTERS: TaskFilter[] = ['all', 'pending', 'completed', 'overdue'];

export default function FilterBar({
  selectedFilter,
  onFilterChange,
}: FilterBarProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {FILTERS.map((filter) => {
        const isSelected = filter === selectedFilter;
        return (
          <Pressable
            key={filter}
            onPress={() => onFilterChange(filter)}
            style={[
              styles.chip,
              isSelected ? styles.chipSelected : styles.chipUnselected,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
              ]}
            >
              {FILTER_LABELS[filter]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexGrow: 0,
    height: 50, // Restore height so ScrollView doesn't collapse
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 5,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    height: 36, // Explicit height
    justifyContent: 'center', // Center text vertically
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    ...Shadows.soft,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipText: {
    ...Typography.captionBold,
  },
  chipTextSelected: {
    color: colors.textOnPrimary,
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
});
