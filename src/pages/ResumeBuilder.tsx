"use client"

import { useState, useCallback, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Upload,
  Sparkles,
  User,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  FileEdit
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useResumes } from "@/hooks/use-resumes"
import { generateConfiguredResume } from "@/lib/resume-generator-v2"
import { createProject } from "@/lib/firebase-db"
import type { ResumeData, ResumeTemplate, SectionVisibility } from "@/lib/types"
import { ResumeHealthDashboard } from "@/components/resume/resume-health-dashboard"
import { BulletTemplatePicker } from "@/components/resume/bullet-template-picker"
import { SkillSuggester } from "@/components/resume/skill-suggester"
import { JDAnalyzer } from "@/components/resume/jd-analyzer"
import {
  PersonalInfoForm,
  EducationForm,
  ExperienceForm,
  ProjectsForm,
  SkillsForm,
  SectionToggle,
  DEFAULT_SECTION_VISIBILITY,
  LeadershipForm,
  AchievementsForm,
  CertificationsForm,
  PublicationsForm,
  OpenSourceForm
} from "@/components/resume/section-forms"
import { TemplateSelector } from "@/components/resume/template-selector"
import { TemplatePreviewGallery } from "@/components/resume/template-preview-gallery"
import { KeyboardShortcutsPanel, useKeyboardShortcuts } from "@/components/resume/keyboard-shortcuts-panel"
import { PDFErrorDisplay } from "@/components/resume/pdf-error-display"
import { exportResumeAsJSON, importResumeFromJSON, focusFirstError, getPDFErrorSolution } from "@/lib/resume-form-utils"
import { validateCompleteResume } from "@/lib/resume-validation-schema"
import html2pdf from "html2pdf.js"
import { HtmlResumePreview } from "@/components/resume/HtmlResumePreview"

const RESUME_DRAFT_KEY = "paperly.resumeBuilder.draft.v1"



// Type for the resume state (without server-generated fields)
type ResumeDataState = Omit<ResumeData, "id" | "createdAt" | "updatedAt">

const getInitialData = (): ResumeDataState => ({
  template: "fresher",
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    summary: "",
  },
  education: [{
    id: "edu-1",
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    grade: "",
    location: "",
  }],
  experience: [],
  projects: [],
  skills: {
    technical: [],
    soft: [],
    languages: [],
  },
  certifications: [],
})

