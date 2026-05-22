// 先延ばし理由
export type ProcrastinationReason =
  | 'めんどう'
  | '難しい'
  | '時間がない'
  | '何から始めればいいか分からない'
  | '気が重い'
  | '優先度が分からない';

export const PROCRASTINATION_REASONS: ProcrastinationReason[] = [
  'めんどう',
  '難しい',
  '時間がない',
  '何から始めればいいか分からない',
  '気が重い',
  '優先度が分からない',
];

// 優先度
export type Priority = 'high' | 'medium' | 'low';

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

// ステータス
export type TaskStatus = 'pending' | 'completed';

// サブタスク
export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

// タスク
export interface Task {
  id: string;
  title: string;
  memo: string;
  deadline: string | null; // ISO 8601
  priority: Priority;
  estimatedMinutes: number | null;
  procrastinationReason: ProcrastinationReason | null;
  isToday: boolean;
  todayOrder: number | null;
  status: TaskStatus;
  completedAt: string | null; // ISO 8601
  subtasks: Subtask[];
  createdAt: string; // ISO 8601
}

// フィルター
export type TaskFilter = 'all' | 'pending' | 'today' | 'completed' | 'overdue';

export const FILTER_LABELS: Record<TaskFilter, string> = {
  all: 'すべて',
  pending: '未着手',
  today: '今日やる',
  completed: '完了済み',
  overdue: '期限切れ',
};
