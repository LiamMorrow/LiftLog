using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Components.WebAssembly.Http;
using Octokit;

namespace LiftLog.Translator.Services;

public class GithubService
{
    public async Task<List<string>> GetExistingTranslationExtensions()
    {
        var client = new GitHubClient(new Octokit.ProductHeaderValue("liftlog-translator"));
        var files = await client.Repository.Content.GetAllContents(
            "LiamMorrow",
            "LiftLog",
            "LiftLog.Ui/i18n"
        );

        return files
            .Where(x => !x.Name.EndsWith("UiStrings.resx"))
            .Where(f => f.Name.EndsWith(".resx"))
            .Select(f => f.Name.Split(".")[1])
            .ToList();
    }
}