// Email validation helper
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ResumeBuilderPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { createResume, updateResume } = useResumes()

  const [currentStep, setCurrentStep] = useState(0)
  const [resumeData, setResumeData] = useState<ResumeDataState>(getInitialData())
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [isImproving, setIsImproving] = useState<string | null>(null)
  const [isOpeningInEditor, setIsOpeningInEditor] = useState(false)
  const [latexCode, setLatexCode] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<{ message: string; code?: string } | null>(null)

  // Skills input helpers
  const [skillInput, setSkillInput] = useState("")

  // Section visibility state
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(DEFAULT_SECTION_VISIBILITY)
  
  // Preview tabs state
  const [previewTab, setPreviewTab] = useState<'pdf' | 'code'>('pdf')

  // Open in LaTeX Editor handler
  const handleOpenInEditor = useCallback(async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to open your resume in the editor.",
        variant: "destructive",
      })
      return
    }

    setIsOpeningInEditor(true)
    try {
      // Generate LaTeX code
      const latex = latexCode || generateConfiguredResume(resumeData as ResumeData, true)

      // Create a new project with the resume LaTeX
      const projectName = `Resume - ${resumeData.personalInfo.fullName || 'Untitled'}`
      const projectId = await createProject({
        name: projectName,
        description: 'Resume created from Resume Builder',
        ownerId: user.id,
        templateContent: latex,
      })

      toast({
        title: "Opening in Editor",
        description: "Your resume has been opened in the LaTeX Editor.",
      })

      // Navigate to editor
      navigate(`/editor/${projectId}`)
    } catch (error) {
      console.error('Failed to open in editor:', error)
      toast({
        title: "Error",
        description: "Failed to open resume in editor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsOpeningInEditor(false)
    }
  }, [user, resumeData, latexCode, toast, navigate])

  // Demo data function
  const fillDemoData = () => {
    setResumeData({
      template: resumeData.template,
      personalInfo: {
        fullName: "Alex Johnson",
        email: "alex.johnson@email.com",
        phone: "+91 98765 43210",
        location: "Mumbai, India",
        linkedin: "linkedin.com/in/alexjohnson",
        github: "github.com/alexjohnson",
        website: "",
        summary: "Passionate software engineer with 2+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies.",
      },
      education: [{
        id: "edu-1",
        institution: "Indian Institute of Technology, Mumbai",
        degree: "B.Tech",
        field: "Computer Science",
        startDate: "2019",
        endDate: "2023",
        grade: "8.5 CGPA",
        location: "Mumbai",
      }],
      experience: [{
        id: "exp-1",
        company: "Tech Solutions Inc",
        position: "Software Engineer",
        startDate: "June 2023",
        endDate: "Present",
        location: "Mumbai",
        description: [
          "Developed React components that improved user engagement by 40%",
          "Led a team of 3 developers to deliver project 2 weeks ahead of schedule",
          "Reduced API response time from 2s to 200ms using caching strategies"
        ],
        current: true,
      }],
      projects: [{
        id: "proj-1",
        name: "E-Commerce Platform",
        description: "Built a full-stack e-commerce platform with payment integration, serving 10,000+ users",
        technologies: ["React", "Node.js", "MongoDB", "Stripe"],
        link: "github.com/alexjohnson/ecommerce",
        date: "2023",
      }],
      skills: {
        technical: ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "AWS", "Docker", "Git"],
        soft: [],
        languages: [],
      },
      certifications: [],
    })
    toast({
      title: "Demo Data Loaded",
      description: "Example resume data has been filled in. Feel free to edit!",
    })
  }

  // Load draft
  useEffect(() => {
    try {
      const draft = localStorage.getItem(RESUME_DRAFT_KEY)
      if (draft) {
        const parsed = JSON.parse(draft)
        if (parsed.resumeData) {
          setResumeData({ ...getInitialData(), ...parsed.resumeData })
        }
      }
    } catch (e) {
      console.error("Failed to load draft", e)
    }
  }, [])

  // Auto-save to localStorage with optional Firebase sync
  useEffect(() => {
    setIsSaving(true)
    const timer = setTimeout(async () => {
      try {
        // Always save to localStorage as backup
        localStorage.setItem(RESUME_DRAFT_KEY, JSON.stringify({ resumeData, currentStep }))
        
        // Only attempt Firebase save if user is authenticated and has substantial data
        if (user && resumeData.personalInfo.fullName && resumeData.personalInfo.email) {
          try {
            if (currentResumeId) {
              // Update existing resume
              await updateResume(currentResumeId, resumeData)
            } else {
              // Create new resume only if we don't have an ID yet
              const newId = await createResume(
                resumeData.personalInfo.fullName || "Untitled Resume",
                resumeData
              )
              setCurrentResumeId(newId)
            }
          } catch (firebaseError) {
            // Firebase save failed - that's okay, localStorage still works
            // Don't show error to user, just log it
            if (process.env.NODE_ENV === 'development') {
              console.warn('Firebase auto-save skipped:', firebaseError)
            }
          }
        }
        
        setIsSaving(false)
        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 2000)
      } catch (e) {
        // LocalStorage save failed - show this error
        console.error("Failed to save draft", e)
        setIsSaving(false)
      }
    }, 1500) // Increased debounce to 1.5s to reduce API calls
    return () => clearTimeout(timer)
  }, [resumeData, currentStep, user, currentResumeId, createResume, updateResume])

  // JSON Export/Import handlers
  const handleExportJSON = useCallback(() => {
    try {
      exportResumeAsJSON(resumeData, resumeData.personalInfo.fullName || 'resume')
      toast({
        title: "Resume Exported",
        description: "Your resume has been downloaded as JSON",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export resume. Please try again.",
        variant: "destructive",
      })
    }
  }, [resumeData, toast])

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const imported = await importResumeFromJSON(file)
        setResumeData(imported)
        toast({
          title: "Resume Imported",
          description: "Your resume has been loaded successfully",
        })
      } catch (error) {
        toast({
          title: "Import Failed",
          description: error instanceof Error ? error.message : "Could not import resume",
          variant: "destructive",
        })
      }
    }
    input.click()
  }, [toast])

  // Keyboard shortcuts configuration
  useKeyboardShortcuts({
    "Ctrl+1": () => setCurrentStep(0),
    "Ctrl+2": () => setCurrentStep(1),
    "Ctrl+3": () => canProceed() && setCurrentStep(2),
    "Ctrl+s": () => {
      toast({
        title: "Auto-saved",
        description: "Your resume is automatically saved",
      })
    },
    "Ctrl+Enter": () => {
      if (currentStep === 1 && canProceed()) {
        handleGenerate()
      } else if (currentStep === 0) {
        setCurrentStep(1)
      }
    },
    "Ctrl+d": fillDemoData,
    "Ctrl+e": handleExportJSON,
    "Escape": () => {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1)
      }
    },
  })

  // Calculate ATS score (simple heuristic)
  const calculateATSScore = useCallback(() => {
    let score = 50

    if (resumeData.personalInfo.fullName) score += 5
    if (resumeData.personalInfo.email) score += 5
    if (resumeData.personalInfo.phone) score += 3
    if (resumeData.personalInfo.linkedin || resumeData.personalInfo.github) score += 5
    if (resumeData.education.some(e => e.institution && e.degree)) score += 10
    if (resumeData.experience.length > 0) score += 15
    if (resumeData.projects.length > 0) score += 10
    if (resumeData.skills.technical.length >= 5) score += 7

    return Math.min(100, score)
  }, [resumeData])

  const atsScore = calculateATSScore()

  // Handlers
  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }))
  }

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: `edu-${Date.now()}`,
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        grade: "",
        location: "",
      }]
    }))
  }

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: `exp-${Date.now()}`,
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        location: "",
        description: [""],
        current: false,
      }]
    }))
  }

  const updateExperience = (id: string, field: string, value: string | boolean | string[]) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
  }

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: `proj-${Date.now()}`,
        name: "",
        description: "",
        technologies: [],
        link: "",
        date: "",
      }]
    }))
  }

  const updateProject = (id: string, field: string, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }))
  }

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }))
  }



  const handleAddSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: [...prev.skills.technical, skill]
      }
    }))
  }

  const addSkill = () => {
    if (!skillInput.trim()) return
    handleAddSkill(skillInput.trim())
    setSkillInput("")
  }

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: prev.skills.technical.filter((_, i) => i !== index)
      }
    }))
  }

  const handleGenerate = async () => {
    // Validate resume data before generating
    const fullData: ResumeData = {
      ...resumeData,
      id: `resume-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const validation = validateCompleteResume(fullData)
    if (!validation.isValid && validation.errors.length > 0) {
      toast({
        title: "Validation Failed",
        description: `Please fix ${validation.errors.length} error(s) before generating`,
        variant: "destructive",
      })
      setTimeout(() => focusFirstError(), 100)
      return
    }

    setIsGenerating(true)
    try {
      // 1. Move to preview step immediately
      setCurrentStep(2)
      
      // 2. We don't generate backend PDF anymore. It's client-side!
      setPdfError(null)
      toast({
        title: "Resume Ready!",
        description: "Your professional resume has been assembled. Click Download PDF to save it.",
      })
    } catch (error) {
      setPdfError({
        message: "Could not generate your resume client-side.",
        code: "COMPILATION_FAILED"
      })
      toast({
        title: "Generation Failed",
        description: "Could not generate your resume.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const canProceed = () => {
    if (currentStep === 0) return true
    if (currentStep === 1) {
      return resumeData.personalInfo.fullName && resumeData.personalInfo.email
    }
    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Save Indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm">Saving...</span>
        </div>
      )}

      {justSaved && (
        <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-4 py-2 flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">Saved</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Resume Builder</h1>
              <p className="text-sm text-muted-foreground">Professional ATS-friendly resumes</p>
            </div>
          </div>

          {/* ATS Score Badge */}
          {currentStep > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-full border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{atsScore}</div>
                <div className="text-xs text-green-700 dark:text-green-300">
                  <div className="font-semibold">ATS Score</div>
                  <div className="text-[10px]">
                    {atsScore >= 80 ? "Excellent" : atsScore >= 60 ? "Good" : "Needs work"}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleImportJSON}
                  title="Import from JSON"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportJSON}
                  title="Export as JSON (Ctrl+E)"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  title="Press ? to see all keyboard shortcuts"
                >
                  <span className="text-xs font-mono">?</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {["Template", "Details", "Preview"].map((label, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${index === currentStep
                  ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                  : index < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                  }`}>
                  {index < currentStep ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </div>
              {index < 2 && (
                <div className={`h-0.5 w-16 ${index < currentStep ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className={currentStep === 2 ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto'}>
          {/* Step 0: Template Selection */}
          {currentStep === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TemplatePreviewGallery
                selectedTemplate={resumeData.template}
                onSelectTemplate={(templateId) => setResumeData(prev => ({ ...prev, template: templateId as ResumeTemplate }))}
                onContinue={() => setCurrentStep(1)}
              />
            </div>
          )}

          {/* Step 1: Fill Details */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Fill Your Details</h2>
                <p className="text-muted-foreground">Complete the form below to build your resume</p>

                {/* Demo Data Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fillDemoData}
                  className="mt-4"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Fill with Example Data
                </Button>
              </div>

              {/* Grid Layout: Form + Health Dashboard */}
              <div className="grid lg:grid-cols-[1fr_300px] gap-6 xl:gap-8 items-start">
                {/* Main Form */}
                <div className="space-y-6 min-w-0">
                  {/* Quick Navigation */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Quick Navigation</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'personal', label: 'Personal', icon: User, visible: true },
                          { id: 'education', label: 'Education', icon: GraduationCap, visible: sectionVisibility.education },
                          { id: 'experience', label: 'Experience', icon: Briefcase, visible: sectionVisibility.experience },
                          { id: 'projects', label: 'Projects', icon: Code, visible: sectionVisibility.projects },
                          { id: 'skills', label: 'Skills', icon: Award, visible: sectionVisibility.skills },
                          { id: 'certs', label: 'Certifications', icon: Award, visible: sectionVisibility.certifications },
                        ].filter(s => s.visible).map((section) => (
                          <Button
                            key={section.id}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900"
                            onClick={() => {
                              const element = document.getElementById(`section-${section.id}`)
                              element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }}
                          >
                            <section.icon className="h-3 w-3 mr-1" />
                            {section.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Section Toggle Panel */}
                  <SectionToggle
                    visibility={sectionVisibility}
                    onChange={setSectionVisibility}
                  />

                  {/* Personal Info - Always shown */}
                  <PersonalInfoForm
                    personalInfo={resumeData.personalInfo}
                    onUpdate={updatePersonalInfo}
                  />

                  {/* Summary section is part of PersonalInfoForm, no separate toggle needed */}

                  {/* Education */}
                  {sectionVisibility.education && (
                    <EducationForm
                      education={resumeData.education}
                      onAdd={addEducation}
                      onUpdate={updateEducation}
                      onRemove={removeEducation}
                    />
                  )}

                  {/* Experience */}
                  {sectionVisibility.experience && (
                    <ExperienceForm
                      experience={resumeData.experience}
                      onAdd={addExperience}
                      onUpdate={updateExperience}
                      onRemove={removeExperience}
                    />
                  )}

                  {/* Projects */}
                  {sectionVisibility.projects && (
                    <ProjectsForm
                      projects={resumeData.projects}
                      onAdd={addProject}
                      onUpdate={updateProject}
                      onRemove={removeProject}
                    />
                  )}

                  {/* Skills */}
                  {sectionVisibility.skills && (
                    <SkillsForm
                      skills={resumeData.skills}
                      onAddSkill={handleAddSkill}
                      onRemoveSkill={removeSkill}
                    />
                  )}

                  {/* Certifications */}
                  {sectionVisibility.certifications && (
                    <CertificationsForm
                      certifications={resumeData.certifications || []}
                      onChange={(certifications) => setResumeData(prev => ({
                        ...prev,
                        certifications
                      }))}
                    />
                  )}

                  {/* Leadership */}
                  {sectionVisibility.leadership && (
                    <LeadershipForm
                      leadership={resumeData.leadership || []}
                      onChange={(leadership) => setResumeData(prev => ({
                        ...prev,
                        leadership
                      }))}
                    />
                  )}

                  {/* Achievements */}
                  {sectionVisibility.achievements && (
                    <AchievementsForm
                      achievements={resumeData.achievements || []}
                      onChange={(achievements) => setResumeData(prev => ({
                        ...prev,
                        achievements
                      }))}
                    />
                  )}

                  {/* Publications */}
                  {sectionVisibility.publications && (
                    <PublicationsForm
                      publications={resumeData.publications || []}
                      onChange={(publications) => setResumeData(prev => ({
                        ...prev,
                        publications
                      }))}
                    />
                  )}

                  {/* Open Source */}
                  {sectionVisibility.openSource && (
                    <OpenSourceForm
                      openSource={resumeData.openSource || []}
                      onChange={(openSource) => setResumeData(prev => ({
                        ...prev,
                        openSource
                      }))}
                    />
                  )}
                </div>

                {/* Resume Health Dashboard - Desktop Sidebar (Sticky with better scrolling) */}
                <div className="hidden lg:block">
                  <div className="sticky top-20 space-y-3 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                    <ResumeHealthDashboard
                      resumeData={resumeData}
                      onFixIssue={(issue) => {
                        toast({
                          title: "💡 Improvement Tip",
                          description: issue,
                        })
                      }}
                    />

                    {/* JD Analyzer */}
                    <JDAnalyzer
                      resumeData={resumeData}
                      onSuggestSkill={(skill) => {
                        setResumeData(prev => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            technical: [...prev.skills.technical, skill]
                          }
                        }))
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!canProceed() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Resume
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground">
                  Press{" "}
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + Enter</kbd>
                  {" "}to generate or{" "}
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Esc</kbd>
                  {" "}to go back
                </p>
              </div>

              {/* PDF Error Display */}
              {pdfError && (
                <div className="mt-6">
                  <PDFErrorDisplay
                    error={pdfError.message}
                    onRetry={handleGenerate}
                    onDownloadJSON={handleExportJSON}
                    onDismiss={() => setPdfError(null)}
                  />
                </div>
              )}

              {/* Resume Health Dashboard - Mobile (Bottom) */}
              <div className="lg:hidden mt-6 space-y-4">
                <ResumeHealthDashboard
                  resumeData={resumeData}
                  onFixIssue={(issue) => {
                    toast({
                      title: "💡 Improvement Tip",
                      description: issue,
                    })
                  }}
                />

                {/* JD Analyzer - Mobile */}
                <JDAnalyzer
                  resumeData={resumeData}
                  onSuggestSkill={(skill) => {
                    setResumeData(prev => ({
                      ...prev,
                      skills: {
                        ...prev.skills,
                        technical: [...prev.skills.technical, skill]
                      }
                    }))
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Preview & Export */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Header with Success Icon */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-2 shadow-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Your Resume is Ready!</h2>
                <p className="text-sm text-muted-foreground">Preview your resume and download or edit the LaTeX code</p>
              </div>

              {/* Tabs and Preview */}
              <Card className="overflow-hidden border-2">
                {/* Tab Headers */}
                <div className="border-b bg-muted/50">
                  <div className="flex items-center justify-between px-4">
                    <div className="flex gap-1">
                      <Button
                        variant={previewTab === 'pdf' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewTab('pdf')}
                        className="rounded-b-none"
                      >
                        <FileEdit className="h-4 w-4 mr-2" />
                        PDF Preview
                      </Button>
                      <Button
                        variant={previewTab === 'code' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewTab('code')}
                        className="rounded-b-none"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        LaTeX Code
                      </Button>
                    </div>
                    
                    {/* Quick Actions in Header */}
                    <div className="flex gap-2 py-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        const element = document.getElementById("resume-preview-pdf");
                        if (element) {
                          html2pdf().set({
                            margin: 0,
                            filename: `${resumeData.personalInfo.fullName?.replace(/\s+/g, '_') || 'Resume'}.pdf`,
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2 },
                            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                          }).from(element).save();
                        }
                      }}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (latexCode) {
                            navigator.clipboard.writeText(latexCode)
                            toast({ title: "Copied!", description: "LaTeX code copied to clipboard" })
                          }
                        }}
                      >
                        <Code className="h-4 w-4 mr-1" />
                        Copy Code
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <CardContent className="p-0 bg-slate-200 dark:bg-slate-800 flex justify-center overflow-auto h-[calc(100vh-280px)] min-h-[600px] py-8">
                  {previewTab === 'pdf' ? (
                    <div className="shadow-2xl">
                      <HtmlResumePreview data={resumeData as ResumeData} id="resume-preview-pdf" />
                    </div>
                  ) : (
                    <div className="relative h-[calc(100vh-280px)] min-h-[600px] overflow-auto">
                      <pre className="p-6 text-xs font-mono bg-slate-950 text-green-400 h-full overflow-auto">
                        <code>{latexCode || 'LaTeX code not available'}</code>
                      </pre>
                      <Button
                        size="sm"
                        className="absolute top-4 right-4"
                        onClick={() => {
                          if (latexCode) {
                            navigator.clipboard.writeText(latexCode)
                            toast({ title: "✓ Copied!", description: "LaTeX code copied to clipboard" })
                          }
                        }}
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Copy All
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons - Reorganized */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Edit Details
                  </Button>
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" onClick={() => {
                    const element = document.getElementById("resume-preview-pdf");
                    if (element) {
                      html2pdf().set({
                        margin: 0,
                        filename: `${resumeData.personalInfo.fullName?.replace(/\s+/g, '_') || 'Resume'}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                      }).from(element).save();
                    }
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleOpenInEditor}
                    disabled={isOpeningInEditor}
                  >
                    {isOpeningInEditor ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileEdit className="mr-2 h-4 w-4" />
                    )}
                    {isOpeningInEditor ? 'Opening...' : 'Open in Editor'}
                  </Button>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="grid sm:grid-cols-3 gap-3 text-center mt-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <Code className="h-5 w-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100">View LaTeX Code</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Click 'LaTeX Code' tab</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                  <FileEdit className="h-5 w-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                  <p className="text-xs font-medium text-purple-900 dark:text-purple-100">Advanced Editing</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Use 'Open in Editor'</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <Download className="h-5 w-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
                  <p className="text-xs font-medium text-green-900 dark:text-green-100">ATS-Optimized</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Score: {atsScore}/100</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel />
    </div>
  )
}
