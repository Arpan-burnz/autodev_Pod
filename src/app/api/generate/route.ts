import { NextRequest, NextResponse } from 'next/server';
import { generateDynamicApplication } from '@/ai/flows/ai-dynamic-app-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessRequirement, supportingDocument } = body;

    const result = await generateDynamicApplication({
      businessRequirement: businessRequirement || 'Business Management Application',
      supportingDocument: supportingDocument || '',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal generation failure' },
      { status: 500 }
    );
  }
}

