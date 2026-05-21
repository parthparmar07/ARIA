/**
 * Smart Template Recommendation System
 * Analyzes resume data and recommends the best template
 */

import type { ResumeData, ResumeTemplate } from "./types"

export interface TemplateRecommendation {
    template: ResumeTemplate
    confidence: number // 0-1
    reason: string
    pros: string[]
    cons: string[]
}

/**
 * Calculate years of experience from experience entries
 */
function calculateYearsOfExperience(data: ResumeData): number {
    if (data.experience.length === 0) return 0

    let totalMonths = 0

    data.experience.forEach(exp => {
        const start = parseDate(exp.startDate)
        const end = exp.current ? new Date() : parseDate(exp.endDate)

        if (start && end) {
            const months = (end.getFullYear() - start.getFullYear()) * 12 +
                (end.getMonth() - start.getMonth())
            totalMonths += Math.max(0, months)
        }
    })

    return totalMonths / 12
}

/**
 * Parse date string (handles various formats)
 */
function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null

    // Try common formats
    const formats = [
        /(\d{4})-(\d{2})/,           // 2024-01
        /(\w+)\s+(\d{4})/,           // January 2024
        /(\d{2})\/(\d{4})/,          // 01/2024
    ]

    for (const format of formats) {
        const match = dateStr.match(format)
        if (match) {
            if (format === formats[0]) {
                return new Date(parseInt(match[1]), parseInt(match[2]) - 1)
            }
            if (format === formats[1]) {
                const monthNames = ["january", "february", "march", "april", "may", "june",
                    "july", "august", "september", "october", "november", "december"]
                const monthIndex = monthNames.indexOf(match[1].toLowerCase())
                if (monthIndex !== -1) {
                    return new Date(parseInt(match[2]), monthIndex)
                }
            }
        }
    }

    // Fallback: try native Date parsing
    const parsed = new Date(dateStr)
    return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Check if user has academic background
 */
function isAcademic(data: ResumeData): boolean {
    // Check for PhD, Masters, or research positions
    const hasAdvancedDegree = data.education.some(edu =>
        edu.degree.toLowerCase().includes("phd") ||
        edu.degree.toLowerCase().includes("ph.d") ||
        edu.degree.toLowerCase().includes("doctorate") ||
        edu.degree.toLowerCase().includes("master") ||
        edu.degree.toLowerCase().includes("m.s") ||
        edu.degree.toLowerCase().includes("m.sc")
    )

    const hasResearchExperience = data.experience.some(exp =>
        exp.position.toLowerCase().includes("research") ||
        exp.position.toLowerCase().includes("professor") ||
        exp.position.toLowerCase().includes("postdoc") ||
        exp.company.toLowerCase().includes("university") ||
        exp.company.toLowerCase().includes("institute")
    )

    return hasAdvancedDegree || hasResearchExperience
}

/**
 * Check if user is in creative/design field
 */
function isCreativeField(data: ResumeData): boolean {
    const creativeKeywords = [
        "design", "designer", "creative", "ui", "ux", "graphic",
        "artist", "illustrator", "photographer", "video", "animation",
        "marketing", "brand", "content creator"
    ]

    const position = data.experience[0]?.position.toLowerCase() || ""
    const skills = data.skills.technical.join(" ").toLowerCase()

    return creativeKeywords.some(keyword =>
        position.includes(keyword) || skills.includes(keyword)
    )
}

/**
 * Check if user is in tech/engineering field
 */
function isTechField(data: ResumeData): boolean {
    const techKeywords = [
        "engineer", "developer", "programmer", "software", "data",
        "devops", "sre", "architect", "tech lead", "cto"
    ]

    const position = data.experience[0]?.position.toLowerCase() || ""

    return techKeywords.some(keyword => position.includes(keyword))
}

/**
 * Recommend template based on user profile
 */
