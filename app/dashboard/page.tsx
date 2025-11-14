'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Trash2 } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingTasks, setFetchingTasks] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                fetchTasks(user.id);
            }
        };
        getUser();
    }, []);

    const fetchTasks = async (userId: string) => {
        setFetchingTasks(true);
        try {
            const response = await fetch(`/api/tasks?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data.tasks);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setFetchingTasks(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({
                title: title.trim(),
                description: description.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create task');
            }
            const data = await response.json();
            setTasks([data.task, ...tasks]);
            setTitle('');
            setDescription('');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks?id=${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete task');

            setTasks(tasks.filter((task) => task.id !== taskId));
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 w-30 truncate sm:w-full">{user?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium bg-blue-50 hover:bg-blue-300 transition-colors rounded-lg text-gray-700 hover:text-gray-900 cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-center gap-10 lg:flex lg:flex-row max-w-5xl mx-auto">
                    
                    <div className="bg-white shadow rounded-lg p-6 mb-6 w-full max-w-3xl">
                        {error && (
                            <div className="mb-4 rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-800">{error}</div>
                            </div>
                        )}

                        {/* Add Task Form */}
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h2>
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-600 focus:border-teal-600 sm:text-sm"
                                    placeholder="Enter task title"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    id="description"
                                    required
                                    rows={8}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-600 focus:border-teal-600 sm:text-sm"
                                    placeholder="Enter task description"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm cursor-pointer font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding...' : 'Add Task'}
                            </button>
                        </form>
                    </div>

                    {/* Task List */}
                    <div className="bg-white shadow rounded-lg p-6 w-full max-w-3xl">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Tasks</h2>
                        {fetchingTasks ? (
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
                                                <h3 className="text-base font-medium text-gray-900 wrap-break-word">{task.title}</h3>
                                                <p className="mt-1 text-sm text-gray-600 wrap-break-word whitespace-pre-wrap">{task.description}</p>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    {new Date(task.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                aria-label='delete'
                                                onClick={() => handleDeleteTask(task.id)}
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
                </div>
            </main>
        </div>
    );
}