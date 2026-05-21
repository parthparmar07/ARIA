"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react"
import { getErrorHelpText } from "@/lib/resume-validation-schema"

interface ErrorDisplayProps {
  error: string | null
  onDismiss?: () => void
  onRetry?: () => void
}

export function ErrorDisplay({ error, onDismiss, onRetry }: ErrorDisplayProps) {
  if (!error) return null

  const helpText = getErrorHelpText(error)

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{helpText}</p>
        <div className="flex gap-2 mt-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}

interface WarningDisplayProps {
  warnings: string[]
  onDismiss?: () => void
}

export function WarningDisplay({ warnings, onDismiss }: WarningDisplayProps) {
  if (warnings.length === 0) return null

  return (
    <Alert variant="default" className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">Suggestions</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        <ul className="list-disc pl-4 space-y-1">
          {warnings.map((warning, index) => (
            <li key={index}>{warning}</li>
          ))}
        </ul>
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}

interface SuccessDisplayProps {
  message: string
  onDismiss?: () => void
}

export function SuccessDisplay({ message, onDismiss }: SuccessDisplayProps) {
  return (
    <Alert variant="default" className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertTitle className="text-green-800 dark:text-green-200">Success</AlertTitle>
      <AlertDescription className="text-green-700 dark:text-green-300">
        {message}
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}

interface LoadingStateProps {
  stage: "compiling" | "rendering" | "optimizing" | "uploading" | "saving"
  progress?: number
  message?: string
}

export function LoadingState({ stage, progress, message }: LoadingStateProps) {
  const stageInfo = {
    compiling: { label: "Compiling LaTeX", icon: Loader2, description: "Processing your resume structure..." },
    rendering: { label: "Rendering PDF", icon: Loader2, description: "Creating beautiful document..." },
    optimizing: { label: "Optimizing", icon: Loader2, description: "Finalizing your resume..." },
    uploading: { label: "Uploading", icon: Loader2, description: "Saving to cloud..." },
    saving: { label: "Saving", icon: Loader2, description: "Persisting your changes..." },
  }

  const info = stageInfo[stage]
  const Icon = info.icon

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Icon className="h-6 w-6 animate-spin text-primary" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{info.label}</h4>
              {progress !== undefined && (
                <span className="text-sm text-muted-foreground">{progress}%</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {message || info.description}
            </p>
            {progress !== undefined && (
              <Progress value={progress} className="h-2" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ValidationFeedbackProps {
  field: string
  error?: string
  warning?: string
}

export function ValidationFeedback({ field, error, warning }: ValidationFeedbackProps) {
  if (!error && !warning) return null

  return (
    <div className="flex items-start gap-2 mt-1">
      {error && (
        <>
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </>
      )}
      {!error && warning && (
        <>
          <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-600 dark:text-yellow-400">{warning}</p>
        </>
      )}
    </div>
  )
}

interface FormValidationSummaryProps {
  errors: string[]
  warnings: string[]
  completeness: number
}

export function FormValidationSummary({ errors, warnings, completeness }: FormValidationSummaryProps) {
  return (
    <Card className="sticky top-4">
      <CardContent className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Resume Completeness</h4>
            <span className="text-sm font-bold">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
        </div>

        {errors.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.length} Error{errors.length !== 1 && "s"}
            </h5>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-xs text-destructive flex items-start gap-1">
                  <span className="shrink-0">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {warnings.length} Suggestion{warnings.length !== 1 && "s"}
            </h5>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-1">
                  <span className="shrink-0">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {errors.length === 0 && warnings.length === 0 && completeness === 100 && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-sm font-medium">Resume looks great!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
