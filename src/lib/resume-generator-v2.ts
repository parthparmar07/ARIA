/**
 * Resume LaTeX Generator V2
 * Professional ATS-friendly template with FontAwesome icons
 * 
 * DESIGN PHILOSOPHY: Format-based, not content-judgement
 * Based on Jake's Resume template - industry standard
 * 
 * TEMPLATE VISUAL STYLES:
 * - Fresher: Clean, spacious, larger headings (for students)
 * - Professional: Tight spacing, metrics-focused (for experienced)
 * - Academic: Traditional, serif-friendly, publications-ready
 */

import type { ResumeData, SectionVisibility } from "./types"
import { getTemplateConfig, getSectionLabel, type SectionKey, type TemplateConfig, type TemplateFamily } from "./template-config"
import { escapeLatex } from "./report-latex-templates"

// ============ HELPER FUNCTIONS ============

// escapeLatex is imported from report-latex-templates.ts

/**
 * Check if text has meaningful content (not just placeholder)
 */
function hasContent(text: string | undefined | null): boolean {
    if (!text) return false
    const cleaned = text.trim().toLowerCase()
    const placeholderPatterns = [
        /^hi\s*[-–—]\s*hi$/i,
        /^test$/i,
        /^placeholder$/i,
        /^xxx+$/i,
        /^\.{3,}$/,
        /^n\/a$/i,
        /^tbd$/i,
        /^todo$/i,
    ]
    return !placeholderPatterns.some(p => p.test(cleaned)) && cleaned.length > 1
}

/**
 * Check if array has meaningful items
 */
function hasItems<T>(arr: T[] | undefined | null): arr is T[] {
    return Array.isArray(arr) && arr.length > 0
}

/**
 * Get effective section visibility
 */
function getEffectiveVisibility(data: ResumeData, config: TemplateConfig): SectionVisibility {
    const defaultVisibility: SectionVisibility = {
        summary: true,
        education: true,
        experience: true,
        projects: true,
        skills: true,
        certifications: true,
        leadership: true,
        achievements: true,
        publications: true,
        openSource: true,
    }

    for (const section of config.hiddenSections) {
        defaultVisibility[section] = false
    }

    if (data.sectionVisibility) {
        for (const [key, value] of Object.entries(data.sectionVisibility)) {
            if (value !== undefined) {
                defaultVisibility[key as SectionKey] = value
            }
        }
    }

    return defaultVisibility
}

// ============ LATEX PREAMBLE ============

/**
 * Generate preamble based on template family for distinct visual styles
 * - Fresher: 11pt, spacious margins, larger section headers
 * - Professional: 10pt, tight margins, compact spacing
 * - Academic: 11pt, traditional margins, serif-friendly
 */
function generatePreamble(family: TemplateFamily = 'fresher', isCompact: boolean = false): string {
    // Base packages used by all templates
    const basePackages = `\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}
\\pdfgentounicode=1`

    // FRESHER TEMPLATE: Clean, spacious, student-friendly
    if (family === 'fresher') {
        const fontSize = isCompact ? '10pt' : '11pt'
        const margins = isCompact 
            ? `\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}`
            : `\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.6in}
\\addtolength{\\textheight}{1.2in}`

        return `\\documentclass[letterpaper,${fontSize}]{article}

${basePackages}

% FRESHER STYLE: Clean & Spacious
${margins}

% Larger section headers for visual clarity
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\Large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

${generateCommonCommands(isCompact ? -2 : -4, isCompact ? -5 : -7)}
`
    }

    // PROFESSIONAL TEMPLATE: Tight, metrics-focused, experienced
    if (family === 'professional') {
        return `\\documentclass[letterpaper,10pt]{article}

${basePackages}

% PROFESSIONAL STYLE: Compact & Dense
\\addtolength{\\oddsidemargin}{-0.7in}
\\addtolength{\\evensidemargin}{-0.6in}
\\addtolength{\\textwidth}{1.4in}
\\addtolength{\\topmargin}{-.8in}
\\addtolength{\\textheight}{1.6in}

% Compact section headers
\\titleformat{\\section}{
  \\vspace{-6pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-4pt}]

${generateCommonCommands(-1, -5)}
`
    }

    // ACADEMIC TEMPLATE: Traditional, publication-ready
    if (family === 'academic') {
        return `\\documentclass[letterpaper,11pt]{article}

${basePackages}

% ACADEMIC STYLE: Traditional & Readable
\\addtolength{\\oddsidemargin}{-0.4in}
\\addtolength{\\evensidemargin}{-0.4in}
\\addtolength{\\textwidth}{0.8in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

% Traditional section headers with more space
\\titleformat{\\section}{
  \\vspace{-2pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-3pt}]

${generateCommonCommands(-3, -6)}
`
    }

    // COMMUNITY/DEFAULT: Standard Jake's template
    return `\\documentclass[letterpaper,11pt]{article}

${basePackages}

% STANDARD STYLE
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\titleformat{\\section}{
  \\vspace{-7pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

${generateCommonCommands(-2, -5)}
`
}

