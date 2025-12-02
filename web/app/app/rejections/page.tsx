"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { apiService, Rejection } from "@/lib/api.service";
import DashboardLayout from "@/components/DashboardLayout";

type SortOption = "newest" | "oldest" | "title";
type FilterOption = "all" | "email" | "manual";

export default function AllRejectionsPage() {
    const [rejections, setRejections] = useState<Rejection[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [filterBy, setFilterBy] = useState<FilterOption>("all");

    const fetchRejections = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiService.getRejections();
            setRejections(data);
        } catch (error) {
            console.error("Error fetching rejections:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRejections();

        // Listen for rejection logged event
        const handleRejectionLogged = () => {
            fetchRejections();
        };

        window.addEventListener('rejectionLogged', handleRejectionLogged);

        return () => {
            window.removeEventListener('rejectionLogged', handleRejectionLogged);
        };
    }, [fetchRejections]);

    const filteredAndSortedRejections = useMemo(() => {
        let result = [...rejections];

        // Apply search filter
        if (searchQuery) {
            result = result.filter((rejection) =>
                rejection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rejection.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rejection.reason?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply type filter
        if (filterBy === "email") {
            result = result.filter((rejection) => rejection.emailId !== null);
        } else if (filterBy === "manual") {
            result = result.filter((rejection) => rejection.emailId === null);
        }

        // Apply sorting
        result.sort((a, b) => {
            if (sortBy === "newest") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === "oldest") {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortBy === "title") {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });

        return result;
    }, [rejections, searchQuery, sortBy, filterBy]);

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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        All Rejections 📋
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base">
                        Your complete rejection journey in one place
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-slate-400 text-lg">Loading rejections...</div>
                    </div>
                ) : (
                    <>
                        {/* Filters and search */}
                        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-4 sm:p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Search */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search by title, content, or reason..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Sort */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="title">Title (A-Z)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Filter buttons */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilterBy("all")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filterBy === "all"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                                >
                                    All ({rejections.length})
                                </button>
                                <button
                                    onClick={() => setFilterBy("email")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filterBy === "email"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                                >
                                    From Email ({rejections.filter(r => r.emailId !== null).length})
                                </button>
                                <button
                                    onClick={() => setFilterBy("manual")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filterBy === "manual"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                                >
                                    Manual Entry ({rejections.filter(r => r.emailId === null).length})
                                </button>
                            </div>
                        </div>

                        {/* Results info */}
                        <div className="mb-4 text-sm text-slate-400">
                            Showing {filteredAndSortedRejections.length} of {rejections.length} rejections
                        </div>

                        {/* Rejections list */}
                        {filteredAndSortedRejections.length === 0 ? (
                            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-12 text-center">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-white mb-2">No rejections found</h3>
                                <p className="text-slate-400 mb-6">
                                    {searchQuery || filterBy !== "all"
                                        ? "Try adjusting your filters or search query"
                                        : "Start your journey by logging your first rejection"}
                                </p>
                                {!searchQuery && filterBy === "all" && (
                                    <Link
                                        href="/"
                                        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Log Your First Rejection
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredAndSortedRejections.map((rejection) => (
                                    <Link
                                        key={rejection.id}
                                        href={`/app/rejections/${rejection.id}`}
                                        className="block bg-slate-800/50 backdrop-blur-md border border-slate-700 hover:border-slate-600 rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                {/* Title and badges */}
                                                <div className="flex items-start gap-3 mb-3">
                                                    <h3 className="text-lg font-semibold text-white flex-1">
                                                        {rejection.title}
                                                    </h3>
                                                    {rejection.emailId && (
                                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                                                            📧 Email
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Content preview */}
                                                {rejection.content && (
                                                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                                        {rejection.content}
                                                    </p>
                                                )}

                                                {/* Metadata */}
                                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        📅 {formatDate(rejection.createdAt)}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{getTimeAgo(rejection.createdAt)}</span>
                                                    {rejection.reason && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="px-2 py-1 bg-slate-700 rounded">
                                                                {rejection.reason}
                                                            </span>
                                                        </>
                                                    )}
                                                    {rejection.sender && (
                                                        <>
                                                            <span>•</span>
                                                            <span>From: {rejection.sender}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Arrow icon */}
                                            <div className="text-slate-500">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
