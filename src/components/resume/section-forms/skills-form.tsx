"use client"

import { Award, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkillSuggester } from "@/components/resume/skill-suggester"
import type { ResumeData } from "@/lib/types"

interface SkillsFormProps {
  skills: ResumeData["skills"]
  onAddSkill: (skill: string) => void
  onRemoveSkill: (index: number) => void
}

export function SkillsForm({ skills, onAddSkill, onRemoveSkill }: SkillsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" aria-hidden="true" />
          Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form 
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const input = form.elements.namedItem('skillInput') as HTMLInputElement
            if (input.value.trim()) {
              onAddSkill(input.value.trim())
              input.value = ''
            }
          }}
        >
          <Input
            name="skillInput"
            placeholder="e.g., Python, React, AWS"
            aria-label="Enter a skill"
          />
          <Button type="submit" aria-label="Add skill">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
        
        <div 
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="Added skills"
        >
          {skills.technical.map((skill, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="px-3 py-1"
              role="listitem"
            >
              {skill}
              <button
                onClick={() => onRemoveSkill(index)}
                className="ml-2 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </Badge>
          ))}
          {skills.technical.length === 0 && (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>

        {/* Skill Suggester */}
        {skills.technical.length > 0 && (
          <SkillSuggester
            currentSkills={skills.technical}
            onAddSkill={onAddSkill}
          />
        )}
      </CardContent>
    </Card>
  )
}
