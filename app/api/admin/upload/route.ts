import { NextResponse } from 'next/server';
import { requireRole } from '@/app/lib/admin/session';
import { uploadToR2, deleteFromR2ByUrl } from '@/app/lib/r2';
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { basename, join, resolve, sep } from 'path';
import { randomBytes } from 'crypto';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

type ImageExt = 'png' | 'jpg' | 'webp' | 'gif';

const MIME_BY_EXT: Record<ImageExt, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

/**
 * Determines the image type from the file's own magic bytes.
 *
 * The client-supplied MIME type and `data:` prefix are ignored: they are trivial
 * to forge, and the old code trusted them to pick the stored extension. SVG is
 * deliberately not supported — an SVG served from our own origin can carry
 * inline script, which would be stored XSS against the admin panel.
 */
function sniffImage(buf: Buffer): ImageExt | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buf.toString('ascii', 0, 3) === 'GIF') return 'gif';
  return null;
}

function uploadDir(): string {
  return join(process.cwd(), 'public', 'uploads', 'products');
}

async function saveImage(key: string, buffer: Buffer, mime: string): Promise<string> {
  // If R2 credentials are configured, attempt upload to Cloudflare R2
  if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    return await uploadToR2(key, buffer, mime);
  }

  // Fallback: save to public/uploads/products/ (local development only — this
  // directory does not persist on serverless hosting).
  const fileName = basename(key);
  const dir = uploadDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, fileName), buffer);
  return `/uploads/products/${fileName}`;
}

function badFormat() {
  return NextResponse.json(
    { error: 'Invalid image. Please upload a JPG, PNG, WebP or GIF file.' },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  // Uploads feed the product catalogue, which only management can edit.
  const { error } = await requireRole('admin', 'manager');
  if (error) return error;

  try {
    const contentType = request.headers.get('content-type') || '';
    let buffer: Buffer;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: 'Image file must be less than 5MB.' }, { status: 400 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      const { dataUrl } = body;
      if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Valid Base64 image data URL required.' }, { status: 400 });
      }
      const matches = dataUrl.match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: 'Malformed image data URL.' }, { status: 400 });
      }
      buffer = Buffer.from(matches[1], 'base64');
    } else {
      return NextResponse.json(
        { error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' },
        { status: 400 }
      );
    }

    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: 'Image file must be less than 5MB.' }, { status: 400 });
    }

    const ext = sniffImage(buffer);
    if (!ext) return badFormat();

    const key = `products/prod_${Date.now()}_${randomBytes(8).toString('hex')}.${ext}`;
    const url = await saveImage(key, buffer, MIME_BY_EXT[ext]);
    return NextResponse.json({ url, success: true }, { status: 201 });
  } catch (err: unknown) {
    console.error('[upload] Failed to process product image upload:', err);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}

// DELETE /api/admin/upload?url=<object url> — removes an image
export async function DELETE(request: Request) {
  const { error } = await requireRole('admin', 'manager');
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url parameter required.' }, { status: 400 });

  try {
    if (url.startsWith('/uploads/products/')) {
      // Strip any path segments before resolving, then confirm the result is
      // still inside the uploads directory — a url of
      // "/uploads/products/../../../.env" must not escape it.
      const dir = uploadDir();
      const target = resolve(dir, basename(url.slice('/uploads/products/'.length)));
      if (target !== join(dir, basename(target)) || !target.startsWith(dir + sep)) {
        return NextResponse.json({ error: 'Invalid image path.' }, { status: 400 });
      }
      if (existsSync(target)) unlinkSync(target);
    } else if (process.env.R2_ACCOUNT_ID) {
      await deleteFromR2ByUrl(url);
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[upload] Delete error:', err);
    return NextResponse.json({ error: 'Failed to delete image.' }, { status: 500 });
  }
}
