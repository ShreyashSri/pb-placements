"use client";

import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeSectionProps {
  resumeUrl: string;
  isEditable?: boolean;
}

export function ResumeSection({ resumeUrl, isEditable }: ResumeSectionProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Resume</h2>
        {isEditable && (
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Update Resume
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <FileText className="h-6 w-6 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">Resume.pdf</p>
          <p className="text-xs text-muted-foreground truncate">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
            View
          </a>
        </Button>
      </div>
    </div>
  );
}