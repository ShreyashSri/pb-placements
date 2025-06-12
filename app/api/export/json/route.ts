import { NextRequest, NextResponse } from 'next/server';
import { MemberService, SkillService, ExperienceService, AchievementService, LinkService } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { memberIds } = await request.json();
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No member IDs provided' },
        { status: 400 }
      );
    }
    
    // Fetch data for each member
    const membersData = [];
    
    for (const memberId of memberIds) {
      const member = await MemberService.getMemberById(memberId);
      
      if (member) {
        const skills = await SkillService.getMemberSkills(memberId);
        const experiences = await ExperienceService.getMemberExperiences(memberId);
        const achievements = await AchievementService.getMemberAchievements(memberId);
        const links = await LinkService.getMemberLinks(memberId);
        
        membersData.push({
          ...member,
          skills: skills.map(s => s.name),
          experiences,
          achievements,
          links,
        });
      }
    }
    
    // Return the data as JSON
    return NextResponse.json({ members: membersData });
  } catch (error) {
    console.error('Error generating JSON:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to generate JSON' },
      { status: 500 }
    );
  }
}