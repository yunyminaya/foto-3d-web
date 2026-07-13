import { NextRequest, NextResponse } from 'next/server';
import { getProject, deleteProject, updateProject, incrementViews } from '@/lib/db';

export const runtime = 'nodejs';

/* GET /api/projects/[id] — obtener un proyecto */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const project = getProject(id);
  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }
  incrementViews(id);
  return NextResponse.json({ project });
}

/* PUT /api/projects/[id] — actualizar */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json();
  const ok = updateProject(id, body);
  if (!ok) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

/* DELETE /api/projects/[id] — eliminar */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  deleteProject(id);
  return NextResponse.json({ success: true });
}
