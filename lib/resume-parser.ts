import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, PDFName } from 'pdf-lib';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

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
    const extractedText = pdfData.text;
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
 * Extracts GitHub and LinkedIn URLs from text with fallback for different casing
 * @param text Resume text
 * @param extractedLinks Already extracted links from PDF annotations
 * @returns Object with github_url and linkedin_url
 */
function extractSocialLinks(text: string, extractedLinks: string[]): { github_url?: string; linkedin_url?: string } {
  const result: { github_url?: string; linkedin_url?: string } = {};
  
  if (extractedLinks.length > 0) {
    const githubLink = extractedLinks.find(link => 
      link.includes('github.com') || link.includes('github.io')
    );
    if (githubLink) {
      result.github_url = githubLink;
    }
    const linkedinLink = extractedLinks.find(link => 
      link.includes('linkedin.com') || link.includes('linked.in')
    );
    if (linkedinLink) {
      result.linkedin_url = linkedinLink;
    }
  }
  if (!result.github_url) {
    const githubUrlPatterns = [
      /https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/gi,
      /github\.com\/[a-zA-Z0-9_-]+/gi,
      /@github\.com\/[a-zA-Z0-9_-]+/gi
    ];
    
    for (const pattern of githubUrlPatterns) {
      const match = text.match(pattern);
      if (match) {
        let url = match[0];
        if (!url.startsWith('http')) {
          url = 'https://' + url.replace('@', '');
        }
        result.github_url = url;
        break;
      }
    }
  }
  
  if (!result.linkedin_url) {
    const linkedinUrlPatterns = [
      /https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi,
      /linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi,
      /@linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi
    ];
    
    for (const pattern of linkedinUrlPatterns) {
      const match = text.match(pattern);
      if (match) {
        let url = match[0];
        if (!url.startsWith('http')) {
          url = 'https://' + url.replace('@', '');
        }
        result.linkedin_url = url;
        break;
      }
    }
  }
  
  if (!result.github_url || !result.linkedin_url) {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      const email = emailMatch[0];
      const username = email.split('@')[0];
      
      const cleanUsername = username.replace(/[^a-zA-Z0-9_-]/g, '');
      
      if (cleanUsername && cleanUsername.length > 0) {
        if (!result.github_url) {
          const githubPatterns = [
            /\bGitHub\b/i,
            /\bGithub\b/i,
            /\bgithub\b/i,
            /\bGit\s*Hub\b/i
          ];
          
          for (const pattern of githubPatterns) {
            if (pattern.test(text)) {
              result.github_url = `https://github.com/${cleanUsername}`;
              break;
            }
          }
        }
        
        if (!result.linkedin_url) {
          const linkedinPatterns = [
            /\bLinkedIn\b/i,
            /\bLinkedin\b/i,
            /\blinkedin\b/i,
            /\bLinked\s*In\b/i
          ];
          
          for (const pattern of linkedinPatterns) {
            if (pattern.test(text)) {
              result.linkedin_url = `https://linkedin.com/in/${cleanUsername}`;
              break;
            }
          }
        }
      }
    }
  }
  return result;
}
/**
 * Uses Gemini API to analyze the resume text and extract relevant information
 */
export async function analyzeWithGemini(text: string, extractedLinks: string[] = []): Promise<ParsedResumeData> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    Analyze this resume text and extract the following information in JSON format:
    1. Full name
    2. Email address
    3. A list of technical skills and technologies [Here First find the skills section from the resume. If its not present keep it empty]
    4. The primary domain/field analyse it effectively after analysing the skillset (e.g., Frontend Development,cybersecurity,backend development,devops,Data Science etc)
    5. Graduation year (YYYY format)
    6. A list of notable achievements, take it from the achievements section of resume only. [Dont put any dates for achievements]
    7. Work experiences take it from the experience section of the resume (including company name, role, description, start date, end date, and if it's current)
    8. Certifications take it from the certifications section of the resume (including certification name, issuing organization)
    9. Projects: take it from the projects section of the resume (including project name, description, and link if present)
    10. GitHub URL if present
    11. LinkedIn URL if present must be like [https://linkedin.com/in/username]

    Resume text:
    ${text}

    Return ONLY a raw JSON object with these exact keys (no markdown formatting, no code blocks):
    {
      "name": "full name",
      "email": "email address",
      "skills": ["skill1", "skill2"],
      "domain": "domain name",
      "graduation_year": YYYY or null,
      "achievements": ["achievement1", "achievement2"],
      "experiences": [
        {
          "company": "company name",
          "role": "job title",
          "description": "job description",
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
          "description": "project description",
          "link": "project link or null"
        }
      ],
      "github_url": "github profile url or null",
      "linkedin_url": "linkedin profile url or null"
    }
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const jsonStr = response.text().replace(/```json\n?|\n?```/g, '').trim();
  
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
    // Extract social links with fallback for different casing
    const socialLinks = extractSocialLinks(text, extractedLinks);
    
    return {
      name: parsed.name || '',
      email: parsed.email || '',
      skills: parsed.skills || [],
      domain: parsed.domain,
      year: yearOfStudy,
      achievements: (parsed.achievements || []),
      experiences: (parsed.experiences || []),
      certifications: (parsed.certifications || []),
      projects: (parsed.projects || []),
      github_url: socialLinks.github_url || parsed.github_url,
      linkedin_url: socialLinks.linkedin_url || parsed.linkedin_url,
      extracted_links: extractedLinks
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return {
      name: '',
      email: '',
      skills: [],
      domain: undefined,
      year: undefined,
      achievements: [],
      experiences: [],
      certifications: [],
      projects: [],
      github_url: undefined,
      linkedin_url: undefined,
      extracted_links: []
    };
  }
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
    const parsedData = await analyzeWithGemini(text);
    await updateUserProfile(userId, parsedData.skills);
    return parsedData;
  } catch (error) {
    console.error('Error in parseResumeText:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
