"use client"

import { useMemo } from "react"
import { AlertCircle, CheckCircle2, Info, Lightbulb, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { validateResume, getImprovementSuggestions, type ValidationError } from "@/lib/resume-validator"
import type { ResumeData } from "@/lib/types"

interface ResumeScoreCardProps {
    resumeData: ResumeData
}

export function ResumeScoreCard({ resumeData }: ResumeScoreCardProps) {
    const validation = useMemo(() => validateResume(resumeData), [resumeData])
    const suggestions = useMemo(() => getImprovementSuggestions(resumeData), [resumeData])

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 dark:text-green-400"
        if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
        return "text-red-600 dark:text-red-400"
    }

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Excellent"
        if (score >= 80) return "Great"
        if (score >= 70) return "Good"
        if (score >= 60) return "Fair"
        return "Needs Work"
    }

    return (
        <Card className="sticky top-20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Resume Quality Score
                </CardTitle>
                <CardDescription>
                    Real-time analysis of your resume
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="text-center space-y-2">
                    <div className={`text-5xl font-bold ${getScoreColor(validation.score)}`}>
                        {validation.score}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {getScoreLabel(validation.score)}
                    </div>
                    <Progress value={validation.score} className="h-2" />
                </div>

                <Separator />

                {/* Errors */}
                {validation.errors.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            {validation.errors.length} Error{validation.errors.length > 1 ? "s" : ""}
                        </h4>
                        <div className="space-y-1">
                            {validation.errors.slice(0, 3).map((error, index) => (
                                <div key={index} className="text-xs text-muted-foreground">
                                    • {error.message}
                                </div>
                            ))}
                            {validation.errors.length > 3 && (
                                <div className="text-xs text-muted-foreground italic">
                                    +{validation.errors.length - 3} more
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Warnings */}
                {validation.warnings.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                            <Info className="h-4 w-4" />
                            {validation.warnings.length} Suggestion{validation.warnings.length > 1 ? "s" : ""}
                        </h4>
                        <div className="space-y-1">
                            {validation.warnings.slice(0, 2).map((warning, index) => (
                                <div key={index} className="text-xs text-muted-foreground">
                                    • {warning.message}
                                </div>
                            ))}
                            {validation.warnings.length > 2 && (
                                <div className="text-xs text-muted-foreground italic">
                                    +{validation.warnings.length - 2} more
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* All good */}
                {validation.errors.length === 0 && validation.warnings.length === 0 && (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Looking good!</AlertTitle>
                        <AlertDescription className="text-xs">
                            Your resume meets all quality standards.
                        </AlertDescription>
                    </Alert>
                )}

                <Separator />

                {/* Top Suggestions */}
                {suggestions.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Quick Wins
                        </h4>
                        <div className="space-y-2">
                            {suggestions.slice(0, 3).map((suggestion, index) => (
                                <div key={index} className="text-xs p-2 rounded-md bg-accent/10 text-accent-foreground">
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Score Breakdown */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Score Breakdown</h4>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Completeness</span>
                            <Badge variant="outline" className="text-xs">
                                {validation.errors.length === 0 ? "✓" : "✗"}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Content Quality</span>
                            <Badge variant="outline" className="text-xs">
                                {validation.warnings.length < 5 ? "✓" : "~"}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ATS-Friendly</span>
                            <Badge variant="outline" className="text-xs">✓</Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
