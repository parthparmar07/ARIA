/**
 * Resume Content Validation
 * Provides real-time validation and suggestions for resume content
 */

import type { ResumeData, Education, Experience, ProjectEntry } from "./types"

export interface ValidationError {
    field: string
    message: string
    severity: "error" | "warning" | "info"
    suggestion?: string
}

export interface ValidationResult {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationError[]
    score: number // 0-100
}

// Weak action verbs to avoid
const WEAK_VERBS = [
    "responsible for",
    "worked on",
    "helped with",
    "assisted with",
    "involved in",
    "participated in",
    "dealt with",
    "handled",
]

// Strong action verbs to suggest
const STRONG_VERBS = [
    "achieved",
    "improved",
    "developed",
    "implemented",
    "designed",
    "led",
    "managed",
    "created",
    "optimized",
    "increased",
    "reduced",
    "launched",
    "built",
    "engineered",
    "architected",
    "spearheaded",
]

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

/**
 * Check if text starts with weak verb
 */
function startsWithWeakVerb(text: string): boolean {
    const lowerText = text.toLowerCase().trim()
    return WEAK_VERBS.some(verb => lowerText.startsWith(verb))
}

/**
 * Check if bullet point has quantifiable metrics
 */
function hasMetrics(text: string): boolean {
    // Look for numbers, percentages, or quantifiers
    const metricPatterns = [
        /\d+%/,           // percentages
        /\d+\+/,          // numbers with +
        /\d+[kKmMbB]/,    // 10k, 5M, etc.
        /\d+x/,           // multipliers
        /\$\d+/,          // dollar amounts
        /\d+ (users|customers|clients|projects|teams|people|hours|days|weeks|months)/i,
    ]

    return metricPatterns.some(pattern => pattern.test(text))
}

/**
 * Validate personal information
 */
function validatePersonalInfo(data: ResumeData): ValidationError[] {
    const errors: ValidationError[] = []
    const { personalInfo } = data

    // Required fields
    if (!personalInfo.fullName?.trim()) {
        errors.push({
            field: "personalInfo.fullName",
            message: "Full name is required",
            severity: "error",
        })
    }

    if (!personalInfo.email?.trim()) {
        errors.push({
            field: "personalInfo.email",
            message: "Email is required",
            severity: "error",
        })
    } else if (!isValidEmail(personalInfo.email)) {
        errors.push({
            field: "personalInfo.email",
            message: "Invalid email format",
            severity: "error",
            suggestion: "Use format: name@example.com",
        })
    }

    // Optional but validated fields
    if (personalInfo.phone && personalInfo.phone.length < 10) {
        errors.push({
            field: "personalInfo.phone",
            message: "Phone number seems too short",
            severity: "warning",
        })
    }

    if (personalInfo.linkedin && !isValidUrl(personalInfo.linkedin)) {
        errors.push({
            field: "personalInfo.linkedin",
            message: "Invalid LinkedIn URL",
            severity: "warning",
            suggestion: "Use format: https://linkedin.com/in/username",
        })
    }

    if (personalInfo.github && !isValidUrl(personalInfo.github)) {
        errors.push({
            field: "personalInfo.github",
            message: "Invalid GitHub URL",
            severity: "warning",
            suggestion: "Use format: https://github.com/username",
        })
    }

    if (personalInfo.website && !isValidUrl(personalInfo.website)) {
        errors.push({
            field: "personalInfo.website",
            message: "Invalid website URL",
            severity: "warning",
        })
    }

    // Summary validation
    if (personalInfo.summary) {
        const wordCount = personalInfo.summary.trim().split(/\s+/).length
        if (wordCount < 20) {
            errors.push({
                field: "personalInfo.summary",
                message: "Summary is too short",
                severity: "info",
                suggestion: "Aim for 30-50 words highlighting your key strengths",
            })
        } else if (wordCount > 100) {
            errors.push({
                field: "personalInfo.summary",
                message: "Summary is too long",
                severity: "warning",
                suggestion: "Keep it concise (30-50 words)",
            })
        }
    }

    return errors
}

/**
 * Validate education entries
 */
