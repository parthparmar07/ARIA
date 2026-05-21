import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, ArrowRight, Loader2, CheckCircle2, 
  Briefcase, Code, Layers, ChevronDown
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useSessionStore } from "@/store/session";
import type { Focus } from "@/types";
import { useToast } from "@/hooks/use-toast";

const POPULAR_ROLES = [
  "Software Engineer", "Product Manager", "Data Scientist",
  "UX Designer", "Frontend Engineer", "Backend Engineer",
  "Full Stack Engineer", "ML Engineer", "DevOps Engineer",
  "Business Analyst", "Marketing Manager", "Sales Engineer",
];

const LEVELS = [
  { value: "Intern", label: "Intern / Fresher", desc: "0–1 years" },
  { value: "Junior", label: "Junior", desc: "1–3 years" },
  { value: "Mid-Level", label: "Mid-Level", desc: "3–6 years" },
  { value: "Senior", label: "Senior", desc: "6–10 years" },
  { value: "Staff", label: "Staff / Principal", desc: "10+ years" },
];

const MODES = [
  { value: "behavioral", label: "Behavioral", icon: Briefcase, desc: "STAR stories, leadership, culture fit" },
  { value: "technical", label: "Technical", icon: Code, desc: "Live coding, algorithms, data structures" },
  { value: "system_design", label: "System Design", icon: Layers, desc: "Architecture, scale, trade-offs" },
];

const FOCUS_OPTIONS: { value: Focus; label: string }[] = [
  { value: "mixed", label: "Mixed (Recommended)" },
  { value: "behavioral", label: "Behavioral Only" },
  { value: "product", label: "Product Sense" },
  { value: "execution", label: "Execution & Delivery" },
  { value: "leadership", label: "Leadership" },
  { value: "technical", label: "Technical Depth" },
];