/**
 * Generate common LaTeX commands with adjustable spacing
 */
function generateCommonCommands(itemVspace: number, headingVspace: number): string {
    return `%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{${itemVspace}pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textbf{\\small #2} \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{${headingVspace}pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\textbf{\\small #2}\\\\
    \\end{tabular*}\\vspace{${headingVspace}pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{${headingVspace}pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%
`
}

// ============ SECTION GENERATORS ============

/**
 * Generate header with FontAwesome icons
 */
function generateHeader(data: ResumeData): string {
    const { personalInfo } = data

    const contactParts: string[] = []

    if (hasContent(personalInfo.phone)) {
        contactParts.push(`\\faPhone\\ ${escapeLatex(personalInfo.phone || '')}`)
    }

    if (hasContent(personalInfo.email)) {
        contactParts.push(`\\href{mailto:${escapeLatex(personalInfo.email || '')}}{\\faEnvelope\\ ${escapeLatex(personalInfo.email || '')}}`)
    }

    if (hasContent(personalInfo.linkedin)) {
        const linkedinUrl = personalInfo.linkedin || ''
        const linkedinDisplay = linkedinUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
        contactParts.push(`\\href{${escapeLatex(linkedinUrl)}}{\\faLinkedin\\ ${escapeLatex(linkedinDisplay)}}`)
    }

    if (hasContent(personalInfo.github)) {
        const githubUrl = personalInfo.github || ''
        const githubDisplay = githubUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
        contactParts.push(`\\href{${escapeLatex(githubUrl)}}{\\faGithub\\ ${escapeLatex(githubDisplay)}}`)
    }

    if (hasContent(personalInfo.website)) {
        contactParts.push(`\\href{${escapeLatex(personalInfo.website || '')}}{\\faGlobe\\ Portfolio}`)
    }

    return `\\begin{document}

%----------HEADING----------
\\begin{center}
    {\\Huge \\scshape ${escapeLatex(personalInfo.fullName)}} \\\\ \\vspace{1pt}
    \\small ${contactParts.join(' ~ \n    ')}
    \\vspace{-8pt}
\\end{center}
`
}

/**
 * Generate summary/objective section
 */
function generateSummary(data: ResumeData, config: TemplateConfig): string {
    if (!hasContent(data.personalInfo.summary)) return ""

    const label = getSectionLabel(config, "summary")
    return `
%-----------SUMMARY-----------
\\section{${escapeLatex(label)}}
\\small{${escapeLatex(data.personalInfo.summary || '')}}
\\vspace{-10pt}
`
}

/**
 * Generate education section
 */

/**
 * Generate education section
 */
