export type TemplateFamily = "fresher" | "professional" | "academic" | "community";

export interface TemplateConfig {
  id: string;
  name: string;
  family: TemplateFamily;
  icon: string;
  description: string;
  atsScore: number;
  hasPhoto: boolean;
  skillsLayout: string;
  emphasisMetrics: boolean;
  sectionOrder: string[];
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: "fresher",
    name: "Fresher",
    family: "fresher",
    icon: "GraduationCap",
    description: "A clean template for students and recent grads.",
    atsScore: 92,
    hasPhoto: false,
    skillsLayout: "comma-separated",
    emphasisMetrics: false,
    sectionOrder: ["education", "experience", "projects", "skills"],
  },
  {
    id: "modern",
    name: "Modern Professional",
    family: "professional",
    icon: "Briefcase",
    description: "Sleek and modern for experienced candidates.",
    atsScore: 95,
    hasPhoto: false,
    skillsLayout: "bulleted",
    emphasisMetrics: true,
    sectionOrder: ["summary", "experience", "education", "skills"],
  }
];

export const getTemplateConfig = (templateId: string): TemplateConfig => {
  return TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
};

export const getAllTemplates = (): TemplateConfig[] => {
  return TEMPLATES;
};

export const getTemplatesByFamily = (family: TemplateFamily): TemplateConfig[] => {
  return TEMPLATES.filter(t => t.family === family);
};

export const getSectionLabel = (key: string, customLabel?: string) => {
  if (customLabel) return customLabel;
  const labels: Record<string, string> = {
    education: "Education",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    certifications: "Certifications",
  };
  return labels[key] || key;
};