function validateEducation(education: Education[]): ValidationError[] {
    const errors: ValidationError[] = []

    if (education.length === 0) {
        errors.push({
            field: "education",
            message: "Add at least one education entry",
            severity: "error",
        })
        return errors
    }

    education.forEach((edu, index) => {
        const prefix = `education[${index}]`

        if (!edu.institution?.trim()) {
            errors.push({
                field: `${prefix}.institution`,
                message: "Institution name is required",
                severity: "error",
            })
        }

        if (!edu.degree?.trim()) {
            errors.push({
                field: `${prefix}.degree`,
                message: "Degree is required",
                severity: "error",
            })
        }

        if (!edu.field?.trim()) {
            errors.push({
                field: `${prefix}.field`,
                message: "Field of study is required",
                severity: "error",
            })
        }

        if (!edu.endDate?.trim()) {
            errors.push({
                field: `${prefix}.endDate`,
                message: "Graduation date is required",
                severity: "warning",
            })
        }
    })

    return errors
}

/**
 * Validate experience entries
 */
function validateExperience(experience: Experience[]): ValidationError[] {
    const errors: ValidationError[] = []

    experience.forEach((exp, index) => {
        const prefix = `experience[${index}]`

        if (!exp.company?.trim()) {
            errors.push({
                field: `${prefix}.company`,
                message: "Company name is required",
                severity: "error",
            })
        }

        if (!exp.position?.trim()) {
            errors.push({
                field: `${prefix}.position`,
                message: "Position/title is required",
                severity: "error",
            })
        }

        if (!exp.startDate?.trim()) {
            errors.push({
                field: `${prefix}.startDate`,
                message: "Start date is required",
                severity: "warning",
            })
        }

        if (!exp.current && !exp.endDate?.trim()) {
            errors.push({
                field: `${prefix}.endDate`,
                message: "End date is required (or mark as current)",
                severity: "warning",
            })
        }

        // Validate description bullets
        if (!exp.description || exp.description.length === 0) {
            errors.push({
                field: `${prefix}.description`,
                message: "Add at least one achievement/responsibility",
                severity: "error",
            })
        } else {
            exp.description.forEach((bullet, bulletIndex) => {
                const bulletField = `${prefix}.description[${bulletIndex}]`

                if (!bullet.trim()) {
                    return // Skip empty bullets
                }

                // Check for weak verbs
                if (startsWithWeakVerb(bullet)) {
                    errors.push({
                        field: bulletField,
                        message: "Avoid weak phrases like 'responsible for'",
                        severity: "warning",
                        suggestion: `Use strong action verbs: ${STRONG_VERBS.slice(0, 3).join(", ")}`,
                    })
                }

                // Check for metrics
                if (!hasMetrics(bullet)) {
                    errors.push({
                        field: bulletField,
                        message: "Add quantifiable metrics to strengthen impact",
                        severity: "info",
                        suggestion: "Include numbers, percentages, or measurable outcomes",
                    })
                }

                // Check length
                const wordCount = bullet.trim().split(/\s+/).length
                if (wordCount < 5) {
                    errors.push({
                        field: bulletField,
                        message: "Bullet point is too short",
                        severity: "warning",
                        suggestion: "Provide more detail about your achievement",
                    })
                } else if (wordCount > 30) {
                    errors.push({
                        field: bulletField,
                        message: "Bullet point is too long",
                        severity: "info",
                        suggestion: "Keep it concise (10-20 words)",
                    })
                }
            })
        }
    })

    return errors
}

/**
 * Validate project entries
 */
function validateProjects(projects: ProjectEntry[]): ValidationError[] {
    const errors: ValidationError[] = []

    projects.forEach((proj, index) => {
        const prefix = `projects[${index}]`

        if (!proj.name?.trim()) {
            errors.push({
                field: `${prefix}.name`,
                message: "Project name is required",
                severity: "error",
            })
        }

        if (!proj.description?.trim()) {
            errors.push({
                field: `${prefix}.description`,
                message: "Project description is required",
                severity: "error",
            })
        } else {
            const wordCount = proj.description.trim().split(/\s+/).length
            if (wordCount < 10) {
                errors.push({
                    field: `${prefix}.description`,
                    message: "Project description is too brief",
                    severity: "warning",
                    suggestion: "Describe the problem, solution, and impact",
                })
            }
        }

        if (!proj.technologies || proj.technologies.length === 0) {
            errors.push({
                field: `${prefix}.technologies`,
                message: "Add technologies used",
                severity: "warning",
                suggestion: "List programming languages, frameworks, tools",
            })
        }

        if (proj.link && !isValidUrl(proj.link)) {
            errors.push({
                field: `${prefix}.link`,
                message: "Invalid project URL",
                severity: "warning",
            })
        }
    })

    return errors
}