function generateEducation(data: ResumeData, config: TemplateConfig, isCompact: boolean = false): string {
    if (!hasItems(data.education)) return ""

    const validEntries = data.education.filter(edu => hasContent(edu.institution))
    if (validEntries.length === 0) return ""

    // Show all entries even in compact mode
    const displayEntries = validEntries
    const label = getSectionLabel(config, "education")

    const entries = displayEntries.map(edu => {
        const dateRange = `${escapeLatex(edu.startDate || '')} -- ${escapeLatex(edu.endDate || '')}`
        // Hide grade info in compact mode if desired, or keep it
        const gradeInfo = (edu.grade && !isCompact) ? `
      \\resumeItemListStart
        \\resumeItem{\\textbf{${escapeLatex(edu.grade)}}}
      \\resumeItemListEnd` : ''

        return `    \\resumeSubheading
      {${escapeLatex(edu.institution)}}{${escapeLatex(edu.location || '')}}
      {${escapeLatex(edu.degree)} in ${escapeLatex(edu.field)}}{${dateRange}}${gradeInfo}`
    }).join('\n')

    return `
%-----------EDUCATION-----------
\\section{${escapeLatex(label)}}
  \\resumeSubHeadingListStart
${entries}
  \\resumeSubHeadingListEnd
\\vspace{${isCompact ? '-6pt' : '-8pt'}}
`
}

/**
 * Generate experience section
 */

/**
 * Generate experience section
 */
function generateExperience(data: ResumeData, config: TemplateConfig, isCompact: boolean = false): string {
    if (!hasItems(data.experience)) return ""

    const validEntries = data.experience.filter(exp => hasContent(exp.company) && hasContent(exp.position))
    if (validEntries.length === 0) return ""

    // Show all entries
    const displayEntries = validEntries
    const label = getSectionLabel(config, "experience")

    const entries = displayEntries.map(exp => {
        const dateRange = `${escapeLatex(exp.startDate || '')} -- ${exp.current ? 'Present' : escapeLatex(exp.endDate || '')}`

        // Show up to 4 bullets generally, maybe tighten if needed but don't drop drastically
        const maxBullets = isCompact ? 4 : 5
        const validBullets = (exp.description || [])
            .filter(desc => hasContent(desc))
            .slice(0, maxBullets)
            .map(desc => `        \\resumeItem{${escapeLatex(desc)}}`)
            .join('\n')

        return `    \\resumeSubheading
      {${escapeLatex(exp.position)}}{${dateRange}}
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location || '')}}
      \\resumeItemListStart
${validBullets}
      \\resumeItemListEnd`
    }).join('\n')

    return `
%-----------EXPERIENCE-----------
\\section{${escapeLatex(label)}}
  \\resumeSubHeadingListStart
${entries}
  \\resumeSubHeadingListEnd
\\vspace{${isCompact ? '-6pt' : '-10pt'}}
`
}

/**
 * Generate projects section
 */

/**
 * Generate projects section
 */
function generateProjects(data: ResumeData, config: TemplateConfig, isCompact: boolean = false): string {
    if (!hasItems(data.projects)) return ""

    const validEntries = data.projects.filter(proj => hasContent(proj.name))
    if (validEntries.length === 0) return ""

    // Show all projects
    const displayEntries = validEntries
    const label = getSectionLabel(config, "projects")

    const entries = displayEntries.map(proj => {
        const techList = hasItems(proj.technologies)
            ? ` $|$ \\emph{${escapeLatex(proj.technologies.join(', '))}}`
            : ''
        const linkIcon = proj.link
            ? ` $|$ \\href{${escapeLatex(proj.link)}}{\\raisebox{-0.1\\height}\\faGithub}`
            : ''

        // Allow reasonable bullets
        const maxBullets = isCompact ? 2 : 3
        const bullets = hasContent(proj.description)
            ? proj.description.split('. ')
                .filter(s => s.trim().length > 10)
                .slice(0, maxBullets)
                .map(s => `        \\resumeItem{${escapeLatex(s.trim().endsWith('.') ? s.trim() : s.trim() + '.')}}`)
                .join('\n')
            : ''

        return `      \\resumeProjectHeading
          {\\textbf{${escapeLatex(proj.name)}}${techList}${linkIcon}}{${escapeLatex(proj.date || '')}}
          \\resumeItemListStart
${bullets}
          \\resumeItemListEnd
          \\vspace{-9pt}`
    }).join('\n          \n')

    return `
%-----------PROJECTS-----------
\\section{${escapeLatex(label)}}
    \\resumeSubHeadingListStart
${entries}
    \\resumeSubHeadingListEnd
\\vspace{${isCompact ? '-14pt' : '-12pt'}}
`
}

