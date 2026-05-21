"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Achievement } from "@/lib/types"

interface AchievementsFormProps {
    achievements: Achievement[]
    onChange: (achievements: Achievement[]) => void
}

export function AchievementsForm({ achievements, onChange }: AchievementsFormProps) {
    const addItem = () => {
        onChange([
            ...achievements,
            {
                id: `ach-${Date.now()}`,
                title: "",
                issuer: "",
                date: "",
                description: "",
            },
        ])
    }

    const updateItem = (index: number, updates: Partial<Achievement>) => {
        const updated = [...achievements]
        updated[index] = { ...updated[index], ...updates }
        onChange(updated)
    }

    const removeItem = (index: number) => {
        onChange(achievements.filter((_, i) => i !== index))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Achievements</span>
                    <Button size="sm" variant="outline" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {achievements.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Add hackathon wins, competitions, awards, or notable accomplishments
                    </p>
                ) : (
                    achievements.map((item, index) => (
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
                                <Label>Achievement Title</Label>
                                <Input
                                    placeholder="Winner - Smart India Hackathon 2023"
                                    value={item.title}
                                    onChange={(e) => updateItem(index, { title: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <Label>Issuer/Organization</Label>
                                    <Input
                                        placeholder="Ministry of Education, Google, etc."
                                        value={item.issuer || ""}
                                        onChange={(e) => updateItem(index, { issuer: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input
                                        placeholder="March 2023"
                                        value={item.date}
                                        onChange={(e) => updateItem(index, { date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Description (optional)</Label>
                                <Input
                                    placeholder="Led a team of 4 to build an AI-powered accessibility tool"
                                    value={item.description || ""}
                                    onChange={(e) => updateItem(index, { description: e.target.value })}
                                />
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
