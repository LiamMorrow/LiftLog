## LiftLog Backend

The LiftLog backend is written in C# on the latest .NET. The backend is responsible for storing and serving user feeds (which are end-to-end encrypted) and serving the AI planner. It requires a PostgreSQL database.

### Prerequisites

#### Installing .NET SDK

Install the latest .NET SDK for your platform:

**macOS:**

```bash
brew install dotnet
```

**Windows:**
Download and install from [dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)

**Linux (Ubuntu/Debian):**

```bash
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x ./dotnet-install.sh
./dotnet-install.sh --channel 9.0
```

For other Linux distributions, see the [official installation guide](https://learn.microsoft.com/en-us/dotnet/core/install/linux).

#### PostgreSQL Database

Optionally, to run a local PostgreSQL instance, use the provided Docker Compose file (requires Docker installed).

### Configuration

Before running the backend, you need to create a configuration file at [LiftLog.Api/appsettings.Development.json](LiftLog.Api/appsettings.Development.json).

Here is an example configuration that works with the Docker Compose setup:

```json
{
  "ConnectionStrings": {
    "UserDataContext": "Host=localhost;Port=5400;Database=liftlog;Username=postgres;Password=password",
    "RateLimitContext": "Host=localhost;Port=5400;Database=liftlog;Username=postgres;Password=password"
  },
  "OpenAiApiKey": "sk-test-key",
  "WebAuthApiKey": "test-web-auth-key-12345",

  // Optional
  "RevenueCatApiKey": "test-key",
  "RevenueCatProjectId": "test-project",
  "RevenueCatProEntitlementId": "pro"
}
```

**Note:** The `RevenueCatApiKey` can be omitted if a `WebAuthApiKey` is provided. It is used only for validating in-app purchases for the AI planner.

### Running the Backend

Start the PostgreSQL database and run the backend:

```bash
cd ./backend/LiftLog.Api
docker compose up -d
dotnet run
```

The backend should now be running at `http://localhost:5264`!

### Connecting the Development App

When running the app in development mode (as specified in the [root README](../README.md)), it will automatically connect to your local backend instance.