/**
 * Generate skills section with smart grouping
 */

/**
 * Generate skills section with smart grouping
 */
function generateSkills(data: ResumeData, config: TemplateConfig, isCompact: boolean = false): string {
    const technicalSkills = (data.skills?.technical || []).filter(s => hasContent(s))
    if (technicalSkills.length === 0) return ""

    const softSkills = (data.skills?.soft || []).filter(s => hasContent(s))
    const languages = (data.skills?.languages || []).filter(s => hasContent(s))

    const label = getSectionLabel(config, "skills")

    let content = ""

    // Compact mode: Flat list
    if (isCompact) {
        content = `     \\textbf{Technical}{: ${escapeLatex(technicalSkills.join(', '))}} \\\\`
        if (languages.length > 0) {
            content += `\n     \\textbf{Languages}{: ${escapeLatex(languages.join(', '))}}`
        }
    } else {
        // Grouped skills
        const skillGroups = autoGroupSkills(technicalSkills)

        const groupLines = skillGroups.map(group =>
            `     \\textbf{${escapeLatex(group.category)}}{: ${escapeLatex(group.skills.join(', '))}} \\\\`
        ).join('\n')

        content = groupLines

        if (softSkills.length > 0) {
            content += `\n     \\textbf{Soft Skills}{: ${escapeLatex(softSkills.join(', '))}} \\\\`
        }
        if (languages.length > 0) {
            content += `\n     \\textbf{Languages}{: ${escapeLatex(languages.join(', '))}}`
        }
    }

    return `
%-----------TECHNICAL SKILLS-----------
\\section{${escapeLatex(label)}}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${content}
    }}
 \\end{itemize}
 \\vspace{${isCompact ? '-14pt' : '-12pt'}}
`
}

/**
 * Auto-group skills by category
 */
function autoGroupSkills(skills: string[]): { category: string, skills: string[] }[] {
    const categories: Record<string, string[]> = {
        "Languages": [],
        "ML/DL": [],
        "Computer Vision": [],
        "Web/Backend": [],
        "Tools & Deployment": [],
        "Other": [],
    }

    const categoryKeywords: Record<string, string[]> = {
        "Languages": ["python", "java", "javascript", "typescript", "c++", "c", "sql", "go", "rust", "kotlin", "swift", "ruby", "php", "r"],
        "ML/DL": ["pytorch", "tensorflow", "keras", "scikit", "sklearn", "xgboost", "langchain", "hugging", "transformer", "bert", "gpt", "llm", "rag", "sentence"],
        "Computer Vision": ["opencv", "u-net", "yolo", "detectron", "vit", "vision transformer", "grad-cam", "midas", "segmentation"],
        "Web/Backend": ["react", "vue", "angular", "next", "node", "express", "flask", "fastapi", "django", "html", "css"],
        "Tools & Deployment": ["docker", "kubernetes", "git", "github", "aws", "gcp", "azure", "vercel", "faiss", "sqlite", "mongodb", "postgres", "groq"],
    }

    for (const skill of skills) {
        const lowerSkill = skill.toLowerCase()
        let matched = false

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(kw => lowerSkill.includes(kw))) {
                categories[category].push(skill)
                matched = true
                break
            }
        }

        if (!matched) {
            categories["Other"].push(skill)
        }
    }

    // Merge small categories into "Other"
    const result: { category: string, skills: string[] }[] = []
    const otherSkills: string[] = [...categories["Other"]]

    for (const [category, skills] of Object.entries(categories)) {
        if (category === "Other") continue
        if (skills.length >= 2) {
            result.push({ category, skills })
        } else if (skills.length === 1) {
            otherSkills.push(...skills)
        }
    }

    if (otherSkills.length > 0) {
        result.push({ category: "Other", skills: otherSkills })
    }

    return result.filter(g => g.skills.length > 0)
}

