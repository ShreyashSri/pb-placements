import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

import {
  AchievementService,
  ExperienceService,
  LinkService,
  SkillService,
  MemberService,
  CertificationService,
  ProjectService,
} from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: any
) {
  const { type, id } = context.params;

  try {
    switch (type) {
      case 'achievements':
        return NextResponse.json(await AchievementService.getMemberAchievements(id));
      case 'experience':
        return NextResponse.json(await ExperienceService.getMemberExperiences(id));
      case 'links':
        return NextResponse.json(await LinkService.getMemberLinks(id));
      case 'skills':
        return NextResponse.json(await SkillService.getMemberSkills(id));
      case 'certifications':
        return NextResponse.json(await CertificationService.getMemberCertifications(id));
      case 'projects':
        return NextResponse.json(await ProjectService.getMemberProjects(id));
      case 'profile': {
        const member = await MemberService.getMemberById(id);
        if (!member) {
          return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }
        return NextResponse.json(member);
      }
      default:
        return NextResponse.json({ error: 'Invalid member type' }, { status: 400 });
    }
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return NextResponse.json({ error: `Failed to fetch ${type}` }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  const { type, id } = context.params;

  if (type !== 'achievements' && type !== 'projects') {
    return NextResponse.json({ error: 'DELETE not supported for this type' }, { status: 405 });
  }

  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (type === 'achievements') {
      await AchievementService.deleteAchievement(id);
      return NextResponse.json({ message: 'Achievement deleted successfully' });
    }
    if (type === 'projects') {
      await ProjectService.removeProject(id);
      return NextResponse.json({ message: 'Project deleted successfully' });
    }
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    return NextResponse.json({ error: `Failed to delete ${type}` }, { status: 500 });
  }
}

