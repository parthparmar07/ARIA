"use client"

import { GraduationCap, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { ResumeData } from "@/lib/types"

interface EducationFormProps {
  education: ResumeData["education"]
  onAdd: () => void
  onUpdate: (id: string, field: string, value: string) => void
  onRemove: (id: string) => void
}

export function EducationForm({ education, onAdd, onUpdate, onRemove }: EducationFormProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
            Education
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onAdd}
            aria-label="Add education entry"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.map((edu, index) => (
          <div 
            key={edu.id} 
            className="space-y-4 p-4 border rounded-lg relative"
            role="group"
            aria-label={`Education entry ${index + 1}`}
          >
            {education.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => onRemove(edu.id)}
                aria-label={`Remove education entry: ${edu.institution || 'untitled'}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                <Input
                  id={`institution-${edu.id}`}
                  placeholder="e.g., IIT Mumbai"
                  value={edu.institution}
                  onChange={(e) => onUpdate(edu.id, "institution", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                <Input
                  id={`degree-${edu.id}`}
                  placeholder="e.g., B.Tech, M.Sc"
                  value={edu.degree}
                  onChange={(e) => onUpdate(edu.id, "degree", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`field-${edu.id}`}>Field of Study</Label>
                <Input
                  id={`field-${edu.id}`}
                  placeholder="e.g., Computer Science"
                  value={edu.field}
                  onChange={(e) => onUpdate(edu.id, "field", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${edu.id}`}>Graduation Year</Label>
                <Input
                  id={`endDate-${edu.id}`}
                  placeholder="e.g., 2024"
                  value={edu.endDate}
                  onChange={(e) => onUpdate(edu.id, "endDate", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
