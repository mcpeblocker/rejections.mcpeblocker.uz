"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api.service";
import toast from "react-hot-toast";

export default function PublicRejectionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [rejection, setRejection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchRejection() {
      try {
        const data = await apiService.getPublicRejection(id);
        if (data.success) {
          setRejection(data.rejection);
        } else {
          toast.error(data.message || "Rejection not found");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load rejection");
      } finally {
        setLoading(false);
      }
    }

    fetchRejection();
  }, [id]);

  const copyRejectionLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Rejection link copied to clipboard!");
  };

  const shareRejection = async () => {
    const url = window.location.href;
    const text = `${rejection.user.name} shared a rejection: "${rejection.title}" 💪 #RejectionJourney`;

    if (navigator.share) {
      try {
        await navigator.share({ title: rejection.title, text, url });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      copyRejectionLink();
    }
  };

  const motivationalQuotes = [
    "Every rejection is a redirection to something better.",
    "The master has failed more times than the beginner has even tried.",
    "Success is stumbling from failure to failure with no loss of enthusiasm.",
    "Rejection is not the opposite of success, it's part of success.",
    "Don't fear failure. Fear being in the exact same place next year.",
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading rejection...</div>
      </div>
    );
  }

  if (!rejection) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-white text-2xl mb-4">Rejection not found</div>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={copyRejectionLink}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </button>
            <button
              onClick={shareRejection}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Rejection Card */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{rejection.source === "email" ? "📧" : "✍️"}</span>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-600 text-slate-300 rounded-full text-sm">
                  {rejection.source === "email" ? "From Email" : "Manual Entry"}
                </span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{rejection.title}</h1>
            <div className="text-slate-400 text-sm">
              {new Date(rejection.timestamp || rejection.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {rejection.sender && (
              <div className="mb-6 pb-6 border-b border-slate-700">
                <div className="text-slate-400 text-sm mb-2">From</div>
                <div className="font-semibold">{rejection.sender}</div>
              </div>
            )}

            <div className="mb-6">
              <div className="text-slate-400 text-sm mb-2">Details</div>
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {rejection.content || "No additional details provided."}
              </div>
            </div>

            {rejection.reason && (
              <div className="mb-6 pb-6 border-b border-slate-700">
                <div className="text-slate-400 text-sm mb-2">Reason</div>
                <div className="text-slate-200">{rejection.reason}</div>
              </div>
            )}

            {rejection.timestamp && (
              <div className="text-slate-500 text-sm">
                Logged: {new Date(rejection.timestamp).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-600/10 backdrop-blur-md border border-blue-500/20 rounded-xl p-6 sm:p-8 mb-8">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-lg sm:text-xl font-medium text-slate-200 mb-2">{randomQuote}</p>
            <p className="text-slate-400 text-sm">Keep pushing forward! 💪</p>
          </div>
        </div>

        {/* User Attribution */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: rejection.user.resilienceColor }}
              >
                {rejection.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold">{rejection.user.name}</div>
                <div className="text-slate-400 text-sm">@{rejection.user.username}</div>
                <div className="flex gap-2 mt-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${rejection.user.resilienceColor}40`,
                      color: rejection.user.resilienceColor,
                    }}
                  >
                    {rejection.user.resilienceLevel} Level
                  </span>
                  <span className="px-3 py-1 bg-slate-700 rounded-full text-xs">
                    {rejection.user.totalRejections} rejections
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push(`/profile/${rejection.user.username}`)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold cursor-pointer"
            >
              View Profile
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Share Your Rejection Journey</h3>
            <p className="text-slate-400 mb-6">
              Join thousands building resilience through rejection tracking
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold cursor-pointer"
            >
              Start Tracking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
