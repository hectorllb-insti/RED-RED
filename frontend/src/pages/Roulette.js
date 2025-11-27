"use client"

import { Toaster } from "react-hot-toast"
import { AuthProvider } from "../context/AuthContext"
import { ThemeProvider } from "../context/ThemeContext"
import Roulette from "../components/Roulette"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../context/ThemeContext"

function ThemeToggle() {
    const { actualTheme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:scale-105 transition-all"
            aria-label="Toggle theme"
        >
            {actualTheme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
                <Moon className="w-5 h-5 text-slate-700" />
            )}
        </button>
    )
}

function PageContent() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
            <div className="container mx-auto px-4 py-8">
                <ThemeToggle />
                <Roulette />
            </div>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: "#10b981",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#ef4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />
        </div>
    )
}

export default function Page() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <PageContent />
            </AuthProvider>
        </ThemeProvider>
    )
}
