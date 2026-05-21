import { useState, useCallback } from "react"
import { useAuth, getAuthHeaders } from "./use-auth"
import type { ResumeData, ResumeDocument, ResumeVersion } from "@/lib/types"

export function useResumes() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createResume = useCallback(
        async (name: string, data: Omit<ResumeData, "id" | "createdAt" | "updatedAt">) => {
            if (!user) throw new Error("User not authenticated")

            setIsLoading(true)
            setError(null)

            try {
                const authHeaders = await getAuthHeaders()
                const response = await fetch("/api/resumes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...authHeaders,
                    },
                    body: JSON.stringify({ name, data }),
                })

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || "Failed to create resume")
                }

                return result.data.id as string
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to create resume"
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [user]
    )

    const getUserResumes = useCallback(async () => {
        if (!user) throw new Error("User not authenticated")

        setIsLoading(true)
        setError(null)

        try {
            const authHeaders = await getAuthHeaders()
            const response = await fetch("/api/resumes", {
                headers: authHeaders,
            })

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || "Failed to fetch resumes")
            }

            return result.data as ResumeDocument[]
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch resumes"
            setError(message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [user])

    const getResume = useCallback(
        async (resumeId: string) => {
            if (!user) throw new Error("User not authenticated")

            setIsLoading(true)
            setError(null)

            try {
                const authHeaders = await getAuthHeaders()
                const response = await fetch(`/api/resumes/${resumeId}`, {
                    headers: authHeaders,
                })

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || "Failed to fetch resume")
                }

                return result.data as ResumeDocument
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to fetch resume"
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [user]
    )

    const updateResume = useCallback(
        async (
            resumeId: string,
            data: Partial<Omit<ResumeData, "id" | "createdAt" | "updatedAt">>,
            createVersion: boolean = false
        ) => {
            if (!user) throw new Error("User not authenticated")

            setIsLoading(true)
            setError(null)

            try {
                const authHeaders = await getAuthHeaders()
                const response = await fetch(`/api/resumes/${resumeId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        ...authHeaders,
                    },
                    body: JSON.stringify({ data, createVersion }),
                })

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || "Failed to update resume")
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to update resume"
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [user]
    )

    const deleteResume = useCallback(
        async (resumeId: string) => {
            if (!user) throw new Error("User not authenticated")

            setIsLoading(true)
            setError(null)

            try {
                const authHeaders = await getAuthHeaders()
                const response = await fetch(`/api/resumes/${resumeId}`, {
                    method: "DELETE",
                    headers: authHeaders,
                })

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || "Failed to delete resume")
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to delete resume"
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [user]
    )

    const createShareLink = useCallback(
        async (resumeId: string) => {
            if (!user) throw new Error("User not authenticated")

            setIsLoading(true)
            setError(null)

            try {
                const authHeaders = await getAuthHeaders()
                const response = await fetch(`/api/resumes/${resumeId}/share`, {
                    method: "POST",
                    headers: authHeaders,
                })

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || "Failed to create share link")
                }

                return result.data as { shareId: string; shareUrl: string }
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to create share link"
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [user]
    )

    const revokeShareLink = useCallback(
        async (resumeId: string) => {
            if (!user) throw new Error("User not authenticated")

            setIsLoading(true)
            setError(null)

            try {
                const authHeaders = await getAuthHeaders()
                const response = await fetch(`/api/resumes/${resumeId}/share`, {
                    method: "DELETE",
                    headers: authHeaders,
                })

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || "Failed to revoke share link")
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to revoke share link"
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [user]
    )

    const getVersions = useCallback(
        async (resumeId: string) => {
            if (!user) throw new Error("User not authenticated")

            setIsLoading(true)
            setError(null)

            try {
                const authHeaders = await getAuthHeaders()
                const response = await fetch(`/api/resumes/${resumeId}/versions`, {
                    headers: authHeaders,
                })

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || "Failed to fetch versions")
                }

                return result.data as ResumeVersion[]
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to fetch versions"
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [user]
    )

    const restoreVersion = useCallback(
        async (resumeId: string, versionId: string) => {
            if (!user) throw new Error("User not authenticated")

            setIsLoading(true)
            setError(null)

            try {
                const authHeaders = await getAuthHeaders()
                const response = await fetch(`/api/resumes/${resumeId}/versions/restore`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...authHeaders,
                    },
                    body: JSON.stringify({ versionId }),
                })

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || "Failed to restore version")
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to restore version"
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [user]
    )

    return {
        createResume,
        getUserResumes,
        getResume,
        updateResume,
        deleteResume,
        createShareLink,
        revokeShareLink,
        getVersions,
        restoreVersion,
        isLoading,
        error,
    }
}
