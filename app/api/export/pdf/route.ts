import { NextRequest, NextResponse } from 'next/server';
import { MemberService } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { memberId, memberName } = await req.json();

    if (!memberId || !memberName) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      }, { status: 400 });
    }

    const member = await MemberService.getMemberById(memberId);

    if (!member || !member.resume_url) {
      return NextResponse.json({
        success: false,
        message: 'Resume URL not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      resumeUrl: member.resume_url,
      filename: `${memberName.replace(/\s+/g, '-').toLowerCase()}-resume.pdf`,
    });

  } catch (error) {
    console.error('[RESUME_DOWNLOAD]', error);
    return NextResponse.json({
      success: false,
      message: 'Server error',
    }, { status: 500 });
  }
}
