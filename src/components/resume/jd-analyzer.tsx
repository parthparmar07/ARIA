"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  Loader2,
  Target,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Code,
  Copy,
  Check
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ResumeData } from "@/lib/types"

interface JDAnalyzerProps {
  resumeData: Omit<ResumeData, "id" | "createdAt" | "updatedAt">
  onSuggestSkill?: (skill: string) => void
  onSuggestBullet?: (bullet: string, section: "experience" | "projects") => void
}

interface AnalysisResult {
  matchScore: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: {
    category: "skill" | "experience" | "education" | "general"
    text: string
    priority: "high" | "medium" | "low"
  }[]
  skillGaps: string[]
  experienceMatch: number
  educationMatch: number
  keywordDensity: number
}

// Common technical keywords by category
const KEYWORD_CATEGORIES = {
  programming: ["python", "javascript", "java", "c++", "typescript", "go", "rust", "ruby", "php", "swift", "kotlin", "scala"],
  frameworks: ["react", "angular", "vue", "next.js", "node.js", "django", "flask", "spring", "express", "fastapi", "rails"],
  databases: ["sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "dynamodb", "firebase", "oracle", "cassandra"],
  cloud: ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "ci/cd", "devops", "microservices"],
  ml: ["machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "data science", "ai", "neural network"],
  soft: ["leadership", "communication", "teamwork", "agile", "scrum", "problem-solving", "collaboration", "mentoring"]
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase()
  const allKeywords: string[] = []
  
  // Extract from predefined categories
  Object.values(KEYWORD_CATEGORIES).forEach(keywords => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        allKeywords.push(keyword)
      }
    })
  })
  
  // Extract years of experience patterns
  const experiencePattern = /(\d+)\+?\s*(?:years?|yrs?)/gi
  const matches = text.match(experiencePattern)
  if (matches) {
    allKeywords.push(...matches.map(m => m.toLowerCase()))
  }
  
  // Extract degree requirements
  const degreePatterns = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.e", "m.e", "bsc", "msc", "mba"]
  degreePatterns.forEach(degree => {
    if (lowerText.includes(degree)) {
      allKeywords.push(degree)
    }
  })
  
  return [...new Set(allKeywords)]
}

// Get resume keywords from all sections
function getResumeKeywords(resumeData: JDAnalyzerProps["resumeData"]): string[] {
  const keywords: string[] = []
  
  // Skills (technical and soft)
  resumeData.skills.technical.forEach(skill => {
    keywords.push(skill.toLowerCase())
  })
  resumeData.skills.soft.forEach(skill => {
    keywords.push(skill.toLowerCase())
  })
  
  // Experience descriptions
  resumeData.experience.forEach(exp => {
    exp.description.forEach(desc => {
      extractKeywords(desc).forEach(k => keywords.push(k))
    })
    keywords.push(exp.position.toLowerCase())
  })
  
  // Projects
  resumeData.projects.forEach(proj => {
    keywords.push(...proj.technologies.map(t => t.toLowerCase()))
    extractKeywords(proj.description).forEach(k => keywords.push(k))
  })
  
  // Education
  resumeData.education.forEach(edu => {
    keywords.push(edu.degree.toLowerCase())
    keywords.push(edu.field.toLowerCase())
  })
  
  return [...new Set(keywords)]
}

