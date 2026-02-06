"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Database, CheckCircle, AlertCircle, Loader2, RefreshCw, Users, Trophy, Vote, BarChart3, Mail, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ConnectionTest {
  success: boolean
  message: string
  connection?: {
    url: string
    status: string
    timestamp: string
  }
  statistics?: {
    users: number
    categories: number
    candidates: number
    votes: number
    email_verifications: number
    device_registrations: number
  }
  recent_data?: {
    users: Array<{
      id: string
      name: string
      email: string
      role: string
      created_at: string
    }>
    categories: Array<{
      id: string
      name: string
      created_at: string
    }>
  }
  tables_status?: {
    users: boolean
    categories: boolean
    candidates: boolean
    votes: boolean
    email_verifications: boolean
    device_registrations: boolean
  }
  errors?: string[]
}

export default function TestConnectionPage() {
  const [testResult, setTestResult] = useState<ConnectionTest | null>(null)
  const [loading, setLoading] = useState(false)
  const [creatingTestUser, setCreatingTestUser] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/test-connection')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erreur lors de la requête',
        errors: [error instanceof Error ? error.message : 'Erreur inconnue']
      })
    } finally {
      setLoading(false)
    }
  }

  const createTestUser = async () => {
    setCreatingTestUser(true)
    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_test_user' })
      })
      const result = await response.json()
      
      if (result.success) {
        // Rafraîchir les données après création
        setTimeout(testConnection, 1000)
      }
    } catch (error) {
      console.error('Erreur création utilisateur test:', error)
    } finally {
      setCreatingTestUser(false)
    }
  }

  const testEmailVerification = async () => {
    if (!testResult?.recent_data?.users?.[0]) return
    
    setTestingEmail(true)
    try {
      const testUser = testResult.recent_data.users[0]
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'test_email_verification',
          userId: testUser.id,
          email: testUser.email
        })
      })
      const result = await response.json()
      
      if (result.success) {
        alert(`Code de vérification créé: ${result.code}\nExpire à: ${result.expires_at}`)
      } else {
        alert(`Erreur: ${result.error}`)
      }
    } catch (error) {
      console.error('Erreur test email:', error)
      alert('Erreur lors du test de vérification email')
    } finally {
      setTestingEmail(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Test de Connexion Supabase
          </h1>
          <p className="text-muted-foreground text-lg">
            Vérification de la connexion et affichage des données de la base
          </p>
        </motion.div>

        {/* Bouton de test */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={testConnection}
            disabled={loading}
            className="bg-gradient-to-r from-primary to-accent"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tester la connexion
              </>
            )}
          </Button>
          
          <Button
            onClick={createTestUser}
            disabled={creatingTestUser || !testResult?.success}
            variant="outline"
          >
            {creatingTestUser ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Créer utilisateur test
              </>
            )}
          </Button>

          <Button
            onClick={testEmailVerification}
            disabled={testingEmail || !testResult?.success}
            variant="outline"
          >
            {testingEmail ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Test email...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Tester vérification email
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Statut de connexion */}
            <Card className={testResult.success ? 'border-green-500/20' : 'border-red-500/20'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  Statut de la Connexion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className={`font-medium ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.message}
                  </p>
                  
                  {testResult.connection && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>URL:</strong> {testResult.connection.url}</p>
                      <p><strong>Statut:</strong> {testResult.connection.status}</p>
                      <p><strong>Testé le:</strong> {formatDate(testResult.connection.timestamp)}</p>
                    </div>
                  )}

                  {testResult.errors && testResult.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="font-medium text-red-600 mb-2">Erreurs détectées:</p>
                      <ul className="text-sm text-red-500 space-y-1">
                        {testResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            {testResult.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{testResult.statistics.users}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Catégories</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{testResult.statistics.categories}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Candidats</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{testResult.statistics.candidates}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Votes</CardTitle>
                    <Vote className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{testResult.statistics.votes}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vérifications Email</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{testResult.statistics.email_verifications}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Registrations Device</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{testResult.statistics.device_registrations}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Statut des tables */}
            {testResult.tables_status && (
              <Card>
                <CardHeader>
                  <CardTitle>Statut des Tables</CardTitle>
                  <CardDescription>
                    État de connexion à chaque table de la base de données
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(testResult.tables_status).map(([tableName, status]) => (
                      <div key={tableName} className="flex items-center gap-2">
                        {status ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">{tableName}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Données récentes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Utilisateurs récents */}
              {testResult.recent_data?.users && (
                <Card>
                  <CardHeader>
                    <CardTitle>Utilisateurs Récents</CardTitle>
                    <CardDescription>
                      Les 5 derniers utilisateurs inscrits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {testResult.recent_data.users.map((user) => (
                        <div key={user.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.role} • {formatDate(user.created_at)}
                          </div>
                        </div>
                      ))}
                      {testResult.recent_data.users.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          Aucun utilisateur trouvé
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Catégories récentes */}
              {testResult.recent_data?.categories && (
                <Card>
                  <CardHeader>
                    <CardTitle>Catégories</CardTitle>
                    <CardDescription>
                      Les 5 dernières catégories créées
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {testResult.recent_data.categories.map((category) => (
                        <div key={category.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Créée le {formatDate(category.created_at)}
                          </div>
                        </div>
                      ))}
                      {testResult.recent_data.categories.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          Aucune catégorie trouvée
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
