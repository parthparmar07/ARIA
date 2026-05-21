export const escapeLatex = (str: string) => {
  if (!str) return "";
  return str.replace(/[&%$#_{}~^\\]/g, (match) => {
    switch (match) {
      case "\\": return "\\textbackslash{}";
      case "~": return "\\textasciitilde{}";
      case "^": return "\\textasciicircum{}";
      default: return "\\" + match;
    }
  });
};
