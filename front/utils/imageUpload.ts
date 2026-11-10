import { SUPABASE_IMAGES_BUCKET, supabase } from './supabaseClient';

const MAX_RAW_FILE_BYTES = 20 * 1024 * 1024;
const MAX_PASSTHROUGH_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION_PX = 1200;
const WEBP_QUALITY = 0.84;
const JPEG_QUALITY = 0.85;

const WEB_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('No se pudo leer el archivo seleccionado.'));
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo decodificar la imagen seleccionada.'));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

async function drawToCompressedBlob(
  source: CanvasImageSource,
  width: number,
  height: number
): Promise<{ blob: Blob; contentType: string; extension: string }> {
  if (!width || !height) {
    throw new Error('La imagen no tiene dimensiones válidas.');
  }

  const scale = Math.min(1, MAX_DIMENSION_PX / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo procesar la imagen en este navegador.');
  }
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

  const webpBlob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);
  if (webpBlob && webpBlob.type === 'image/webp') {
    return { blob: webpBlob, contentType: 'image/webp', extension: 'webp' };
  }

  const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY);
  if (jpegBlob) {
    return { blob: jpegBlob, contentType: 'image/jpeg', extension: 'jpg' };
  }

  throw new Error('No se pudo comprimir la imagen.');
}

async function compressImageFile(
  file: File
): Promise<{ blob: Blob; contentType: string; extension: string }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      try {
        return await drawToCompressedBlob(bitmap, bitmap.width, bitmap.height);
      } finally {
        bitmap.close();
      }
    } catch {
      // Fall through to FileReader data-URL decoding (avoids blob: CSP restrictions)
    }
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const img = await loadImageElement(dataUrl);
    return await drawToCompressedBlob(
      img,
      img.naturalWidth || img.width,
      img.naturalHeight || img.height
    );
  } catch (err) {
    const passthroughExt = WEB_IMAGE_TYPES[file.type.toLowerCase()];
    if (passthroughExt && file.size <= MAX_PASSTHROUGH_BYTES) {
      return {
        blob: file,
        contentType: file.type,
        extension: passthroughExt,
      };
    }
    const isHeic =
      file.type.toLowerCase().includes('heic') ||
      file.type.toLowerCase().includes('heif') ||
      /\.(heic|heif)$/i.test(file.name);
    if (isHeic) {
      throw new Error(
        'El formato HEIC de iPhone no es compatible con este navegador. Probá con JPG, PNG o WebP.'
      );
    }
    throw err instanceof Error ? err : new Error('No se pudo leer la imagen seleccionada.');
  }
}

function formatStorageUploadError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('bucket') && lower.includes('not found')) {
    return `Falta crear el bucket público "${SUPABASE_IMAGES_BUCKET}" en Supabase Storage.`;
  }
  if (
    lower.includes('row-level security') ||
    lower.includes('policy') ||
    lower.includes('unauthorized')
  ) {
    return `Falta habilitar el permiso de subida en el bucket "${SUPABASE_IMAGES_BUCKET}" de Supabase.`;
  }
  return `No se pudo subir la foto: ${message}`;
}

/**
 * Compresses an image in the browser and uploads it to Supabase Storage,
 * returning its public HTTPS URL.
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Seleccioná un archivo de imagen válido (JPG, PNG o WebP).');
  }
  if (file.size > MAX_RAW_FILE_BYTES) {
    throw new Error('La foto es demasiado pesada (máximo 20 MB).');
  }
  if (!supabase) {
    throw new Error('Supabase no está configurado para subir fotos.');
  }

  const { blob, contentType, extension } = await compressImageFile(file);
  const randomSuffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  const filePath = `products/${Date.now()}-${randomSuffix}.${extension}`;

  const { error } = await supabase.storage
    .from(SUPABASE_IMAGES_BUCKET)
    .upload(filePath, blob, {
      contentType,
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    throw new Error(formatStorageUploadError(error.message));
  }

  const { data } = supabase.storage.from(SUPABASE_IMAGES_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl || !data.publicUrl.startsWith('https://')) {
    throw new Error('No se pudo obtener el enlace público de la foto.');
  }

  return data.publicUrl;
}
