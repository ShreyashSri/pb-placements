import { NextRequest, NextResponse } from 'next/server';
import { CertificationService } from '@/lib/db';

export async function GET(req: NextRequest, context: { params: { memberId: string } }) {
  try {
    const certifications = await CertificationService.getMemberCertifications(context.params.memberId);
    return NextResponse.json(certifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: { memberId: string } }) {
  try {
    const body = await req.json();
    // Accepts either a single certification or an array
    if (Array.isArray(body)) {
      const data = await CertificationService.createCertifications(
        body.map((cert: any) => ({ ...cert, member_id: context.params.memberId }))
      );
      return NextResponse.json(data);
    } else {
      const data = await CertificationService.createCertification({ ...body, member_id: context.params.memberId });
      return NextResponse.json(data);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { memberId: string } }) {
  try {
    await CertificationService.removeCertificationsByMemberId(context.params.memberId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 