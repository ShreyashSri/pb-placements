import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/lib/db';

export async function GET(req: NextRequest, context: any) {
  try {
    const projects = await ProjectService.getMemberProjects(context.params.memberId);
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: any) {
  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      const data = await Promise.all(
        body.map((project: any) =>
          ProjectService.createProject({ ...project, member_id: context.params.memberId })
        )
      );
      return NextResponse.json(data);
    } else {
      const data = await ProjectService.createProject({ ...body, member_id: context.params.memberId });
      return NextResponse.json(data);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: any) {
  try {
    const body = await req.json();
    // expects { id, ...fields }
    const { id, ...fields } = body;
    const data = await ProjectService.updateProject(id, fields);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    await ProjectService.removeProjectsByMemberId(context.params.memberId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 