import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createProject, getAllProjects } from '@/lib/db';

export const runtime = 'nodejs';

/* GET /api/projects — listar todos */
export async function GET() {
  const projects = getAllProjects();
  return NextResponse.json({ projects });
}

/* POST /api/projects — crear proyecto con upload de imagen */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const title = (formData.get('title') as string) || 'Sin título';
    const description = (formData.get('description') as string) || '';
    const shape = (formData.get('shape') as string) || 'sphere';
    const background = (formData.get('background') as string) || '#0a0a0f';
    const author = (formData.get('author') as string) || 'Anónimo';

    if (!file) {
      return NextResponse.json({ error: 'No se envió imagen' }, { status: 400 });
    }

    // Guardar imagen
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    const imagePath = `/uploads/${fileName}`;

    // Crear proyecto en DB
    const project = createProject({
      title,
      description,
      image_path: imagePath,
      shape,
      background,
      author,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Error al crear proyecto', detail: String(err) },
      { status: 500 }
    );
  }
}
