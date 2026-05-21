// Project Types
export interface Project {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  userId: string
  files: ProjectFile[]
  settings?: ProjectSettings
}

export interface ProjectFile {
  id: string
  name: string
  path: string
  content?: string
  type: "file" | "folder"
  children?: ProjectFile[]
  createdAt: Date
  updatedAt: Date
}

export interface ProjectSettings {
  mainFile: string
  compiler: "pdflatex" | "xelatex" | "lualatex"
  outputFormat: "pdf" | "dvi"
}

// Editor Types
export interface EditorState {
  code: string
  cursorPosition: { line: number; column: number }
  selectedText?: string
  isDirty: boolean
}

export interface EditorTheme {
  id: string
  name: string
  type: "light" | "dark"
}

// Compile Types
export interface CompileRequest {
  source: string
  projectId?: string
  filename?: string
  compiler?: "pdflatex" | "xelatex" | "lualatex"
}

export interface CompileResponse {
  success: boolean
  pdfUrl?: string
  pdfData?: ArrayBuffer // Raw PDF data for PDF.js
  htmlPreview?: string  // HTML fallback preview
  logs: string
  errors: CompileError[]
  warnings: CompileWarning[]
  duration: number
}

export interface CompileError {
  line: number
  column?: number
  message: string
  type: "error" | "fatal"
}

export interface CompileWarning {
  line: number
  column?: number
  message: string
}

// AI Types
export interface AIMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  code?: string
  timestamp: Date
}

export interface AIRequest {
  messages: AIMessage[]
  context?: string
  action?: "fix" | "explain" | "generate" | "improve"
  tier?: "primary" | "max" | "mid" | "low"
}

export interface AIResponse {
  success: boolean
  message: string
  code?: string
  suggestions?: string[]
  error?: string
  modelUsed?: string  // Model that generated the response (e.g., "llama-3.3-70b")
}

// Auth Types
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  provider: "email" | "google"
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// File Explorer Types
export interface FileNode {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  content?: string
  children?: FileNode[]
  isOpen?: boolean
  isEditing?: boolean
}

// Dashboard Types
export interface RecentProject {
  id: string
  title: string
  description: string
  lastModified: string
  fileCount: number
}

export interface CompiledDocument {
  id: string
  title: string
  date: string
  status: "success" | "warning" | "error"
  pdfUrl?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Toast Types (extended)
export type ToastVariant = "default" | "destructive" | "success"

export interface ToastConfig {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

// ============ RESUME BUILDER TYPES ============

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  grade?: string
  location?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  location?: string
  description: string[]
  current?: boolean
}

export interface ProjectEntry {
  id: string
  name: string
  description: string
  technologies: string[]
  link?: string
  date?: string
}

// NEW: Leadership & Activities
export interface Leadership {
  id: string
  role: string         // "President", "Core Member"
  organization: string // "IEEE Chapter", "GDG"
  duration: string     // "2022-2023"
  description?: string[]
}

// NEW: Achievements
export interface Achievement {
  id: string
  title: string        // "Winner - Smart India Hackathon"
  issuer?: string      // "Ministry of Education"
  date: string
  description?: string
}

// NEW: Publications (for Academic)
export interface Publication {
  id: string
  title: string
  authors: string
  venue: string        // Conference/Journal name
  year: string
  link?: string
  citations?: number
}

// NEW: Open Source Contributions
export interface OpenSourceContribution {
  id: string
  project: string      // "TensorFlow"
  role: string         // "Contributor", "Maintainer"
  contributions: string // "Fixed memory leak in GPU backend"
  link?: string
  stars?: number
}

// Section visibility config
export interface SectionVisibility {
  summary: boolean
  education: boolean
  experience: boolean
  projects: boolean
  skills: boolean
  certifications: boolean
  leadership: boolean
  achievements: boolean
  publications: boolean
  openSource: boolean
}

export interface ResumeData {
  id: string
  userId?: string
  guestId?: string
  template: ResumeTemplate
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location?: string
    linkedin?: string
    github?: string
    website?: string
    summary?: string
  }
  education: Education[]
  experience: Experience[]
  projects: ProjectEntry[]
  skills: {
    technical: string[]
    soft: string[]
    languages?: string[]
  }
  certifications?: {
    id: string
    name: string
    issuer: string
    date: string
    link?: string
  }[]
  // NEW SECTIONS
  leadership?: Leadership[]
  achievements?: Achievement[]
  publications?: Publication[]
  openSource?: OpenSourceContribution[]
  // Section visibility (optional - defaults to template config)
  sectionVisibility?: Partial<SectionVisibility>
  isCompact?: boolean // Fit to 1 Page compact mode
  createdAt: Date
  updatedAt: Date
}

export type ResumeTemplate = "fresher" | "experienced" | "academic" | "modern"

// Resume Document (stored in Firestore with metadata)
export interface ResumeDocument extends ResumeData {
  userId: string
  name: string // User-given name like "Software Engineer Resume"
  isPublic: boolean // Is sharing enabled?
  shareId?: string // Unique share link ID
  pdfUrl?: string // Cached PDF URL
  latexSource?: string // Cached LaTeX source
  currentVersion: number
}

// Resume Version (subcollection for version history)
export interface ResumeVersion {
  id: string
  resumeId: string
  version: number
  data: Partial<ResumeData>
  description?: string // "Before applying to Google"
  createdAt: Date
}

// ============ TEMPLATE SYSTEM TYPES ============

export interface Template {
  id: string
  name: string
  description: string
  category: "resume" | "report" | "letter" | "presentation" | "assignment"
  thumbnail: string
  content: string
  isPremium: boolean
  downloads?: number
  tags: string[]
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
  templates: Template[]
}

// ============ GUEST SESSION TYPES ============

export interface GuestSession {
  guestId: string
  createdAt: Date
  resumesCreated: number
  reportsCreated: number
  aiQueriesUsed: number
  lastActive: Date
}

export interface UsageLimits {
  resumesPerMonth: number
  reportsPerMonth: number
  aiQueriesPerDay: number
  hasWatermark: boolean
}

export const FREE_LIMITS: UsageLimits = {
  resumesPerMonth: 1,
  reportsPerMonth: 1,
  aiQueriesPerDay: 5,
  hasWatermark: true,
}

export const PRO_LIMITS: UsageLimits = {
  resumesPerMonth: -1, // unlimited
  reportsPerMonth: -1,
  aiQueriesPerDay: 100,
  hasWatermark: false,
}
