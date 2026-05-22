import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { Task, Subtask, TaskFilter } from '@/types/task';
import { loadTasks, saveTasks, generateId } from '@/utils/storage';

// --- State ---
interface TaskState {
  tasks: Task[];
  isLoaded: boolean;
}

const initialState: TaskState = {
  tasks: [],
  isLoaded: false,
};

// --- Actions ---
type TaskAction =
  | { type: 'LOAD_TASKS'; tasks: Task[] }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'TOGGLE_TODAY'; id: string }
  | { type: 'COMPLETE_TASK'; id: string }
  | { type: 'UNCOMPLETE_TASK'; id: string }
  | { type: 'REORDER_TODAY_TASKS'; tasks: Task[] }
  | { type: 'ADD_SUBTASK'; taskId: string; subtask: Subtask }
  | { type: 'TOGGLE_SUBTASK'; taskId: string; subtaskId: string }
  | { type: 'DELETE_SUBTASK'; taskId: string; subtaskId: string };

// --- Reducer ---
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'LOAD_TASKS':
      return { ...state, tasks: action.tasks, isLoaded: true };

    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.task.id ? action.task : t)),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
      };

    case 'TOGGLE_TODAY': {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, isToday: !t.isToday, todayOrder: null } : t,
        ),
      };
    }

    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? { ...t, status: 'completed', completedAt: new Date().toISOString(), isToday: false, todayOrder: null }
            : t,
        ),
      };

    case 'UNCOMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? { ...t, status: 'pending', completedAt: null }
            : t,
        ),
      };

    case 'REORDER_TODAY_TASKS': {
      const orderMap = new Map(action.tasks.map((t, index) => [t.id, index]));
      const newTasks = state.tasks.map(t => {
        if (orderMap.has(t.id)) {
          return { ...t, todayOrder: orderMap.get(t.id) as number };
        }
        return t;
      });
      return { ...state, tasks: newTasks };
    }

    case 'ADD_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId
            ? { ...t, subtasks: [...t.subtasks, action.subtask] }
            : t,
        ),
      };

    case 'TOGGLE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === action.subtaskId ? { ...s, isCompleted: !s.isCompleted } : s,
                ),
              }
            : t,
        ),
      };

    case 'DELETE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId
            ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== action.subtaskId) }
            : t,
        ),
      };

    default:
      return state;
  }
}

// --- Context ---
interface TaskContextValue {
  tasks: Task[];
  isLoaded: boolean;
  // CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'status' | 'subtasks'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  // Today
  toggleToday: (id: string) => boolean; // false if limit exceeded
  reorderTodayTasks: (tasks: Task[]) => void;
  todayTasks: Task[];
  todayCount: number;
  canAddToday: boolean;
  // Status
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  // Subtasks
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  // Queries
  getTask: (id: string) => Task | undefined;
  getFilteredTasks: (filter: TaskFilter) => Task[];
  quickTasks: Task[]; // 5分以下
  completedToday: Task[];
  completedThisWeek: Task[];
}

const TaskContext = createContext<TaskContextValue | null>(null);

// --- Provider ---
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // 初期ロード
  useEffect(() => {
    (async () => {
      const tasks = await loadTasks();
      dispatch({ type: 'LOAD_TASKS', tasks });
    })();
  }, []);

  // 自動保存
  useEffect(() => {
    if (state.isLoaded) {
      saveTasks(state.tasks);
    }
  }, [state.tasks, state.isLoaded]);

  // 今日やるタスク
  const priorityWeight: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const todayTasks = state.tasks
    .filter((t) => t.isToday && t.status === 'pending')
    .sort((a, b) => {
      if (a.todayOrder !== null && b.todayOrder !== null) {
        return a.todayOrder - b.todayOrder;
      }
      if (a.todayOrder !== null) return -1;
      if (b.todayOrder !== null) return 1;
      return (priorityWeight[a.priority] ?? 1) - (priorityWeight[b.priority] ?? 1);
    });
  // Strict limit: count ALL isToday tasks, including completed ones
  const todayCount = state.tasks.filter((t) => t.isToday).length;
  const canAddToday = todayCount < 3;

  // 5分タスク
  const quickTasks = state.tasks.filter(
    (t) =>
      t.status === 'pending' &&
      t.estimatedMinutes !== null &&
      t.estimatedMinutes <= 5,
  );

  // 完了タスク
  const completedToday = state.tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && isToday(t.completedAt),
  );

  const completedThisWeek = state.tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && isThisWeek(t.completedAt),
  );

  // --- Actions ---
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'status' | 'subtasks'>) => {
      const task: Task = {
        ...taskData,
        id: generateId(),
        status: 'pending',
        completedAt: null,
        subtasks: [],
        todayOrder: taskData.isToday ? todayCount : null,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_TASK', task });
    },
    [todayCount],
  );

  const updateTask = useCallback((task: Task) => {
    dispatch({ type: 'UPDATE_TASK', task });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', id });
  }, []);

  const toggleToday = useCallback(
    (id: string): boolean => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return false;
      // 既に今日やるに設定済みなら解除（常にOK）
      if (task.isToday) {
        dispatch({ type: 'TOGGLE_TODAY', id });
        return true;
      }
      // 3つ上限チェック
      if (!canAddToday) return false;
      dispatch({ type: 'TOGGLE_TODAY', id });
      return true;
    },
    [state.tasks, canAddToday],
  );

  const reorderTodayTasks = useCallback((tasks: Task[]) => {
    dispatch({ type: 'REORDER_TODAY_TASKS', tasks });
  }, []);

  const completeTask = useCallback((id: string) => {
    dispatch({ type: 'COMPLETE_TASK', id });
  }, []);

  const uncompleteTask = useCallback((id: string) => {
    dispatch({ type: 'UNCOMPLETE_TASK', id });
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const subtask: Subtask = {
      id: generateId(),
      title,
      isCompleted: false,
    };
    dispatch({ type: 'ADD_SUBTASK', taskId, subtask });
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    dispatch({ type: 'TOGGLE_SUBTASK', taskId, subtaskId });
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    dispatch({ type: 'DELETE_SUBTASK', taskId, subtaskId });
  }, []);

  const getTask = useCallback(
    (id: string) => state.tasks.find((t) => t.id === id),
    [state.tasks],
  );

  const getFilteredTasks = useCallback(
    (filter: TaskFilter): Task[] => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      switch (filter) {
        case 'all':
          return state.tasks;
        case 'pending':
          return state.tasks.filter((t) => t.status === 'pending');
        case 'today':
          return state.tasks.filter((t) => t.isToday && t.status === 'pending');
        case 'completed':
          return state.tasks.filter((t) => t.status === 'completed');
        case 'overdue':
          return state.tasks.filter((t) => {
            if (!t.deadline || t.status === 'completed') return false;
            return new Date(t.deadline) < now;
          });
        default:
          return state.tasks;
      }
    },
    [state.tasks],
  );

  const value: TaskContextValue = {
    tasks: state.tasks,
    isLoaded: state.isLoaded,
    addTask,
    updateTask,
    deleteTask,
    toggleToday,
    reorderTodayTasks,
    todayTasks,
    todayCount,
    canAddToday,
    completeTask,
    uncompleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    getTask,
    getFilteredTasks,
    quickTasks,
    completedToday,
    completedThisWeek,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// --- Hook ---
export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

// --- Helper functions (inlined) ---
function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}
