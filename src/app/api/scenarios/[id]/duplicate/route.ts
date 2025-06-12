import { NextRequest, NextResponse } from 'next/server';
import { duplicateScenario } from '@/lib/supabase/scenarios';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const newScenario = await duplicateScenario(params.id);
    return NextResponse.json(newScenario);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error duplicating scenario ${params.id}:`, errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 