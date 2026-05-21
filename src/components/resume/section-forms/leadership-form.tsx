"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Leadership } from "@/lib/types"

interface LeadershipFormProps {
    leadership: Leadership[]
    onChange: (leadership: Leadership[]) => void
}

export function LeadershipForm({ leadership, onChange }: LeadershipFormProps) {
    const addItem = () => {
        onChange([
            ...leadership,
            {
                id: `lead-${Date.now()}`,
                role: "",
                organization: "",
                duration: "",
                description: [],
            },
        ])
    }

    const updateItem = (index: number, updates: Partial<Leadership>) => {
        const updated = [...leadership]
        updated[index] = { ...updated[index], ...updates }
        onChange(updated)
    }

    const removeItem = (index: number) => {
        onChange(leadership.filter((_, i) => i !== index))
    }

    const updateBullet = (itemIndex: number, bulletIndex: number, value: string) => {
        const updated = [...leadership]
        const bullets = [...(updated[itemIndex].description || [])]
        bullets[bulletIndex] = value
        updated[itemIndex] = { ...updated[itemIndex], description: bullets }
        onChange(updated)
    }

    const addBullet = (itemIndex: number) => {
        const updated = [...leadership]
        const bullets = [...(updated[itemIndex].description || []), ""]
        updated[itemIndex] = { ...updated[itemIndex], description: bullets }
        onChange(updated)
    }

    const removeBullet = (itemIndex: number, bulletIndex: number) => {
        const updated = [...leadership]
        const bullets = (updated[itemIndex].description || []).filter((_, i) => i !== bulletIndex)
        updated[itemIndex] = { ...updated[itemIndex], description: bullets }
        onChange(updated)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Leadership & Activities</span>
                    <Button size="sm" variant="outline" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {leadership.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Add your leadership roles, club activities, or volunteer work
                    </p>
                ) : (
                    leadership.map((item, index) => (
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
                                    <Label>Role/Position</Label>
                                    <Input
                                        placeholder="President, Core Member, etc."
                                        value={item.role}
                                        onChange={(e) => updateItem(index, { role: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Organization</Label>
                                    <Input
                                        placeholder="IEEE, GDG, NSS, etc."
                                        value={item.organization}
                                        onChange={(e) => updateItem(index, { organization: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Duration</Label>
                                <Input
                                    placeholder="2022-2023"
                                    value={item.duration}
                                    onChange={(e) => updateItem(index, { duration: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label className="flex items-center justify-between">
                                    <span>Key Contributions</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => addBullet(index)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Add Point
                                    </Button>
                                </Label>
                                {(item.description || []).map((bullet, bulletIndex) => (
                                    <div key={bulletIndex} className="flex gap-2 mt-2">
                                        <Input
                                            placeholder="Organized tech talks with 100+ attendees..."
                                            value={bullet}
                                            onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeBullet(index, bulletIndex)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
