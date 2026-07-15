import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, PDFName } from 'pdf-lib';

// Initialize Mistral AI
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || '' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface ParsedResumeData {
  name: string;
  email: string;
  skills: string[];
  domain?: string;
  year?: number;
  achievements: string[];
  experiences: {
    company: string;
    role: string;
    description: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
  }[];
  certifications: {
    name: string;
    issuing_organization?: string;
  }[];
  projects: {
    name: string;
    description: string;
    link?: string;
  }[];
  github_url?: string;
  linkedin_url?: string;
  resume_url?: string;
  extracted_links?: string[];
}

/**
 * Extracts embedded links from a PDF using pdf-lib
 * @param pdfBuffer PDF file buffer
 * @returns Promise with array of extracted URLs
 */
export async function extractLinksFromPDF(pdfBuffer: ArrayBuffer): Promise<string[]> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const extractedLinks: string[] = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      try {
        // Get the page's annotation array
        const pageDict = page.node;
        const annotations = pageDict.lookup(PDFName.of('Annots'));
        
        if (annotations) {
          // Handle PDFArray of references
          let annotationArray: any[] = [];
          
          if (annotations && typeof annotations === 'object' && 'array' in annotations) {
            // This is a PDFArray with references
            const pdfArray = annotations as { array: any[] };
            
            for (const ref of pdfArray.array) {
              // Resolve the reference to get the actual annotation object
              const annotation = pdfDoc.context.lookup(ref);
              if (annotation) {
                annotationArray.push(annotation);
              }
            }
          } else if (Array.isArray(annotations)) {
            annotationArray = annotations;
          } else {
            annotationArray = [annotations];
          }
          
          for (let j = 0; j < annotationArray.length; j++) {
            const annotation = annotationArray[j];
            
            if (annotation && typeof annotation === 'object') {
              // Get the annotation subtype
              let subtype: string | undefined;
              
              if (annotation.dict) {
                // This is a PDFDict object
                const subtypeObj = annotation.dict.get(PDFName.of('Subtype'));
                subtype = subtypeObj?.decodeText?.() || subtypeObj?.toString();
              } else if (annotation.lookup) {
                // This is a PDFObject with lookup method
                const subtypeObj = annotation.lookup(PDFName.of('Subtype'));
                subtype = subtypeObj?.decodeText?.() || subtypeObj?.toString();
              }
              
              // Check if it's a link annotation
              if (subtype === 'Link' || subtype === '/Link') {
                // Get the action dictionary
                let uri: string | undefined;
                
                if (annotation.dict) {
                  const action = annotation.dict.get(PDFName.of('A'));
                  if (action && action.dict) {
                    const uriObj = action.dict.get(PDFName.of('URI'));
                    uri = uriObj?.decodeText?.() || uriObj?.toString();
                  }
                } else if (annotation.lookup) {
                  const action = annotation.lookup(PDFName.of('A'));
                  if (action && typeof action === 'object') {
                    const uriObj = action.lookup(PDFName.of('URI'));
                    uri = uriObj?.decodeText?.() || uriObj?.toString();
                  }
                }
                if (uri && typeof uri === 'string') {
                  if (!extractedLinks.includes(uri)) {
                    extractedLinks.push(uri);
                  }
                }
              }
            }
          }
        }
      } catch (pageError) {
        console.warn(`Error processing page ${i + 1}:`, pageError);
      }
    }

    return extractedLinks;
  } catch (error) {
    console.error('Error extracting links from PDF:', error);
    return [];
  }
}

/**
 * Extracts text content from a PDF using pdf-parse
 * @param pdfBuffer PDF file buffer
 * @returns Promise with extracted text and links
 */
