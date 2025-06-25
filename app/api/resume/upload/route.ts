import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPDF, analyzeWithGemini } from '@/lib/resume-parser';
import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'buffer';

export const dynamic = 'force-dynamic';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File;

    if (!resumeFile) {
      return NextResponse.json(
        { success: false, message: 'No resume file provided' },
        { status: 400 }
      );
    }

    if (resumeFile.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const fileBuffer = await resumeFile.arrayBuffer();
    const fileName = `resume/${Date.now()}-${resumeFile.name}`;

    const { error: uploadError, data } = await supabase.storage
      .from('resume')
      .upload(fileName, Buffer.from(fileBuffer), {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError || !data?.path) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { success: false, message: 'Failed to upload to Supabase' },
        { status: 500 }
      );
    }

    const publicResumeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resume/${data.path}`;

    // Parse the resume
    const extractedText = await extractTextFromPDF(fileBuffer);
    const parsedData = await analyzeWithGemini(extractedText);

    // Add resume_url to parsed data
    parsedData.resume_url = publicResumeUrl;

    const uploadId = uuidv4();

    

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      id: uploadId,
      file_path: data.path,
      ...parsedData,
    });

  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process resume' },
      { status: 500 }
    );
  }
}
