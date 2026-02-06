"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Shield, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EmailVerificationPopupProps {
  isOpen: boolean
  onClose: () => void
  email: string
  userId: string
  onVerificationSuccess: () => void
}

export function EmailVerificationPopup({ 
  isOpen, 
  onClose, 
  email, 
  userId, 
  onVerificationSuccess 
}: EmailVerificationPopupProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes en secondes
  const [canResend, setCanResend] = useState(false)
  const [developmentCode, setDevelopmentCode] = useState<string | null>(null)

  // Timer pour le compte à rebours
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, timeLeft])

  // Envoyer le code de vérification automatiquement à l'ouverture
  useEffect(() => {
    if (isOpen && email && userId) {
      sendVerificationCode()
    }
  }, [isOpen, email, userId])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const sendVerificationCode = async () => {
    setIsSendingCode(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Code de vérification envoyé par email"
        })
        
        // En développement, afficher le code
        if (result.developmentCode) {
          setDevelopmentCode(result.developmentCode)
          setMessage({
            type: "info",
            text: `Code de développement: ${result.developmentCode}`
          })
        }
        
        // Réinitialiser le timer
        setTimeLeft(600)
        setCanResend(false)
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
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode, userId })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Email vérifié avec succès !"
        })
        
        // Fermer la popup après 2 secondes
        setTimeout(() => {
          onVerificationSuccess()
          onClose()
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

  const handleResendCode = () => {
    sendVerificationCode()
  }

  const handleCodeChange = (value: string) => {
    // Limiter à 6 caractères et seulement des chiffres
    const cleanValue = value.replace(/\D/g, '').slice(0, 6)
    setVerificationCode(cleanValue)
    setMessage(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Vérification Email</h2>
              <p className="text-muted-foreground text-sm">
                Un code de vérification a été envoyé à<br />
                <span className="font-medium text-foreground">{email}</span>
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
                {developmentCode && (
                  <p className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-950 p-2 rounded">
                    <strong>Mode développement:</strong> Utilisez le code {developmentCode}
                  </p>
                )}
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
                {canResend ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendCode}
                    disabled={isSendingCode}
                    className="text-sm"
                  >
                    {isSendingCode ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Renvoyer le code
                      </>
                    )}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Renvoyer le code dans <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                  </p>
                )}
              </div>
            </form>

            {/* Bouton de fermeture */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
