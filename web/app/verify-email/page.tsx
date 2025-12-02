"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Button } from "antd";
import toast from "react-hot-toast";
import { apiService } from "@/lib/api.service";
import Link from "next/link";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get("token");

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if token exists
        if (!token) {
            setIsTokenValid(false);
        } else {
            setIsTokenValid(true);
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter your name!");
            return;
        }

        if (!token) {
            toast.error("Invalid verification token!");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "/api"}/auth/verify-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    name: name.trim(),
                    username: username.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (data.success && data.authToken) {
                toast.success("🎉 Welcome! Your account has been verified!");
                
                // Save auth token
                apiService.saveAuthToken(data.authToken);
                
                // Sync any local rejections
                await apiService.syncLocalRejections();
                
                // Redirect to dashboard
                setTimeout(() => {
                    router.push("/app");
                }, 1000);
            } else {
                throw new Error(data.message || "Verification failed");
            }
        } catch (error: any) {
            console.error("Error verifying email:", error);
            toast.error(error.message || "Failed to verify email. The link may be expired or invalid.");
            setIsTokenValid(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isTokenValid === null) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
                <div className="text-slate-300 text-xl">Loading...</div>
            </div>
        );
    }

    if (isTokenValid === false) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
                {/* Subtle background effects */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-md w-full bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-8 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-white mb-4">Invalid or Expired Link</h1>
                    <p className="text-slate-400 mb-6">
                        This verification link is invalid or has expired. Please register again or contact support if you continue to have issues.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
                        >
                            Go to Homepage
                        </Link>
                        <Link
                            href="/app/support"
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-center"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4 py-8">
            {/* Subtle background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-lg w-full">
                {/* Welcome Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        Welcome to Rejections!
                    </h1>
                    <p className="text-slate-400">
                        We're excited to have you. Let's complete your profile to get started.
                    </p>
                </div>

                {/* Onboarding Form */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Your Name <span className="text-red-400">*</span>
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., John Doe"
                                size="large"
                                maxLength={100}
                                disabled={isSubmitting}
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                This is how you'll be identified in the platform
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Username <span className="text-slate-500">(Optional)</span>
                            </label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g., johndoe"
                                size="large"
                                maxLength={50}
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Choose a unique username or skip this for now
                            </p>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={isSubmitting}
                                disabled={isSubmitting || !name.trim()}
                                className="w-full"
                            >
                                {isSubmitting ? "Setting up your account..." : "Complete Setup & Enter Dashboard"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Info Section */}
                <div className="mt-6 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-300 mb-1">Getting Started</h3>
                            <p className="text-xs text-slate-300">
                                After completing your profile, you'll be able to log your rejections, 
                                track your growth, and join a community of resilient individuals!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-slate-500">
                    <p>
                        By continuing, you agree to our terms of service and privacy policy.
                    </p>
                    <p className="mt-2">
                        Need help?{" "}
                        <a href="mailto:mcpeblockeruzs@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
                            Contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-slate-300 text-xl">Loading...</div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
