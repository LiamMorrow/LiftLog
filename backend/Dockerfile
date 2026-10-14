# Build from the repository root: docker build -f backend/Dockerfile .
# The root is needed because LiftLog.Api embeds docs/schemas/ai-plan/AiPlan.json.

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first so it caches independently of source changes.
COPY backend/LiftLog.Api/LiftLog.Api.csproj backend/LiftLog.Api/
COPY backend/LiftLog.Lib/LiftLog.Lib.csproj backend/LiftLog.Lib/
COPY backend/RevenueCat/RevenueCat.csproj backend/RevenueCat/
RUN dotnet restore backend/LiftLog.Api/LiftLog.Api.csproj

COPY . .
RUN dotnet publish backend/LiftLog.Api/LiftLog.Api.csproj -c Release --no-restore -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# libgssapi-krb5-2 is Npgsql's Kerberos dependency; without it every Postgres boot logs a
# "Cannot load library libgssapi_krb5.so.2" failure before falling back.
# /var/lib/liftlog is owned by the app user so a named volume mounted there is writable.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /var/lib/liftlog \
    && chown -R $APP_UID:$APP_UID /var/lib/liftlog
VOLUME /var/lib/liftlog

COPY --from=build /out ./
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "LiftLog.Api.dll"]
