"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Publication } from "@/lib/types"

interface PublicationsFormProps {
    publications: Publication[]
    onChange: (publications: Publication[]) => void
}

export function PublicationsForm({ publications, onChange }: PublicationsFormProps) {
    const addItem = () => {
        onChange([
            ...publications,
            {
                id: `pub-${Date.now()}`,
                title: "",
                authors: "",
                venue: "",
                year: "",
                link: "",
                citations: undefined,
            },
        ])
    }

    const updateItem = (index: number, updates: Partial<Publication>) => {
        const updated = [...publications]
        updated[index] = { ...updated[index], ...updates }
        onChange(updated)
    }

    const removeItem = (index: number) => {
        onChange(publications.filter((_, i) => i !== index))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Publications</span>
                    <Button size="sm" variant="outline" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {publications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Add research papers, conference publications, or journal articles
                    </p>
                ) : (
                    publications.map((item, index) => (
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

                            <div>
                                <Label>Paper Title</Label>
                                <Input
                                    placeholder="Deep Learning for Medical Image Segmentation"
                                    value={item.title}
                                    onChange={(e) => updateItem(index, { title: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Authors</Label>
                                <Input
                                    placeholder="J. Doe, A. Smith, B. Johnson"
                                    value={item.authors}
                                    onChange={(e) => updateItem(index, { authors: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <Label>Conference/Journal</Label>
                                    <Input
                                        placeholder="IEEE CVPR 2024"
                                        value={item.venue}
                                        onChange={(e) => updateItem(index, { venue: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Year</Label>
                                    <Input
                                        placeholder="2024"
                                        value={item.year}
                                        onChange={(e) => updateItem(index, { year: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <Label>Link (optional)</Label>
                                    <Input
                                        placeholder="https://arxiv.org/abs/..."
                                        value={item.link || ""}
                                        onChange={(e) => updateItem(index, { link: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Citations (optional)</Label>
                                    <Input
                                        type="number"
                                        placeholder="25"
                                        value={item.citations || ""}
                                        onChange={(e) => updateItem(index, { citations: parseInt(e.target.value) || undefined })}
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