export function recommendTemplate(data: ResumeData): TemplateRecommendation {
    const yearsExp = calculateYearsOfExperience(data)
    const academic = isAcademic(data)
    const creative = isCreativeField(data)
    const tech = isTechField(data)

    // Academic CV for researchers
    if (academic) {
        return {
            template: "academic",
            confidence: 0.95,
            reason: "You have an academic background with advanced degrees or research experience",
            pros: [
                "Traditional format preferred in academia",
                "Space for publications and research",
                "Emphasizes education and scholarly work"
            ],
            cons: [
                "May be too formal for industry roles",
                "Longer format (2+ pages typical)"
            ]
        }
    }

    // Fresher template for students/entry-level
    if (yearsExp < 2) {
        return {
            template: "fresher",
            confidence: 0.90,
            reason: "You're early in your career with less than 2 years of experience",
            pros: [
                "Emphasizes education and projects",
                "Clean, simple layout",
                "Perfect for internships and entry-level roles"
            ],
            cons: [
                "Less space for extensive work history",
                "May look too basic for senior roles"
            ]
        }
    }

    // Modern template for creative/design roles
    if (creative) {
        return {
            template: "modern",
            confidence: 0.85,
            reason: "Your profile suggests a creative or design-focused role",
            pros: [
                "Visually appealing two-column layout",
                "Modern icons and styling",
                "Stands out in creative industries"
            ],
            cons: [
                "May not parse well in some ATS systems",
                "Too flashy for conservative industries"
            ]
        }
    }

    // Professional template for experienced professionals
    if (yearsExp >= 2) {
        return {
            template: "experienced",
            confidence: 0.88,
            reason: `You have ${Math.round(yearsExp)} years of professional experience`,
            pros: [
                "Emphasizes work experience and achievements",
                "Professional, industry-standard format",
                "ATS-friendly single-column layout"
            ],
            cons: [
                "Less emphasis on education",
                "May feel traditional for creative roles"
            ]
        }
    }

    // Default to fresher if unclear
    return {
        template: "fresher",
        confidence: 0.70,
        reason: "Based on your current profile, this template is a good starting point",
        pros: [
            "Versatile for various career stages",
            "Clean and professional",
            "Easy to customize"
        ],
        cons: [
            "May not highlight your unique strengths",
            "Consider other templates as you add more content"
        ]
    }
}

/**
 * Get all template recommendations ranked by confidence
 */
export function getAllTemplateRecommendations(data: ResumeData): TemplateRecommendation[] {
    const recommendations: TemplateRecommendation[] = []
    const yearsExp = calculateYearsOfExperience(data)
    const academic = isAcademic(data)
    const creative = isCreativeField(data)

    // Fresher
    recommendations.push({
        template: "fresher",
        confidence: yearsExp < 2 ? 0.90 : 0.50,
        reason: yearsExp < 2
            ? "Ideal for students and early-career professionals"
            : "Good fallback option with clean layout",
        pros: ["Simple", "Education-focused", "ATS-friendly"],
        cons: yearsExp >= 2 ? ["Doesn't showcase extensive experience"] : []
    })

    // Professional
    recommendations.push({
        template: "experienced",
        confidence: yearsExp >= 2 ? 0.88 : 0.60,
        reason: yearsExp >= 2
            ? "Perfect for highlighting your work experience"
            : "Use this when you gain more experience",
        pros: ["Experience-focused", "Professional", "Industry-standard"],
        cons: yearsExp < 2 ? ["Too much emphasis on work history"] : []
    })

    // Academic
    recommendations.push({
        template: "academic",
        confidence: academic ? 0.95 : 0.40,
        reason: academic
            ? "Best for academic and research positions"
            : "Only if applying to academic roles",
        pros: ["Research-focused", "Traditional", "Publication-friendly"],
        cons: !academic ? ["Too formal for most industry jobs"] : []
    })

    // Modern
    recommendations.push({
        template: "modern",
        confidence: creative ? 0.85 : 0.65,
        reason: creative
            ? "Stands out in creative industries"
            : "Good for making a visual impact",
        pros: ["Eye-catching", "Modern design", "Two-column layout"],
        cons: !creative ? ["May not be ATS-friendly", "Too flashy for conservative fields"] : []
    })

    return recommendations.sort((a, b) => b.confidence - a.confidence)
}
