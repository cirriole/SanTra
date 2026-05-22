import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '@/types/task';

const TASKS_KEY = '@todo_tasks';

const DEFAULT_TASKS: Task[] = [
  {
    id: 'sample-1',
    title: 'スーパーで牛乳と卵を買う',
    memo: '晩ご飯の材料用。忘れずに！',
    deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T18:00:00.000Z',
    priority: 'medium',
    estimatedMinutes: 10,
    procrastinationReason: null,
    isToday: true,
    status: 'pending',
    completedAt: null,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: '公園を30分ランニングする',
    memo: 'ウェアに着替えてから出発する。',
    deadline: new Date().toISOString().split('T')[0] + 'T20:00:00.000Z',
    priority: 'high',
    estimatedMinutes: 30,
    procrastinationReason: null,
    isToday: true,
    status: 'pending',
    completedAt: null,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: '読書（TriDoの使い方ガイドを読む）',
    memo: 'アプリの便利な機能をチェックする。',
    deadline: null,
    priority: 'low',
    estimatedMinutes: 15,
    procrastinationReason: null,
    isToday: true,
    status: 'pending',
    completedAt: null,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
];

export async function loadTasks(): Promise<Task[]> {
  try {
    const json = await AsyncStorage.getItem(TASKS_KEY);
    if (json) {
      return JSON.parse(json) as Task[];
    }
    return DEFAULT_TASKS;
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return DEFAULT_TASKS;
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    const json = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, json);
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
