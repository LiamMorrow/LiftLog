using System;
using System.Net.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Fluxor;
using SimpleGymTracker.Lib.Store;
using SimpleGymTracker.WebUi.Store.WorkoutSession;
using Blazored.LocalStorage;
using SimpleGymTracker.WebUi.Services;
using SimpleGymTracker.Lib.Serialization;

namespace SimpleGymTracker.WebUi
{
  public class Program
  {
    public static async Task Main(string[] args)
    {
      var builder = WebAssemblyHostBuilder.CreateDefault(args);
      builder.RootComponents.Add<WebApplication>("#app");

      builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
      builder.Services.AddBlazoredLocalStorage();

      builder.Services.AddFluxor(o => o
        .ScanAssemblies(typeof(Program).Assembly)
        .AddMiddleware<PersistSessionMiddleware>()
        .UseReduxDevTools());

      builder.Services.AddScoped<IProgressStore, LocalStorageProgressStore>();

      await builder.Build().RunAsync();
    }
  }
}
