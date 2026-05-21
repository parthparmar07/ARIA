"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Copy } from "lucide-react"
import { BULLET_TEMPLATES, BULLET_EXAMPLES } from "@/lib/bullet-templates"

interface BulletTemplatePickerProps {
    onSelect: (template: string) => void
}

export function BulletTemplatePicker({ onSelect }: BulletTemplatePickerProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
            >
                <Lightbulb className="h-4 w-4 mr-2" />
                Use Template
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Bullet Point Templates</DialogTitle>
                        <DialogDescription>
                            Choose a template and fill in the blanks with your specific details
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="achievement" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="achievement">Achievement</TabsTrigger>
                            <TabsTrigger value="optimization">Optimization</TabsTrigger>
                            <TabsTrigger value="leadership">Leadership</TabsTrigger>
                            <TabsTrigger value="technical">Technical</TabsTrigger>
                            <TabsTrigger value="research">Research</TabsTrigger>
                        </TabsList>

                        {Object.entries(BULLET_TEMPLATES).map(([category, templates]) => (
                            <TabsContent key={category} value={category} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-muted-foreground">Templates:</h4>
                                    <div className="space-y-2">
                                        {templates.map((template, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/5"
                                                onClick={() => {
                                                    onSelect(template)
                                                    setOpen(false)
                                                }}
                                            >
                                                <div className="flex items-start gap-2 w-full">
                                                    <Copy className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                                    <span className="text-sm">{template}</span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 border-t pt-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground">Examples:</h4>
                                    <div className="space-y-2">
                                        {BULLET_EXAMPLES[category as keyof typeof BULLET_EXAMPLES].map((example, index) => (
                                            <div
                                                key={index}
                                                className="text-sm bg-muted/50 p-3 rounded-lg border border-muted"
                                            >
                                                <p className="text-foreground">{example}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    )
}