/**
 * Generate leadership section
 */
function generateLeadership(data: ResumeData, config: TemplateConfig): string {
    if (!hasItems(data.leadership)) return ""

    const validEntries = data.leadership.filter(lead => hasContent(lead.role) && hasContent(lead.organization))
    if (validEntries.length === 0) return ""

    const label = getSectionLabel(config, "leadership")
    const entries = validEntries.map(lead => {
        const bullets = (lead.description || [])
            .filter(desc => hasContent(desc))
            .slice(0, 3)
            .map(desc => `        \\resumeItem{${escapeLatex(desc)}}`)
            .join('\n')

        return `    \\resumeSubheading
      {${escapeLatex(lead.role)}}{${escapeLatex(lead.duration || '')}}
      {${escapeLatex(lead.organization)}}{}
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`
    }).join('\n      \n')

    return `
%-----------LEADERSHIP-----------
\\section{${escapeLatex(label)}}
  \\resumeSubHeadingListStart
${entries}
  \\resumeSubHeadingListEnd
\\vspace{-6pt}
`
}

/**
 * Generate achievements section
 */
function generateAchievements(data: ResumeData, config: TemplateConfig): string {
    if (!hasItems(data.achievements)) return ""

    const validEntries = data.achievements.filter(ach => hasContent(ach.title))
    if (validEntries.length === 0) return ""

    const label = getSectionLabel(config, "achievements")

    // Format achievements inline for compact display
    const achievementItems = validEntries.map(ach =>
        `\\textbf{${escapeLatex(ach.title || '')}}${hasContent(ach.issuer) ? ` - ${escapeLatex(ach.issuer || '')}` : ''}`
    )

    // Join with pipes for inline format
    const itemsPerLine = 2
    const lines: string[] = []
    for (let i = 0; i < achievementItems.length; i += itemsPerLine) {
        lines.push(achievementItems.slice(i, i + itemsPerLine).join(' \\hspace{0.5em} $|$ \\hspace{0.5em} '))
    }

    return `
%-----------ACHIEVEMENTS-----------
\\section{${escapeLatex(label)}}
    \\begin{itemize}[leftmargin=0.15in, label={}]
        \\small{\\item{
            ${lines.join(' \\\\\n            ')}
        }}
    \\end{itemize}
 \\vspace{-12pt}
`
}

/**
 * Generate certifications section
 */
function generateCertifications(data: ResumeData, config: TemplateConfig): string {
    if (!hasItems(data.certifications)) return ""

    const validEntries = data.certifications.filter(cert =>
        hasContent(cert.name) && hasContent(cert.issuer)
    )
    if (validEntries.length === 0) return ""

    const label = getSectionLabel(config, "certifications")
    const certLines = validEntries.map(cert =>
        `\\textbf{${escapeLatex(cert.name || '')}} - ${escapeLatex(cert.issuer || '')}`
    )

    return `
%-----------CERTIFICATIONS-----------
\\section{${escapeLatex(label)}}
    \\begin{itemize}[leftmargin=0.15in, label={}]
        \\small{\\item{
            ${certLines.join(' \\\\\n            ')}
        }}
    \\end{itemize}
`
}

/**
 * Generate publications section
 */
function generatePublications(data: ResumeData, config: TemplateConfig): string {
    if (!hasItems(data.publications)) return ""

    const validEntries = data.publications.filter(pub =>
        hasContent(pub.title) && hasContent(pub.authors) && hasContent(pub.venue)
    )
    if (validEntries.length === 0) return ""

    const label = getSectionLabel(config, "publications")
    const entries = validEntries.map(pub => {
        const link = pub.link ? ` \\href{${escapeLatex(pub.link)}}{[Link]}` : ''
        return `        \\resumeItem{\\textbf{${escapeLatex(pub.title || '')}}${link} -- ${escapeLatex(pub.authors || '')} -- \\textit{${escapeLatex(pub.venue || '')}, ${escapeLatex(pub.year || '')}}${pub.citations ? ` (${pub.citations} citations)` : ''}}`
    }).join('\n')

    return `
%-----------PUBLICATIONS-----------
\\section{${escapeLatex(label)}}
    \\resumeSubHeadingListStart
      \\resumeItemListStart
${entries}
      \\resumeItemListEnd
    \\resumeSubHeadingListEnd
\\vspace{-10pt}
`
}

