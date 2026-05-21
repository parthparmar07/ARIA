"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { SectionVisibility } from "@/lib/types"

interface SectionToggleProps {
    visibility: SectionVisibility
    onChange: (visibility: SectionVisibility) => void
}

const SECTION_INFO: Record<keyof SectionVisibility, { label: string; description: string }> = {
    summary: {
        label: "Professional Summary",
        description: "Brief career objective or professional summary"
    },
    education: {
        label: "Education",
        description: "Academic qualifications and degrees"
    },
    experience: {
        label: "Work Experience",
        description: "Professional work history and internships"
    },
    projects: {
        label: "Projects",
        description: "Personal or academic projects"
    },
    skills: {
        label: "Skills",
        description: "Technical and soft skills"
    },
    certifications: {
        label: "Certifications",
        description: "Professional certifications and courses"
    },
    leadership: {
        label: "Leadership & Activities",
        description: "Club roles, volunteer work, extracurriculars"
    },
    achievements: {
        label: "Achievements",
        description: "Hackathon wins, awards, competitions"
    },
    publications: {
        label: "Publications",
        description: "Research papers and academic publications"
    },
    openSource: {
        label: "Open Source",
        description: "Contributions to open source projects"
    },
}

export function SectionToggle({ visibility, onChange }: SectionToggleProps) {
    const toggleSection = (section: keyof SectionVisibility) => {
        onChange({
            ...visibility,
            [section]: !visibility[section],
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Section Visibility</CardTitle>
                <CardDescription>
                    Choose which sections to include in your resume
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {(Object.keys(SECTION_INFO) as (keyof SectionVisibility)[]).map((section) => (
                    <div
                        key={section}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <div className="space-y-0.5">
                            <Label htmlFor={`toggle-${section}`} className="font-medium cursor-pointer">
                                {SECTION_INFO[section].label}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {SECTION_INFO[section].description}
                            </p>
                        </div>
                        <Switch
                            id={`toggle-${section}`}
                            checked={visibility[section]}
                            onCheckedChange={() => toggleSection(section)}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

// Default visibility for quick access
export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
    summary: true,
    education: true,
    experience: true,
    projects: true,
    skills: true,
    certifications: true,  // Enabled by default - commonly used
    leadership: false,
    achievements: true,    // Enabled by default - commonly used
    publications: false,
    openSource: false,
}
