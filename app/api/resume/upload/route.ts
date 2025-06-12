import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPDF, analyzeWithGemini } from '@/lib/resume-parser';

export const dynamic = 'force-dynamic';

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
    
    // Check file type
    if (resumeFile.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'Only PDF files are supported' },
        { status: 400 }
      );
    }
    
    // Check file size (5MB limit)
    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }
    
    // Convert the file to ArrayBuffer for processing
    const fileBuffer = await resumeFile.arrayBuffer();
    
    // Extract text from PDF
    const extractedText = await extractTextFromPDF(fileBuffer);
    
    // Parse the extracted text (do not update any user profile)
    const parsedData = await analyzeWithGemini(extractedText);
    
    // Generate a temporary ID for the upload session
    const uploadId = uuidv4();
    
    return NextResponse.json({ 
      success: true,
      id: uploadId,
      ...parsedData
    });
    
  } catch (error) {
    console.error('Error processing resume:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to process resume' },
      { status: 500 }
    );
  }
}