export function JDAnalyzer({ resumeData, onSuggestSkill, onSuggestBullet }: JDAnalyzerProps) {
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null)
  const { toast } = useToast()

  const analyzeJD = useCallback(async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "No Job Description",
        description: "Please paste a job description to analyze",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Extract keywords from JD
      const jdKeywords = extractKeywords(jobDescription)
      const resumeKeywords = getResumeKeywords(resumeData)
      
      // Find matches and gaps
      const matchedKeywords = jdKeywords.filter(k => 
        resumeKeywords.some(rk => rk.includes(k) || k.includes(rk))
      )
      const missingKeywords = jdKeywords.filter(k => 
        !resumeKeywords.some(rk => rk.includes(k) || k.includes(rk))
      )
      
      // Calculate scores
      const matchScore = jdKeywords.length > 0 
        ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
        : 0
      
      // Check experience match
      const jdText = jobDescription.toLowerCase()
      const hasExperienceKeywords = resumeData.experience.length > 0
      const experienceMatch = hasExperienceKeywords ? 
        Math.min(100, matchScore + 20) : Math.max(0, matchScore - 20)
      
      // Check education match
      const educationMatch = resumeData.education.length > 0 ? 
        Math.min(100, matchScore + 10) : Math.max(0, matchScore - 10)
      
      // Generate suggestions
      const suggestions: AnalysisResult["suggestions"] = []
      
      // Skill suggestions
      missingKeywords.slice(0, 5).forEach(keyword => {
        const category = Object.entries(KEYWORD_CATEGORIES).find(([_, keywords]) => 
          keywords.includes(keyword)
        )?.[0]
        
        if (category === "programming" || category === "frameworks" || category === "databases" || category === "cloud") {
          suggestions.push({
            category: "skill",
            text: `Add "${keyword}" to your skills if you have experience with it`,
            priority: "high"
          })
        }
      })
      
      // Experience suggestions
      if (resumeData.experience.length === 0 && jdText.includes("experience")) {
        suggestions.push({
          category: "experience",
          text: "Add relevant work experience or internships",
          priority: "high"
        })
      }
      
      // Quantify achievements
      const hasMetrics = resumeData.experience.some(exp => 
        exp.description.some(d => /\d+%|\$[\d,]+|\d+\+/.test(d))
      )
      if (!hasMetrics) {
        suggestions.push({
          category: "experience",
          text: "Add metrics to your achievements (e.g., 'increased efficiency by 30%')",
          priority: "medium"
        })
      }
      
      // Project suggestions
      if (resumeData.projects.length < 2) {
        suggestions.push({
          category: "general",
          text: "Add more relevant projects to showcase your skills",
          priority: "medium"
        })
      }
      
      setResult({
        matchScore,
        matchedKeywords,
        missingKeywords,
        suggestions,
        skillGaps: missingKeywords.filter(k => 
          Object.values(KEYWORD_CATEGORIES).flat().includes(k)
        ),
        experienceMatch,
        educationMatch,
        keywordDensity: jdKeywords.length
      })
      
      toast({
        title: "Analysis Complete",
        description: `Your resume matches ${matchScore}% of the job requirements`
      })
      
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the job description",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [jobDescription, resumeData, toast])

  const handleAddSkill = (skill: string) => {
    onSuggestSkill?.(skill)
    toast({
      title: "Skill Added",
      description: `"${skill}" has been added to your skills`
    })
  }

  const handleCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword)
    setCopiedKeyword(keyword)
    setTimeout(() => setCopiedKeyword(null), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          Job Description Analyzer
        </CardTitle>
        <CardDescription>
          Paste a job description to see how well your resume matches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Area */}
        <div className="space-y-2">
          <Textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[120px] resize-none"
          />
          <Button 
            onClick={analyzeJD} 
            disabled={isAnalyzing || !jobDescription.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Match
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            {/* Overall Score */}
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className={`text-4xl font-bold ${getScoreColor(result.matchScore)}`}>
                {result.matchScore}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {result.matchScore >= 80 ? "Excellent match!" : 
                 result.matchScore >= 60 ? "Good match, some improvements needed" :
                 "Consider adding more relevant skills"}
              </p>
              <Progress 
                value={result.matchScore} 
                className={`h-2 mt-3 ${getScoreBg(result.matchScore)}`}
              />
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/30">
                <Briefcase className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className={`text-lg font-semibold ${getScoreColor(result.experienceMatch)}`}>
                  {result.experienceMatch}%
                </div>
                <p className="text-xs text-muted-foreground">Experience</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30">
                <GraduationCap className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className={`text-lg font-semibold ${getScoreColor(result.educationMatch)}`}>
                  {result.educationMatch}%
                </div>
                <p className="text-xs text-muted-foreground">Education</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30">
                <Code className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className={`text-lg font-semibold ${getScoreColor(result.matchScore)}`}>
                  {result.matchedKeywords.length}/{result.keywordDensity}
                </div>
                <p className="text-xs text-muted-foreground">Keywords</p>
              </div>
            </div>

            {/* Matched Keywords */}
            {result.matchedKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Matched Keywords ({result.matchedKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="secondary" 
                      className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {result.missingKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Missing Keywords ({result.missingKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.slice(0, 10).map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="outline" 
                      className="bg-yellow-500/10 border-yellow-500/30 cursor-pointer hover:bg-yellow-500/20 transition-colors"
                      onClick={() => onSuggestSkill ? handleAddSkill(keyword) : handleCopyKeyword(keyword)}
                    >
                      {keyword}
                      {copiedKeyword === keyword ? (
                        <Check className="h-3 w-3 ml-1 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 ml-1 opacity-50" />
                      )}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Click to {onSuggestSkill ? "add to skills" : "copy"}
                </p>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Suggestions to Improve
                </h4>
                <div className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded-lg text-sm flex items-start gap-2 ${
                        suggestion.priority === "high" 
                          ? "bg-red-500/10 border border-red-500/20"
                          : suggestion.priority === "medium"
                          ? "bg-yellow-500/10 border border-yellow-500/20"
                          : "bg-muted/50"
                      }`}
                    >
                      <TrendingUp className={`h-4 w-4 mt-0.5 shrink-0 ${
                        suggestion.priority === "high" 
                          ? "text-red-500"
                          : suggestion.priority === "medium"
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                      }`} />
                      <span>{suggestion.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
