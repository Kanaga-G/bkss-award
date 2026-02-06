"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Mail, Shield, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [step, setStep] = useState<'email' | 'verify'>('email')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingCode(true)
    setMessage(null)

    try {
      // Vérifier si l'email existe dans la base
      const checkResponse = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
      const users = await checkResponse.json()

      if (!Array.isArray(users) || users.length === 0) {
        setMessage({
          type: "error",
          text: "Email non trouvé. Veuillez vous inscrire."
        })
        setIsSendingCode(false)
        return
      }

      const user = users[0]
      
      if (user.email_verified) {
        setMessage({
          type: "info",
          text: "Cet email est déjà vérifié. Vous pouvez vous connecter."
        })
        setIsSendingCode(false)
        return
      }

      // Envoyer le code de vérification
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          userId: user.id,
          name: user.name,
          createSession: true
        })
      })

      const result = await response.json()

      if (response.ok) {
        setStep('verify')
        setMessage({
          type: "success",
          text: "Code de vérification envoyé par email"
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

    setIsSendingCode(false)
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Récupérer l'utilisateur pour vérifier
      const checkResponse = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
      const users = await checkResponse.json()

      if (!Array.isArray(users) || users.length === 0) {
        setMessage({
          type: "error",
          text: "Email non trouvé. Veuillez vous inscrire."
        })
        setIsSubmitting(false)
        return
      }

      const user = users[0]

      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          code: verificationCode, 
          userId: user.id 
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
          ...user,
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

  const handleCodeChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 6)
    setVerificationCode(cleanValue)
    setMessage(null)
  }

  const handleBackToEmail = () => {
    setStep('email')
    setVerificationCode("")
    setMessage(null)
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
            <h2 className="text-2xl font-bold mb-2">
              {step === 'email' ? 'Vérifier Email' : 'Code de Vérification'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {step === 'email' 
                ? 'Entrez votre email pour recevoir un code de vérification'
                : `Entrez le code à 6 chiffres envoyé à ${email}`
              }
            </p>
          </div>

          {/* Étape 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="h-12"
                  required
                />
              </div>

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

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                disabled={isSendingCode || !email}
              >
                {isSendingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer le code
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Étape 2: Vérification */}
          {step === 'verify' && (
            <form onSubmit={handleVerification} className="space-y-6">
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

              <Button
                type="button"
                variant="outline"
                onClick={handleBackToEmail}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Modifier l'email
              </Button>
            </form>
          )}

          {/* Liens de retour */}
          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/auth"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'inscription
            </Link>
            {step === 'email' && (
              <div>
                <Link 
                  href="/"
                  className="text-sm text-primary hover:underline"
                >
                  Déjà un compte ? Se connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
