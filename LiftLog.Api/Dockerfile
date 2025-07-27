# Use the official .NET 9 runtime as the base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# Install curl and other useful utilities
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    vim \
    net-tools \
    dnsutils \
    traceroute \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Use the .NET 9 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["LiftLog.Api/LiftLog.Api.csproj", "LiftLog.Api/"]
COPY ["LiftLog.Lib/LiftLog.Lib.csproj", "LiftLog.Lib/"]
COPY ["RevenueCat/RevenueCat.csproj", "RevenueCat/"]

# Restore dependencies
RUN dotnet restore "LiftLog.Api/LiftLog.Api.csproj"

# Copy only the source code we need
COPY ["LiftLog.Api/", "LiftLog.Api/"]
COPY ["LiftLog.Lib/", "LiftLog.Lib/"]
COPY ["RevenueCat/", "RevenueCat/"]

# Build the application
WORKDIR "/src/LiftLog.Api"
RUN dotnet build "LiftLog.Api.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "LiftLog.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage - create the runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set the entry point
ENTRYPOINT ["dotnet", "LiftLog.Api.dll"]
