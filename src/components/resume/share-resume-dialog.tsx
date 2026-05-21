"use client"

import { useState } from "react"
import { Share2, Copy, Check, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useResumes } from "@/hooks/use-resumes"
import { useToast } from "@/hooks/use-toast"

interface ShareResumeDialogProps {
    resumeId: string
    isPublic: boolean
    shareId?: string
    onShareToggle?: (isPublic: boolean, shareId?: string) => void
}

export function ShareResumeDialog({
    resumeId,
    isPublic: initialIsPublic,
    shareId: initialShareId,
    onShareToggle,
}: ShareResumeDialogProps) {
    const { createShareLink, revokeShareLink, isLoading } = useResumes()
    const { toast } = useToast()
    const [isPublic, setIsPublic] = useState(initialIsPublic)
    const [shareId, setShareId] = useState(initialShareId)
    const [copied, setCopied] = useState(false)

    const shareUrl = shareId
        ? `${window.location.origin}/share/${shareId}`
        : ""

    const handleToggleSharing = async (enabled: boolean) => {
        try {
            if (enabled) {
                const result = await createShareLink(resumeId)
                setShareId(result.shareId)
                setIsPublic(true)
                onShareToggle?.(true, result.shareId)
                toast({
                    title: "Sharing enabled",
                    description: "Your resume is now publicly accessible",
                })
            } else {
                await revokeShareLink(resumeId)
                setIsPublic(false)
                onShareToggle?.(false)
                toast({
                    title: "Sharing disabled",
                    description: "Your resume is no longer publicly accessible",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update sharing settings",
                variant: "destructive",
            })
        }
    }

    const handleCopyLink = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast({
                title: "Link copied",
                description: "Share link copied to clipboard",
            })
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Resume</DialogTitle>
                    <DialogDescription>
                        Create a public link to share your resume with anyone
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="sharing-toggle">Public sharing</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow anyone with the link to view your resume
                            </p>
                        </div>
                        <Switch
                            id="sharing-toggle"
                            checked={isPublic}
                            onCheckedChange={handleToggleSharing}
                            disabled={isLoading}
                        />
                    </div>

                    {isPublic && shareUrl && (
                        <div className="space-y-2">
                            <Label htmlFor="share-link">Share link</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="share-link"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1"
                                />
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={handleCopyLink}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => window.open(shareUrl, "_blank")}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Anyone with this link can view your resume
                            </p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
