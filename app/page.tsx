import { HeroSection } from "@/components/home/hero-section";
import { AnimatedGradientBackground } from '@/components/ui/animated-gradient-background';
import Domains from '@/components/home/domains'

export default function UploadPage() {
  return (
    <div className="relative min-h-screen pb-20 overflow-x-hidden">
      {/* Animated gradient background with reduced opacity */}
      <div className="absolute inset-0 z-0" style={{ opacity: 0.9 }}>
        <AnimatedGradientBackground />
      </div>
      {/* Black overlay for readability */}
      <div className="absolute inset-0 z-10 bg-black/10 pointer-events-none" />
      <div className="relative z-20 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col justify-center">
          <HeroSection />
        </div>
        <div className="pb-8 md:pb-12">
          <Domains />
        </div>
      </div>
    </div>
  );
}
