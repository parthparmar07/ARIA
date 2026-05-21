"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIBulletImproverProps {
    bulletText: string
    onImprove: (improvedText: string) => void
}

/**
 * AI-powered bullet point improvement button
 * Takes weak bullet points and makes them stronger using STAR method
 */
export function AIBulletImprover({ bulletText, onImprove }: AIBulletImproverProps) {
    const [isImproving, setIsImproving] = useState(false)
    const { toast } = useToast()

    const handleImprove = async () => {
        if (!bulletText.trim()) {
            toast({
                title: "Empty bullet",
                description: "Please enter some text first",
                variant: "destructive"
            })
            return
        }

        setIsImproving(true)

        try {
            const response = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{
                        role: "user",
                        content: `Improve this resume bullet point to be more impactful. Use the STAR method (Situation, Task, Action, Result). Add quantifiable metrics where appropriate. Keep it concise (under 2 lines). Return ONLY the improved bullet point, no explanation.

Original: "${bulletText}"`
                    }],
                    tier: "mid"
                })
            })

            if (!response.ok) {
                throw new Error("AI request failed")
            }

            const data = await response.json()
            const improved = data.content || data.message

            if (improved) {
                // Clean up response (remove quotes if present)
                const cleanedText = improved.replace(/^["']|["']$/g, "").trim()
                onImprove(cleanedText)
                toast({
                    title: "✨ Bullet improved!",
                    description: "AI has enhanced your bullet point"
                })
            }
        } catch (error) {
            console.error("AI improvement error:", error)
            toast({
                title: "Improvement failed",
                description: "Could not improve bullet. Try again later.",
                variant: "destructive"
            })
        } finally {
            setIsImproving(false)
        }
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImprove}
            disabled={isImproving || !bulletText.trim()}
            className="text-xs text-accent hover:text-accent-foreground hover:bg-accent/10"
        >
            {isImproving ? (
                <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Improving...
                </>
            ) : (
                <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Improve
                </>
            )}
        </Button>
    )
}
