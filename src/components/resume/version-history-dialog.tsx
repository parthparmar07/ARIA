"use client"

import { useState, useEffect } from "react"
import { History, RotateCcw, Clock, Loader2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useResumes } from "@/hooks/use-resumes"
import { useToast } from "@/hooks/use-toast"
import type { ResumeVersion } from "@/lib/types"
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

interface VersionHistoryDialogProps {
    resumeId: string
    currentVersion: number
    onRestore?: () => void
}

export function VersionHistoryDialog({
    resumeId,
    currentVersion,
    onRestore,
}: VersionHistoryDialogProps) {
    const { getVersions, restoreVersion, isLoading } = useResumes()
    const { toast } = useToast()
    const [versions, setVersions] = useState<ResumeVersion[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            loadVersions()
        }
    }, [isOpen])

    const loadVersions = async () => {
        try {
            const data = await getVersions(resumeId)
            setVersions(data)
        } catch (error) {
            console.error("Failed to load versions:", error)
            toast({
                title: "Error",
                description: "Failed to load version history",
                variant: "destructive",
            })
        }
    }

    const handleRestore = async (versionId: string) => {
        try {
            await restoreVersion(resumeId, versionId)
            setRestoreConfirmId(null)
            setIsOpen(false)
            onRestore?.()
            toast({
                title: "Version restored",
                description: "Your resume has been restored to the selected version",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to restore version",
                variant: "destructive",
            })
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <History className="h-4 w-4 mr-2" />
                        Version History
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Version History</DialogTitle>
                        <DialogDescription>
                            View and restore previous versions of your resume
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No version history yet</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Versions are created automatically when you make significant changes
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Version {version.version}</span>
                                            {version.version === currentVersion && (
                                                <Badge variant="default" className="text-xs">
                                                    Current
                                                </Badge>
                                            )}
                                        </div>
                                        {version.description && (
                                            <p className="text-sm text-muted-foreground">{version.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                {formatTimeAgo(new Date(version.createdAt))}
                                            </span>
                                        </div>
                                    </div>

                                    {version.version !== currentVersion && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setRestoreConfirmId(version.id)}
                                        >
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            Restore
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Restore Confirmation Dialog */}
            <AlertDialog open={!!restoreConfirmId} onOpenChange={() => setRestoreConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore this version?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will replace your current resume with the selected version. Your current version
                            will be saved in the history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => restoreConfirmId && handleRestore(restoreConfirmId)}>
                            Restore
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
