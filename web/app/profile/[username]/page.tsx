"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api.service";
import toast from "react-hot-toast";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    async function fetchProfile() {
      try {
        const data = await apiService.getPublicProfile(username);
        if (data.success) {
          setProfile(data.profile);
        } else {
          toast.error(data.message || "Profile not found");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [username]);

  const copyProfileLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard!");
  };

  const shareProfile = async () => {
    const url = window.location.href;
    const text = `Check out ${profile.name}'s rejection journey! 💪 ${profile.stats.resilienceLevel} level with ${profile.stats.totalRejections} rejections logged.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile.name}'s Profile`, text, url });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      copyProfileLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-white text-2xl mb-4">Profile not found</div>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Avatar */}
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-lg"
              style={{ backgroundColor: profile.stats.resilienceColor }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{profile.name}</h1>
              <p className="text-slate-400 text-lg mb-4">@{profile.username}</p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <span
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: `${profile.stats.resilienceColor}40`, color: profile.stats.resilienceColor }}
                >
                  {profile.stats.resilienceLevel} Level
                </span>
                <span className="px-4 py-2 bg-slate-700 rounded-full text-sm">
                  {profile.stats.growthPoints} Growth Points
                </span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-3">
              <button
                onClick={copyProfileLink}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>
              <button
                onClick={shareProfile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {/* Total Rejections */}
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Total Rejections</div>
            <div className="text-3xl font-bold">{profile.stats.totalRejections}</div>
            <div className="text-xs text-slate-500 mt-2">Every "no" is progress</div>
          </div>

          {/* Growth Points */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Growth Points</div>
            <div className="text-3xl font-bold">{profile.stats.growthPoints}</div>
            <div className="text-xs text-slate-500 mt-2">Building resilience</div>
          </div>

          {/* Active Streak */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">30-Day Activity</div>
            <div className="text-3xl font-bold">{profile.stats.activeStreak} days</div>
            <div className="text-xs text-slate-500 mt-2">Keep going strong!</div>
          </div>
        </div>

        {/* Recent Rejections */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Rejections</h2>
          {profile.recentRejections.length === 0 ? (
            <div className="text-center text-slate-400 py-8">No rejections yet</div>
          ) : (
            <div className="space-y-3">
              {profile.recentRejections.map((rejection: any) => (
                <div
                  key={rejection.id}
                  onClick={() => router.push(`/rejection/${rejection.id}`)}
                  className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{rejection.title}</h3>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-slate-600 text-slate-300 rounded">
                          {rejection.source === "email" ? "📧 Email" : "✍️ Manual"}
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-400 text-sm">
                      {new Date(rejection.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-600/10 backdrop-blur-md border border-blue-500/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Start Your Resilience Journey</h3>
            <p className="text-slate-400 mb-6">
              Track your rejections, celebrate your growth, and build mental resilience.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
