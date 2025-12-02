"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Modal, Input } from "antd";
import { apiService, UserProfile } from "@/lib/api.service";
import DashboardLayout from "@/components/DashboardLayout";
import ShareLinkModal from "@/components/ShareLinkModal";

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedUsername, setEditedUsername] = useState("");
    
    // Password change modal state
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // Delete account modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    
    // Share link modal state
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [copiedLink, setCopiedLink] = useState("");

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

    useEffect(() => {
        fetchUser();
    }, []);

    const handleSaveProfile = async () => {
        if (!editedName.trim()) {
            toast.error("Name cannot be empty!");
            return;
        }

        setIsSaving(true);
        try {
            const response = await apiService.updateProfile(editedName.trim(), editedUsername.trim());
            if (response.success && response.user) {
                setUser(response.user);
                setEditedName(response.user.name);
                setEditedUsername(response.user.username || "");
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            }
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (user) {
            setEditedName(user.name);
            setEditedUsername(user.username || "");
        }
        setIsEditing(false);
    };

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All password fields are required!");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long!");
            return;
        }

        setIsChangingPassword(true);
        try {
            const response = await apiService.changePassword(currentPassword, newPassword);
            if (response.success) {
                toast.success("Password changed successfully!");
                setIsPasswordModalOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error: any) {
            console.error("Error changing password:", error);
            toast.error(error.message || "Failed to change password. Please check your current password.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error("Password is required to delete account!");
            return;
        }

        setIsDeletingAccount(true);
        try {
            const response = await apiService.deleteAccount(deletePassword);
            if (response.success) {
                toast.success("Account deleted successfully. Redirecting...");
                apiService.clearAuthToken();
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            }
        } catch (error: any) {
            console.error("Error deleting account:", error);
            toast.error(error.message || "Failed to delete account. Please check your password.");
        } finally {
            setIsDeletingAccount(false);
        }
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
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
                            {user.username && (
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/profile/${user.username}`;
                                        navigator.clipboard.writeText(url);
                                        setCopiedLink(url);
                                        setShowLinkModal(true);
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share Profile
                                </button>
                            )}
                        </div>
                        {!user.username && (
                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <p className="text-yellow-400 text-sm">
                                    💡 Set a username to share your public profile with others!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Profile info */}
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm cursor-pointer"
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
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
                                    >
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
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
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                        >
                            🔒 Change Password
                        </button>
                        
                        <div className="pt-6 border-t border-slate-700">
                            <h4 className="text-red-400 font-semibold mb-3">Danger Zone</h4>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
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

                {/* Password Change Modal */}
                <Modal
                    title="Change Password"
                    open={isPasswordModalOpen}
                    onCancel={() => {
                        setIsPasswordModalOpen(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                    }}
                    footer={null}
                    width="90%"
                    style={{ maxWidth: 500 }}
                >
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Current Password</label>
                            <Input.Password
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                size="large"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">New Password</label>
                            <Input.Password
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min 6 characters)"
                                size="large"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                            <Input.Password
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                size="large"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handlePasswordChange}
                                disabled={isChangingPassword}
                                className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                {isChangingPassword ? "Changing..." : "Change Password"}
                            </button>
                            <button
                                onClick={() => {
                                    setIsPasswordModalOpen(false);
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                                disabled={isChangingPassword}
                                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Delete Account Modal */}
                <Modal
                    title={<span className="text-red-600">Delete Account</span>}
                    open={isDeleteModalOpen}
                    onCancel={() => {
                        setIsDeleteModalOpen(false);
                        setDeletePassword("");
                    }}
                    footer={null}
                    width="90%"
                    style={{ maxWidth: 500 }}
                >
                    <div className="space-y-4 py-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 font-semibold mb-2">⚠️ Warning: This action is permanent!</p>
                            <p className="text-red-700 text-sm">
                                Deleting your account will permanently remove all your data, including all logged rejections.
                                This action cannot be undone.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Enter your password to confirm</label>
                            <Input.Password
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Enter your password"
                                size="large"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeletingAccount}
                                className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                {isDeletingAccount ? "Deleting..." : "Delete Account"}
                            </button>
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeletePassword("");
                                }}
                                disabled={isDeletingAccount}
                                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
                
                {/* Share Link Modal */}
                <ShareLinkModal
                    isOpen={showLinkModal}
                    onClose={() => setShowLinkModal(false)}
                    link={copiedLink}
                    title="Profile Link Copied Successfully!"
                    description="Share your profile and inspire others with your rejection journey!"
                />
            </div>
        </DashboardLayout>
    );
}
