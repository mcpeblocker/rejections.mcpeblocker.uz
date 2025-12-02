"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { apiService, Rejection } from "@/lib/api.service";
import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
    const [count, setCount] = useState<number>(0);
    const [recentRejections, setRecentRejections] = useState<Rejection[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [countResponse, rejectionsResponse] = await Promise.all([
                apiService.getRejectionsCount(),
                apiService.getRejections(),
            ]);
            
            setCount(countResponse.count);
            
            // Get the 5 most recent rejections
            const sorted = rejectionsResponse
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5);
            setRecentRejections(sorted);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Listen for rejection logged event
        const handleRejectionLogged = () => {
            fetchData();
        };

        window.addEventListener('rejectionLogged', handleRejectionLogged);

        return () => {
            window.removeEventListener('rejectionLogged', handleRejectionLogged);
        };
    }, [fetchData]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
        return `${Math.floor(diffInDays / 365)} years ago`;
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Welcome header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        Welcome Back! 👋
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base">
                        Here's an overview of your rejection journey
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-slate-400 text-lg">Loading your dashboard...</div>
                    </div>
                ) : (
                    <>
                        {/* Stats cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                            {/* Total Rejections */}
                            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-slate-400 text-sm font-medium">Total Rejections</h3>
                                    <span className="text-2xl">📊</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{count}</p>
                                <p className="text-xs text-slate-500 mt-2">Keep tracking your growth!</p>
                            </div>

                            {/* Growth mindset card */}
                            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-blue-300 text-sm font-medium">Growth Points</h3>
                                    <span className="text-2xl">💪</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{count * 10}</p>
                                <p className="text-xs text-blue-300/70 mt-2">Each rejection = 10 growth points</p>
                            </div>

                            {/* Resilience score */}
                            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-slate-400 text-sm font-medium">Resilience Level</h3>
                                    <span className="text-2xl">🔥</span>
                                </div>
                                <p className="text-3xl font-bold text-white">
                                    {count === 0 ? "Beginner" : count < 5 ? "Explorer" : count < 10 ? "Fighter" : count < 20 ? "Warrior" : "Champion"}
                                </p>
                                <p className="text-xs text-slate-500 mt-2">Keep pushing forward!</p>
                            </div>

                            {/* Quick action card - Hint to use floating button */}
                            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6 flex flex-col justify-center items-center text-center">
                                <span className="text-3xl mb-2">👉</span>
                                <p className="text-green-300 text-sm font-medium">
                                    Look for the <b>➕</b> button!
                                </p>
                                <p className="text-xs text-green-300/70 mt-1">Quick log at bottom-right</p>
                            </div>
                        </div>

                        {/* Motivational quote */}
                        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-md border border-slate-700 rounded-lg p-6 mb-8">
                            <blockquote className="text-center">
                                <p className="text-lg sm:text-xl italic text-slate-300 mb-2">
                                    "Never give up! Failure and rejection are only the first step to succeeding."
                                </p>
                                <footer className="text-sm text-slate-500">— Jim Valvano</footer>
                            </blockquote>
                        </div>

                        {/* Recent rejections */}
                        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-white">Recent Rejections</h2>
                                <Link
                                    href="/app/rejections"
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                >
                                    View All →
                                </Link>
                            </div>

                            {recentRejections.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 text-lg mb-4">No rejections logged yet</p>
                                    <p className="text-slate-500 text-sm mb-6">
                                        Start your journey by logging your first rejection experience
                                    </p>
                                    <Link
                                        href="/"
                                        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Log Your First Rejection
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentRejections.map((rejection) => (
                                        <Link
                                            key={rejection.id}
                                            href={`/app/rejections/${rejection.id}`}
                                            className="block p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-medium mb-1 truncate">
                                                        {rejection.title}
                                                    </h3>
                                                    {rejection.content && (
                                                        <p className="text-slate-400 text-sm line-clamp-2">
                                                            {rejection.content}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                        <span>{getTimeAgo(rejection.createdAt)}</span>
                                                        {rejection.reason && (
                                                            <span className="px-2 py-1 bg-slate-600/50 rounded">
                                                                {rejection.reason}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-slate-500">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}