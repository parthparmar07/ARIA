"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, Sparkles, Zap, Crown } from "lucide-react"

interface PricingModalProps {
    open: boolean
    onClose: () => void
}

export function PricingModal({ open, onClose }: PricingModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl text-center font-bold">
                        Unlock Your Professional Resume
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Choose the plan that fits your needs
                    </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-3 gap-6 mt-6">
                    {/* Free */}
                    <Card className="relative">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Free</CardTitle>
                            </div>
                            <div className="text-4xl font-bold">₹0</div>
                            <CardDescription>Try it out</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm mb-6">
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>1 resume</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Basic ATS score</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>All templates</span>
                                </li>
                                <li className="flex items-start gap-2 text-muted-foreground">
                                    <span className="text-xs">⚠️</span>
                                    <span>PDF with watermark</span>
                                </li>
                            </ul>
                            <Button variant="outline" className="w-full" onClick={onClose}>
                                Current Plan
                            </Button>
                        </CardContent>
                    </Card>

                    {/* ₹49 - Most Popular */}
                    <Card className="relative border-2 border-primary shadow-lg scale-105">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                MOST POPULAR
                            </span>
                        </div>
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-5 w-5 text-primary" />
                                <CardTitle>Student</CardTitle>
                            </div>
                            <div className="text-4xl font-bold">₹49</div>
                            <CardDescription>One-time payment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm mb-6">
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Remove watermark</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>PDF + LaTeX download</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Lifetime access</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Priority support</span>
                                </li>
                            </ul>
                            <Button className="w-full" size="lg">
                                Get Started - ₹49
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                Perfect for students & freshers
                            </p>
                        </CardContent>
                    </Card>

                    {/* ₹99 */}
                    <Card className="relative">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="h-5 w-5 text-amber-500" />
                                <CardTitle>Job Seeker</CardTitle>
                            </div>
                            <div className="text-4xl font-bold">₹99</div>
                            <CardDescription>One-time payment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm mb-6">
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Everything in ₹49</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>3 resume versions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>AI bullet improvements (10 uses)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Full ATS breakdown</span>
                                </li>
                            </ul>
                            <Button className="w-full" variant="outline" size="lg">
                                Get Started - ₹99
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                Best for active job seekers
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-center text-muted-foreground">
                        💡 <strong>Why Paperly?</strong> ATS-safe LaTeX resumes that actually get past recruiters.
                        No fancy designs that break ATS systems. Just clean, professional resumes that work.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
