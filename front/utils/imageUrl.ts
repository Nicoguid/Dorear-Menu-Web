export function getOptimizedImageUrl(
  rawUrl: string | undefined,
  width: number,
  quality = 80
): string {
  if (!rawUrl) return '';
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes('images.unsplash.com')) {
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', String(quality));
      url.searchParams.set('fm', 'webp');
      return url.toString();
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

export function getResponsiveImageSrcSet(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined;
  try {
    const url = new URL(rawUrl);
    if (!url.hostname.includes('images.unsplash.com')) {
      return undefined;
    }
    const w400 = getOptimizedImageUrl(rawUrl, 400, 78);
    const w720 = getOptimizedImageUrl(rawUrl, 720, 80);
    const w960 = getOptimizedImageUrl(rawUrl, 960, 82);
    return `${w400} 400w, ${w720} 720w, ${w960} 960w`;
  } catch {
    return undefined;
  }
}
