import { NextRequest, NextResponse } from 'next/server';
import { createScenario, getAllScenarios } from '@/lib/supabase/scenarios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newScenario = await createScenario(body);
    return NextResponse.json(newScenario);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error creating scenario:`, errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const searchTerm = searchParams.get('searchTerm') || '';
        const scenarios = await getAllScenarios(searchTerm);
        return NextResponse.json(scenarios);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`Error fetching scenarios:`, errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 