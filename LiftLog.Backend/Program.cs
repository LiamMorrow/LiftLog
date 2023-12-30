using LiftLog.Backend.Db;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<UserDataContext>(
    options => options.UseNpgsql(builder.Configuration.GetConnectionString("UserDataContext"))
);
var app = builder.Build();

app.UseHttpsRedirection();

app.MapGet(
    "/health",
    () =>
    {
        return "healthy";
    }
);

app.Run();
