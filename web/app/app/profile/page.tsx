"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiService, UserProfile } from "@/lib/api.service";
import DashboardLayout from "@/components/DashboardLayout";

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedUsername, setEditedUsername] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await apiService.getMe();
                if (response.success && response.user) {
                    setUser(response.user);
                    setEditedName(response.user.name);
                    setEditedUsername(response.user.username || "");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleSaveProfile = () => {
        // Backend doesn't have an update endpoint yet
        toast("Coming up soon... Profile update feature will be available in the next update!", {
            icon: "ℹ️",
        });
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        if (user) {
            setEditedName(user.name);
            setEditedUsername(user.username || "");
        }
        setIsEditing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="text-slate-400 text-lg">Loading profile...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        Profile Settings 👤
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base">
                        Manage your account information
                    </p>
                </div>

                {/* Profile card */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg overflow-hidden mb-6">
                    {/* Avatar section */}
                    <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-6 sm:p-8 border-b border-slate-700">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                                <p className="text-slate-400">{user.email}</p>
                                {user.username && (
                                    <p className="text-slate-500 text-sm mt-1">@{user.username}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile info */}
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                                >
                                    ✏️ Edit Profile
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-white">{user.name}</p>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Username
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedUsername}
                                        onChange={(e) => setEditedUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-white">
                                        {user.username ? `@${user.username}` : "Not set"}
                                    </p>
                                )}
                            </div>

                            {/* Email (read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Email Address
                                </label>
                                <p className="text-white">{user.email}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Email cannot be changed at this time
                                </p>
                            </div>

                            {/* Action buttons for editing */}
                            {isEditing && (
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account details */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6 sm:p-8 mb-6">
                    <h3 className="text-xl font-semibold text-white mb-6">Account Details</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Account Created
                            </label>
                            <p className="text-white">{formatDate(user.createdAt)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                User ID
                            </label>
                            <p className="text-slate-400 font-mono text-sm">#{user.id}</p>
                        </div>
                    </div>
                </div>

                {/* Security section */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6 sm:p-8">
                    <h3 className="text-xl font-semibold text-white mb-6">Security</h3>
                    
                    <div className="space-y-4">
                        <button
                            onClick={() => toast("Coming up soon... Password change feature will be available in the next update!", {
                                icon: "ℹ️",
                            })}
                            className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                        >
                            🔒 Change Password
                        </button>
                        
                        <div className="pt-6 border-t border-slate-700">
                            <h4 className="text-red-400 font-semibold mb-3">Danger Zone</h4>
                            <button
                                onClick={() => toast("Coming up soon... Account deletion will be available in the next update. Please contact support if you need assistance.", {
                                    icon: "ℹ️",
                                })}
                                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors text-sm"
                            >
                                🗑️ Delete Account
                            </button>
                            <p className="text-xs text-slate-500 mt-2">
                                This action cannot be undone. All your data will be permanently deleted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
