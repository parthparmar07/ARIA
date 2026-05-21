"use client"

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import type { ResumeTemplate } from "@/lib/types"
import { getTemplateConfig } from "@/lib/template-config"

interface TemplateSwitchDialogProps {
    isOpen: boolean
    onClose: () => void
    currentTemplate: ResumeTemplate
    newTemplate: ResumeTemplate
    onConfirm: () => void
}

export function TemplateSwitchDialog({
    isOpen,
    onClose,
    currentTemplate,
    newTemplate,
    onConfirm,
}: TemplateSwitchDialogProps) {
    const currentConfig = getTemplateConfig(currentTemplate)
    const newConfig = getTemplateConfig(newTemplate)

    // Find sections that will be hidden
    const sectionsThatWillHide = newConfig.hiddenSections.filter(
        section => !currentConfig.hiddenSections.includes(section)
    )

    const hasHiddenSections = sectionsThatWillHide.length > 0

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {hasHiddenSections && (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                        Switch Template?
                    </DialogTitle>
                </DialogHeader>

                <div className="text-sm text-muted-foreground">
                    {hasHiddenSections ? (
                        <>
                            <span>
                                Switching from <strong>{currentConfig.name}</strong> to{" "}
                                <strong>{newConfig.name}</strong> will hide some sections by default.
                            </span>
                            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                                    Sections that will be hidden:
                                </div>
                                <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside">
                                    {sectionsThatWillHide.map(section => (
                                        <li key={section} className="capitalize">
                                            {section.replace(/([A-Z])/g, ' $1').trim()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-3 text-sm">
                                Your data <strong>won{"'"}t be deleted</strong>. You can re-enable these sections from the toggle panel.
                            </div>
                        </>
                    ) : (
                        <span>
                            Switch from <strong>{currentConfig.name}</strong> to{" "}
                            <strong>{newConfig.name}</strong>? This will change the layout and section order.
                        </span>
                    )}
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        onConfirm()
                        onClose()
                    }}>
                        Switch Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
