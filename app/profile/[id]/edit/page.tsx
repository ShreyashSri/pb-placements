import { notFound } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { MemberService, ProjectService } from "@/lib/db";
import EditProfileClient from "@/components/profile/edit-profile-client";

interface EditProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  const member = await MemberService.getMemberById(id);

  if (!member || user?.id !== member.id) {
    notFound();
  }

  return <EditProfileClient member={member} />;
}