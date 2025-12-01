"use client";
import { API_BASE_URL } from "@/api";
import Link from "next/link";
import { useState, useEffect, Fragment } from "react";

interface UserProfile {
    name: string;
    email: string;
    username: string | null;
}

export default function Dashboard() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        // Fetch user profile on component mount
        const fetchUserProfile = async () => {
            try {
                const authToken = localStorage.getItem("auth_token");
                if (!authToken) throw new Error("No auth token found");
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setUser(data.user);
                    }
                } else {
                    console.error("Failed to fetch user profile");
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                window.location.href = "/";
            }
        };
        // Fetch rejection count on component mount
        const fetchRejectionCount = async () => {
            try {
                const authToken = localStorage.getItem("auth_token");
                if (!authToken) throw new Error("No auth token found");
                const response = await fetch(`${API_BASE_URL}/rejections/count`, {
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setCount(data.count);
                } else {
                    console.error("Failed to fetch rejection count");
                }
            } catch (error) {
                console.error("Error fetching rejection count:", error);
            }
        };

        fetchUserProfile();
        fetchRejectionCount();
    }, []);

    if (!user) {
        return (
            <main className="h-screen flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </main>
        );
    }

    const handleSignOut = () => {
        localStorage.removeItem("auth_token");
        window.location.href = "/";
    }

    return (
        <main className="h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">Hey there{user ? (
                <Fragment>
                    <span>{`, ${user.name}! `}</span>
                    <span title="Sign out of this account" className="cursor-pointer underline text-gray-600 text-lg" onClick={handleSignOut}>(sign out)</span>
                </Fragment>
            ) : "!"}</h1>
            <p className="mb-16 italic">We are currently working on your dashboard. Stay tuned for updates!</p>
            {count > 0 && <p className="mb-4">For now, here's some interesting fact: You've shared total of <b>{count}</b> rejections so far.</p>}
            {/* Quote style with a blockquote*/}
            <blockquote className="italic text-center">It's never easy to face rejection, but remember - <br /> each failure is a step towards growth and success!</blockquote>
            <Link href="/" className="mt-16"><span className="text-blue-500 underline underline-offset-4">⬅ Go back to homepage</span></Link>
        </main>
    )
}