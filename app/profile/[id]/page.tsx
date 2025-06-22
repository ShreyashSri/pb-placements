import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { 
  MemberService, 
  SkillService, 
  ExperienceService, 
  AchievementService,
  LinkService
} from "@/lib/db";
import { ProfileHeader } from "@/components/profile/profile-header";
import { SkillSection } from "@/components/profile/skill-section";
import { ExperienceSection } from "@/components/profile/experience-section";
import { AchievementSection } from "@/components/profile/achievement-section";
import { ResumeSection } from "@/components/profile/resume-section";
import { ExportProfileButton } from "@/components/profile/export-profile-button";
import { EditProfileButton } from "@/components/profile/edit-profile-button";
import { ToastProvider } from "@/components/ui/toast";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await MemberService.getMemberById(id);
  
  if (!member) {
    return {
      title: "Profile Not Found",
    };
  }
  
  return {
    title: `${member.name} | Point Blank`,
    description: `View ${member.name}'s developer profile on Point Blank`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  const member = await MemberService.getMemberById(id);
  
  if (!member) {
    notFound();
  }
  
  console.log('Member data:', member); // Debug log
  
  // Fetch additional profile data
  const skills = await SkillService.getMemberSkills(id);
  const experiences = await ExperienceService.getMemberExperiences(id);
  const achievements = await AchievementService.getMemberAchievements(id);
  const links = await LinkService.getMemberLinks(id);
  
  const isCurrentUser = user?.id === member.id;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Banner Image */}
      <div className="relative h-48 md:h-48 bg-gradient-to-r from-green-500 to-green-600">
        <div className="absolute inset-0 bg-black/20" />
        {isCurrentUser && (
          <div className="absolute bottom-4 right-4">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors">
              Change Banner
            </button>
          </div>
        )}
      </div>

      <div className="px-8 -mt-16">
        {/* Header Section */}
       
        <div className="flex flex-col  md:flex-row gap-6 mb-12">
          {/* Profile Header (Left) */}
          <div className="w-full md:w-1/2">
            <ProfileHeader
              name={member.name}
              email={member.email}
              pictureUrl={member.picture_url}
              domain={member.domain}
              yearOfStudy={member.year_of_study}
              links={links}
              isCurrentUser={isCurrentUser}
            />
          </div>

          {/* Action Buttons (Right or Bottom) */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-4 md:mt-0 items-start md:items-end">
            <div className="flex gap-4">
              {isCurrentUser && (
                <EditProfileButton memberId={member.id} />
              )}
              <ExportProfileButton
                memberId={member.id}
                memberName={member.name}
                memberEmail={member.email}
              />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {experiences.length > 0 && (
              <div className="bg-card rounded-lg border shadow-sm">
                <ExperienceSection 
                  experiences={experiences} 
                  isEditable={isCurrentUser}
                />
              </div>
            )}
            
            {achievements.length > 0 && (
              <div className="bg-card rounded-lg border shadow-sm">
                <AchievementSection 
                  achievements={achievements} 
                  isEditable={isCurrentUser}
                />
              </div>
            )}
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            <div className="bg-card rounded-lg border shadow-sm">
              <SkillSection 
                skills={skills.map(s => s.name)} 
                isEditable={isCurrentUser}
              />
            </div>
            
            
              <div className="bg-card rounded-lg border shadow-sm">
                <ResumeSection 
                  resumeUrl={member.resume_url} 
                  isEditable={isCurrentUser}
                />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}