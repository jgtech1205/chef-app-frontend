export interface RecipeCategory {
  id: string
  name: string
  recipeCount: number
  icon: 'utensils'
}

export interface Ingredient {
  name: string
  quantity?: string
  unit?: string
  notes?: string
}

export interface NutritionalInfo {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
}

export interface Recipe {
  id: string
  title: string
  panel: string
  image?: {
    url: string
    publicId: string
  } | null
  ingredients: Ingredient[]
  method: string
  chefNotes?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  nutritionalInfo?: NutritionalInfo
  isActive?: boolean
  createdBy?: string
  updatedBy?: string
  version?: number
}

export interface Panel {
  id: string
  name: string
  order: number
  recipeCount: number
  image?: {
    url: string
    publicId: string
  } | null
  isActive?: boolean
  createdBy?: string
  updatedBy?: string
}

export interface Plateup {
  id: string
  name: string
  image?: {
    url: string
    publicId: string
  } | null
  createdBy?: string
  updatedBy?: string
}

export interface PlateupFolder {
  id: string
  name: string
  createdBy?: string
  updatedBy?: string
}

export interface UserPermissions {
  canViewRecipes: boolean
  canEditRecipes: boolean
  canDeleteRecipes: boolean
  canUpdateRecipes: boolean

  canViewPlateups: boolean
  canCreatePlateups: boolean
  canDeletePlateups: boolean
  canUpdatePlateups: boolean

  canViewNotifications: boolean
  canCreateNotifications: boolean
  canDeleteNotifications: boolean
  canUpdateNotifications: boolean

  canViewPanels: boolean
  canCreatePanels: boolean
  canDeletePanels: boolean
  canUpdatePanels: boolean
  
  canManageTeam: boolean
  canAccessAdmin: boolean
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  status: string
  organization?: string
  permissions?: UserPermissions
  avatar?: string | null
}

export interface PendingRequest {
  id: string
  name: string
  status: string
}

export interface NotificationRecipient {
  user: string
  read: boolean
  readAt?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
}

