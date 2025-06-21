"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/db";
import { useAuthStore } from "@/lib/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(async ({ data, error }) => {
          if (error) {
            console.error("Exchange error:", error);
          }
          const { session } = data;
          if (session) {
            useAuthStore.getState().setUser(session.user);
            router.replace(window.location.pathname);
          }
        });
    } else {
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          useAuthStore.getState().setUser(session.user);
        }
      });
    }
  }, [router, searchParams]);

  return (
    <div className="py-8 md:py-12">
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
