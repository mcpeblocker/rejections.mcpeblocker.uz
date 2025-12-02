"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiService, Rejection } from "@/lib/api.service";
import DashboardLayout from "@/components/DashboardLayout";

export default function RejectionDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const rejectionId = params?.id as string;

    const [rejection, setRejection] = useState<Rejection | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRejection = async () => {
            try {
                const rejections = await apiService.getRejections();
                const found = rejections.find((r) => r.id === rejectionId);
                
                if (found) {
                    setRejection(found);
                } else {
                    router.push("/app/rejections");
                }
            } catch (error) {
                console.error("Error fetching rejection:", error);
                router.push("/app/rejections");
            } finally {
                setLoading(false);
            }
        };

        if (rejectionId) {
            fetchRejection();
        }
    }, [rejectionId, router]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="text-slate-400 text-lg">Loading rejection details...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!rejection) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Back button and share */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/app/rejections"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to All Rejections
                    </Link>
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/rejection/${rejection.id}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Rejection link copied! Share your journey 💪");
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                    </button>
                </div>

                {/* Main content card */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg overflow-hidden">
                    {/* Header section */}
                    <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-6 sm:p-8 border-b border-slate-700">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white flex-1">
                                {rejection.title}
                            </h1>
                            {rejection.emailId && (
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg border border-blue-500/30 whitespace-nowrap">
                                    📧 From Email
                                </span>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <span>📅</span>
                                <span>{formatDate(rejection.timestamp || rejection.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>🕒</span>
                                <span>{formatTime(rejection.timestamp || rejection.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details grid */}
                    <div className="p-6 sm:p-8 space-y-6">
                        {/* Reason badge */}
                        {rejection.reason && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Category
                                </label>
                                <span className="inline-block px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600">
                                    {rejection.reason}
                                </span>
                            </div>
                        )}

                        {/* Sender */}
                        {rejection.sender && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    From
                                </label>
                                <p className="text-white">{rejection.sender}</p>
                            </div>
                        )}

                        {/* Content */}
                        {rejection.content && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Details
                                </label>
                                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                                        {rejection.content}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Email ID (for debugging/reference) */}
                        {rejection.emailId && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Email Reference
                                </label>
                                <p className="text-slate-400 text-sm font-mono bg-slate-700/30 px-3 py-2 rounded border border-slate-600 break-all">
                                    {rejection.emailId}
                                </p>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-700">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Created
                                </label>
                                <p className="text-slate-300 text-sm">
                                    {formatDate(rejection.createdAt)} at {formatTime(rejection.createdAt)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Last Updated
                                </label>
                                <p className="text-slate-300 text-sm">
                                    {formatDate(rejection.updatedAt)} at {formatTime(rejection.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Motivational section */}
                <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 backdrop-blur-md border border-blue-500/20 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">💪</div>
                        <div>
                            <h3 className="text-lg font-semibold text-blue-300 mb-2">
                                Remember: You're Growing Stronger
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Every rejection is a learning opportunity. You've documented this experience, 
                                which means you're taking an active step toward personal growth. Keep pushing forward, 
                                and remember that success often comes after many rejections.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex flex-wrap gap-4">
                    <button
                        onClick={() => toast("Coming up soon... Export feature will be available in the next update!", {
                            icon: "ℹ️",
                        })}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        📄 Export Details
                    </button>
                    <button
                        onClick={() => toast("Coming up soon... Share feature will be available in the next update!", {
                            icon: "ℹ️",
                        })}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        🔗 Share Story
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
