'use client';

import { Trash2 } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

interface TaskListProps {
    tasks: Task[];
    loading: boolean;
    onDeleteTask: (taskId: string) => void;
}

export default function TaskList({ tasks, loading, onDeleteTask }: TaskListProps) {
    return (
        <div className="bg-white shadow rounded-lg p-6 w-full lg:w-1/2 lg:shrink-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Tasks</h2>
            {loading ? (
                <p className="text-gray-500">Loading tasks...</p>
            ) : tasks.length === 0 ? (
                <p className="text-gray-500">No tasks yet. Create your first task above!</p>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-base font-medium text-gray-900 wrap-break-word">
                                        {task.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600 wrap-break-word whitespace-pre-wrap">
                                        {task.description}
                                    </p>
                                    <p className="mt-2 text-xs text-gray-400">
                                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <button
                                    aria-label="delete"
                                    onClick={() => onDeleteTask(task.id)}
                                    className="shrink-0 ml-4 px-3 py-1 font-medium text-red-600 cursor-pointer"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}