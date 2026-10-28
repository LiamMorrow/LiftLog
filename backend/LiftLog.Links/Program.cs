using System.Text.Encodings.Web;

var builder = WebApplication.CreateSlimBuilder(args);
var app = builder.Build();

var publicUrl = app.Configuration["PublicUrl"] ?? "https://app.liftlog.online";

app.UseStaticFiles();

MapWellKnown("apple-app-site-association");
MapWellKnown("assetlinks.json");

app.MapGet(
    "/feed/shared-item/{id}",
    () =>
        Page(
            "Shared from LiftLog",
            "Open this link in LiftLog to see it. It is end-to-end encrypted, so only people with the link can read it."
        )
);

app.MapGet(
    "/feed/share",
    (string? name) =>
        Page(
            string.IsNullOrWhiteSpace(name)
                ? "Add me as a friend on LiftLog"
                : $"Add {Truncate(name.Trim(), 40)} as a friend on LiftLog",
            "Open this link in LiftLog to send a friend request."
        )
);

app.MapGet("/health", () => "healthy");

app.MapFallback(() => Page("LiftLog", "Simple gym tracking, free for everyone."));

app.Run();

void MapWellKnown(string fileName)
{
    var path = Path.Combine(app.Environment.ContentRootPath, "WellKnown", Path.ChangeExtension(fileName, "json"));
    app.MapGet($"/.well-known/{fileName}", () => Results.File(path, "application/json"));
}

static string Truncate(string value, int maxLength) =>
    value.Length <= maxLength ? value : value[..maxLength] + "…";

IResult Page(string title, string description)
{
    var encodedTitle = HtmlEncoder.Default.Encode(title);
    var encodedDescription = HtmlEncoder.Default.Encode(description);
    var html = $$"""
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>{{encodedTitle}}</title>
            <meta name="description" content="{{encodedDescription}}" />
            <meta property="og:site_name" content="LiftLog" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="{{encodedTitle}}" />
            <meta property="og:description" content="{{encodedDescription}}" />
            <meta property="og:image" content="{{publicUrl}}/icon.png" />
            <meta property="og:image:width" content="1024" />
            <meta property="og:image:height" content="1024" />
            <meta name="twitter:card" content="summary" />
            <meta name="apple-itunes-app" content="app-id=6467372581" />
            <link rel="icon" href="/icon.png" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
            <style>
              :root {
                --base: #f0efe8;
                --text: #1a2a1a;
                --text-muted: #4a5e4a;
                --accent: #005500;
              }
              @media (prefers-color-scheme: dark) {
                :root {
                  --base: #121612;
                  --text: #e8ede8;
                  --text-muted: #9aad9a;
                  --accent: #4caf4c;
                }
              }
              * { box-sizing: border-box; margin: 0; }
              body {
                min-height: 100dvh;
                display: grid;
                place-items: center;
                padding: 24px 16px;
                background: var(--base);
                color: var(--text);
                font-family: "DM Sans", system-ui, sans-serif;
                text-align: center;
              }
              main { max-width: 420px; display: grid; justify-items: center; gap: 16px; }
              .icon { width: 96px; height: 96px; border-radius: 22px; }
              h1 { font-family: "DM Serif Display", serif; font-weight: 400; font-size: 2rem; line-height: 1.15; }
              p { color: var(--text-muted); line-height: 1.5; }
              .stores { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 8px; }
              .stores img { height: 48px; width: auto; display: block; }
              .open { color: var(--accent); font-weight: 500; margin-top: 8px; }
              footer { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 20px; margin-top: 24px; font-size: 0.9rem; }
              footer a { color: var(--text-muted); }
            </style>
          </head>
          <body>
            <main>
              <img class="icon" src="/icon.png" alt="" />
              <h1>{{encodedTitle}}</h1>
              <p>{{encodedDescription}}</p>
              <div class="stores">
                <a href="https://apps.apple.com/app/id6467372581"><img src="/app-store-badge.svg" alt="Download on the App Store" /></a>
                <a href="https://play.google.com/store/apps/details?id=com.limajuice.liftlog"><img src="/google-play-badge.svg" alt="Get it on Google Play" /></a>
                <a href="https://apps.obtainium.imranr.dev/redirect?r=obtainium://app/{%22id%22:%22com.limajuice.liftlog%22,%22url%22:%22https://github.com/LiamMorrow/LiftLog%22,%22author%22:%22LiamMorrow%22,%22name%22:%22LiftLog%22}"><img src="/badge_obtainium.png" alt="Get it on Obtainium" /></a>
              </div>
              <a id="open" class="open" href="liftlog://">Already have LiftLog? Open it</a>
              <footer>
                <a href="https://liftlog.online">liftlog.online</a>
                <a href="https://github.com/LiamMorrow/LiftLog/releases/latest">Download from GitHub</a>
                <a href="https://github.com/LiamMorrow/LiftLog">Source code</a>
              </footer>
            </main>
            <script>
              document.getElementById("open").href = "liftlog:/" + location.pathname + location.search + location.hash;
            </script>
          </body>
        </html>
        """;
    return Results.Content(html, "text/html; charset=utf-8");
}
