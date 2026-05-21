"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Award } from "lucide-react"

interface Certification {
    id: string
    name: string
    issuer: string
    date: string
    link?: string
}

interface CertificationsFormProps {
    certifications: Certification[]
    onChange: (certifications: Certification[]) => void
}

export function CertificationsForm({ certifications, onChange }: CertificationsFormProps) {
    const addCertification = () => {
        const newCert: Certification = {
            id: `cert-${Date.now()}`,
            name: "",
            issuer: "",
            date: "",
            link: "",
        }
        onChange([...certifications, newCert])
    }

    const removeCertification = (id: string) => {
        onChange(certifications.filter((c) => c.id !== id))
    }

    const updateCertification = (id: string, field: keyof Certification, value: string) => {
        onChange(
            certifications.map((c) =>
                c.id === id ? { ...c, [field]: value } : c
            )
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle>Certifications</CardTitle>
                            <CardDescription>Professional certifications and courses</CardDescription>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addCertification}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {certifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Add certifications like AWS Certified, Google Cloud, Coursera courses, etc.
                    </p>
                ) : (
                    certifications.map((cert) => (
                        <div key={cert.id} className="space-y-4 p-4 border rounded-lg relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeCertification(cert.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="grid gap-4 sm:grid-cols-2 pr-10">
                                <div className="space-y-2">
                                    <Label>Certification Name</Label>
                                    <Input
                                        placeholder="e.g., AWS Certified Solutions Architect"
                                        value={cert.name}
                                        onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Issuing Organization</Label>
                                    <Input
                                        placeholder="e.g., Amazon Web Services"
                                        value={cert.issuer}
                                        onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date Obtained</Label>
                                    <Input
                                        placeholder="e.g., March 2023"
                                        value={cert.date}
                                        onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Credential URL (optional)</Label>
                                    <Input
                                        placeholder="e.g., https://www.credential.net/..."
                                        value={cert.link || ""}
                                        onChange={(e) => updateCertification(cert.id, "link", e.target.value)}
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