export async function extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<{ text: string; links: string[] }> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(Buffer.from(pdfBuffer));
    const extractedText = await cleanTextWithAI(pdfData.text);
    const extractedLinks = await extractLinksFromPDF(pdfBuffer);
    return {
      text: extractedText,
      links: extractedLinks
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Utility function to retry API calls with simple fixed delay
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param delay Delay in milliseconds between retries
 * @returns Promise with the result of the function
 */
async function retryWithDelay<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 3000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a rate limit or overload error
      const isRetryableError = 
        error instanceof Error && (
          error.message.includes('overloaded') ||
          error.message.includes('rate limit') ||
          error.message.includes('503') ||
          error.message.includes('429') ||
          error.message.includes('quota exceeded')
        );
      
      if (attempt === maxRetries || !isRetryableError) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
/**
 * Uses Mistral to add spacing to concatenated text
 */
async function cleanTextWithAI(text: string): Promise<string> {
  return retryWithDelay(async () => {
    const prompt = `
     Fix this resume text with strict requirements:
     SECTION IDENTIFICATION:
        - Lines starting with "Description", "Experience", etc. are section headers
        - ALL lines in Description section must start with bullet points
        - Only text after a blank line following section headers can be bullet points

     1. BULLET POINTS (•, *, -):
        - NEVER split any bullet point across lines
        - Combine any bullet fragments into complete single-line bullets
        - Preserve the original bullet character (•, *, or -)
        - Only fix spacing BETWEEN words, never within proper nouns/technical terms
        - If the first point in regular text does not start with a bullet, add a bullet point at the start of the first line.
        - If a bullet point is missing a bullet character, add it at the start of the line.
        - ALL the points under DESCRIPTION should START with a BULLET character.

     2. LINE BREAKS:
        - Remove ALL mid-sentence line breaks
        - Keep exactly one line break between distinct bullet points
        - Keep exactly two line breaks between sections

     3. SPACING:
        - Add missing spaces between words ("ImplementedAES-200" → "Implemented AES-200")
        - Also add a space when a lowercase letter is immediately followed by an uppercase letter in all sections of the resume.
        - Never modify:
          * Technical terms ("RESTful", "CRUD")
          * Proper nouns ("GLibC", "PBKDF2")
          * Numbers/dates ("2000+", "2023-2024")
          * Project names ("ELISA project")

     4. SPECIAL CASES:
        - Preserve all hyphenated terms as-is ("end-to-end")
        - Keep all acronyms intact ("APIs" not "A P Is")
        - Maintain exact company/product names ("Intel/Mobileye")

     REQUIRED OUTPUT FORMAT:
     - Each bullet point exactly one line
     - Add bullet to first point.
     - No trailing spaces
     - No empty lines between bullets
     - Exactly one blank line between sections

      Examples:
      - "VSCodeand" should become "VSCode and"
      - "developingcross-platform" should become "developing cross-platform" 
      - "Serverusing" should become "Server using"

      Text to fix:
      ${text}

      Return only the corrected text with proper spacing, no additional commentary.
      `;

    const result = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
    });
    const response = result.choices?.[0]?.message?.content as string ?? ''
    return response.trim();
  }, 3, 3000).catch((error) => {
    console.error('Error cleaning text with AI:', error);
    return text;
  });
}
/**
 * Uses Mistral API to analyze the resume text and extract relevant information
 */
