"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  FileDown,
  RefreshCw,
  Lightbulb,
  X
} from "lucide-react"
import { getPDFErrorSolution } from "@/lib/resume-form-utils"

interface PDFErrorDisplayProps {
  error: string
  onRetry?: () => void
  onDismiss?: () => void
  onDownloadJSON?: () => void
}

export function PDFErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss,
  onDownloadJSON 
}: PDFErrorDisplayProps) {
  const solution = getPDFErrorSolution(error)
  
  const Icon = {
    alert: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[solution.icon]

  const variant = {
    alert: "destructive",
    warning: "default",
    info: "default",
  }[solution.icon] as "destructive" | "default"

  return (
    <Card className={`border-2 ${
      solution.icon === "alert" ? "border-destructive/50 bg-destructive/5" :
      solution.icon === "warning" ? "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20" :
      "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20"
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className={`h-5 w-5 mt-0.5 ${
              solution.icon === "alert" ? "text-destructive" :
              solution.icon === "warning" ? "text-yellow-600 dark:text-yellow-400" :
              "text-blue-600 dark:text-blue-400"
            }`} />
            <div>
              <CardTitle className="text-lg">{solution.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {solution.message}
              </p>
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Solutions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">How to Fix This</h4>
          </div>
          <ul className="space-y-2">
            {solution.solutions.map((sol, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>{sol}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {onRetry && (
            <Button onClick={onRetry} size="sm">
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          )}
          {onDownloadJSON && (
            <Button variant="outline" onClick={onDownloadJSON} size="sm">
              <FileDown className="h-3 w-3 mr-2" />
              Download Backup (JSON)
            </Button>
          )}
        </div>

        {/* Technical Error */}
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Technical Details
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
            {error}
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}

interface SuccessFeedbackProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function SuccessFeedback({ message, action }: SuccessFeedbackProps) {
  return (
    <Alert variant="default" className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertTitle className="text-green-800 dark:text-green-200">Success!</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span className="text-green-700 dark:text-green-300">{message}</span>
        {action && (
          <Button variant="outline" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
