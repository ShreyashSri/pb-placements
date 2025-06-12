import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';

export const metadata = {
  title: "Student discovery system | Point Blank",
  description: "Upload your resume to create or update your profile on Point Blank",
};

export default function UploadPage() {
  return (
    <div className="container py-8 md:py-12">
      {/* <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Your Resume</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload your resume to create or update your profile. We'll automatically parse your skills and experience.
        </p>
      </div> */}
      
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}