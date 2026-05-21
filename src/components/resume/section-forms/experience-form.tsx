"use client"

import { useState } from "react"
import { Briefcase, Plus, Trash2, Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { BulletTemplatePicker } from "@/components/resume/bullet-template-picker"
import type { ResumeData } from "@/lib/types"

interface ExperienceFormProps {
  experience: ResumeData["experience"]
  onAdd: () => void
  onUpdate: (id: string, field: string, value: string | boolean | string[]) => void
  onRemove: (id: string) => void
}

export function ExperienceForm({ experience, onAdd, onUpdate, onRemove }: ExperienceFormProps) {
  const { toast } = useToast()
  const [isImproving, setIsImproving] = useState<string | null>(null)

  const handleImproveWithAI = async (exp: ResumeData["experience"][0]) => {
    if (!exp.description.length || !exp.description[0]) {
      toast({
        title: "No bullets to improve",
        description: "Add some bullet points first",
      })
      return
    }

    setIsImproving(exp.id)
    try {
      const improved = await Promise.all(
        exp.description.map(async (bullet) => {
          if (!bullet.trim()) return bullet

          const response = await fetch('/api/ai/improve-bullet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bullet,
              context: {
                position: exp.position,
                company: exp.company
              }
            })
          })

          if (!response.ok) return bullet
          const data = await response.json()
          return data.improved || bullet
        })
      )

      onUpdate(exp.id, "description", improved)
      toast({
        title: "✨ Bullets improved!",
        description: "Your achievements have been enhanced with AI",
      })
    } catch (error) {
      toast({
        title: "Improvement failed",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsImproving(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" aria-hidden="true" />
            Work Experience
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onAdd}
            aria-label="Add work experience"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {experience.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No experience added yet. Click "Add" to include your work history.
          </p>
        ) : (
          experience.map((exp, index) => (
            <div 
              key={exp.id} 
              className="space-y-4 p-4 border rounded-lg relative"
              role="group"
              aria-label={`Work experience ${index + 1}`}
            >
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => onRemove(exp.id)}
                aria-label={`Remove experience: ${exp.company || 'untitled'}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`company-${exp.id}`}>Company</Label>
                  <Input
                    id={`company-${exp.id}`}
                    placeholder="e.g., Google"
                    value={exp.company}
                    onChange={(e) => onUpdate(exp.id, "company", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`position-${exp.id}`}>Position</Label>
                  <Input
                    id={`position-${exp.id}`}
                    placeholder="e.g., Software Engineer"
                    value={exp.position}
                    onChange={(e) => onUpdate(exp.id, "position", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${exp.id}`}>Start Date</Label>
                  <Input
                    id={`startDate-${exp.id}`}
                    placeholder="e.g., Jan 2023"
                    value={exp.startDate}
                    onChange={(e) => onUpdate(exp.id, "startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                  <Input
                    id={`endDate-${exp.id}`}
                    placeholder="e.g., Present"
                    value={exp.endDate}
                    onChange={(e) => onUpdate(exp.id, "endDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Label htmlFor={`description-${exp.id}`}>Achievements (one per line)</Label>
                  <div className="flex gap-2">
                    <BulletTemplatePicker
                      onSelect={(template) => {
                        const current = exp.description.join("\n")
                        const updated = current ? `${current}\n${template}` : template
                        onUpdate(exp.id, "description", updated.split("\n"))
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleImproveWithAI(exp)}
                      disabled={isImproving === exp.id}
                      aria-label="Improve bullet points with AI"
                    >
                      {isImproving === exp.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                          Improving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
                          Improve with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <Textarea
                  id={`description-${exp.id}`}
                  placeholder={`• Developed React components that improved user engagement by 40%\n• Led a team of 3 developers to deliver project 2 weeks ahead of schedule\n• Reduced API response time from 2s to 200ms using caching`}
                  rows={4}
                  value={exp.description.join("\n")}
                  onChange={(e) => onUpdate(exp.id, "description", e.target.value.split("\n"))}
                  aria-describedby={`description-hint-${exp.id}`}
                />
                <span id={`description-hint-${exp.id}`} className="text-xs text-muted-foreground">
                  Start each bullet with an action verb and include quantifiable results when possible
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
