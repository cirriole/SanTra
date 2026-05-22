import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '@/contexts/TaskContext';
import PriorityBadge from '@/components/PriorityBadge';
import { PRIORITY_LABELS, PROCRASTINATION_REASONS } from '@/types/task';
import type { Priority, ProcrastinationReason } from '@/types/task';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function AddTaskScreen() {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { addTask, canAddToday, todayCount } = useTasks();

  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [procrastinationReason, setProcrastinationReason] = useState<ProcrastinationReason | null>(null);
  const [isToday, setIsToday] = useState(false);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('入力エラー', 'タスク名を入力してください');
      return;
    }

    if (isToday && !canAddToday) {
      Alert.alert(
        '上限に達しています',
        '今日やるタスクは最大3つまでです。',
        [{ text: 'OK' }],
      );
      return;
    }

    const minutes = estimatedMinutes ? parseInt(estimatedMinutes, 10) : null;

    addTask({
      title: title.trim(),
      memo: memo.trim(),
      deadline: deadline ? deadline.toISOString() : null,
      priority,
      estimatedMinutes: minutes,
      procrastinationReason,
      isToday,
    });

    router.back();
  }, [title, memo, deadline, priority, estimatedMinutes, procrastinationReason, isToday, addTask, canAddToday, router]);

  const timeOptions = [5, 10, 15, 30, 60, 120];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Ionicons name="close" size={36} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle}>タスクを追加</Text>
          <Pressable onPress={handleSave} style={{ borderRadius: BorderRadius.md, overflow: 'hidden' }}>
            {({ pressed }) => (
              <LinearGradient
                colors={[colors.todayCardGradientStart, colors.todayCardGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.saveButton, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* タスク名 */}
          <View style={styles.field}>
            <Text style={styles.label}>タスク名</Text>
            <TextInput
              style={styles.textInput}
              placeholder="何をしますか？"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* 期限 */}
          <View style={styles.field}>
            <Text style={styles.label}>期限</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(!showDatePicker)}
            >
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              <Text style={styles.dateButtonText}>
                {deadline
                  ? `${deadline.getMonth() + 1}月${deadline.getDate()}日`
                  : '期限を設定'}
              </Text>
              {deadline && (
                <Pressable
                  onPress={() => { setDeadline(null); setShowDatePicker(false); }}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </Pressable>
            {showDatePicker && (
              <View style={styles.customDatePicker}>
                <View style={styles.dateQuickRow}>
                  {[
                    { label: '今日', date: new Date() },
                    { label: '明日', date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })() },
                    { label: '1週間後', date: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d; })() },
                  ].map((item) => (
                    <Pressable
                      key={item.label}
                      style={styles.dateQuickChip}
                      onPress={() => { setDeadline(item.date); setShowDatePicker(false); }}
                    >
                      <Text style={styles.dateQuickChipText}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateMonthScroll}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                    const selected = (deadline || new Date()).getMonth() + 1 === m;
                    return (
                      <Pressable
                        key={m}
                        style={[styles.dateMonthChip, selected && styles.dateMonthChipSelected]}
                        onPress={() => {
                          const d = deadline ? new Date(deadline) : new Date();
                          d.setMonth(m - 1);
                          const maxDay = new Date(d.getFullYear(), m, 0).getDate();
                          if (d.getDate() > maxDay) d.setDate(maxDay);
                          setDeadline(d);
                        }}
                      >
                        <Text style={[styles.dateMonthChipText, selected && styles.dateMonthChipTextSelected]}>
                          {m}月
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={styles.dateWeekdayRow}>
                  {['月', '火', '水', '木', '金', '土', '日'].map((w, i) => (
                    <View key={w} style={styles.dateWeekdayCell}>
                      <Text style={[styles.dateWeekdayText, i === 5 && { color: colors.accent }, i === 6 && { color: colors.danger }]}>{w}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.dateDayGrid}>
                  {Array.from({ length: (new Date((deadline || new Date()).getFullYear(), (deadline || new Date()).getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dateDayChip} />
                  ))}
                  {Array.from(
                    { length: new Date((deadline || new Date()).getFullYear(), (deadline || new Date()).getMonth() + 1, 0).getDate() },
                    (_, i) => i + 1,
                  ).map((d) => {
                    const selected = (deadline || new Date()).getDate() === d;
                    return (
                      <Pressable
                        key={d}
                        style={[styles.dateDayChip, selected && styles.dateDayChipSelected]}
                        onPress={() => {
                          const date = deadline ? new Date(deadline) : new Date();
                          date.setDate(d);
                          setDeadline(date);
                          setShowDatePicker(false);
                        }}
                      >
                        <Text style={[styles.dateDayChipText, selected && styles.dateDayChipTextSelected]}>
                          {d}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* 優先度 */}
          <View style={styles.field}>
            <Text style={styles.label}>優先度</Text>
            <View style={styles.priorityRow}>
              {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.priorityChip,
                    priority === p && {
                      backgroundColor: p === 'high' ? colors.priorityHighBg : p === 'medium' ? colors.priorityMediumBg : colors.priorityLowBg,
                      borderColor: p === 'high' ? colors.priorityHigh : p === 'medium' ? colors.priorityMedium : colors.priorityLow,
                    },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.priorityChipText, priority === p && { color: p === 'high' ? colors.priorityHigh : p === 'medium' ? colors.priorityMedium : colors.priorityLow }]}>
                    {PRIORITY_LABELS[p]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 所要時間 */}
          <View style={styles.field}>
            <Text style={styles.label}>所要時間</Text>
            <View style={styles.timeRow}>
              {timeOptions.map((t) => (
                <Pressable
                  key={t}
                  style={[
                    styles.timeChip,
                    estimatedMinutes === String(t) && styles.timeChipSelected,
                  ]}
                  onPress={() =>
                    setEstimatedMinutes(estimatedMinutes === String(t) ? '' : String(t))
                  }
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      estimatedMinutes === String(t) && styles.timeChipTextSelected,
                    ]}
                  >
                    {t < 60 ? `${t}分` : `${t / 60}時間`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 先延ばし理由 */}
          <View style={styles.field}>
            <Text style={styles.label}>先延ばし理由</Text>
            <Text style={styles.labelHint}>このタスクをためらう理由があれば選んでください</Text>
            <View style={styles.reasonChipRow}>
              {PROCRASTINATION_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  style={[
                    styles.reasonChip,
                    procrastinationReason === reason && styles.reasonChipSelected,
                  ]}
                  onPress={() =>
                    setProcrastinationReason(
                      procrastinationReason === reason ? null : reason,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.reasonChipText,
                      procrastinationReason === reason && styles.reasonChipTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 今日やるかどうか */}
          <View style={styles.field}>
            <Pressable
              style={[styles.todayToggleCard, isToday && styles.todayToggleCardActive]}
              onPress={() => {
                if (!isToday && !canAddToday) {
                  Alert.alert('上限に達しています', `今日やるタスクは最大3つまでです（現在${todayCount}つ設定中）。`);
                  return;
                }
                setIsToday(!isToday);
              }}
            >
              <View style={styles.todayToggleInfo}>
                <Text style={[styles.todayToggleTitle, isToday && styles.todayToggleTitleActive]}>今日やる</Text>
                <Text style={styles.todayToggleHint}>
                  {isToday ? '今日やるタスクに設定されます' : `あと${3 - todayCount}つ設定できます`}
                </Text>
              </View>
              <View style={[styles.todayToggleSwitch, isToday && styles.todayToggleSwitchActive]}>
                <View style={[styles.todayToggleKnob, isToday && styles.todayToggleKnobActive]} />
              </View>
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...Typography.subtitle,
    color: colors.textPrimary,
  },
  saveButton: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md + 4,
    borderRadius: BorderRadius.md,
  },
  saveButtonText: {
    ...Typography.bodyBold,
    fontSize: 18,
    color: colors.textOnPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  field: {
    marginBottom: Spacing.xxl,
  },
  label: {
    ...Typography.bodyBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  labelHint: {
    ...Typography.small,
    color: colors.textMuted,
    marginBottom: Spacing.md,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: Spacing.sm,
  },
  dateButtonText: {
    ...Typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  priorityChipText: {
    ...Typography.captionBold,
    color: colors.textPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  timeChipText: {
    ...Typography.captionBold,
    color: colors.textSecondary,
  },
  timeChipTextSelected: {
    color: colors.primary,
  },
  reasonChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  reasonChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  reasonChipText: {
    ...Typography.captionBold,
    color: colors.textSecondary,
  },

  // 日付ピッカー
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: Spacing.sm,
  },
  dateButtonText: {
    ...Typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  customDatePicker: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: Spacing.lg,
  },
  dateQuickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dateQuickChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
  },
  dateQuickChipText: {
    ...Typography.captionBold,
    color: colors.accent,
  },
  dateMonthScroll: {
    marginBottom: Spacing.md,
  },
  dateMonthScrollContent: {
    gap: Spacing.xs,
  },
  dateMonthChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'transparent',
  },
  dateMonthChipSelected: {
    backgroundColor: colors.primary,
  },
  dateMonthChipText: {
    ...Typography.caption,
    color: colors.textSecondary,
  },
  dateMonthChipTextSelected: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  dateWeekdayRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  dateWeekdayCell: {
    width: '14.28%',
    alignItems: 'center',
  },
  dateWeekdayText: {
    ...Typography.captionBold,
    color: colors.textSecondary,
  },
  dateDayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
  },
  dateDayChip: {
    width: '14.28%',
    height: 38,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dateDayChipSelected: {
    backgroundColor: colors.primary,
  },
  dateDayChipText: {
    ...Typography.caption,
    color: colors.textPrimary,
  },
  dateDayChipTextSelected: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  datePickerDone: {
    backgroundColor: colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  datePickerDoneText: {
    ...Typography.bodyBold,
    color: colors.textOnPrimary,
  },
  todayToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
  },
  todayToggleCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  todayToggleInfo: {
    flex: 1,
  },
  todayToggleTitle: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  todayToggleTitleActive: {
    color: colors.accent,
  },
  todayToggleHint: {
    ...Typography.caption,
    color: colors.textSecondary,
  },
  todayToggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    padding: 2,
  },
  todayToggleSwitchActive: {
    backgroundColor: colors.accent,
  },
  todayToggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    ...Shadows.soft,
  },
  todayToggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
});
