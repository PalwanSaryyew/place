import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Next.js 15 için params tipi Promise olmalı
export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> } 
) {
  // 1. ADIM: params bir Promise olduğu için önce await etmeliyiz
  const { filename } = await params;

  // Projenin ana dizinindeki 'uploads' klasörünü hedefle
  const filePath = path.join(process.cwd(), 'uploads', filename);

  try {
    const fileBuffer = fs.readFileSync(filePath);

    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.webp') contentType = 'image/webp';
    if (ext === '.svg') contentType = 'image/svg+xml';
    if (ext === '.pdf') contentType = 'application/pdf';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error(error);
    
    return new NextResponse('Image not found', { status: 404 });
  }
}