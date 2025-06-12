import { NextRequest, NextResponse } from 'next/server';
import { MemberService, SkillService, AchievementService } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      id, 
      name, 
      email, 
      domain, 
      year, 
      skills = [], 
      achievements = [] 
    } = data;
    
    // Check if user exists
    let member = await MemberService.getMemberById(id);
    
    if (member) {
      // Update existing member
      member = await MemberService.updateMember(id, {
        name,
        email,
        domain,
        year_of_study: Number(year),
      });
    } else {
      // Create new member
      member = await MemberService.createMember({
        name,
        email,
        domain,
        year_of_study: Number(year),
        picture_url: '',
        resume_url: '',
      });
    }
    
    // Process skills
    // 1. Get existing skills for member
    const existingSkills = await SkillService.getMemberSkills(member.id);
    const existingSkillNames = existingSkills.map(skill => skill.name);
    
    // 2. Add new skills
    for (const skillName of skills) {
      if (!existingSkillNames.includes(skillName)) {
        const skill = await SkillService.getOrCreateSkill(skillName);
        await SkillService.addSkillToMember(member.id, skill.id);
      }
    }
    
    // 3. Remove skills that are no longer associated
    for (const existingSkill of existingSkills) {
      if (!skills.includes(existingSkill.name)) {
        await SkillService.removeSkillFromMember(member.id, existingSkill.id);
      }
    }
    
    // Process achievements
    // Delete existing achievements (for simplicity)
    // In a real app, you might want to update existing ones instead
    const existingAchievements = await AchievementService.getMemberAchievements(member.id);
    
    // Add new achievements
    for (const achievementTitle of achievements) {
      await AchievementService.createAchievement({
        member_id: member.id,
        title: achievementTitle,
        description: '',
        date: new Date(),
      });
    }
    
    return NextResponse.json({ 
      success: true,
      id: member.id,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}