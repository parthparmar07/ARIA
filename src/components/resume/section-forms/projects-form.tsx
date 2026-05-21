"use client"

import { Code, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { ResumeData } from "@/lib/types"

interface ProjectsFormProps {
  projects: ResumeData["projects"]
  onAdd: () => void
  onUpdate: (id: string, field: string, value: string | string[]) => void
  onRemove: (id: string) => void
}

export function ProjectsForm({ projects, onAdd, onUpdate, onRemove }: ProjectsFormProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" aria-hidden="true" />
            Projects
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onAdd}
            aria-label="Add project"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No projects added yet. Showcase your work!
          </p>
        ) : (
          projects.map((proj, index) => (
            <div 
              key={proj.id} 
              className="space-y-4 p-4 border rounded-lg relative"
              role="group"
              aria-label={`Project ${index + 1}`}
            >
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => onRemove(proj.id)}
                aria-label={`Remove project: ${proj.name || 'untitled'}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`projectName-${proj.id}`}>Project Name</Label>
                  <Input
                    id={`projectName-${proj.id}`}
                    placeholder="e.g., E-Commerce Platform"
                    value={proj.name}
                    onChange={(e) => onUpdate(proj.id, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`projectDesc-${proj.id}`}>Description</Label>
                  <Textarea
                    id={`projectDesc-${proj.id}`}
                    placeholder="e.g., Built a full-stack e-commerce platform with payment integration, serving 10,000+ users"
                    rows={2}
                    value={proj.description}
                    onChange={(e) => onUpdate(proj.id, "description", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`projectTech-${proj.id}`}>Technologies (comma-separated)</Label>
                  <Input
                    id={`projectTech-${proj.id}`}
                    placeholder="e.g., React, Node.js, MongoDB, AWS"
                    value={proj.technologies.join(", ")}
                    onChange={(e) => onUpdate(proj.id, "technologies", e.target.value.split(",").map(t => t.trim()))}
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
