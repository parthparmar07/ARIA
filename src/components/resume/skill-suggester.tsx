"use client"

import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Plus, Sparkles } from "lucide-react"
import { getSuggestedSkills } from "@/lib/skill-suggestions"

interface SkillSuggesterProps {
  currentSkills: string[]
  onAddSkill: (skill: string) => void
}

export function SkillSuggester({ currentSkills, onAddSkill }: SkillSuggesterProps) {
  const suggestedSkills = getSuggestedSkills(currentSkills)

  if (suggestedSkills.length === 0) {
    return null
  }

  return (
    <div className="space-y-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <Label className="text-sm font-semibold">
          Suggested Skills
        </Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Based on your current skills, you might want to add:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestedSkills.map((skill) => (
          <Badge
            key={skill}
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onAddSkill(skill)}
          >
            {skill}
            <Plus className="h-3 w-3 ml-1" />
          </Badge>
        ))}
      </div>
    </div>
  )
}
