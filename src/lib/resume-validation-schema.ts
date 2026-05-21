/**
 * Comprehensive validation schema for resume data
 * Provides inline validation with helpful error messages
 */

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

// Email regex pattern
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone regex (flexible for international formats)
const PHONE_PATTERN = /^[\d\s\-\+\(\)]{10,20}$/

// URL regex
const URL_PATTERN = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

// LinkedIn URL pattern
const LINKEDIN_PATTERN = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[\w-]+\/?$/

// GitHub URL pattern
const GITHUB_PATTERN = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?$/

/**
 * Validate personal info section
 */
export function validatePersonalInfo(data: {
  fullName: string
  email: string
  phone: string
  location?: string
  linkedin?: string
  github?: string
  website?: string
}): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  // Full Name - Required
  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.fullName = "Full name is required"
  } else if (data.fullName.length < 2) {
    errors.fullName = "Name must be at least 2 characters"
  } else if (data.fullName.length > 100) {
    errors.fullName = "Name is too long (max 100 characters)"
  } else if (!/^[a-zA-Z\s\.\-']+$/.test(data.fullName)) {
    warnings.fullName = "Name contains unusual characters"
  }

  // Email - Required
  if (!data.email || data.email.trim().length === 0) {
    errors.email = "Email is required"
  } else if (!EMAIL_PATTERN.test(data.email)) {
    errors.email = "Please enter a valid email address"
  } else if (data.email.length > 255) {
    errors.email = "Email is too long"
  }

  // Phone - Required
  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = "Phone number is required"
  } else if (!PHONE_PATTERN.test(data.phone)) {
    errors.phone = "Please enter a valid phone number"
  }

  // Location - Optional but validated if provided
  if (data.location && data.location.length > 100) {
    warnings.location = "Location is unusually long"
  }

  // LinkedIn - Optional but validated if provided
  if (data.linkedin) {
    if (data.linkedin.length > 0 && !LINKEDIN_PATTERN.test(data.linkedin)) {
      if (!URL_PATTERN.test(data.linkedin)) {
        warnings.linkedin = "Should be a valid LinkedIn profile URL"
      }
    }
  }

  // GitHub - Optional but validated if provided
  if (data.github) {
    if (data.github.length > 0 && !GITHUB_PATTERN.test(data.github)) {
      if (!URL_PATTERN.test(data.github)) {
        warnings.github = "Should be a valid GitHub profile URL"
      }
    }
  }

  // Website - Optional but validated if provided
  if (data.website && data.website.length > 0) {
    if (!URL_PATTERN.test(data.website)) {
      warnings.website = "Should be a valid website URL"
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate education entry
 */
export function validateEducation(data: {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  grade?: string
}): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  if (!data.institution || data.institution.trim().length === 0) {
    errors.institution = "Institution name is required"
  } else if (data.institution.length < 3) {
    errors.institution = "Institution name is too short"
  }

  if (!data.degree || data.degree.trim().length === 0) {
    errors.degree = "Degree is required"
  }

  if (!data.field || data.field.trim().length === 0) {
    errors.field = "Field of study is required"
  }

  if (!data.startDate) {
    errors.startDate = "Start date is required"
  }

  if (!data.endDate) {
    errors.endDate = "End date is required"
  } else if (data.startDate && data.endDate < data.startDate) {
    errors.endDate = "End date cannot be before start date"
  }

  // Grade warnings
  if (data.grade && data.grade.length > 50) {
    warnings.grade = "Grade/GPA seems unusually long"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate experience entry
 */
export function validateExperience(data: {
  company: string
  position: string
  startDate: string
  endDate: string
  description: string[]
  current?: boolean
}): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  if (!data.company || data.company.trim().length === 0) {
    errors.company = "Company name is required"
  }

  if (!data.position || data.position.trim().length === 0) {
    errors.position = "Position/title is required"
  }

  if (!data.startDate) {
    errors.startDate = "Start date is required"
  }

  if (!data.current && !data.endDate) {
    errors.endDate = "End date is required (or mark as current position)"
  } else if (!data.current && data.endDate && data.startDate && data.endDate < data.startDate) {
    errors.endDate = "End date cannot be before start date"
  }

  // Description validation
  if (!data.description || data.description.length === 0) {
    errors.description = "At least one achievement/responsibility is required"
  } else if (data.description.filter(d => d.trim().length > 0).length === 0) {
    errors.description = "Please add meaningful descriptions"
  } else {
    // Check for weak verbs
    const weakVerbs = ["did", "worked on", "helped with", "was responsible for"]
    data.description.forEach((desc, index) => {
      const lowerDesc = desc.toLowerCase()
      weakVerbs.forEach(verb => {
        if (lowerDesc.includes(verb)) {
          warnings[`description_${index}`] = `Bullet ${index + 1}: Consider using stronger action verbs`
        }
      })
    })

    // Check for missing metrics
    const hasMetrics = data.description.some(desc => /\d+/.test(desc))
    if (!hasMetrics) {
      warnings.description = "Consider adding quantifiable achievements (numbers, %)"
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate project entry
 */
export function validateProject(data: {
  name: string
  description: string
  technologies: string[]
  link?: string
  date?: string
}): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Project name is required"
  } else if (data.name.length < 3) {
    errors.name = "Project name is too short"
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = "Project description is required"
  } else if (data.description.length < 20) {
    warnings.description = "Description is quite short - consider adding more details"
  }

  if (!data.technologies || data.technologies.length === 0) {
    warnings.technologies = "Consider adding technologies used"
  }

  if (data.link && !URL_PATTERN.test(data.link)) {
    warnings.link = "Project link should be a valid URL"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Get user-friendly error message for common errors
 */
export function getErrorHelpText(errorCode: string): string {
  const errorHelp: Record<string, string> = {
    // Compilation errors
    latex_timeout: "⚠️ Your resume is too complex. Try enabling 'Compact Mode' to fit on one page.",
    latex_error: "⚠️ LaTeX compilation failed. Check for special characters in your content.",
    invalid_character: "⚠️ Found special characters that LaTeX doesn't support. Remove: & # $ % { }",
    
    // Network errors
    network_error: "⚠️ Connection lost. Your changes are saved locally and will sync when online.",
    firebase_error: "⚠️ Could not save to cloud. Don't worry, your resume is saved locally.",
    
    // Data errors
    missing_required_field: "⚠️ Please fill all required fields (marked with *)",
    invalid_email: "⚠️ Please enter a valid email address (e.g., john@example.com)",
    invalid_phone: "⚠️ Please enter a valid phone number (10-20 digits)",
    
    // PDF errors
    pdf_generation_failed: "⚠️ Could not generate PDF. Try simplifying your resume content.",
    pdf_too_large: "⚠️ Your resume exceeds recommended length. Consider compact mode.",
  }

  return errorHelp[errorCode] || "⚠️ An unknown error occurred. Please try again."
}

/**
 * Validate entire resume data
 */
export function validateCompleteResume(data: any): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  completeness: number
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Personal Info
  const personalValidation = validatePersonalInfo(data.personalInfo || {})
  if (!personalValidation.isValid) {
    errors.push("Personal information has errors")
  }

  // Education
  if (!data.education || data.education.length === 0) {
    errors.push("At least one education entry is required")
  }

  // Experience or Projects
  const hasExperience = data.experience && data.experience.length > 0
  const hasProjects = data.projects && data.projects.length > 0
  if (!hasExperience && !hasProjects) {
    warnings.push("Add either work experience or projects to strengthen your resume")
  }

  // Skills
  if (!data.skills || data.skills.technical.length === 0) {
    warnings.push("Consider adding technical skills")
  }

  // Calculate completeness (0-100)
  let completeness = 0
  const sections = [
    data.personalInfo?.fullName ? 15 : 0,
    data.personalInfo?.email ? 10 : 0,
    data.personalInfo?.phone ? 10 : 0,
    data.personalInfo?.summary ? 10 : 0,
    data.education?.length > 0 ? 15 : 0,
    hasExperience ? 15 : 0,
    hasProjects ? 10 : 0,
    data.skills?.technical.length > 0 ? 10 : 0,
    data.certifications?.length > 0 ? 5 : 0,
  ]
  completeness = sections.reduce((a, b) => a + b, 0)

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness: Math.min(100, completeness),
  }
}
