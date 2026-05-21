"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Sparkles, Info } from "lucide-react"
import type { ResumeData, ResumeTemplate } from "@/lib/types"
import { WEAK_VERBS, METRICS_KEYWORDS } from "@/lib/bullet-templates"

interface ResumeHealthProps {
    resumeData: Omit<ResumeData, "id" | "createdAt" | "updatedAt">
    onFixIssue?: (issue: string) => void
}

interface ScoreCategory {
    name: string
    score: number
    max: number
    status: "success" | "warning" | "error"
    issues: string[]
}

// Template-specific section requirements
interface TemplateRequirements {
    required: string[]
    optional: string[]
    weights: {
        completeness: number
        content: number
        ats: number
        extra: number
    }
    emphasis?: string[] // Sections to weight higher for this template
}

// Map template variants to their base family
const getTemplateFamily = (templateId: string): string => {
    if (templateId.startsWith("fresher")) return "fresher"
    if (templateId.startsWith("professional") || templateId === "experienced") return "professional"
    if (templateId.startsWith("academic")) return "academic"
    if (templateId.startsWith("community") || templateId === "modern") return "community"
    return "fresher" // Default fallback
}

// Extended requirements for all template variants
const TEMPLATE_REQUIREMENTS: Record<string, TemplateRequirements> = {
    // === FRESHER FAMILY ===
    fresher: {
        required: ["personalInfo", "education", "projects", "skills"],
        optional: ["experience", "certifications", "achievements", "leadership"],
        weights: { completeness: 35, content: 25, ats: 25, extra: 15 }
    },
    "fresher-projects": {
        required: ["personalInfo", "education", "projects", "skills"],
        optional: ["experience", "certifications", "achievements"],
        weights: { completeness: 30, content: 30, ats: 25, extra: 15 },
        emphasis: ["projects"]
    },
    "fresher-skills": {
        required: ["personalInfo", "education", "skills", "projects"],
        optional: ["certifications", "achievements"],
        weights: { completeness: 30, content: 25, ats: 30, extra: 15 },
        emphasis: ["skills"]
    },
    "fresher-internship": {
        required: ["personalInfo", "education", "experience", "projects", "skills"],
        optional: ["certifications"],
        weights: { completeness: 30, content: 30, ats: 25, extra: 15 },
        emphasis: ["experience"]
    },

    // === PROFESSIONAL FAMILY ===
    experienced: {
        required: ["personalInfo", "experience", "skills", "education"],
        optional: ["projects", "certifications", "achievements"],
        weights: { completeness: 30, content: 35, ats: 25, extra: 10 }
    },
    "professional-software": {
        required: ["personalInfo", "experience", "projects", "skills", "education"],
        optional: ["certifications", "openSource"],
        weights: { completeness: 25, content: 35, ats: 30, extra: 10 },
        emphasis: ["experience", "projects"]
    },
    "professional-mlai": {
        required: ["personalInfo", "experience", "publications", "projects", "skills"],
        optional: ["certifications", "education"],
        weights: { completeness: 25, content: 30, ats: 25, extra: 20 },
        emphasis: ["publications", "experience"]
    },
    "professional-backend": {
        required: ["personalInfo", "experience", "skills", "projects"],
        optional: ["certifications", "education"],
        weights: { completeness: 25, content: 35, ats: 30, extra: 10 },
        emphasis: ["skills", "experience"]
    },

    // === ACADEMIC FAMILY ===
    academic: {
        required: ["personalInfo", "education", "publications", "skills"],
        optional: ["experience", "projects", "achievements", "openSource"],
        weights: { completeness: 30, content: 30, ats: 20, extra: 20 }
    },
    "academic-research-intern": {
        required: ["personalInfo", "education", "experience", "publications"],
        optional: ["projects", "skills", "achievements"],
        weights: { completeness: 30, content: 30, ats: 20, extra: 20 },
        emphasis: ["publications", "experience"]
    },
    "academic-phd": {
        required: ["personalInfo", "education", "publications", "experience"],
        optional: ["projects", "skills", "achievements"],
        weights: { completeness: 25, content: 35, ats: 20, extra: 20 },
        emphasis: ["publications", "education"]
    },
    "academic-publications": {
        required: ["personalInfo", "publications", "education"],
        optional: ["experience", "projects", "skills"],
        weights: { completeness: 25, content: 35, ats: 15, extra: 25 },
        emphasis: ["publications"]
    },

    // === COMMUNITY FAMILY ===
    modern: {
        required: ["personalInfo", "experience", "skills", "projects"],
        optional: ["education", "certifications", "leadership"],
        weights: { completeness: 30, content: 35, ats: 25, extra: 10 }
    },
    "community-opensource": {
        required: ["personalInfo", "openSource", "projects", "skills"],
        optional: ["experience", "education"],
        weights: { completeness: 25, content: 35, ats: 25, extra: 15 },
        emphasis: ["openSource", "projects"]
    },
    "community-leadership": {
        required: ["personalInfo", "leadership", "achievements", "experience"],
        optional: ["projects", "skills", "education"],
        weights: { completeness: 25, content: 30, ats: 25, extra: 20 },
        emphasis: ["leadership", "achievements"]
    }
}

