"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SimpleLogin } from "@/components/simple-login"
import { SimpleSignup } from "@/components/simple-signup"
import { useUsers } from "@/hooks/use-api-data"
import { Mail } from "lucide-react"
import Link from "next/link"
import type { User } from "@/hooks/use-api-data"

interface AuthSectionProps {
  setCurrentPage: (page: string) => void
  setCurrentUser: (user: User | null) => void
}

export function AuthSection({ setCurrentPage, setCurrentUser }: AuthSectionProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const { users } = useUsers()

  useEffect(() => {
    // Vérifier si l'URL contient tab=signup
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tab = urlParams.get('tab')
      if (tab === 'signup') {
        setActiveTab('signup')
      }
    }
  }, [])

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user)
    setCurrentPage("home")
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tabs */}
      <div className="flex mb-8 bg-muted/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "login"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Connexion
        </button>
        <button
          onClick={() => setActiveTab("signup")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "signup"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Inscription
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "login" ? (
            <SimpleLogin
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={() => setActiveTab("signup")}
            />
          ) : (
            <SimpleSignup
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab("login")}
              existingUsers={users}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Lien de vérification d'email */}
      <div className="mt-6 text-center">
        <Link 
          href="/auth/verify-email"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Mail className="w-4 h-4" />
          Vérifier mon adresse email
        </Link>
      </div>
    </div>
  )
}
