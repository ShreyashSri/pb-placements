"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Award } from "lucide-react";
import { format } from "date-fns";

interface Certification {
  id: string;
  name: string;
  issuing_organization?: string;
}

interface CertificationSectionProps {
  certifications: Certification[];
}

export function CertificationSection({ certifications }: CertificationSectionProps) {
  if (!certifications || certifications.length === 0) {
    return null;
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certifications.map((certification) => (
            <div
              key={certification.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg">{certification.name}</h4>
                  {certification.issuing_organization && (
                    <p className="text-muted-foreground">
                      {certification.issuing_organization}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 