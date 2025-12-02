"use client";
import DashboardLayout from "@/components/DashboardLayout";

export default function SupportPage() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        Support & Contact 💬
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base">
                        We're here to help! Reach out to us anytime
                    </p>
                </div>

                {/* Contact Card */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6 sm:p-8 mb-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="text-4xl">📧</div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">Get in Touch</h2>
                            <p className="text-slate-300 leading-relaxed mb-4">
                                Have questions, feedback, or need assistance? We'd love to hear from you!
                                Our team is dedicated to helping you make the most of your rejection tracking journey.
                            </p>
                        </div>
                    </div>

                    {/* Email contact */}
                    <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6 mb-6">
                        <label className="block text-sm font-medium text-slate-400 mb-3">
                            Email Us
                        </label>
                        <a 
                            href="mailto:mcpeblockeruzs@gmail.com"
                            className="text-2xl sm:text-3xl font-bold text-blue-400 hover:text-blue-300 transition-colors break-all"
                        >
                            mcpeblockeruzs@gmail.com
                        </a>
                    </div>

                    {/* Quick links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a
                            href="mailto:mcpeblockeruzs@gmail.com?subject=Support Request"
                            className="flex items-center gap-3 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors"
                        >
                            <span className="text-2xl">🆘</span>
                            <div>
                                <h3 className="text-white font-semibold">Request Support</h3>
                                <p className="text-xs text-slate-400">Get help with an issue</p>
                            </div>
                        </a>
                        <a
                            href="mailto:mcpeblockeruzs@gmail.com?subject=Feature Suggestion"
                            className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                        >
                            <span className="text-2xl">💡</span>
                            <div>
                                <h3 className="text-white font-semibold">Suggest a Feature</h3>
                                <p className="text-xs text-slate-400">Share your ideas</p>
                            </div>
                        </a>
                        <a
                            href="mailto:mcpeblockeruzs@gmail.com?subject=Bug Report"
                            className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                        >
                            <span className="text-2xl">🐛</span>
                            <div>
                                <h3 className="text-white font-semibold">Report a Bug</h3>
                                <p className="text-xs text-slate-400">Help us improve</p>
                            </div>
                        </a>
                        <a
                            href="mailto:mcpeblockeruzs@gmail.com?subject=General Inquiry"
                            className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                        >
                            <span className="text-2xl">💬</span>
                            <div>
                                <h3 className="text-white font-semibold">General Inquiry</h3>
                                <p className="text-xs text-slate-400">Ask us anything</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                How do I log a rejection from an email?
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                We're working on a browser extension that will allow you to log rejections directly from your email.
                                For now, you can manually enter rejection details through the dashboard.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Can I export my rejection data?
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Data export functionality is coming soon! This feature will allow you to download your rejection
                                history in various formats. Stay tuned for updates.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Is my data secure and private?
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Absolutely! We take your privacy seriously. Your rejection data is encrypted and stored securely.
                                We never share your personal information with third parties.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                How can I contribute to the project?
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                This is an open-source project! Check out our{" "}
                                <a 
                                    href="https://github.com/mcpeblocker/rejections.mcpeblocker.uz" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline"
                                >
                                    GitHub repository
                                </a>
                                {" "}to contribute code, report issues, or suggest features.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Creator section */}
                <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 backdrop-blur-md border border-blue-500/20 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">👨‍💻</div>
                        <div>
                            <h3 className="text-lg font-semibold text-blue-300 mb-2">
                                About the Creator
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                This project is created and maintained by{" "}
                                <a 
                                    href="https://mcpeblocker.uz" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline font-semibold"
                                >
                                    Alisher Ortiqov
                                </a>
                                . With a passion for helping people turn their setbacks into comebacks, this platform
                                aims to create a supportive community of resilient individuals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
