export const getSuggestedSkills = (currentSkills: string[]) => {
  return ["JavaScript", "React", "TypeScript", "Node.js"].filter(s => !currentSkills.includes(s));
};
