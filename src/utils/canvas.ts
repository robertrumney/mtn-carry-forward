const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getCachedImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return imageCache.get(src)!;
  const img = await loadImage(src);
  imageCache.set(src, img);
  return img;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;
  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export async function preloadFrames(urls: string[]) {
  await Promise.all(urls.map(getCachedImage));
}

export async function compositeImage(
  photoDataUrl: string,
  frameUrl: string,
  size: number
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);
  const photo = await loadImage(photoDataUrl);
  drawCover(ctx, photo, 0, 0, size, size);
  const frame = await getCachedImage(frameUrl);
  ctx.drawImage(frame, 0, 0, size, size);
  return canvas.toDataURL("image/png");
}

export async function drawPreview(
  canvas: HTMLCanvasElement,
  photoDataUrl: string,
  frameUrl: string,
  size: number
) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);
  const photo = await loadImage(photoDataUrl);
  drawCover(ctx, photo, 0, 0, size, size);
  const frame = await getCachedImage(frameUrl);
  ctx.drawImage(frame, 0, 0, size, size);
}

export async function drawFrameOverlay(
  canvas: HTMLCanvasElement,
  frameUrl: string,
  size: number
) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  const frame = await getCachedImage(frameUrl);
  ctx.drawImage(frame, 0, 0, size, size);
}
