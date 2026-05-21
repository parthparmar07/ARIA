"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OpenSourceContribution } from "@/lib/types"

interface OpenSourceFormProps {
    openSource: OpenSourceContribution[]
    onChange: (openSource: OpenSourceContribution[]) => void
}

export function OpenSourceForm({ openSource, onChange }: OpenSourceFormProps) {
    const addItem = () => {
        onChange([
            ...openSource,
            {
                id: `os-${Date.now()}`,
                project: "",
                role: "",
                contributions: "",
                link: "",
                stars: undefined,
            },
        ])
    }

    const updateItem = (index: number, updates: Partial<OpenSourceContribution>) => {
        const updated = [...openSource]
        updated[index] = { ...updated[index], ...updates }
        onChange(updated)
    }

    const removeItem = (index: number) => {
        onChange(openSource.filter((_, i) => i !== index))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Open Source Contributions</span>
                    <Button size="sm" variant="outline" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {openSource.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Add your contributions to open source projects
                    </p>
                ) : (
                    openSource.map((item, index) => (
                        <div key={item.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-end">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <Label>Project Name</Label>
                                    <Input
                                        placeholder="TensorFlow, React, etc."
                                        value={item.project}
                                        onChange={(e) => updateItem(index, { project: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Your Role</Label>
                                    <Input
                                        placeholder="Contributor, Maintainer, etc."
                                        value={item.role}
                                        onChange={(e) => updateItem(index, { role: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Contributions</Label>
                                <Input
                                    placeholder="Fixed memory leak in GPU backend, added TypeScript support"
                                    value={item.contributions}
                                    onChange={(e) => updateItem(index, { contributions: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <Label>Repository Link (optional)</Label>
                                    <Input
                                        placeholder="https://github.com/..."
                                        value={item.link || ""}
                                        onChange={(e) => updateItem(index, { link: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Stars (optional)</Label>
                                    <Input
                                        type="number"
                                        placeholder="500"
                                        value={item.stars || ""}
                                        onChange={(e) => updateItem(index, { stars: parseInt(e.target.value) || undefined })}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
