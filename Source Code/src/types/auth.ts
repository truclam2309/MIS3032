import type { Role } from './procurement'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}
