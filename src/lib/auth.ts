import { createServerSupabaseClient, supabase } from './supabase'
import { User, UserRole } from '@/types/database'
import { AuthError } from '@supabase/supabase-js'

export interface AuthUser extends User {
  hasRole: (roles: UserRole | UserRole[]) => boolean
  canAccessStation: (stationId: string) => boolean
}

export class AuthService {
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error || !authUser) {
        return null
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError || !user) {
        // If user doesn't exist in our users table but is authenticated,
        // create the profile (this handles email confirmation flow)
        if (authUser.email_confirmed_at) {
          const username = authUser.user_metadata?.username || `user_${authUser.id.slice(0, 8)}`
          const stationId = authUser.user_metadata?.station_id || null
          const newUser = await this.createUserProfile(authUser.id, authUser.email || '', username, stationId)
          return newUser
        }
        return null
      }

      return this.enhanceUser(user)
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  static async createUserProfile(userId: string, email: string, username: string, stationId?: string): Promise<AuthUser | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          username,
          role: 'station_user' as UserRole,
          station_id: stationId,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      return this.enhanceUser(user)
    } catch (error) {
      console.error('Error creating user profile:', error)
      return null
    }
  }

  static async getServerUser(): Promise<AuthUser | null> {
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error || !authUser) {
        return null
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError || !user) {
        return null
      }

      return this.enhanceUser(user)
    } catch (error) {
      console.error('Error getting server user:', error)
      return null
    }
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      throw error
    }
    
    return data
  }

  static async signUp(email: string, password: string, username: string, stationId?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          station_id: stationId || null,
        }
      }
    })
    
    if (error) {
      throw error
    }

    // Don't create user profile here - it will be created after email confirmation
    // in the getCurrentUser method when user first logs in
    
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  static async updateUserRole(userId: string, role: UserRole, stationId?: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role,
        station_id: stationId || null 
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return this.enhanceUser(data)
  }

  private static enhanceUser(user: User): AuthUser {
    return {
      ...user,
      hasRole: (roles: UserRole | UserRole[]) => {
        const roleArray = Array.isArray(roles) ? roles : [roles]
        return roleArray.includes(user.role)
      },
      canAccessStation: (stationId: string) => {
        if (user.role === 'super_admin') {
          return true
        }
        return user.station_id === stationId
      }
    }
  }
}

export function checkPermission(user: AuthUser | null, roles: UserRole | UserRole[]): boolean {
  if (!user) return false
  return user.hasRole(roles)
}

export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
  if (!user) {
    throw new Error('Authentication required')
  }
}

export function requireRole(user: AuthUser | null, roles: UserRole | UserRole[]): asserts user is AuthUser {
  requireAuth(user)
  if (!user.hasRole(roles)) {
    throw new Error('Insufficient permissions')
  }
}