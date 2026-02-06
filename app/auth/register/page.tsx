"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthSection } from "@/components/auth-section"
import { Navigation } from "@/components/navigation"
import { useCurrentUser } from "@/hooks/use-api-data"
import type { User } from "@/hooks/use-api-data"

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentUser } = useCurrentUser()
  const [isClient, setIsClient] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    setIsClient(true)
    
    // Récupérer le thème sauvegardé
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
    
    // Si déjà connecté, rediriger vers l'accueil
    if (currentUser) {
      router.push('/')
      return
    }
  }, [currentUser, router])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
    window.location.href = '/'
  }

  // Si côté client et connecté, ne rien afficher pendant la redirection
  if (!isClient || currentUser) {
    return null
  }

  const handleAuthSuccess = (user: User) => {
    // Rediriger vers l'accueil après inscription réussie
    router.push('/')
  }

  const setCurrentUser = (user: User | null) => {
    // Cette fonction est nécessaire pour AuthSection mais ne fait rien ici
    // car la gestion de l'utilisateur est faite par useCurrentUser
  }

  const setCurrentPage = (page: string) => {
    // Rediriger vers la page d'accueil avec le bon onglet
    if (page === "auth") {
      router.push('/?tab=signup')
    } else {
      router.push(`/?page=${page}`)
    }
  }

  const isSuperAdmin = (currentUser as any)?.role === 'SUPER_ADMIN' || false

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentUser={currentUser} 
        setCurrentPage={setCurrentPage}
        currentPage="auth"
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        isSuperAdmin={isSuperAdmin}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Inscription
            </h1>
            <p className="text-muted-foreground">
              Créez votre compte pour participer aux BANKASS AWARDS
            </p>
          </div>
          
          <AuthSection 
            setCurrentPage={setCurrentPage}
            setCurrentUser={setCurrentUser}
          />
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}
