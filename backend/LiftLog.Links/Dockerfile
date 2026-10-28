# Build from the repository root: docker build -f backend/LiftLog.Links/Dockerfile .

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
RUN apt-get update \
    && apt-get install -y --no-install-recommends clang zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /src

COPY backend/LiftLog.Links/LiftLog.Links.csproj backend/LiftLog.Links/
RUN dotnet restore backend/LiftLog.Links/LiftLog.Links.csproj

COPY backend/LiftLog.Links backend/LiftLog.Links
RUN dotnet publish backend/LiftLog.Links/LiftLog.Links.csproj -c Release --no-restore -o /out

FROM mcr.microsoft.com/dotnet/runtime-deps:10.0
WORKDIR /app
COPY --from=build /out ./
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["./LiftLog.Links"]
