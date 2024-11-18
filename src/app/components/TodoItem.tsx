'use client'

interface TodoItemProps {
  task: string;
  completed: boolean;
  onDelete: () => void;
  onToggle: () => void;
  loading?: boolean;
}

export default function TodoItem({ 
  task, 
  completed, 
  onDelete, 
  onToggle, 
  loading = false 
}: TodoItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggle}
        className="w-5 h-5"
        disabled={loading}
      />
      <div className="flex-1">
        <span className={completed ? 'line-through text-gray-500' : ''}>
          {task}
        </span>
      </div>
      <button
        onClick={onDelete}
        className="text-red-500 hover:text-red-700 disabled:opacity-50"
        disabled={loading}
      >
        Delete
      </button>
    </div>
  );
} 