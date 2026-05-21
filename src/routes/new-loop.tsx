import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Upload, Briefcase } from "lucide-react";
import { Nav } from "@/components/Nav";
import { createLoop } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function NewLoop() {
  const nav = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'scrape'>('manual');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedLeads, setScrapedLeads] = useState<any[]>([]);
  
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/onboarding/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResumeText(data.text);
      toast({ title: "Resume Uploaded", description: "Successfully extracted text." });
    } catch (err) {
      toast({ title: "Upload Failed", description: "Could not process your PDF.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = () => {
    setIsScraping(true);
    // Simulate scraping delay
    setTimeout(() => {
      setScrapedLeads([
        { company: "Stripe", role: "Staff Software Engineer", source: "HackerNews 'Who is Hiring'", jd: "We are looking for a staff engineer to lead our core ledger architecture. Experience with distributed systems and Postgres required.", rejected: true, reason: "Requires Staff/Principal level (10+ YOE). Candidate matches Mid level." },
        { company: "Vercel", role: "Frontend Engineer", source: "Greenhouse", jd: "Join our frontend infrastructure team. Looking for React and TypeScript experts to build out the Next.js compiler.", rejected: false },
        { company: "Anthropic", role: "Full Stack Engineer", source: "Lever", jd: "Help us build Claude. We need full stack engineers comfortable with Python, React, and working with LLMs in production.", rejected: false },
      ]);
      setIsScraping(false);
    }, 2000);
  };

  const handleGenerateFromLead = async (lead: any) => {
    setLoading(true);
    try {
      const loop = await createLoop({
        target_company: lead.company,
        target_role: lead.role,
        job_description: lead.jd,
        resume_text: resumeText,
      });
      nav(`/loops/${loop.id}`);
    } catch (err) {
      toast({ title: "Pipeline Creation Failed", description: "Failed to analyze JD.", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role || !jd || !resumeText) {
      toast({ title: "Missing fields", description: "Please fill out all fields and upload your resume.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const loop = await createLoop({
        target_company: company,
        target_role: role,
        job_description: jd,
        resume_text: resumeText,
      });
      nav(`/loops/${loop.id}`);
    } catch (err) {
      toast({ title: "Pipeline Creation Failed", description: "Failed to analyze JD.", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <Nav />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <header className="mb-10 text-center">
          <p className="font-mono text-[0.75rem] uppercase tracking-wider text-accent-rust mb-2">
            New Pipeline
          </p>
          <h1 className="font-display text-4xl text-mahogany">
            Configure Interview Loop
          </h1>
          <p className="mt-2 text-mahogany-soft text-sm">
            Upload your resume and the target Job Description to generate a tailored interview pipeline.
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <div className="flex bg-warm-white rounded-xl p-1 border border-card-border">
            <button 
              onClick={() => setActiveTab('manual')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'manual' ? 'bg-white shadow-sm text-mahogany' : 'text-warm-muted hover:text-mahogany'}`}
            >
              Manual Input
            </button>
            <button 
              onClick={() => setActiveTab('scrape')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'scrape' ? 'bg-white shadow-sm text-mahogany' : 'text-warm-muted hover:text-mahogany'}`}
            >
              Auto-Scrape (Beta)
            </button>
          </div>
        </div>

        {activeTab === 'manual' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="aria-card p-6">
                <label className="block font-mono text-[0.7rem] uppercase tracking-wider text-mahogany mb-2">Target Company</label>
                <input 
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full bg-warm-white border border-card-border rounded-xl px-4 py-2.5 text-mahogany text-sm focus:outline-none focus:border-accent-rust"
                />
              </div>
              <div className="aria-card p-6">
                <label className="block font-mono text-[0.7rem] uppercase tracking-wider text-mahogany mb-2">Target Role</label>
                <input 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-warm-white border border-card-border rounded-xl px-4 py-2.5 text-mahogany text-sm focus:outline-none focus:border-accent-rust"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aria-card p-6 flex flex-col">
                <label className="block font-mono text-[0.7rem] uppercase tracking-wider text-mahogany mb-2">Your Resume</label>
                <p className="text-sm text-warm-muted mb-4">Upload the PDF resume you are applying with.</p>
                
                <label className={`flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${resumeText ? 'border-accent-sage bg-green-50/30' : 'border-card-border hover:border-accent-rust hover:bg-warm-white'}`}>
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                  {resumeText ? (
                    <>
                      <Briefcase className="w-8 h-8 text-accent-sage mb-2" />
                      <p className="text-mahogany font-medium">Resume Extracted</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-warm-muted mb-2" />
                      <p className="text-mahogany font-medium">Click to upload PDF</p>
                    </>
                  )}
                </label>
              </div>

              <div className="aria-card p-6 flex flex-col">
                <label className="block font-mono text-[0.7rem] uppercase tracking-wider text-mahogany mb-2">Job Description</label>
                <p className="text-sm text-warm-muted mb-4">Paste the full job description text here.</p>
                <textarea 
                  value={jd}
                  onChange={e => setJd(e.target.value)}
                  placeholder="Paste JD here..."
                  className="flex-1 min-h-[150px] w-full bg-warm-white border border-card-border rounded-xl px-4 py-3 text-mahogany text-sm focus:outline-none focus:border-accent-rust resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={loading || !company || !role || !jd || !resumeText}
                className="aria-btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Match & Generating Packages...</>
                ) : (
                  <>Generate Loop Pipeline <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="aria-card p-6 flex flex-col items-center text-center">
              <h2 className="font-display text-2xl text-mahogany mb-2">Automated Quality Gate</h2>
              <p className="text-mahogany-soft text-sm max-w-lg mb-6">
                Upload your resume, and ARIA will scrape HackerNews and Greenhouse boards. It filters out bad leads (too senior, unpaid) and only presents high-quality matches.
              </p>
              
              {!resumeText ? (
                <label className={`w-full max-w-md border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-card-border hover:border-accent-rust hover:bg-warm-white`}>
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                  <Upload className="w-8 h-8 text-warm-muted mb-2" />
                  <p className="text-mahogany font-medium">1. Upload Resume to Begin</p>
                </label>
              ) : (
                <button 
                  onClick={handleScrape}
                  disabled={isScraping}
                  className="aria-btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50"
                >
                  {isScraping ? <><Loader2 className="w-4 h-4 animate-spin" /> Scraping 40+ Boards...</> : "2. Discover Leads"}
                </button>
              )}
            </div>

            {scrapedLeads.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">Scraped Results</h3>
                
                {scrapedLeads.map((lead, i) => (
                  <div key={i} className={`aria-card p-6 border-l-4 ${lead.rejected ? 'border-l-accent-rust opacity-75' : 'border-l-accent-sage'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-display text-xl text-mahogany">{lead.company}</h4>
                          <span className="text-sm text-warm-muted">•</span>
                          <span className="text-sm font-medium text-mahogany">{lead.role}</span>
                        </div>
                        <p className="text-xs text-warm-muted mt-1 uppercase font-mono tracking-wide">Source: {lead.source}</p>
                      </div>
                      
                      {lead.rejected ? (
                        <div className="bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full font-medium border border-red-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Rejected: {lead.reason}
                        </div>
                      ) : (
                        <div className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full font-medium border border-green-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Quality Gate Passed
                        </div>
                      )}
                    </div>
                    
                    {!lead.rejected && (
                      <div className="mt-6 flex justify-end">
                        <button 
                          onClick={() => handleGenerateFromLead(lead)}
                          disabled={loading}
                          className="flex items-center gap-2 bg-mahogany text-cream px-5 py-2 rounded-lg text-sm font-medium hover:bg-mahogany/90 transition-colors disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Pipeline"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
