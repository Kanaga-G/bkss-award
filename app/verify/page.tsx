"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Shield, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

function VerifyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [verificationCode, setVerificationCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Charger les données de la session
  useEffect(() => {
    if (!sessionId) {
      setMessage({
        type: "error",
        text: "Lien de vérification invalide. Veuillez vous inscrire à nouveau."
      })
      setLoading(false)
      return
    }

    fetch(`/api/auth/pending-verification?sessionId=${sessionId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSessionData(data.session)
        } else {
          setMessage({
            type: "error",
            text: data.error || "Session invalide ou expirée"
          })
        }
      })
      .catch(error => {
        console.error('Erreur:', error)
        setMessage({
          type: "error",
          text: "Erreur lors du chargement de la session"
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [sessionId])

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: sessionData.email, 
          code: verificationCode, 
          userId: sessionData.userId 
        })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Email vérifié avec succès ! Redirection..."
        })
        
        // Stocker l'utilisateur et le connecter
        localStorage.setItem('user', JSON.stringify({
          id: sessionData.userId,
          name: sessionData.name,
          email: sessionData.email,
          email_verified: true
        }))
        localStorage.setItem('isLoggedIn', 'true')
        
        // Rediriger vers la page d'accueil après 2 secondes
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setMessage({
          type: "error",
          text: result.error || "Code invalide"
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur de connexion. Veuillez réessayer."
      })
    }

    setIsSubmitting(false)
  }

  const handleResendCode = async () => {
    if (!sessionData) return

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sessionData.email,
          userId: sessionData.userId,
          name: sessionData.name,
          createSession: true
        })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Code renvoyé avec succès"
        })
        
        if (result.developmentCode) {
          setMessage({
            type: "info",
            text: `Code de développement: ${result.developmentCode}`
          })
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erreur lors de l'envoi du code"
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur de connexion. Veuillez réessayer."
      })
    }
  }

  const handleCodeChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 6)
    setVerificationCode(cleanValue)
    setMessage(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de la session...</p>
        </div>
      </div>
    )
  }

  if (message?.type === "error" && !sessionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Session Invalide</h2>
            <p className="text-muted-foreground mb-6">{message.text}</p>
            <div className="space-y-3">
              <Link href="/auth">
                <Button className="w-full bg-gradient-to-r from-primary to-accent">
                  Créer un compte
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Vérification Email</h2>
            <p className="text-muted-foreground text-sm">
              Bonjour {sessionData?.name},<br />
              Un code a été envoyé à {sessionData?.email}
            </p>
          </div>

          {/* Formulaire de vérification */}
          <form onSubmit={handleVerification} className="space-y-6">
            {/* Code de vérification */}
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Code de vérification</Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Entrez le code à 6 chiffres"
                className="h-12 text-center text-lg font-mono"
                maxLength={6}
                required
              />
            </div>

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : message.type === 'info'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}
              >
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : 
                 message.type === 'info' ? <AlertCircle className="w-4 h-4" /> : 
                 <AlertCircle className="w-4 h-4" />}
                {message.text}
              </motion.div>
            )}

            {/* Bouton de vérification */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
              disabled={isSubmitting || verificationCode.length !== 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification en cours...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Vérifier l'email
                </>
              )}
            </Button>

            {/* Renvoyer le code */}
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                className="text-sm"
              >
                Renvoyer le code
              </Button>
            </div>
          </form>

          {/* Retour */}
          <div className="mt-6 text-center">
            <Link 
              href="/auth"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'inscription
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
}
