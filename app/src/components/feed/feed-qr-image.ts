import { argbFromHex, Hct, hexFromArgb } from '@material/material-color-utilities';
import { matchFont, PaintStyle, SkCanvas, SkImage, Skia } from '@shopify/react-native-skia';
import { create } from 'qrcode';
import { Platform } from 'react-native';

const WIDTH = 1080;
const PADDING = 96;
const QR_SIZE = WIDTH - PADDING * 2;
const FINDER_MODULES = 7;
const EMBLEM_MODULES = 9;
const DOT_RADIUS = 0.42;
const NAME_FONT_SIZE = 64;
const CAPTION_FONT_SIZE = 40;
const SYSTEM_FONT_FAMILY = Platform.select({ ios: 'System', default: 'sans-serif' });
/** Material Symbols' `fitness_center`, in its 960-unit viewport. */
const FITNESS_CENTER =
  'M536,876L480,820L622,678L282,338L140,480L84,424L140,366L84,310L168,226L112,168L168,112L226,168L310,84L366,140L424,84L480,140L338,282L678,622L820,480L876,536L820,594L876,650L792,734L848,792L792,848L734,792L650,876L594,820L536,876Z';
const GLYPH_EXTENT = 792;

export interface FeedQrCodeContent {
  link: string;
  name: string | undefined;
  caption: string;
  themeColor: string;
}

/**
 * A scannable card for the feed share link: dotted modules, rounded finder eyes and the LiftLog glyph
 * in the centre. Tones are fixed rather than taken from the light or dark scheme, so the code always
 * scans as dark on light.
 */
export function renderFeedQrCode({ link, name, caption, themeColor }: FeedQrCodeContent): SkImage {
  const palette = qrPalette(themeColor);
  const modules = create(link, { errorCorrectionLevel: 'Q' }).modules;
  const count = modules.size;
  const cell = QR_SIZE / count;
  const textTop = PADDING + QR_SIZE + PADDING / 2;
  const height = textTop + (name ? NAME_FONT_SIZE * 1.4 : 0) + CAPTION_FONT_SIZE * 1.4 + PADDING;

  const surface = Skia.Surface.Make(WIDTH, Math.round(height))!;
  const canvas = surface.getCanvas();
  canvas.drawColor(Skia.Color(palette.background));
  const ink = fill(palette.ink);
  const accent = fill(palette.accent);

  const centre = count / 2;
  const isFinder = (row: number, col: number) =>
    (row < FINDER_MODULES && (col < FINDER_MODULES || col >= count - FINDER_MODULES)) ||
    (row >= count - FINDER_MODULES && col < FINDER_MODULES);
  const isUnderEmblem = (row: number, col: number) =>
    Math.hypot(row + 0.5 - centre, col + 0.5 - centre) < EMBLEM_MODULES / 2 + 0.5;

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (modules.get(row, col) && !isFinder(row, col) && !isUnderEmblem(row, col)) {
        canvas.drawCircle(PADDING + (col + 0.5) * cell, PADDING + (row + 0.5) * cell, cell * DOT_RADIUS, ink);
      }
    }
  }

  for (const [row, col] of [
    [0, 0],
    [0, count - FINDER_MODULES],
    [count - FINDER_MODULES, 0],
  ] as const) {
    drawFinder(canvas, PADDING + col * cell, PADDING + row * cell, cell, accent);
  }

  const centrePx = PADDING + centre * cell;
  const emblemRadius = (EMBLEM_MODULES / 2) * cell - cell / 2;
  canvas.drawCircle(centrePx, centrePx, emblemRadius, accent);
  const glyphScale = (emblemRadius * 1.3) / GLYPH_EXTENT;
  canvas.save();
  canvas.translate(centrePx - 480 * glyphScale, centrePx - 480 * glyphScale);
  canvas.scale(glyphScale, glyphScale);
  canvas.drawPath(Skia.Path.MakeFromSVGString(FITNESS_CENTER)!, fill(palette.background));
  canvas.restore();

  const textWidth = WIDTH - PADDING * 2;
  let baseline = textTop;
  if (name) {
    drawCentredText(canvas, name, WIDTH / 2, baseline + NAME_FONT_SIZE * 0.5, NAME_FONT_SIZE, ink, 'bold', textWidth);
    baseline += NAME_FONT_SIZE * 1.4;
  }
  drawCentredText(
    canvas,
    caption,
    WIDTH / 2,
    baseline + CAPTION_FONT_SIZE * 0.5,
    CAPTION_FONT_SIZE,
    fill(palette.muted),
    'normal',
    textWidth,
  );

  surface.flush();
  return surface.makeImageSnapshot();
}

function drawFinder(canvas: SkCanvas, x: number, y: number, cell: number, paint: ReturnType<typeof fill>) {
  const ring = paint.copy();
  ring.setStyle(PaintStyle.Stroke);
  ring.setStrokeWidth(cell);
  const ringInset = cell / 2;
  const ringSize = FINDER_MODULES * cell - cell;
  canvas.drawRRect(
    Skia.RRectXY(Skia.XYWHRect(x + ringInset, y + ringInset, ringSize, ringSize), cell * 2, cell * 2),
    ring,
  );
  canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3), cell, cell), paint);
}

function drawCentredText(
  canvas: SkCanvas,
  text: string,
  centreX: number,
  centreY: number,
  fontSize: number,
  paint: ReturnType<typeof fill>,
  fontWeight: 'bold' | 'normal',
  maxWidth: number,
) {
  let font = matchFont({ fontFamily: SYSTEM_FONT_FAMILY, fontSize, fontWeight });
  const measured = font.measureText(text);
  if (measured.width > maxWidth) {
    font = matchFont({ fontFamily: SYSTEM_FONT_FAMILY, fontSize: (fontSize * maxWidth) / measured.width, fontWeight });
  }
  const bounds = font.measureText(text);
  canvas.drawText(text, centreX - bounds.x - bounds.width / 2, centreY - bounds.y - bounds.height / 2, paint, font);
}

function fill(color: string) {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(color));
  return paint;
}

function qrPalette(themeColor: string) {
  const { hue, chroma } = Hct.fromInt(argbFromHex(themeColor));
  const tone = (c: number, t: number) => hexFromArgb(Hct.from(hue, c, t).toInt());
  return {
    background: tone(Math.min(chroma, 16), 96),
    ink: tone(Math.min(chroma, 36), 16),
    accent: tone(Math.max(chroma, 48), 40),
    muted: tone(Math.min(chroma, 16), 40),
  };
}
