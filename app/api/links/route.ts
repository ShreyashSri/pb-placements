import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, links } = body;
    if (!member_id || !Array.isArray(links)) {
      return NextResponse.json({ success: false, error: 'member_id and links are required' }, { status: 400 });
    }

    // Upsert each link (GitHub, LinkedIn)
    for (const link of links) {
      if (!link.name || !link.url) continue;
      // Check if link already exists for this member and name
      const { data: existing, error: fetchError } = await supabase
        .from('links')
        .select('id')
        .eq('member_id', member_id)
        .eq('name', link.name)
        .single();
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Ignore not found error
        return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
      }
      if (existing) {
        // Update
        const { error: updateError } = await supabase
          .from('links')
          .update({ url: link.url })
          .eq('id', existing.id);
        if (updateError) {
          return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
        }
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('links')
          .insert([{ id: uuidv4(), member_id, name: link.name, url: link.url }]);
        if (insertError) {
          return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 