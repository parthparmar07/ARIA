"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Edit, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/hooks/use-auth"
import { generateConfiguredResume as generateResumeLatex } from "@/lib/resume-generator-v2"
import type { ResumeData } from "@/lib/types"

interface OpenInEditorButtonProps {
    resumeData: ResumeData
    className?: string
}

export function OpenInEditorButton({ resumeData, className }: OpenInEditorButtonProps) {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleOpenInEditor = async () => {
        setIsLoading(true)

        try {
            // Generate LaTeX from resume data
            const latex = generateResumeLatex(resumeData, true) // true = no watermark for editing

            // Get auth headers for authenticated API call
            const authHeaders = await getAuthHeaders()

            // Create a new project with this LaTeX
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders,
                },
                body: JSON.stringify({
                    name: `Resume - ${resumeData.personalInfo.fullName || "Untitled"}`,
                    description: "Resume created from Resume Builder",
                    templateContent: latex,
                }),
            })

            const result = await response.json()

            if (result.success && result.data?.id) {
                toast({
                    title: "Opening in Editor",
                    description: "Your resume LaTeX is ready for editing",
                })

                // Navigate to editor
                navigate(`/editor/${result.data.id}`)
            } else {
                // Fallback: Copy LaTeX to clipboard and navigate to new editor
                await navigator.clipboard.writeText(latex)
                toast({
                    title: "LaTeX Copied",
                    description: "Paste it in the editor to start editing",
                })
                navigate("/editor/new")
            }
        } catch (error) {
            console.error("Failed to open in editor:", error)

            // Fallback: Just copy the LaTeX
            try {
                const latex = generateResumeLatex(resumeData, true)
                await navigator.clipboard.writeText(latex)
                toast({
                    title: "LaTeX Copied",
                    description: "Paste it in the editor to start editing",
                })
                navigate("/editor/new")
            } catch {
                toast({
                    title: "Error",
                    description: "Failed to open in editor",
                    variant: "destructive",
                })
            }
        } finally {
            setIsLoading(false)
            setIsOpen(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={className}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit in LaTeX Editor
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Open in LaTeX Editor</DialogTitle>
                    <DialogDescription>
                        This will convert your resume to LaTeX and open it in the full Paperly editor where you
                        can:
                    </DialogDescription>
                </DialogHeader>

                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Fine-tune spacing and formatting</li>
                    <li>Add custom LaTeX sections</li>
                    <li>Use AI assistance for improvements</li>
                    <li>Access advanced LaTeX features</li>
                </ul>

                <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-sm">
                    <p className="text-amber-800 dark:text-amber-200">
                        <strong>Note:</strong> Changes made in the LaTeX editor won&apos;t sync back to the
                        Resume Builder. This is a one-way export for power users.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleOpenInEditor} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Opening...
                            </>
                        ) : (
                            <>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Editor
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
