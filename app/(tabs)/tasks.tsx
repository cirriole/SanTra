import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTasks } from '@/contexts/TaskContext';
import TaskListItem from '@/components/TaskListItem';
import FilterBar from '@/components/FilterBar';
import CompletionCelebration from '@/components/CompletionCelebration';
import EmptyState from '@/components/EmptyState';
import type { TaskFilter } from '@/types/task';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function TasksScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { tasks: allTasks, getFilteredTasks, completeTask, uncompleteTask, toggleToday, deleteTask, isLoaded } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>('all');

  useEffect(() => {
    const loadFilter = async () => {
      try {
        const saved = await AsyncStorage.getItem('tasks_filter');
        if (saved) {
          setFilter(saved as TaskFilter);
        }
      } catch (e) {
        console.error('Failed to load filter', e);
      }
    };
    loadFilter();
  }, []);

  const handleFilterChange = useCallback((newFilter: TaskFilter) => {
    setFilter(newFilter);
    AsyncStorage.setItem('tasks_filter', newFilter).catch(console.error);
  }, []);

  const tasks = getFilteredTasks(filter);

  const handleComplete = useCallback(
    (id: string) => {
      const task = allTasks.find((t) => t.id === id);
      if (task) {
        if (task.status === 'completed') {
          uncompleteTask(id);
        } else {
          completeTask(id);
        }
      }
    },
    [allTasks, completeTask, uncompleteTask],
  );

  const handleTaskDelete = useCallback(
    (id: string) => {
      deleteTask(id);
    },
    [deleteTask],
  );

  const handleToggleToday = useCallback(
    (id: string) => {
      const success = toggleToday(id);
      if (!success) {
        Alert.alert(
          '上限に達しています',
          '今日やるタスクは最大3つまでです。\n他のタスクを解除してから設定してください。',
          [{ text: 'OK' }],
        );
      }
    },
    [toggleToday],
  );

  const handleTaskPress = useCallback(
    (id: string) => {
      router.push({ pathname: '/task-detail', params: { id } });
    },
    [router],
  );

  const getEmptyMessage = () => {
    switch (filter) {
      case 'all':
        return { emoji: '📝', title: 'タスクがありません', message: '新しいタスクを追加しましょう' };
      case 'pending':
        return { emoji: '🎉', title: '未着手のタスクはありません', message: 'すべて完了しています！' };
      case 'today':
        return { emoji: '🌟', title: '今日やるタスクはありません', message: 'タスクを「今日やる」に設定しましょう' };
      case 'completed':
        return { emoji: '💪', title: '完了したタスクはまだありません', message: '一つずつ進めていきましょう' };
      case 'overdue':
        return { emoji: '✨', title: '期限切れのタスクはありません', message: 'いい調子です！' };
      default:
        return { emoji: '📝', title: 'タスクがありません' };
    }
  };

  if (!isLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>タスク一覧</Text>
        <Pressable
          style={({ pressed }) => [styles.addButtonContainer, pressed && styles.addButtonPressed]}
          onPress={() => router.push('/add-task')}
        >
          <LinearGradient
            colors={[colors.todayCardGradientStart, colors.todayCardGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButton}
          >
            <Ionicons name="add" size={26} color={colors.textOnPrimary} />
          </LinearGradient>
        </Pressable>
      </View>

      {/* フィルター */}
      <FilterBar selectedFilter={filter} onFilterChange={handleFilterChange} />

      {/* タスクリスト */}
      <FlatList
        style={{ flex: 1 }}
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TaskListItem
            task={item}
            onPress={() => handleTaskPress(item.id)}
            onComplete={() => handleComplete(item.id)}
            onToggleToday={() => handleToggleToday(item.id)}
            onDelete={() => handleTaskDelete(item.id)}
          />
        )}        ListEmptyComponent={() => {
          const msg = getEmptyMessage();
          return <EmptyState emoji={msg.emoji} title={msg.title} message={msg.message} />;
        }}
        ListFooterComponent={<View style={{ height: 150 }} />}
      />
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.title,
    color: colors.textPrimary,
  },
  addButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  listContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
  },
});
