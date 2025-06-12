import { NextRequest, NextResponse } from 'next/server';
import {
  getScenarioById,
  updateScenario,
  deleteScenario,
} from '@/lib/supabase/scenarios';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scenario = await getScenarioById(params.id);
    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }
    return NextResponse.json(scenario);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error fetching scenario ${params.id}:`, errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updatedScenario = await updateScenario(params.id, body);
    return NextResponse.json(updatedScenario);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error updating scenario ${params.id}:`, errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await deleteScenario(params.id);
        return NextResponse.json({ message: 'Scenario deleted successfully' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`Error deleting scenario ${params.id}:`, errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 