import React, { useState, useCallback, useMemo } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTasks } from '@/contexts/TaskContext';
import PriorityBadge from '@/components/PriorityBadge';
import SubtaskItem from '@/components/SubtaskItem';
import CompletionCelebration from '@/components/CompletionCelebration';
import type { Task, Priority, ProcrastinationReason } from '@/types/task';
import { PROCRASTINATION_REASONS, PRIORITY_LABELS } from '@/types/task';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { formatDateTime, formatMinutes } from '@/utils/date';
import { useTheme } from '@/contexts/ThemeContext';

export default function TaskDetailScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    toggleToday,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    canAddToday,
  } = useTasks();

  const task = getTask(id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task?.title || '');
  const [editMemo, setEditMemo] = useState(task?.memo || '');
  const [editPriority, setEditPriority] = useState<Priority>(task?.priority || 'medium');
  const [editDeadline, setEditDeadline] = useState<Date | null>(
    task?.deadline ? new Date(task.deadline) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editMinutes, setEditMinutes] = useState(
    task?.estimatedMinutes ? String(task.estimatedMinutes) : '',
  );
  const [editReason, setEditReason] = useState<ProcrastinationReason | null>(
    task?.procrastinationReason || null,
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const subtaskProgress = useMemo(() => {
    if (!task || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter((s) => s.isCompleted).length;
    return { completed, total: task.subtasks.length, percent: completed / task.subtasks.length };
  }, [task]);

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>タスクが見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      Alert.alert('入力エラー', 'タスク名を入力してください');
      return;
    }
    updateTask({
      ...task,
      title: editTitle.trim(),
      memo: editMemo.trim(),
      priority: editPriority,
      deadline: editDeadline ? editDeadline.toISOString() : null,
      estimatedMinutes: editMinutes ? parseInt(editMinutes, 10) : null,
      procrastinationReason: editReason,
    });
    setIsEditing(false);
  };

  const handleComplete = () => {
    completeTask(task.id);
    setShowCelebration(true);
  };

  const handleUncomplete = () => {
    uncompleteTask(task.id);
  };

  const handleDelete = () => {
    Alert.alert('タスクを削除', 'このタスクを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          deleteTask(task.id);
          router.back();
        },
      },
    ]);
  };

  const handleToggleToday = () => {
    const success = toggleToday(task.id);
    if (!success) {
      Alert.alert(
        '上限に達しています',
        '今日やるタスクは最大3つまでです。',
      );
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };



  const isCompleted = task.status === 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Ionicons name="close" size={32} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle}>{isEditing ? 'タスクの編集' : 'タスク詳細'}</Text>
          <View style={styles.headerActions}>
            {!isEditing && !isCompleted && (
              <Pressable onPress={() => setIsEditing(true)} hitSlop={16}>
                <Text style={styles.editButtonText}>編集</Text>
              </Pressable>
            )}
            {isEditing && (
              <Pressable onPress={handleSaveEdit} style={{ borderRadius: BorderRadius.md, overflow: 'hidden' }}>
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
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* タスク名 */}
          {isEditing ? (
            <TextInput
              style={styles.textInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="タスク名"
              autoFocus
            />
          ) : (
            <Text
              style={[
                styles.detailTitle,
                isCompleted && { textDecorationLine: 'line-through', color: colors.textMuted },
              ]}
            >
              {task.title}
            </Text>
          )}

          {/* ステータスバッジ & 今日やる */}
          {!isEditing && (
            <View style={styles.metaRow}>
              <PriorityBadge priority={task.priority} />
              {task.isToday && !isCompleted && (
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color={colors.accent} />
                  <Text style={[styles.metaText, { color: colors.accent }]}>今日やる</Text>
                </View>
              )}
            </View>
          )}

          {/* 優先度編集 */}
          {isEditing && (
            <View style={styles.field}>
              <Text style={styles.label}>優先度</Text>
              <View style={styles.priorityRow}>
                {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                  <Pressable
                    key={p}
                    style={[
                      styles.priorityChip,
                      editPriority === p && {
                        backgroundColor: p === 'high' ? colors.priorityHighBg : p === 'medium' ? colors.priorityMediumBg : colors.priorityLowBg,
                        borderColor: p === 'high' ? colors.priorityHigh : p === 'medium' ? colors.priorityMedium : colors.priorityLow,
                      },
                    ]}
                    onPress={() => setEditPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityChipText,
                        editPriority === p && {
                          color: p === 'high' ? colors.priorityHigh : p === 'medium' ? colors.priorityMedium : colors.priorityLow,
                        },
                      ]}
                    >
                      {PRIORITY_LABELS[p]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* 情報カード */}
          <View style={styles.infoCard}>
            {/* 期限 */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.infoLabel}>期限</Text>
              {isEditing ? (
                <Pressable
                  style={styles.infoEditButton}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                >
                  <Text style={styles.infoEditText}>
                    {editDeadline
                      ? `${editDeadline.getMonth() + 1}月${editDeadline.getDate()}日`
                      : '設定する'}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.infoValue}>
                  {task.deadline
                    ? `${new Date(task.deadline).getMonth() + 1}月${new Date(task.deadline).getDate()}日`
                    : '未設定'}
                </Text>
              )}
            </View>

            {showDatePicker && isEditing && (
              <View style={[styles.customDatePicker, { marginTop: Spacing.sm }]}>
                {/* クイック選択 */}
                <View style={styles.dateQuickRow}>
                  {[
                    { label: '今日', date: new Date() },
                    { label: '明日', date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })() },
                    { label: '1週間後', date: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d; })() },
                  ].map((item) => (
                    <Pressable
                      key={item.label}
                      style={styles.dateQuickChip}
                      onPress={() => { setEditDeadline(item.date); setShowDatePicker(false); }}
                    >
                      <Text style={styles.dateQuickChipText}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* 月選択 */}
                <Text style={styles.datePickerSectionLabel}>月</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateMonthScroll} contentContainerStyle={styles.dateMonthScrollContent}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                    const selected = (editDeadline || new Date()).getMonth() + 1 === m;
                    return (
                      <Pressable
                        key={m}
                        style={[styles.dateMonthChip, selected && styles.dateMonthChipSelected]}
                        onPress={() => {
                          const d = editDeadline ? new Date(editDeadline) : new Date();
                          d.setMonth(m - 1);
                          const maxDay = new Date(d.getFullYear(), m, 0).getDate();
                          if (d.getDate() > maxDay) d.setDate(maxDay);
                          setEditDeadline(d);
                        }}
                      >
                        <Text style={[styles.dateMonthChipText, selected && styles.dateMonthChipTextSelected]}>
                          {m}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* 日選択 */}
                <Text style={styles.datePickerSectionLabel}>日</Text>
                <View style={styles.dateWeekdayRow}>
                  {['月', '火', '水', '木', '金', '土', '日'].map((w, i) => (
                    <View key={w} style={styles.dateWeekdayCell}>
                      <Text style={[styles.dateWeekdayText, i === 5 && { color: colors.accent }, i === 6 && { color: colors.danger }]}>{w}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.dateDayGrid}>
                  {Array.from({ length: (new Date((editDeadline || new Date()).getFullYear(), (editDeadline || new Date()).getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dateDayChip} />
                  ))}
                  {Array.from(
                    { length: new Date((editDeadline || new Date()).getFullYear(), (editDeadline || new Date()).getMonth() + 1, 0).getDate() },
                    (_, i) => i + 1,
                  ).map((d) => {
                    const selected = (editDeadline || new Date()).getDate() === d;
                    return (
                      <Pressable
                        key={d}
                        style={[styles.dateDayChip, selected && styles.dateDayChipSelected]}
                        onPress={() => {
                          const date = editDeadline ? new Date(editDeadline) : new Date();
                          date.setDate(d);
                          setEditDeadline(date);
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

                <Pressable style={styles.datePickerDone} onPress={() => {
                  if (!editDeadline) setEditDeadline(new Date());
                  setShowDatePicker(false);
                }}>
                  <Text style={styles.datePickerDoneText}>決定</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.infoSeparator} />

            {/* 所要時間 */}
            <View style={[styles.infoRow, { alignItems: isEditing ? 'flex-start' : 'center' }]}>
              <View style={[styles.infoIcon, isEditing && { marginTop: 2 }]}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.infoLabel, isEditing && { marginTop: 2 }]}>所要時間</Text>
              {isEditing ? (
                <View style={styles.timeChipRow}>
                  {[5, 10, 15, 30, 60, 120].map((t) => (
                    <Pressable
                      key={t}
                      style={[
                        styles.timeChip,
                        editMinutes === String(t) && styles.timeChipSelected,
                      ]}
                      onPress={() =>
                        setEditMinutes(editMinutes === String(t) ? '' : String(t))
                      }
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          editMinutes === String(t) && styles.timeChipTextSelected,
                        ]}
                      >
                        {t < 60 ? `${t}分` : `${t / 60}時間`}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoValue}>
                  {task.estimatedMinutes
                    ? formatMinutes(task.estimatedMinutes)
                    : '未設定'}
                </Text>
              )}
            </View>

            <View style={styles.infoSeparator} />

            {/* 先延ばし理由 */}
            <View style={[styles.infoRow, { alignItems: isEditing ? 'flex-start' : 'center' }]}>
              <View style={[styles.infoIcon, isEditing && { marginTop: 2 }]}>
                <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.infoLabel, isEditing && { marginTop: 2 }]}>先延ばし理由</Text>
              {isEditing ? (
                <View style={styles.reasonChipRow}>
                  {PROCRASTINATION_REASONS.map((reason) => (
                    <Pressable
                      key={reason}
                      style={[
                        styles.reasonChip,
                        editReason === reason && styles.reasonChipSelected,
                      ]}
                      onPress={() => setEditReason(editReason === reason ? null : reason)}
                    >
                      <Text
                        style={[
                          styles.reasonChipText,
                          editReason === reason && styles.reasonChipTextSelected,
                        ]}
                      >
                        {reason}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoValue}>
                  {task.procrastinationReason || 'なし'}
                </Text>
              )}
            </View>
          </View>



          {/* アクションボタン */}
          <View style={styles.actionSection}>
            {!isCompleted && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.todayButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleToggleToday}
                >
                  <Ionicons
                    name={task.isToday ? 'star' : 'star-outline'}
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={styles.todayButtonText}>
                    {task.isToday ? '今日やるから外す' : '今日やるに設定'}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.completeButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleComplete}
                >
                  <Ionicons name="checkmark-circle" size={20} color={colors.textOnPrimary} />
                  <Text style={styles.completeButtonText}>完了にする</Text>
                </Pressable>
              </>
            )}

            {isCompleted && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.uncompleteButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleUncomplete}
              >
                <Ionicons name="arrow-undo" size={20} color={colors.primary} />
                <Text style={styles.uncompleteButtonText}>未着手に戻す</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.deleteSection}>
            <Pressable
              style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && { opacity: 0.8 }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color={colors.danger} />
              <Text style={styles.deleteText}>タスクを削除</Text>
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CompletionCelebration
        visible={showCelebration}
        onDismiss={() => {
          setShowCelebration(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
    height: 84,
  },
  headerTitle: {
    ...Typography.subtitle,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  editButtonText: {
    ...Typography.bodyBold,
    fontSize: 18,
    color: colors.primary,
    paddingRight: Spacing.md,
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
    paddingBottom: 100, 
  },
  field: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Spacing.xl,
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
  detailTitle: {
    ...Typography.title,
    color: colors.textPrimary,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaText: {
    ...Typography.captionBold,
  },
  // 情報カード
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.soft,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoIcon: {
    width: 32,
    alignItems: 'center',
  },
  infoLabel: {
    ...Typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    ...Typography.captionBold,
    color: colors.textPrimary,
  },
  infoSeparator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: Spacing.xs,
    marginLeft: 32,
  },
  infoEditButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  infoEditText: {
    ...Typography.caption,
    color: colors.primary,
  },
  infoEditInput: {
    ...Typography.caption,
    color: colors.textPrimary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    width: 60,
    textAlign: 'center',
  },

  // アクション
  actionSection: {
    gap: Spacing.md,
    marginTop: Spacing.xxl, // Move actions lower
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  todayButton: {
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  todayButtonText: {
    ...Typography.bodyBold,
    color: colors.accent,
  },
  completeButton: {
    backgroundColor: colors.success,
  },
  completeButtonText: {
    ...Typography.bodyBold,
    color: colors.textOnPrimary,
  },
  uncompleteButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  uncompleteButtonText: {
    ...Typography.bodyBold,
    color: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteText: {
    ...Typography.bodyBold,
    color: colors.danger,
  },
  deleteSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
  },

  // カスタム日付ピッカー
  customDatePicker: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: Spacing.lg,
  },
  datePickerSectionLabel: {
    ...Typography.captionBold,
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
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

  // 所要時間チップ
  timeChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
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
    ...Typography.caption,
    color: colors.textSecondary,
  },
  timeChipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  // 先延ばし理由チップ
  reasonChipRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
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
    backgroundColor: colors.accentLight,
    borderColor: colors.accent,
  },
  reasonChipText: {
    ...Typography.caption,
    color: colors.textSecondary,
  },
  reasonChipTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
