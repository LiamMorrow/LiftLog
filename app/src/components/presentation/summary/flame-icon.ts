import { BlendMode, matchFont, PaintStyle, Skia, StrokeJoin } from '@shopify/react-native-skia';
import { ImageSourcePropType, Platform } from 'react-native';

const HEIGHT_POINTS = 24;
const PIXEL_RATIO = 3;
/** The silhouette's extent in its 960-unit viewport, plus room for the outline stroke. */
const BOUNDS = { x: 120, y: 80, width: 720, height: 840 };
const SILHOUETTE =
  'M480,120L480,252Q480,286 503.5,309Q527,332 561,332Q579,332 594.5,324.5Q610,317 622,302L640,280Q714,322 757,397Q800,472 800,560Q800,694 707,787Q614,880 480,880Q346,880 253,787Q160,694 160,560Q160,431 246.5,315Q333,199 480,120Z';
const OUTLINE_WIDTH = 80;
const BODY_CENTRE = { x: 480, y: 600 };
const MAX_SHOWN = 999;
const SYSTEM_FONT_FAMILY = Platform.select({ ios: 'System', default: 'sans-serif' });

/** A flame with the count inside it, as a template image to tint. Without a count it is a bare outline. */
export function flameIcon(filled: boolean, count: number | undefined): ImageSourcePropType {
  const scale = (HEIGHT_POINTS * PIXEL_RATIO) / BOUNDS.height;
  const widthPoints = (BOUNDS.width * scale) / PIXEL_RATIO;
  const surface = Skia.Surface.Make(Math.round(BOUNDS.width * scale), HEIGHT_POINTS * PIXEL_RATIO)!;
  const canvas = surface.getCanvas();
  canvas.scale(scale, scale);
  canvas.translate(-BOUNDS.x, -BOUNDS.y);

  const flame = Skia.Paint();
  flame.setAntiAlias(true);
  flame.setColor(Skia.Color('black'));
  if (!filled) {
    flame.setStyle(PaintStyle.Stroke);
    flame.setStrokeWidth(OUTLINE_WIDTH);
    flame.setStrokeJoin(StrokeJoin.Round);
  }
  canvas.drawPath(Skia.Path.MakeFromSVGString(SILHOUETTE)!, flame);

  if (count !== undefined) {
    const label = Math.min(count, MAX_SHOWN).toString();
    const font = matchFont({
      fontFamily: SYSTEM_FONT_FAMILY,
      fontSize: label.length > 2 ? 340 : 440,
      fontWeight: 'bold',
    });
    const bounds = font.measureText(label);
    const digits = Skia.Paint();
    digits.setAntiAlias(true);
    digits.setColor(Skia.Color('black'));
    if (filled) {
      digits.setBlendMode(BlendMode.Clear);
    }
    canvas.drawText(
      label,
      BODY_CENTRE.x - bounds.x - bounds.width / 2,
      BODY_CENTRE.y - bounds.y - bounds.height / 2,
      digits,
      font,
    );
  }

  surface.flush();
  const png = surface.makeImageSnapshot().encodeToBase64();
  return { uri: `data:image/png;base64,${png}`, width: widthPoints, height: HEIGHT_POINTS, scale: PIXEL_RATIO };
}
