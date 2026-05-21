/**
 * Utility functions for improving form UX
 */

/**
 * Auto-focus the first field with a validation error
 */
export function focusFirstError(formId: string = "resume-form") {
  // Wait for DOM to update
  setTimeout(() => {
    // Find first element with error
    const errorInputs = document.querySelectorAll(`#${formId} [aria-invalid="true"], #${formId} .error-field`)
    
    if (errorInputs.length > 0) {
      const firstError = errorInputs[0] as HTMLElement
      
      // Scroll into view
      firstError.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      })
      
      // Focus the element
      if (firstError instanceof HTMLInputElement || 
          firstError instanceof HTMLTextAreaElement) {
        firstError.focus()
        
        // Select the text for easier editing
        if (firstError.value) {
          firstError.select()
        }
      }
      
      // Add highlight animation
      firstError.classList.add("ring-2", "ring-destructive", "ring-offset-2")
      setTimeout(() => {
        firstError.classList.remove("ring-2", "ring-destructive", "ring-offset-2")
      }, 2000)
    }
  }, 100)
}

/**
 * Export resume data as JSON for backup/migration
 */
export function exportResumeAsJSON(
  resumeData: any,
  filename: string = `resume-backup-${new Date().toISOString().split('T')[0]}.json`
) {
  const json = JSON.stringify(resumeData, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100)
  
  return {
    success: true,
    filename,
    size: blob.size,
  }
}

/**
 * Import resume data from JSON file
 */
export function importResumeFromJSON(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        const data = JSON.parse(json)
        
        // Validate basic structure
        if (!data.personalInfo || !data.template) {
          reject(new Error("Invalid resume JSON format"))
          return
        }
        
        resolve(data)
      } catch (error) {
        reject(new Error("Failed to parse JSON file"))
      }
    }
    
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

/**
 * Better PDF error messages with actionable solutions
 */
export const PDF_ERROR_SOLUTIONS: Record<string, {
  title: string
  message: string
  solutions: string[]
  icon: "alert" | "warning" | "info"
}> = {
  "timeout": {
    title: "Resume Too Complex",
    message: "Your resume is taking too long to compile. This usually means it's too detailed for one page.",
    solutions: [
      "Enable 'Compact Mode' in settings to fit more content",
      "Remove less important sections or bullet points",
      "Shorten lengthy descriptions",
      "Consider a 2-page resume if you have 5+ years experience"
    ],
    icon: "alert"
  },
  "special_chars": {
    title: "Special Characters Detected",
    message: "LaTeX doesn't support certain special characters in your content.",
    solutions: [
      "Remove or replace these characters: & # $ % { } _ ~ ^",
      "Use 'and' instead of '&'",
      "Spell out percentages instead of using '%' symbol",
      "Check company names and project titles for special symbols"
    ],
    icon: "warning"
  },
  "compilation_failed": {
    title: "Compilation Error",
    message: "We couldn't generate your PDF. This is usually a formatting issue.",
    solutions: [
      "Try the 'Fill Demo Data' button to see if it's a data issue",
      "Check for very long URLs or text without spaces",
      "Remove any copied/pasted text with unusual formatting",
      "Try a different template - some are more forgiving"
    ],
    icon: "alert"
  },
  "network_error": {
    title: "Connection Issue",
    message: "We couldn't reach our servers to generate your PDF.",
    solutions: [
      "Check your internet connection",
      "Try again in a few moments",
      "Your resume is saved locally - no data lost",
      "Download as JSON backup while offline"
    ],
    icon: "warning"
  },
  "too_large": {
    title: "Resume Exceeds Recommended Length",
    message: "Your resume is longer than 2 pages, which may not be ideal for most positions.",
    solutions: [
      "Enable 'Compact Mode' to condense sections",
      "Prioritize most recent and relevant experience",
      "Combine similar achievements into single bullet points",
      "Move older experience to a brief summary"
    ],
    icon: "info"
  }
}

/**
 * Get solutions for a PDF error
 */
export function getPDFErrorSolution(errorCode: string) {
  // Try to match error code/message to known solutions
  const lowerCode = errorCode.toLowerCase()
  
  if (lowerCode.includes("timeout") || lowerCode.includes("too long")) {
    return PDF_ERROR_SOLUTIONS["timeout"]
  }
  if (lowerCode.includes("special") || lowerCode.includes("character")) {
    return PDF_ERROR_SOLUTIONS["special_chars"]
  }
  if (lowerCode.includes("network") || lowerCode.includes("connection")) {
    return PDF_ERROR_SOLUTIONS["network_error"]
  }
  if (lowerCode.includes("too large") || lowerCode.includes("pages")) {
    return PDF_ERROR_SOLUTIONS["too_large"]
  }
  
  return PDF_ERROR_SOLUTIONS["compilation_failed"]
}

/**
 * Undo/Redo history manager
 */
export class UndoRedoManager<T> {
  private history: T[] = []
  private currentIndex: number = -1
  private maxHistory: number = 50

  constructor(initialState?: T, maxHistory: number = 50) {
    this.maxHistory = maxHistory
    if (initialState) {
      this.push(initialState)
    }
  }

  push(state: T) {
    // Remove any states after current index (when undoing then making new changes)
    this.history = this.history.slice(0, this.currentIndex + 1)
    
    // Add new state
    this.history.push(state)
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    } else {
      this.currentIndex++
    }
  }

  undo(): T | null {
    if (this.canUndo()) {
      this.currentIndex--
      return this.history[this.currentIndex]
    }
    return null
  }

  redo(): T | null {
    if (this.canRedo()) {
      this.currentIndex++
      return this.history[this.currentIndex]
    }
    return null
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  getCurrent(): T | null {
    return this.history[this.currentIndex] || null
  }

  clear() {
    this.history = []
    this.currentIndex = -1
  }

  getHistorySize(): number {
    return this.history.length
  }
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Smooth scroll to element with padding
 */
export function smoothScrollTo(elementId: string, offset: number = 100) {
  const element = document.getElementById(elementId)
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top: y, behavior: "smooth" })
  }
}