export function ResumeHealthDashboard({ resumeData, onFixIssue }: ResumeHealthProps) {
    const template = resumeData.template || "fresher"
    // Get requirements: first try exact match, then family fallback
    const templateFamily = getTemplateFamily(template)
    const requirements = TEMPLATE_REQUIREMENTS[template] || TEMPLATE_REQUIREMENTS[templateFamily] || TEMPLATE_REQUIREMENTS.fresher

    const calculateHealth = (): { total: number; categories: ScoreCategory[] } => {
        const categories: ScoreCategory[] = []
        const maxPoints = 100

        // 1. Completeness Score (based on template requirements)
        let completenessScore = 0
        const completenessIssues: string[] = []
        const completenessMax = requirements.weights.completeness

        // Personal Info (always required - 10 points)
        const personalInfoPoints = completenessMax * 0.25
        let personalScore = 0
        if (resumeData.personalInfo.fullName) personalScore += personalInfoPoints * 0.3
        else completenessIssues.push("Add your full name")
        if (resumeData.personalInfo.email) personalScore += personalInfoPoints * 0.25
        else completenessIssues.push("Add email address")
        if (resumeData.personalInfo.phone) personalScore += personalInfoPoints * 0.2
        else completenessIssues.push("Add phone number")
        if (resumeData.personalInfo.linkedin || resumeData.personalInfo.github) personalScore += personalInfoPoints * 0.25
        else completenessIssues.push("Add LinkedIn or GitHub profile")
        completenessScore += personalScore

        // Education (for fresher/academic - important)
        const eduRequired = requirements.required.includes("education")
        const eduWeight = eduRequired ? 0.25 : 0.1
        if (resumeData.education.some(e => e.institution && e.degree)) {
            completenessScore += completenessMax * eduWeight
        } else if (eduRequired) {
            completenessIssues.push("Complete your education details")
        }

        // Experience (for experienced/modern - critical)
        const expRequired = requirements.required.includes("experience")
        const expWeight = expRequired ? 0.25 : 0.15
        if (resumeData.experience.length > 0 && resumeData.experience.some(e => e.company && e.position)) {
            completenessScore += completenessMax * expWeight
        } else if (expRequired) {
            completenessIssues.push("Add work experience")
        } else if (template === "fresher" && resumeData.experience.length === 0) {
            // For freshers, experience is optional but helpful
        }

        // Projects (for fresher - critical)
        const projRequired = requirements.required.includes("projects")
        const projWeight = projRequired ? 0.25 : 0.1
        if (resumeData.projects.length > 0 && resumeData.projects.some(p => p.name && p.description)) {
            completenessScore += completenessMax * projWeight
        } else if (projRequired) {
            completenessIssues.push("Add at least one project")
        }

        // Publications (for academic - critical)
        if (template === "academic") {
            if (resumeData.publications && resumeData.publications.length > 0) {
                completenessScore += completenessMax * 0.2
            } else {
                completenessIssues.push("Add your publications")
            }
        }

        categories.push({
            name: "Completeness",
            score: Math.round(completenessScore),
            max: completenessMax,
            status: completenessScore >= completenessMax * 0.75 ? "success" : completenessScore >= completenessMax * 0.5 ? "warning" : "error",
            issues: completenessIssues.slice(0, 3)
        })

        // 2. Structure Balance Score (FORMAT-based, not content judgement)
        let structureScore = 0
        const structureIssues: string[] = []
        const structureMax = requirements.weights.content

        // Check for summary/objective
        if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.length > 50) {
            structureScore += structureMax * 0.2
        } else {
            structureIssues.push("Add a professional summary section")
        }

        // Check experience bullets quality
        let totalBullets = 0
        let bulletsWithMetrics = 0
        let bulletsWithWeakVerbs = 0

        resumeData.experience.forEach(exp => {
            exp.description.forEach(bullet => {
                if (bullet.trim()) {
                    totalBullets++
                    const hasMetrics = METRICS_KEYWORDS.some(keyword =>
                        bullet.toLowerCase().includes(keyword.toLowerCase())
                    )
                    if (hasMetrics) bulletsWithMetrics++
                    const hasWeakVerb = WEAK_VERBS.some(verb =>
                        bullet.toLowerCase().startsWith(verb.toLowerCase())
                    )
                    if (hasWeakVerb) bulletsWithWeakVerbs++
                }
            })
        })

        if (totalBullets > 0) {
            // Check bullet count balance (FORMAT check, not content)
            const avgBulletsPerJob = totalBullets / Math.max(resumeData.experience.length, 1)
            if (avgBulletsPerJob >= 2 && avgBulletsPerJob <= 4) {
                structureScore += structureMax * 0.35
            } else if (avgBulletsPerJob >= 1) {
                structureScore += structureMax * 0.2
                if (avgBulletsPerJob < 2) {
                    structureIssues.push("Add 2-4 bullet points per job for balance")
                } else if (avgBulletsPerJob > 4) {
                    structureIssues.push("Consider condensing to 3-4 bullets per job")
                }
            } else {
                structureIssues.push("Add bullet points to experience entries")
            }
        } else if (requirements.required.includes("experience")) {
            structureIssues.push("Add experience section with bullet points")
        }

        // Check project descriptions quality
        // Check project section density (FORMAT balance)
        const projectsWithTech = resumeData.projects.filter(p =>
            p.technologies && p.technologies.length > 0
        ).length

        if (resumeData.projects.length > 0) {
            const hasBalancedProjects = projectsWithTech / resumeData.projects.length >= 0.8
            if (hasBalancedProjects) {
                structureScore += structureMax * 0.2
            } else {
                structureScore += structureMax * 0.1
                structureIssues.push("Add technologies to all projects")
            }
        }

        // Skills depth check
        // Skills section density
        if (resumeData.skills.technical.length >= 8) {
            structureScore += structureMax * 0.15
        } else if (resumeData.skills.technical.length >= 5) {
            structureScore += structureMax * 0.1
        } else {
            structureIssues.push("Add more skills (aim for 8-12)")
        }

        categories.push({
            name: "Structure Balance",
            score: Math.round(structureScore),
            max: structureMax,
            status: structureScore >= structureMax * 0.7 ? "success" : structureScore >= structureMax * 0.4 ? "warning" : "error",
            issues: structureIssues.slice(0, 3)
        })

        // 3. ATS Optimization Score
        let atsScore = 0
        const atsIssues: string[] = []
        const atsMax = requirements.weights.ats

        // Technical skills for ATS
        const totalSkills = resumeData.skills.technical.length
        if (totalSkills >= 10) {
            atsScore += atsMax * 0.35
        } else if (totalSkills >= 6) {
            atsScore += atsMax * 0.2
            atsIssues.push(`Add ${10 - totalSkills} more technical skills for better ATS matching`)
        } else {
            atsIssues.push(`Add ${10 - totalSkills} more technical skills`)
        }

        // Keyword-rich content
        const hasDetailedBullets = resumeData.experience.some(exp =>
            exp.description.some(bullet => bullet.split(' ').length >= 10)
        )
        if (hasDetailedBullets) {
            atsScore += atsMax * 0.25
        } else if (resumeData.experience.length > 0) {
            atsIssues.push("Add more detailed bullet points (10+ words)")
        }

        // LaTeX formatting bonus (always ATS-safe)
        atsScore += atsMax * 0.4

        categories.push({
            name: "ATS Optimization",
            score: Math.round(atsScore),
            max: atsMax,
            status: atsScore >= atsMax * 0.7 ? "success" : atsScore >= atsMax * 0.5 ? "warning" : "error",
            issues: atsIssues.slice(0, 2)
        })

        // 4. Extra Sections Bonus (template-specific)
        let extraScore = 0
        const extraIssues: string[] = []
        const extraMax = requirements.weights.extra

        // Certifications bonus
        if (resumeData.certifications && resumeData.certifications.length > 0) {
            extraScore += extraMax * 0.25
        } else if (requirements.optional.includes("certifications")) {
            extraIssues.push("Add relevant certifications to stand out")
        }

        // Leadership/Activities
        if (resumeData.leadership && resumeData.leadership.length > 0) {
            extraScore += extraMax * 0.25
        } else if (template === "fresher") {
            extraIssues.push("Add leadership roles or extracurricular activities")
        }

        // Achievements
        if (resumeData.achievements && resumeData.achievements.length > 0) {
            extraScore += extraMax * 0.25
        }

        // Open Source (great for tech roles)
        if (resumeData.openSource && resumeData.openSource.length > 0) {
            extraScore += extraMax * 0.25
        } else if (template === "academic" || resumeData.personalInfo.github) {
            extraIssues.push("Add open source contributions")
        }

        categories.push({
            name: "Extra Sections",
            score: Math.round(extraScore),
            max: extraMax,
            status: extraScore >= extraMax * 0.5 ? "success" : extraScore >= extraMax * 0.25 ? "warning" : "error",
            issues: extraIssues.slice(0, 2)
        })

        const total = categories.reduce((sum, cat) => sum + cat.score, 0)
        return { total: Math.min(total, 100), categories }
    }

    const health = calculateHealth()
    const percentage = Math.round((health.total / 100) * 100)

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 dark:text-green-400"
        if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
        if (score >= 40) return "text-orange-600 dark:text-orange-400"
        return "text-red-600 dark:text-red-400"
    }

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Excellent"
        if (score >= 80) return "Great"
        if (score >= 70) return "Good"
        if (score >= 60) return "Fair"
        if (score >= 40) return "Needs Work"
        return "Getting Started"
    }

    const getStatusIcon = (status: "success" | "warning" | "error") => {
        switch (status) {
            case "success":
                return <CheckCircle2 className="h-4 w-4 text-green-600" />
            case "warning":
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />
            case "error":
                return <XCircle className="h-4 w-4 text-red-600" />
        }
    }

    const getTemplateLabel = (t: string): string => {
        // Handle all template variants with readable labels
        const labels: Record<string, string> = {
            // Fresher family
            "fresher": "Fresher/Student",
            "fresher-projects": "Fresher (Projects)",
            "fresher-skills": "Fresher (Skills)",
            "fresher-internship": "Fresher (Internship)",
            // Professional family
            "experienced": "Professional",
            "professional-software": "Software Engineer",
            "professional-mlai": "ML/AI Engineer",
            "professional-backend": "Backend/Infra",
            // Academic family
            "academic": "Academic",
            "academic-research-intern": "Research Intern",
            "academic-phd": "MS/PhD Applicant",
            "academic-publications": "Publication Focus",
            // Community family
            "modern": "Modern/Community",
            "community-opensource": "Open Source",
            "community-leadership": "Community Leader",
        }
        return labels[t] || t.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return (
        <Card className="sticky top-4">
            <CardHeader className="pb-3">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">Resume Readiness</CardTitle>
                        <span className={`text-sm font-medium ${getScoreColor(health.total)}`}>
                            {health.total}/100
                        </span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                        {getScoreLabel(health.total)} • {getTemplateLabel(template)} template
                    </p>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Score Breakdown */}
                <div className="space-y-3">
                    {health.categories.map((category) => (
                        <div key={category.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(category.status)}
                                    <span className="font-medium">{category.name}</span>
                                </div>
                                <span className="text-muted-foreground">
                                    {category.score}/{category.max}
                                </span>
                            </div>
                            <Progress
                                value={(category.score / category.max) * 100}
                                className="h-1.5"
                            />
                        </div>
                    ))}
                </div>

                {/* Quick Fixes */}
                {health.total < 85 && (
                    <>
                        <div className="border-t pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold text-sm">Quick Improvements</h4>
                            </div>

                            <div className="space-y-2">
                                {health.categories.flatMap(cat => cat.issues).slice(0, 4).map((issue, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-xs h-auto py-2"
                                        onClick={() => onFixIssue?.(issue)}
                                    >
                                        <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0" />
                                        <span className="text-left">{issue}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Success Message */}
                {health.total >= 85 && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                    {health.total >= 90 ? "Outstanding Resume!" : "Great Resume!"}
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    Your resume is ATS-optimized and ready to impress recruiters.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Template Info */}
                <div className="flex items-center justify-center gap-2 pt-2">
                    <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        LaTeX-powered ATS-safe
                    </Badge>
                </div>

                {/* Scoring Info */}
                <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                    <Info className="h-3 w-3" />
                    Scoring tailored to {getTemplateLabel(template)} profiles
                </div>
            </CardContent>
        </Card>
    )
}
