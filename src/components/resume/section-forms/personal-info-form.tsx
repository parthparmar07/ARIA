"use client"

import { User, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ResumeData } from "@/lib/types"

interface PersonalInfoFormProps {
  personalInfo: ResumeData["personalInfo"]
  onUpdate: (field: string, value: string) => void
}

// Email validation helper
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function PersonalInfoForm({ personalInfo, onUpdate }: PersonalInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" aria-hidden="true" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <div className="relative">
              <Input
                id="fullName"
                placeholder="e.g., John Doe"
                value={personalInfo.fullName}
                onChange={(e) => onUpdate("fullName", e.target.value)}
                className="pr-10"
                aria-required="true"
                aria-describedby="fullName-status"
              />
              {personalInfo.fullName && (
                <CheckCircle2 
                  className="absolute right-3 top-3 h-4 w-4 text-green-500" 
                  aria-hidden="true"
                />
              )}
              <span id="fullName-status" className="sr-only">
                {personalInfo.fullName ? "Valid name entered" : "Name is required"}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="e.g., john.doe@email.com"
                value={personalInfo.email}
                onChange={(e) => onUpdate("email", e.target.value)}
                className="pr-10"
                aria-required="true"
                aria-invalid={personalInfo.email ? !isValidEmail(personalInfo.email) : undefined}
                aria-describedby="email-status"
              />
              {isValidEmail(personalInfo.email) && (
                <CheckCircle2 
                  className="absolute right-3 top-3 h-4 w-4 text-green-500" 
                  aria-hidden="true"
                />
              )}
              <span id="email-status" className="sr-only">
                {isValidEmail(personalInfo.email) ? "Valid email entered" : "Please enter a valid email"}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., +91 98765 43210"
              value={personalInfo.phone}
              onChange={(e) => onUpdate("phone", e.target.value)}
              aria-describedby="phone-hint"
            />
            <span id="phone-hint" className="sr-only">
              Include country code for international formats
            </span>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Mumbai, India"
              value={personalInfo.location}
              onChange={(e) => onUpdate("location", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="e.g., linkedin.com/in/johndoe"
              value={personalInfo.linkedin}
              onChange={(e) => onUpdate("linkedin", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              type="url"
              placeholder="e.g., github.com/johndoe"
              value={personalInfo.github}
              onChange={(e) => onUpdate("github", e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary (Optional)</Label>
          <Textarea
            id="summary"
            placeholder="e.g., Passionate software engineer with 2+ years of experience building scalable web applications..."
            rows={3}
            value={personalInfo.summary}
            onChange={(e) => onUpdate("summary", e.target.value)}
            aria-describedby="summary-hint"
          />
          <span id="summary-hint" className="text-xs text-muted-foreground">
            2-3 sentences highlighting your key skills and experience
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
