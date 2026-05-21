"use client"

import { useState } from "react"
import {
    GraduationCap,
    Briefcase,
    Code,
    Brain,
    Server,
    BookOpen,
    FileText,
    Microscope,
    GitBranch,
    Users,
    Zap,
    CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllTemplates, type TemplateConfig, type TemplateFamily } from "@/lib/template-config"
import { DocumentThumbnail } from "@/components/ui/document-thumbnail"

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    GraduationCap,
    Briefcase,
    Code,
    Brain,
    Server,
    BookOpen,
    FileText,
    Microscope,
    GitBranch,
    Users,
    Zap,
}

interface TemplateSelectorProps {
    selectedTemplate: string
    onSelect: (templateId: string) => void
}

const FAMILY_INFO: Record<TemplateFamily, { name: string; description: string }> = {
    fresher: {
        name: "Fresher",
        description: "For students and new graduates",
    },
    professional: {
        name: "Professional",
        description: "For experienced developers",
    },
    academic: {
        name: "Academic",
        description: "For researchers and academics",
    },
    community: {
        name: "Community",
        description: "For OSS contributors and leaders",
    },
}

export function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
    const [activeFamily, setActiveFamily] = useState<TemplateFamily>("fresher")
    const allTemplates = getAllTemplates()

    const getTemplatesByFamily = (family: TemplateFamily) => {
        return allTemplates.filter((t) => t.family === family)
    }

    const getIcon = (iconName: string) => {
        return ICON_MAP[iconName] || GraduationCap
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Choose Your Template</h2>
                <p className="text-muted-foreground mt-2">
                    Select the template family that matches your career stage
                </p>
            </div>

            <Tabs value={activeFamily} onValueChange={(v) => setActiveFamily(v as TemplateFamily)}>
                <TabsList className="grid w-full grid-cols-4">
                    {(Object.keys(FAMILY_INFO) as TemplateFamily[]).map((family) => (
                        <TabsTrigger key={family} value={family} className="text-xs md:text-sm">
                            {FAMILY_INFO[family].name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {(Object.keys(FAMILY_INFO) as TemplateFamily[]).map((family) => (
                    <TabsContent key={family} value={family} className="mt-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            {FAMILY_INFO[family].description}
                        </p>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {getTemplatesByFamily(family).map((template) => {
                                const Icon = getIcon(template.icon)
                                const isSelected = selectedTemplate === template.id

                                return (
                                    <Card
                                        key={template.id}
                                        className={`group cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${isSelected
                                            ? "border-primary ring-2 ring-primary ring-offset-2 shadow-lg shadow-primary/20"
                                            : "hover:border-primary/50 hover:shadow-primary/10"
                                            }`}
                                        onClick={() => onSelect(template.id)}
                                    >
                                        {/* Shimmer effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none z-10" />

                                        {/* Visual Thumbnail Preview */}
                                        <div className="aspect-[4/3] p-4 bg-muted/30 relative">
                                            <DocumentThumbnail type="cv" />
                                            {/* Icon Overlay */}
                                            <div className={`absolute top-2 left-2 p-1.5 rounded-md shadow-sm transition-all duration-300 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background/90 group-hover:bg-primary/10'}`}>
                                                <Icon className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                                            </div>
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle2 className="h-5 w-5 text-primary animate-scale-in" />
                                                </div>
                                            )}
                                        </div>

                                        <CardHeader className="pb-2 pt-3">
                                            <CardTitle className="text-base group-hover:text-primary transition-colors">{template.name}</CardTitle>
                                            <CardDescription className="text-xs line-clamp-2">{template.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex items-center justify-between">
                                                <Badge
                                                    variant={template.atsScore >= 90 ? "default" : "secondary"}
                                                    className={template.atsScore >= 90 ? "bg-gradient-to-r from-emerald-500 to-green-500 border-0 text-xs" : "text-xs"}
                                                >
                                                    ATS: {template.atsScore}%
                                                </Badge>
                                                <span className="text-xs text-muted-foreground capitalize">
                                                    {template.variant}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
