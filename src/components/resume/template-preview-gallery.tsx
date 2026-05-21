"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GraduationCap,
  Code,
  BookOpen,
  GitBranch,
  Zap,
  Briefcase,
  Brain,
  Server,
  Users,
  FileText,
  Check,
  ArrowRight,
  Eye,
} from "lucide-react"
import { getAllTemplates, getTemplatesByFamily, type TemplateFamily, type TemplateConfig } from "@/lib/template-config"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, any> = {
  GraduationCap,
  Code,
  BookOpen,
  GitBranch,
  Zap,
  Briefcase,
  Brain,
  Server,
  Users,
  FileText,
}

interface TemplatePreviewGalleryProps {
  selectedTemplate?: string
  onSelectTemplate: (templateId: string) => void
  onContinue: () => void
}

export function TemplatePreviewGallery({
  selectedTemplate,
  onSelectTemplate,
  onContinue,
}: TemplatePreviewGalleryProps) {
  const [activeFamily, setActiveFamily] = useState<TemplateFamily>("fresher")
  const [previewTemplate, setPreviewTemplate] = useState<TemplateConfig | null>(null)

  const familyTemplates = getTemplatesByFamily(activeFamily)

  const familyInfo: Record<TemplateFamily, { title: string; description: string; icon: any }> = {
    fresher: {
      title: "Fresher Templates",
      description: "Perfect for students and recent graduates",
      icon: GraduationCap,
    },
    professional: {
      title: "Professional Templates",
      description: "For experienced engineers and developers",
      icon: Code,
    },
    academic: {
      title: "Academic Templates",
      description: "Research-focused layouts for academics",
      icon: BookOpen,
    },
    community: {
      title: "Community Templates",
      description: "Highlight open source and leadership",
      icon: GitBranch,
    },
  }

  const handlePreview = (template: TemplateConfig) => {
    setPreviewTemplate(template)
  }

  const handleSelect = (templateId: string) => {
    onSelectTemplate(templateId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Resume Template</h2>
        <p className="text-muted-foreground">
          Preview templates with sample data before you start
        </p>
      </div>

      {/* Family Tabs */}
      <Tabs value={activeFamily} onValueChange={(v) => setActiveFamily(v as TemplateFamily)}>
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          {(Object.keys(familyInfo) as TemplateFamily[]).map((family) => {
            const Icon = familyInfo[family].icon
            return (
              <TabsTrigger key={family} value={family} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{familyInfo[family].title.split(" ")[0]}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {(Object.keys(familyInfo) as TemplateFamily[]).map((family) => (
          <TabsContent key={family} value={family} className="space-y-4 mt-6">
            {/* Family Description */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {(() => {
                    const Icon = familyInfo[family].icon
                    return <Icon className="h-5 w-5 text-primary mt-0.5" />
                  })()}
                  <div>
                    <CardTitle className="text-lg">{familyInfo[family].title}</CardTitle>
                    <CardDescription>{familyInfo[family].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyTemplates.map((template) => {
                const Icon = ICON_MAP[template.icon] || FileText
                const isSelected = selectedTemplate === template.id

                return (
                  <Card
                    key={template.id}
                    className={cn(
                      "group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
                      isSelected && "border-primary shadow-md"
                    )}
                    onClick={() => handleSelect(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <Badge variant={template.family === "professional" ? "default" : "secondary"}>
                          ATS {template.atsScore}
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {template.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      {/* Section Order Preview */}
                      <div className="text-xs text-muted-foreground">
                        <div className="font-medium mb-1">Section Order:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.sectionOrder.slice(0, 4).map((section) => (
                            <Badge key={section} variant="outline" className="text-[10px] px-1.5 py-0">
                              {section}
                            </Badge>
                          ))}
                          {template.sectionOrder.length > 4 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              +{template.sectionOrder.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreview(template)
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        {isSelected && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              onContinue()
                            }}
                          >
                            Continue
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Preview Dialog/Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{previewTemplate.name}</CardTitle>
                  <CardDescription>{previewTemplate.description}</CardDescription>
                </div>
                <Badge>ATS {previewTemplate.atsScore}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                  {/* Template Features */}
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Skills Layout: {previewTemplate.skillsLayout}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {previewTemplate.emphasisMetrics ? "Emphasizes metrics" : "Clean, minimal style"}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {previewTemplate.sectionOrder.length} visible sections
                      </li>
                    </ul>
                  </div>

                  {/* Section Order */}
                  <div>
                    <h4 className="font-medium mb-2">Section Order</h4>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.sectionOrder.map((section, index) => (
                        <Badge key={section} variant="secondary">
                          {index + 1}. {section}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Sample Preview */}
                  <div>
                    <h4 className="font-medium mb-2">Sample Structure</h4>
                    <div className="bg-muted p-4 rounded-lg text-xs font-mono space-y-2">
                      <div className="font-bold">ALEX JOHNSON</div>
                      <div className="text-muted-foreground">alex.johnson@email.com | +91 98765 43210</div>
                      <div className="h-px bg-border my-2"></div>
                      {previewTemplate.sectionOrder.slice(0, 5).map((section) => (
                        <div key={section} className="space-y-1">
                          <div className="font-semibold uppercase">{section}</div>
                          <div className="text-muted-foreground pl-4">
                            {section === "experience" && "• Developed features that improved engagement by 40%"}
                            {section === "projects" && "• Built full-stack platform serving 10,000+ users"}
                            {section === "skills" && "JavaScript, React, Node.js, MongoDB, AWS..."}
                            {section === "education" && "B.Tech Computer Science - IIT Mumbai (8.5 CGPA)"}
                            {section === "summary" && "Passionate engineer with 2+ years experience..."}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPreviewTemplate(null)}
                    >
                      Close
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        handleSelect(previewTemplate.id)
                        setPreviewTemplate(null)
                        onContinue()
                      }}
                    >
                      Use This Template
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Continue Button (Fixed at Bottom) */}
      {selectedTemplate && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Selected:</span>{" "}
              <span className="font-medium">
                {getAllTemplates().find(t => t.id === selectedTemplate)?.name}
              </span>
            </div>
            <Button onClick={onContinue}>
              Continue to Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
