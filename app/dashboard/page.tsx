'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';

interface Task {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
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

    const handleTaskAdded = (newTask: Task) => {
        setTasks([newTask, ...tasks]);
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
                        <AddTaskForm onTaskAdded={handleTaskAdded} onError={setError} />
                    </div>

                    {/* Task List */}
                    <TaskList 
                        tasks={tasks} 
                        loading={fetchingTasks} 
                        onDeleteTask={handleDeleteTask}
                    />
                </div>
            </main>
        </div>
    );
}