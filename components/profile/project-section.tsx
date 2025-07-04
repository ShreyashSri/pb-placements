"use client";

import React from "react";

export interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
}

interface ProjectSectionProps {
  projects: Project[];
  isEditable?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectSection({ projects }: ProjectSectionProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4">
      <h3 className="text-xl font-semibold mb-4">Projects</h3>
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-lg">{project.name}</h4>
            <p className="text-muted-foreground mb-1">{project.description}</p>
            {project.link && (
              <div className="mt-1">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-foreground hover:underline break-all"
                  style={{ display: 'block', wordBreak: 'break-all' }}
                >
                  {project.link}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 