/**
 * Generate open source section
 */
function generateOpenSource(data: ResumeData, config: TemplateConfig): string {
    if (!hasItems(data.openSource)) return ""

    const validEntries = data.openSource.filter(os => hasContent(os.project))
    if (validEntries.length === 0) return ""

    const label = getSectionLabel(config, "openSource")
    const entries = validEntries.map(os => {
        const link = os.link ? ` $|$ \\href{${escapeLatex(os.link)}}{\\faGithub}` : ''
        const stars = os.stars ? ` (${os.stars}+ \\faStar)` : ''

        return `      \\resumeProjectHeading
          {\\textbf{${escapeLatex(os.project)}} -- ${escapeLatex(os.role || 'Contributor')}${link}${stars}}{}
          \\resumeItemListStart
            \\resumeItem{${escapeLatex(os.contributions || '')}}
          \\resumeItemListEnd`
    }).join('\n          \\vspace{-9pt}\n')

    return `
%-----------OPEN SOURCE-----------
\\section{${escapeLatex(label)}}
    \\resumeSubHeadingListStart
${entries}
    \\resumeSubHeadingListEnd
\\vspace{-10pt}
`
}

/**
 * Generate watermark for free users
 */
function generateWatermark(isPaid: boolean): string {
    if (isPaid) return ""

    return `
\\vfill
\\begin{center}
\\textcolor{gray}{\\tiny Created with Paperly - paperly.com}
\\end{center}
`
}

// ============ SECTION GENERATOR MAP ============


// ============ SECTION GENERATOR MAP ============

type SectionGenerator = (data: ResumeData, config: TemplateConfig, isCompact?: boolean) => string

const SECTION_GENERATORS: Record<SectionKey, SectionGenerator> = {
    summary: (d, c, compact) => generateSummary(d, c), // Summary typically doesn't need compaction
    education: generateEducation,
    experience: generateExperience,
    projects: generateProjects,
    skills: generateSkills,
    certifications: generateCertifications, // TODO: Add compact logic if needed
    leadership: generateLeadership, // TODO: Add compact logic if needed
    achievements: generateAchievements,
    publications: (d, c) => generatePublications(d, c), // Academic typically needs full list
    openSource: (d, c) => generateOpenSource(d, c),
}

// ============ MAIN GENERATOR ============

/**
 * Generate complete LaTeX resume using professional template
 */
export function generateConfiguredResume(data: ResumeData, isPaid: boolean = false): string {
    const config = getTemplateConfig(data.template)
    const visibility = getEffectiveVisibility(data, config)
    const isCompact = !!data.isCompact

    const sections: string[] = []
    const generatedSections = new Set<SectionKey>()

    // Generate sections in template's preferred order
    for (const sectionKey of config.sectionOrder) {
        if (visibility[sectionKey]) {
            const generator = SECTION_GENERATORS[sectionKey]
            if (generator) {
                const content = generator(data, config, isCompact)
                if (content && content.trim()) {
                    sections.push(content)
                    generatedSections.add(sectionKey)
                }
            }
        }
    }

    // Add remaining visible sections
    const allSectionKeys: SectionKey[] = ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'leadership', 'achievements', 'publications', 'openSource']

    for (const sectionKey of allSectionKeys) {
        if (visibility[sectionKey] && !generatedSections.has(sectionKey)) {
            const generator = SECTION_GENERATORS[sectionKey]
            if (generator) {
                const content = generator(data, config, isCompact)
                if (content && content.trim()) {
                    sections.push(content)
                    generatedSections.add(sectionKey)
                }
            }
        }
    }

    // Use template family for distinct visual styles
    return `${generatePreamble(config.family, isCompact)}
${generateHeader(data)}
${sections.join('\n')}
${generateWatermark(isPaid)}
\\end{document}`
}
