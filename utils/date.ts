/**
 * 日付ユーティリティ関数
 */

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}

export function isOverdue(deadlineStr: string | null): boolean {
  if (!deadlineStr) return false;
  const deadline = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadline < today;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

export function formatDeadline(deadlineStr: string | null): string {
  if (!deadlineStr) return '期限なし';
  const deadline = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const deadlineDay = new Date(deadline);
  deadlineDay.setHours(0, 0, 0, 0);

  if (deadlineDay.getTime() === today.getTime()) return '今日まで';
  if (deadlineDay.getTime() === tomorrow.getTime()) return '明日まで';
  if (deadlineDay < today) return `${formatDate(deadlineStr)} (期限切れ)`;
  return `${formatDate(deadlineStr)}まで`;
}

export function formatMinutes(minutes: number | null): string {
  if (minutes === null) return '';
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}