export default function Setup() {
  const nav = useNavigate();
  const create = useSessionStore((s) => s.createSession);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Form state
  const [resumeText, setResumeText] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [level, setLevel] = useState("Mid-Level");
  const [mode, setMode] = useState<"behavioral" | "technical" | "system_design">("behavioral");
  const [focus, setFocus] = useState<Focus>("mixed");
  const [showRoleInput, setShowRoleInput] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/onboarding/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setResumeText(data.text);
      setUploadedFileName(file.name);

      // Auto-populate Resume Builder draft
      if (data.parsed_resume) {
        localStorage.setItem("paperly.resumeBuilder.draft.v1", JSON.stringify({
          resumeData: data.parsed_resume,
          currentStep: 1
        }));
      }

      toast({
        title: "Resume Uploaded",
        description: "We've extracted your experience to personalize your interview.",
      });
      setStep(2);
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: "Could not process your PDF. You can skip this step.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const finalRole = showRoleInput ? customRole : role;

  const handleStart = () => {
    if (!finalRole) {
      toast({ title: "Select a role", description: "Please pick or type your target role.", variant: "destructive" });
      return;
    }
    const id = create({
      role: `${level} ${finalRole}`,
      background: resumeText,
      focus: focus,
      interview_mode: mode,
    });
    nav(`/session/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-6 py-12">

        {/* Header */}
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-accent-rust mb-3">
            ARIA · Interview Setup
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-mahogany leading-tight">
            Configure your session.
          </h1>
          <p className="mt-2 text-warm-muted text-sm">Takes 30 seconds. No typing required.</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8 w-full max-w-xs mx-auto">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-mahogany' : 'bg-card-border'}`} />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Upload Resume */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="w-full space-y-4"
            >
              <div className="aria-card p-8">
                <h2 className="font-display text-2xl text-mahogany mb-1">Upload your resume</h2>
                <p className="text-warm-muted text-sm mb-6">
                  We'll extract your experience to personalize questions and pre-fill your Resume Builder.
                </p>

                <label
                  htmlFor="resume-upload"
                  className={`block border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 
                    ${uploadedFileName ? 'border-accent-sage bg-green-50/30' : 'border-card-border hover:border-accent-rust hover:bg-warm-white'}
                    ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
                >
                  <input
                    id="resume-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                  <div className="flex flex-col items-center gap-3">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-10 h-10 animate-spin text-accent-rust" />
                        <p className="text-mahogany font-medium">Extracting your experience with AI…</p>
                      </>
                    ) : uploadedFileName ? (
                      <>
                        <CheckCircle2 className="w-10 h-10 text-accent-sage" />
                        <p className="text-mahogany font-medium">{uploadedFileName}</p>
                        <p className="text-sm text-warm-muted">Resume extracted successfully</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-warm-white border border-card-border flex items-center justify-center">
                          <Upload className="w-6 h-6 text-warm-muted" />
                        </div>
                        <p className="text-mahogany font-medium">Drop your PDF here or click to browse</p>
                        <p className="text-sm text-warm-muted">PDF only · Max 5MB</p>
                      </>
                    )}
                  </div>
                </label>

                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-warm-muted hover:text-mahogany font-medium transition-colors"
                  >
                    Skip for now →
                  </button>
                  {uploadedFileName && (
                    <button
                      onClick={() => setStep(2)}
                      className="aria-btn-primary flex items-center gap-2 text-sm py-2.5 px-5"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Role, Level, Mode */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="w-full space-y-5"
            >
              {/* Role */}
              <div className="aria-card p-6">
                <h2 className="font-display text-xl text-mahogany mb-1">Target Role</h2>
                <p className="text-warm-muted text-sm mb-4">What role are you interviewing for?</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setShowRoleInput(false); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                        ${role === r && !showRoleInput
                          ? "bg-mahogany text-cream border-mahogany"
                          : "bg-warm-white border-card-border text-mahogany hover:border-accent-rust"
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowRoleInput(true); setRole(""); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                      ${showRoleInput
                        ? "bg-mahogany text-cream border-mahogany"
                        : "bg-warm-white border-card-border text-warm-muted hover:border-accent-rust"
                      }`}
                  >
                    + Custom
                  </button>
                </div>
                {showRoleInput && (
                  <motion.input
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Staff iOS Engineer"
                    className="mt-3 w-full bg-warm-white border border-card-border rounded-xl px-4 py-2.5 text-mahogany text-sm focus:outline-none focus:border-accent-rust"
                    autoFocus
                  />
                )}
              </div>

              {/* Level */}
              <div className="aria-card p-6">
                <h2 className="font-display text-xl text-mahogany mb-4">Experience Level</h2>
                <div className="grid grid-cols-5 gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLevel(l.value)}
                      className={`py-3 px-2 rounded-xl border text-center transition-all
                        ${level === l.value
                          ? "bg-mahogany text-cream border-mahogany"
                          : "bg-warm-white border-card-border text-mahogany hover:border-accent-rust"
                        }`}
                    >
                      <p className="text-xs font-semibold">{l.label}</p>
                      <p className={`text-[10px] mt-0.5 ${level === l.value ? "text-cream/70" : "text-warm-muted"}`}>{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview Mode */}
              <div className="aria-card p-6">
                <h2 className="font-display text-xl text-mahogany mb-4">Interview Mode</h2>
                <div className="grid grid-cols-3 gap-3">
                  {MODES.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value as any)}
                      className={`py-4 px-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2
                        ${mode === m.value
                          ? "bg-mahogany text-cream border-mahogany"
                          : "bg-warm-white border-card-border text-mahogany hover:border-accent-rust"
                        }`}
                    >
                      <m.icon className={`w-5 h-5 ${mode === m.value ? "text-cream" : "text-warm-muted"}`} />
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className={`text-[10px] leading-tight ${mode === m.value ? "text-cream/70" : "text-warm-muted"}`}>{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Area */}
              <div className="aria-card p-6">
                <h2 className="font-display text-xl text-mahogany mb-4">Question Focus</h2>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFocus(f.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                        ${focus === f.value
                          ? "bg-mahogany text-cream border-mahogany"
                          : "bg-warm-white border-card-border text-mahogany hover:border-accent-rust"
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl border border-card-border text-mahogany text-sm font-medium hover:border-mahogany transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStart}
                  disabled={!finalRole}
                  className="flex-1 aria-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Start Interview
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