export async function analyzeWithMistral(text: string, extractedLinks: string[] = []): Promise<ParsedResumeData> {
  const prompt = `
    You are a strict parsing engine. Analyze this resume text and the following array of extracted links, and extract the following information in strict JSON format.

    CRITICAL BOUNDARY RULES:
    - "achievements": Look ONLY under explicit headings like "Achievements", "Awards", "Honors", "Extracurriculars" or "Accomplishments". Items here MUST be structured as single-line bulleted milestones or honors (e.g., "Meta Hacker Cup Global Rank 1654", "CodeForces Expert"). If a milestone (like GSoC or LFX) is formatted as a full structural role with multiple descriptive work bullet points, do NOT put it here—it belongs strictly in "experiences". If no dedicated achievements heading or single-line honors exist, return an empty array [].
    - "experiences": Look under "Experience", "Work History", "Employment", OR "Open Source"/"Open Source Contributions". If open-source contributions are listed as text points without a specific company, map the company to "Open Source Contributions", set the role to "Open Source Contributor", and include that section's bullet points as the description — this section MUST be represented as an experience entry, never dropped or merged elsewhere. CRITICAL: Do NOT include campus leadership, club memberships, volunteering, or "Positions of Responsibility" (like coding club members, college fest volunteers, or student society roles) in this experiences array. If no formal employment or open-source history exists, return an empty array [].
    - "projects": Look ONLY under "Projects" or "Academic Projects".

    COMPANY NAME EXTRACTION (applies to "company" in "experiences"):
    - Extract ONLY the actual organization/company name (e.g., "PrepAiro").
    - Do NOT append or merge work-mode, employment-type, or location qualifiers into the company name — this includes words like "Remote", "Hybrid", "On-site", "Onsite", "In-office", "Full-time", "Part-time", "Internship", or city/country names.
    - If the resume shows these next to the company name (e.g., "PrepAiro — Hybrid", "PrepAiro (Remote)", "PrepAiro | Bengaluru | Hybrid"), strip them entirely and keep only the clean company name, e.g. "PrepAiro".

    LINE BREAK PRESERVATION (applies to "description" in both "experiences" and "projects"):
    - The source text uses bullet characters (•, *, -) to separate distinct points. Preserve that structure.
    - Join each distinct bullet point with a literal "\\n" newline character inside the JSON string value, in the same order they appear in the resume. Do NOT collapse multiple bullets into one run-on sentence or paragraph.
    - Keep each bullet's own text on its own line; do not add a bullet character yourself, just separate the lines with "\\n".
    - If a description in the source is a single paragraph with no bullets, return it as a single line with no "\\n".
    - Never insert "\\n" in the middle of a single bullet/sentence — only between distinct bullet points.
    - This rule applies equally to project descriptions — do NOT flatten multi-bullet project descriptions into one paragraph.

    Fields to extract:
    1. Full name
    2. Email address
    3. A list of technical skills and technologies [First find the skills section from the resume. If its not present keep it empty]
    4. The primary domain/field analyse it effectively after analysing the skillset (e.g., Frontend Development, cybersecurity, backend development, devops, Data Science etc)
    5. Graduation year (YYYY format)
    6. A list of notable achievements. ONLY extract from a section explicitly labeled "Achievements" , "Awards", "Honors", "Extracurriculars" or "Accomplishments" in the resume. If no such section exists or no achievements are explicitly listed under it, return an empty array []. Do NOT extract from projects, experiences, or certifications sections. Do NOT infer, guess, or hallucinate achievements. [Dont put any dates for achievements]
    7. Work experiences take it from the experience section of the resume (including company name, role, description, start date, end date, and if it's current). Follow the COMPANY NAME EXTRACTION and LINE BREAK PRESERVATION rules.
    8. Certifications take it from the certifications section of the resume (including certification name, issuing organization)
    9. Projects: take it from the projects section of the resume (including project name, description, and link if present). Follow the LINE BREAK PRESERVATION rule for description.
    10. GitHub URL if present (choose the correct one from the extracted links array, do not guess)
    11. LinkedIn URL if present (choose the correct one from the extracted links array, do not guess)

    Resume text:
    ${text}

    Extracted links:
    ${JSON.stringify(extractedLinks)}

    Return ONLY a raw JSON object with these exact keys (no markdown formatting, no code blocks). Remember: "company" must be a clean name with no mode/location qualifiers, and description fields must use literal "\\n" characters between bullet points, properly escaped as valid JSON string content.
    {
      "name": "full name",
      "email": "email address",
      "skills": ["skill1", "skill2"],
      "domain": "domain name",
      "graduation_year": YYYY or null,
      "achievements": [], 
      "experiences": [
        {
          "company": "clean company name only, e.g. PrepAiro",
          "role": "job title",
          "description": "bullet one\\nbullet two\\nbullet three",
          "start_date": "YYYY-MM-DD",
          "end_date": "YYYY-MM-DD or null",
          "is_current": boolean
        }
      ],
      "certifications": [
        {
          "name": "certification name",
          "issuing_organization": "issuing organization"
        }
      ],
      "projects": [
        {
          "name": "project name",
          "description": "bullet one\\nbullet two",
          "link": "project link or null"
        }
      ],
      "github_url": "github profile url or null",
      "linkedin_url": "linkedin profile url or null"
    }
  `;

  return retryWithDelay(async () => {
    const result = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
    });
    const response = result.choices?.[0]?.message?.content as string ?? ''
    const jsonStr = response.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      const parsed = JSON.parse(jsonStr);

      // Calculate year of study based on graduation year
      let yearOfStudy: number | undefined;
      if (parsed.graduation_year) {
        const currentYear = new Date().getFullYear();
        const yearsRemaining = parsed.graduation_year - currentYear;
        if (yearsRemaining >= 1 && yearsRemaining <= 4) {
          yearOfStudy = yearsRemaining;
        }
      }
      
      // Normalize description line breaks in case the model returned
      // stray "\r\n" or extra whitespace around lines
      const normalizeDescription = (desc: string | undefined | null): string => {
  if (!desc) return '';
  return desc
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return trimmed;
      // Add a period if the line doesn't already end with terminal punctuation
      return /[.!?:;]$/.test(trimmed) ? trimmed : `${trimmed}.`;
    })
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
};

      // Strip any work-mode / location qualifiers that slipped into the
      // company name 
      const normalizeCompany = (company: string | undefined | null): string => {
        if (!company) return '';
        return company
          .replace(
            /\s*[-–—|,(]*\s*(remote|hybrid|on[\s-]?site|onsite|in[\s-]?office|work\s+from\s+home|wfh|full[\s-]?time|part[\s-]?time)\)?\s*$/gi,
            ''
          )
          .trim();
      };

      const experiences = (parsed.experiences || []).map((exp: any) => ({
        ...exp,
        company: normalizeCompany(exp.company),
        description: normalizeDescription(exp.description),
      }));

      const projects = (parsed.projects || []).map((proj: any) => ({
        ...proj,
        description: normalizeDescription(proj.description),
      }));

      return {
        name: parsed.name || '',
        email: parsed.email || '',
        skills: parsed.skills || [],
        domain: parsed.domain,
        achievements: (parsed.achievements || []),
        experiences,
        certifications: (parsed.certifications || []),
        projects,
        github_url: parsed.github_url,
        linkedin_url: parsed.linkedin_url,
        extracted_links: extractedLinks
      };
    } catch (e) {
      throw new Error('Failed to parse Mistral response: ' + e);
    }
  }, 3, 3000); // 3 retries with 3 second base delay
}

/**
 * Updates user profile in Supabase with extracted skills
 */
async function updateUserProfile(userId: string, skills: string[]): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required for profile update');
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ skills })
      .eq('id', userId)
      .select();
    if (error) {
      console.error('Supabase error:', error.message, error.details, error.hint);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Parses the extracted text to identify skills, domain, year, and achievements
 */
export async function parseResumeText(text: string, userId: string): Promise<ParsedResumeData> {
  if (!userId) {
    throw new Error('User ID is required for resume parsing');
  }

  try {
    const cleanedText = await cleanTextWithAI(text);
    const parsedData = await analyzeWithMistral(cleanedText);
    await updateUserProfile(userId, parsedData.skills);
    return parsedData;
  } catch (error) {
    console.error('Error in parseResumeText:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}