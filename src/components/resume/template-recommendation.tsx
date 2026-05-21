"use client"

import { useMemo } from "react"
import { Sparkles, Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { recommendTemplate, getAllTemplateRecommendations } from "@/lib/resume-recommender"
import type { ResumeData, ResumeTemplate } from "@/lib/types"

interface TemplateRecommendationProps {
    resumeData: ResumeData
    currentTemplate: ResumeTemplate
    onSelectTemplate: (template: ResumeTemplate) => void
}

export function TemplateRecommendation({
    resumeData,
    currentTemplate,
    onSelectTemplate
}: TemplateRecommendationProps) {
    const topRecommendation = useMemo(() => recommendTemplate(resumeData), [resumeData])
    const allRecommendations = useMemo(() => getAllTemplateRecommendations(resumeData), [resumeData])

    const isUsingRecommended = currentTemplate === topRecommendation.template

    return (
        <div className="space-y-4">
            {/* Top Recommendation Alert */}
            {!isUsingRecommended && topRecommendation.confidence > 0.7 && (
                <Alert className="border-accent">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <AlertTitle>Recommended Template</AlertTitle>
                    <AlertDescription className="space-y-2">
                        <p className="text-sm">
                            Based on your profile, we recommend the <strong>{topRecommendation.template}</strong> template.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {topRecommendation.reason}
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSelectTemplate(topRecommendation.template)}
                            className="mt-2"
                        >
                            Switch to {topRecommendation.template}
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* All Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Template Recommendations</CardTitle>
                    <CardDescription>
                        AI-powered suggestions based on your experience and field
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {allRecommendations.map((rec) => {
                        const isSelected = currentTemplate === rec.template
                        const confidencePercent = Math.round(rec.confidence * 100)

                        return (
                            <div
                                key={rec.template}
                                className={`p-3 rounded-lg border transition-all ${isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold capitalize text-sm">
                                                {rec.template}
                                            </h4>
                                            {isSelected && (
                                                <Badge variant="default" className="text-xs">
                                                    Current
                                                </Badge>
                                            )}
                                            <Badge
                                                variant={confidencePercent >= 80 ? "default" : "secondary"}
                                                className="text-xs"
                                            >
                                                {confidencePercent}% match
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {rec.reason}
                                        </p>

                                        {/* Pros and Cons */}
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {rec.pros.length > 0 && (
                                                <div className="space-y-1">
                                                    <div className="text-xs font-medium text-green-600 dark:text-green-400">
                                                        Pros:
                                                    </div>
                                                    {rec.pros.slice(0, 2).map((pro, idx) => (
                                                        <div key={idx} className="flex items-start gap-1 text-xs text-muted-foreground">
                                                            <Check className="h-3 w-3 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                                            <span>{pro}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {rec.cons.length > 0 && (
                                                <div className="space-y-1">
                                                    <div className="text-xs font-medium text-red-600 dark:text-red-400">
                                                        Cons:
                                                    </div>
                                                    {rec.cons.slice(0, 2).map((con, idx) => (
                                                        <div key={idx} className="flex items-start gap-1 text-xs text-muted-foreground">
                                                            <X className="h-3 w-3 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                                            <span>{con}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!isSelected && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onSelectTemplate(rec.template)}
                                            className="shrink-0"
                                        >
                                            Use
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}
