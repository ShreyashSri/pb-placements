// lib/pdf.ts
export async function generateResumePDFBuffer(resumeUrl: string): Promise<Buffer> {
  const response = await fetch(resumeUrl);

  if (!response.ok) {
    throw new Error('Failed to download resume');
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
