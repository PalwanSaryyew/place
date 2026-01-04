// /app/api/tempimages/[filename]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// A simple function to infer content type from file extension
const getContentType = (filename: string): string => {
    const extension = path.extname(filename).toLowerCase();
    switch (extension) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.webp':
            return 'image/webp';
        case '.svg':
            return 'image/svg+xml';
        default:
            return 'application/octet-stream';
    }
};

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ filename: string }> }
) {
    // Await params promise to resolve, as required by the specific Next.js version's type definitions
    const { filename } = await context.params;
    if (!filename) {
        return NextResponse.json({ error: "Filename is required." }, { status: 400 });
    }

    // Prevent path traversal attacks
    const safeFilename = path.basename(filename);
    if (safeFilename !== filename) {
        return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
    }

    const filepath = path.join(process.cwd(), "temp", safeFilename);

    try {
        const buffer = await readFile(filepath);
        const contentType = getContentType(safeFilename);
        // Explicitly convert Node.js Buffer to Uint8Array to satisfy Blob constructor types
        const uint8Array = new Uint8Array(buffer);
        const blob = new Blob([uint8Array]);

        return new NextResponse(blob, {
            status: 200,
            headers: { 'Content-Type': contentType },
        });
    } catch (error) {
        // Type-safe error handling for 'file not found'
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: unknown }).code === 'ENOENT') {
            return NextResponse.json({ error: "Image not found." }, { status: 404 });
        }
        console.error(`Failed to read temp file: ${filepath}`, error);
        return NextResponse.json({ error: "Failed to read image." }, { status: 500 });
    }
}
