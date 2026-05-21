"use client"

import { useState, useEffect } from "react"
import { FileText, Trash2, Edit, Share2, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useResumes } from "@/hooks/use-resumes"
import { useAuth } from "@/hooks/use-auth"
import type { ResumeDocument } from "@/lib/types"
// Simple time ago formatter
const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks}w ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
}

interface ResumeListModalProps {
    onSelectResume?: (resume: ResumeDocument) => void
    trigger?: React.ReactNode
}

export function ResumeListModal({ onSelectResume, trigger }: ResumeListModalProps) {
    const { user } = useAuth()
    const { getUserResumes, deleteResume, isLoading } = useResumes()
    const [resumes, setResumes] = useState<ResumeDocument[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && user) {
            loadResumes()
        }
    }, [isOpen, user])

    const loadResumes = async () => {
        try {
            const data = await getUserResumes()
            setResumes(data)
        } catch (error) {
            console.error("Failed to load resumes:", error)
        }
    }

    const handleDelete = async (resumeId: string) => {
        try {
            await deleteResume(resumeId)
            setResumes((prev) => prev.filter((r) => r.id !== resumeId))
            setDeleteConfirmId(null)
        } catch (error) {
            console.error("Failed to delete resume:", error)
        }
    }

    const handleSelect = (resume: ResumeDocument) => {
        onSelectResume?.(resume)
        setIsOpen(false)
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            My Resumes
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>My Resumes</DialogTitle>
                        <DialogDescription>Select a resume to edit or manage your saved resumes</DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No saved resumes yet</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Create your first resume to get started
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {resumes.map((resume) => (
                                <Card
                                    key={resume.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleSelect(resume)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{resume.name}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {resume.personalInfo.fullName || "Untitled"}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="secondary" className="ml-2">
                                                {resume.template}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                Updated {formatTimeAgo(new Date(resume.updatedAt))}
                                            </span>
                                        </div>

                                        {resume.isPublic && resume.shareId && (
                                            <div className="flex items-center gap-2">
                                                <Share2 className="h-4 w-4 text-primary" />
                                                <span className="text-sm text-primary">Publicly shared</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleSelect(resume)
                                                }}
                                            >
                                                <Edit className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDeleteConfirmId(resume.id)
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your resume and all its
                            versions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
