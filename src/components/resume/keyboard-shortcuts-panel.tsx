"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Keyboard, Command } from "lucide-react"

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ["Ctrl", "1"], description: "Go to Template Selection", category: "Navigation" },
  { keys: ["Ctrl", "2"], description: "Go to Form Editor", category: "Navigation" },
  { keys: ["Ctrl", "3"], description: "Go to Preview", category: "Navigation" },
  { keys: ["Tab"], description: "Next field", category: "Navigation" },
  { keys: ["Shift", "Tab"], description: "Previous field", category: "Navigation" },

  // Actions
  { keys: ["Ctrl", "S"], description: "Save resume (auto-saves anyway)", category: "Actions" },
  { keys: ["Ctrl", "Enter"], description: "Generate PDF", category: "Actions" },
  { keys: ["Ctrl", "D"], description: "Fill demo data", category: "Actions" },
  { keys: ["Ctrl", "K"], description: "Open command palette", category: "Actions" },
  
  // Editing
  { keys: ["Ctrl", "Z"], description: "Undo last change", category: "Editing" },
  { keys: ["Ctrl", "Y"], description: "Redo", category: "Editing" },
  { keys: ["Ctrl", "C"], description: "Copy selected text", category: "Editing" },
  { keys: ["Ctrl", "V"], description: "Paste", category: "Editing" },

  // View
  { keys: ["Ctrl", "L"], description: "Toggle LaTeX view", category: "View" },
  { keys: ["Ctrl", "P"], description: "Toggle PDF preview", category: "View" },
  { keys: ["Esc"], description: "Close modals/dialogs", category: "View" },

  // Quick Actions
  { keys: ["?"], description: "Show this help", category: "Help" },
]

interface KeyboardShortcutsPanelProps {
  onShortcut?: (keys: string[]) => void
}

export function KeyboardShortcutsPanel({ onShortcut }: KeyboardShortcutsPanelProps) {
  const [open, setOpen] = useState(false)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open shortcuts panel with ?
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement
        // Don't trigger if typing in input/textarea
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault()
          setOpen(true)
          return
        }
      }

      // Track pressed keys
      const key = e.key
      setPressedKeys(prev => new Set(prev).add(key))

      // Trigger shortcut callback
      const keys = [
        e.ctrlKey && "Ctrl",
        e.shiftKey && "Shift",
        e.altKey && "Alt",
        e.metaKey && "Meta",
        e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Meta" && e.key,
      ].filter(Boolean) as string[]

      if (keys.length > 1 && onShortcut) {
        onShortcut(keys)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const next = new Set(prev)
        next.delete(e.key)
        return next
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [onShortcut])

  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          <span className="hidden sm:inline">Shortcuts</span>
          <Badge variant="secondary" className="hidden md:inline-flex">?</Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map(category => (
            <div key={category}>
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">{category}</h3>
              <div className="space-y-2">
                {SHORTCUTS.filter(s => s.category === category).map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Press <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">?</kbd> anytime to see shortcuts
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for using keyboard shortcuts in components
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && "Ctrl",
        e.shiftKey && "Shift",
        e.altKey && "Alt",
        e.key,
      ].filter(Boolean).join("+")

      if (shortcuts[key]) {
        e.preventDefault()
        shortcuts[key]()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}
