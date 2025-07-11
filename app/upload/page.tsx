import { ResumeUpload } from "@/components/upload/resume-upload";

export const metadata = {
  title: "Upload Resume | Point Blank",
  description: "Upload your resume to create or update your profile on Point Blank",
};

export default function UploadPage() {
  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Your Resume</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload your resume to create or update your profile. We&apos;ll automatically parse your skills and experience.
        </p>
      </div>
      <div className="flex justify-center">
      <ResumeUpload />
    </div>
    </div>
  );
}