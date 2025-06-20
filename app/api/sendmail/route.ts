import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {
      memberName,
      memberEmail
    }: {
      memberName: string;
      memberEmail: string;
    } = await req.json();

    if (!memberName || !memberEmail) {
      console.warn('[GMAIL_TEMPLATE] Missing required fields:', {
        memberName,
        memberEmail,
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const subject = `Hello ${memberName}, I'd like to connect`;

    const body = `
Dear ${memberName},

I recently came across your profile on Point Blank and was genuinely impressed by your background, experiences, and accomplishments.

I admire the work you've done and would appreciate the opportunity to connect and learn more about your journey and interests.

If you're open to a conversation, I’d be glad to hear from you at your convenience.

Warm regards,  
[Your Name]
`;

    const gmailDraftURL = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(
      memberEmail
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    console.log(`[GMAIL_TEMPLATE] Draft URL generated for member: ${memberName}`);

    return NextResponse.json({
      success: true,
      gmailDraftURL,
    });
  } catch (error: any) {
    console.error('[GMAIL_TEMPLATE] Server error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error while generating Gmail draft',
      },
      { status: 500 }
    );
  }
}
