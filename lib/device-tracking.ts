import crypto from 'crypto'

// Générer un fingerprint unique pour le device
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    // Côté serveur, générer un UUID simple
    return crypto.randomUUID()
  }

  // Côté client, utiliser plusieurs attributs pour créer un fingerprint unique
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
  }

  const fingerprintData = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    // Ajouter d'autres attributs si nécessaire
    (navigator as any).hardwareConcurrency || '',
    (navigator as any).deviceMemory || ''
  ]

  return crypto.createHash('sha256')
    .update(fingerprintData.join('|'))
    .digest('hex')
    .substring(0, 32)
}

// Obtenir ou créer l'ID du device
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return generateDeviceFingerprint()
  }

  let deviceId = localStorage.getItem('device_id')
  
  if (!deviceId) {
    deviceId = generateDeviceFingerprint()
    localStorage.setItem('device_id', deviceId)
  }

  return deviceId
}

// Obtenir l'adresse IP (côté serveur uniquement)
export async function getClientIP(request?: any): Promise<string> {
  try {
    // En développement, retourner une IP de test
    if (process.env.NODE_ENV === 'development') {
      return '127.0.0.1'
    }

    // Essayer différentes sources pour l'IP
    const forwarded = request?.headers?.['x-forwarded-for']
    const realIP = request?.headers?.['x-real-ip']
    const clientIP = request?.headers?.['x-client-ip']
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    if (clientIP) {
      return clientIP
    }

    // Fallback sur l'IP de connexion
    return request?.socket?.remoteAddress || 'unknown'
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'IP:', error)
    return 'unknown'
  }
}

// Vérifier si un device a déjà créé un compte
export async function checkDeviceAccountLimit(
  supabaseAdmin: any,
  deviceId: string,
  clientIP: string
): Promise<{ canCreate: boolean; existingAccounts: number }> {
  try {
    // Compter les comptes créés par ce device
    const { data: deviceAccounts, error: deviceError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('device_id', deviceId)

    // Compter les comptes créés par cette IP
    const { data: ipAccounts, error: ipError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('registration_ip', clientIP)

    const deviceCount = deviceAccounts?.length || 0
    const ipCount = ipAccounts?.length || 0

    // Limiter à 1 compte par device et 3 comptes par IP
    const canCreate = deviceCount < 1 && ipCount < 3
    const existingAccounts = Math.max(deviceCount, ipCount)

    return { canCreate, existingAccounts }
  } catch (error) {
    console.error('Erreur lors de la vérification des limites:', error)
    return { canCreate: true, existingAccounts: 0 }
  }
}

// Enregistrer les informations de device lors de l'inscription
export async function recordDeviceRegistration(
  supabaseAdmin: any,
  userId: string,
  deviceId: string,
  clientIP: string,
  userAgent: string
): Promise<void> {
  try {
    await supabaseAdmin
      .from('users')
      .update({
        device_id: deviceId,
        registration_ip: clientIP,
        user_agent: userAgent,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    // Enregistrer dans la table de tracking (optionnel)
    await supabaseAdmin
      .from('device_registrations')
      .insert({
        user_id: userId,
        device_id: deviceId,
        ip_address: clientIP,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du device:', error)
  }
}