/**
 * Validate skills
 */
function validateSkills(data: ResumeData): ValidationError[] {
    const errors: ValidationError[] = []
    const { skills } = data

    if (!skills.technical || skills.technical.length === 0) {
        errors.push({
            field: "skills.technical",
            message: "Add at least 3-5 technical skills",
            severity: "error",
        })
    } else if (skills.technical.length < 3) {
        errors.push({
            field: "skills.technical",
            message: "Add more technical skills (aim for 5-10)",
            severity: "warning",
        })
    } else if (skills.technical.length > 20) {
        errors.push({
            field: "skills.technical",
            message: "Too many skills listed",
            severity: "info",
            suggestion: "Focus on your strongest 10-15 skills",
        })
    }

    return errors
}

/**
 * Calculate overall resume score
 */
function calculateScore(data: ResumeData, errors: ValidationError[]): number {
    let score = 100

    // Deduct points for errors
    errors.forEach(error => {
        if (error.severity === "error") score -= 10
        if (error.severity === "warning") score -= 5
        if (error.severity === "info") score -= 2
    })

    // Bonus points for completeness
    if (data.personalInfo.summary) score += 5
    if (data.personalInfo.linkedin) score += 3
    if (data.personalInfo.github) score += 3
    if (data.experience.length > 0) score += 10
    if (data.projects.length > 0) score += 5
    if (data.skills.soft && data.skills.soft.length > 0) score += 3

    // Bonus for metrics in experience
    const bulletsWithMetrics = data.experience.reduce((count, exp) => {
        return count + exp.description.filter(hasMetrics).length
    }, 0)
    score += Math.min(bulletsWithMetrics * 2, 10)

    return Math.max(0, Math.min(100, score))
}

/**
 * Main validation function
 */
export function validateResume(data: ResumeData): ValidationResult {
    const allErrors: ValidationError[] = []

    // Validate each section
    allErrors.push(...validatePersonalInfo(data))
    allErrors.push(...validateEducation(data.education))
    allErrors.push(...validateExperience(data.experience))
    allErrors.push(...validateProjects(data.projects))
    allErrors.push(...validateSkills(data))

    // Separate by severity
    const errors = allErrors.filter(e => e.severity === "error")
    const warnings = allErrors.filter(e => e.severity === "warning" || e.severity === "info")

    // Calculate score
    const score = calculateScore(data, allErrors)

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        score,
    }
}

/**
 * Get suggestions for improving resume
 */
export function getImprovementSuggestions(data: ResumeData): string[] {
    const suggestions: string[] = []

    // Check for missing optional sections
    if (!data.personalInfo.summary) {
        suggestions.push("Add a professional summary to introduce yourself")
    }

    if (!data.personalInfo.linkedin && !data.personalInfo.github) {
        suggestions.push("Add LinkedIn or GitHub profile to showcase your professional presence")
    }

    if (data.experience.length === 0 && data.projects.length === 0) {
        suggestions.push("Add work experience or projects to demonstrate your skills")
    }

    // Check experience quality
    const experienceBullets = data.experience.flatMap(exp => exp.description)
    const bulletsWithMetrics = experienceBullets.filter(hasMetrics)
    const metricsPercentage = experienceBullets.length > 0
        ? (bulletsWithMetrics.length / experienceBullets.length) * 100
        : 0

    if (metricsPercentage < 50) {
        suggestions.push("Add more quantifiable metrics to your achievements (numbers, percentages, outcomes)")
    }

    const bulletsWithWeakVerbs = experienceBullets.filter(startsWithWeakVerb)
    if (bulletsWithWeakVerbs.length > 0) {
        suggestions.push(`Replace weak phrases with strong action verbs (e.g., ${STRONG_VERBS.slice(0, 3).join(", ")})`)
    }

    // Check skills
    if (data.skills.technical.length < 5) {
        suggestions.push("List more relevant technical skills to improve keyword matching")
    }

    if (!data.skills.soft || data.skills.soft.length === 0) {
        suggestions.push("Consider adding soft skills (leadership, communication, teamwork)")
    }

    return suggestions.slice(0, 5) // Return top 5 suggestions
}
