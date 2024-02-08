using MaterialColorUtilities.Blend;
using MaterialColorUtilities.Palettes;
using MaterialColorUtilities.Schemes;

namespace LiftLog.Ui.Models;

public class AppCorePalette : CorePalette
{
    public TonalPalette Orange { get; set; } = null!;
    public TonalPalette Blue { get; set; } = null!;
    public TonalPalette Green { get; set; } = null!;
    public TonalPalette Red { get; set; } = null!;
    public TonalPalette Yellow { get; set; } = null!;
    public TonalPalette Purple { get; set; } = null!;
    public TonalPalette Cyan { get; set; } = null!;
    public TonalPalette Pink { get; set; } = null!;
    public TonalPalette Indigo { get; set; } = null!;
    public TonalPalette Teal { get; set; } = null!;
    public TonalPalette Lime { get; set; } = null!;

    public override void Fill(uint seed, Style style = Style.TonalSpot)
    {
        base.Fill(seed, style);

        Orange = TonalPalette.FromInt(Blender.Harmonize(0xFFA500, seed));
        Blue = TonalPalette.FromInt(Blender.Harmonize(0x0000FF, seed));
        Green = TonalPalette.FromInt(Blender.Harmonize(0x008000, seed));
        Red = TonalPalette.FromInt(Blender.Harmonize(0xFF0000, seed));
        Yellow = TonalPalette.FromInt(Blender.Harmonize(0xFFFF00, seed));
        Purple = TonalPalette.FromInt(Blender.Harmonize(0x800080, seed));
        Cyan = TonalPalette.FromInt(Blender.Harmonize(0x00FFFF, seed));
        Pink = TonalPalette.FromInt(Blender.Harmonize(0xFFC0CB, seed));
        Indigo = TonalPalette.FromInt(Blender.Harmonize(0x4B0082, seed));
        Teal = TonalPalette.FromInt(Blender.Harmonize(0x008080, seed));
        Lime = TonalPalette.FromInt(Blender.Harmonize(0x00FF00, seed));
    }
}

public partial class AppColorScheme<TColor> : Scheme<TColor>
{
    public TColor Orange { get; set; } = default!;
    public TColor Blue { get; set; } = default!;
    public TColor Green { get; set; } = default!;
    public TColor Red { get; set; } = default!;
    public TColor Yellow { get; set; } = default!;
    public TColor Purple { get; set; } = default!;
    public TColor Cyan { get; set; } = default!;
    public TColor Pink { get; set; } = default!;
    public TColor Indigo { get; set; } = default!;
    public TColor Teal { get; set; } = default!;
    public TColor Lime { get; set; } = default!;
}

public class AppLightSchemeMapper : LightSchemeMapper<AppCorePalette, AppColorScheme<uint>>
{
    protected override void MapCore(AppCorePalette palette, AppColorScheme<uint> scheme)
    {
        base.MapCore(palette, scheme);
        scheme.Orange = palette.Orange[40];
        scheme.Blue = palette.Blue[40];
        scheme.Green = palette.Green[40];
        scheme.Red = palette.Red[40];
        scheme.Yellow = palette.Yellow[40];
        scheme.Purple = palette.Purple[40];
        scheme.Cyan = palette.Cyan[40];
        scheme.Pink = palette.Pink[40];
        scheme.Indigo = palette.Indigo[40];
        scheme.Teal = palette.Teal[40];
        scheme.Lime = palette.Lime[40];
    }
}

public class AppDarkSchemeMapper : DarkSchemeMapper<AppCorePalette, AppColorScheme<uint>>
{
    protected override void MapCore(AppCorePalette palette, AppColorScheme<uint> scheme)
    {
        base.MapCore(palette, scheme);
        scheme.Orange = palette.Orange[80];
        scheme.Blue = palette.Blue[80];
        scheme.Green = palette.Green[80];
        scheme.Red = palette.Red[80];
        scheme.Yellow = palette.Yellow[80];
        scheme.Purple = palette.Purple[80];
        scheme.Cyan = palette.Cyan[80];
        scheme.Pink = palette.Pink[80];
        scheme.Indigo = palette.Indigo[80];
        scheme.Teal = palette.Teal[80];
        scheme.Lime = palette.Lime[80];
    }
}
