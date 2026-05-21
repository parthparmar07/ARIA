import { ResumeData } from "@/lib/types";

export function HtmlResumePreview({ data, id }: { data: ResumeData; id?: string }) {
  const { personalInfo, education, experience, projects, skills } = data;

  return (
    <div 
      id={id}
      className="bg-white text-black p-10 mx-auto" 
      style={{ 
        width: "210mm", 
        minHeight: "297mm", 
        fontFamily: "'Times New Roman', Times, serif", 
        fontSize: "11pt",
        lineHeight: "1.3" 
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1 uppercase">{personalInfo.fullName}</h1>
        <div className="text-sm flex flex-wrap justify-center gap-2">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.email && personalInfo.phone && <span>|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {(personalInfo.email || personalInfo.phone) && personalInfo.location && <span>|</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="text-sm flex flex-wrap justify-center gap-2 mt-0.5">
          {personalInfo.linkedin && (
            <a href={`https://${personalInfo.linkedin}`} className="text-blue-600 underline">
              {personalInfo.linkedin}
            </a>
          )}
          {personalInfo.linkedin && personalInfo.github && <span>|</span>}
          {personalInfo.github && (
            <a href={`https://${personalInfo.github}`} className="text-blue-600 underline">
              {personalInfo.github}
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-4">
          <p className="text-sm">{personalInfo.summary}</p>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between font-bold">
                <span>{edu.institution}</span>
                <span>{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="italic">{edu.degree} in {edu.field}</span>
                <span>{edu.grade && `Grade: ${edu.grade}`}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between font-bold">
                <span>{exp.company}</span>
                <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="italic">{exp.position}</span>
                <span>{exp.location}</span>
              </div>
              <ul className="list-disc ml-5 text-sm">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">Projects</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <div className="flex justify-between font-bold">
                <span>{proj.name}</span>
                <span>{proj.date}</span>
              </div>
              <p className="text-sm mt-0.5">{proj.description}</p>
              {proj.technologies.length > 0 && (
                <p className="text-sm italic text-gray-700">Technologies: {proj.technologies.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <div className="mb-4">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">Skills</h2>
          <div className="text-sm">
            {skills.technical.length > 0 && (
              <p><span className="font-bold">Technical:</span> {skills.technical.join(', ')}</p>
            )}
            {skills.soft.length > 0 && (
              <p><span className="font-bold">Soft Skills:</span> {skills.soft.join(', ')}</p>
            )}
            {skills.languages.length > 0 && (
              <p><span className="font-bold">Languages:</span> {skills.languages.join(', ')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
