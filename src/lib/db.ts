import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface Project {
  id: string;
  title: string;
  description: string;
  image_path: string;
  shape: string;
  background: string;
  author: string;
  views: number;
  created_at: string;
  updated_at: string;
}

const DATA_DIR = join(process.cwd(), 'data');
const DB_FILE = join(DATA_DIR, 'projects.json');

// Ensure dir + file exist
function ensureDB() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, '[]', 'utf-8');
}

function readAll(): Project[] {
  ensureDB();
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeAll(projects: Project[]) {
  ensureDB();
  writeFileSync(DB_FILE, JSON.stringify(projects, null, 2), 'utf-8');
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function createProject(data: Omit<Project, 'id' | 'views' | 'created_at' | 'updated_at'>): Project {
  const now = new Date().toISOString();
  const project: Project = {
    id: uid(),
    views: 0,
    created_at: now,
    updated_at: now,
    ...data,
  };
  const all = readAll();
  all.unshift(project);
  writeAll(all);
  return project;
}

export function getProject(id: string): Project | null {
  return readAll().find((p) => p.id === id) || null;
}

export function getAllProjects(limit = 100): Project[] {
  return readAll().slice(0, limit);
}

export function incrementViews(id: string) {
  const all = readAll();
  const p = all.find((p) => p.id === id);
  if (p) {
    p.views++;
    writeAll(all);
  }
}

export function deleteProject(id: string) {
  writeAll(readAll().filter((p) => p.id !== id));
}

export function updateProject(id: string, data: Partial<Pick<Project, 'title' | 'description' | 'shape' | 'background' | 'author'>>): boolean {
  const all = readAll();
  const p = all.find((p) => p.id === id);
  if (!p) return false;
  Object.assign(p, data, { updated_at: new Date().toISOString() });
  writeAll(all);
  return true;
}
