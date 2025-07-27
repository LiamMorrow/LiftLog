# LiftLog.Api

This is the backend API for LiftLog. It is built with ASP.NET Core and requires a PostgreSQL database. You can run the API locally for development and testing.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/) (for running the database)
- PostgreSQL (recommended to use Docker Compose)

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/LiamMorrow/LiftLog.git
cd LiftLog/LiftLog.Api
```

### 2. Start the database

A `docker-compose.yml` is provided to start the required PostgreSQL containers.

```sh
docker compose up -d
```

### 3. Configure environment variables

Create a file named `appsettings.Development.json` in the `LiftLog.Api` directory. Below is a sample configuration. Replace the dummy values with your actual credentials and keys.

```json
{
  "ConnectionStrings": {
    // These can be the same database
    "UserDataContext": "Host=localhost;Port=5432;Database=liftlog_user;Username=postgres;Password=postgres",
    "RateLimitContext": "Host=localhost;Port=5432;Database=liftlog_ratelimit;Username=postgres;Password=postgres"
  },
  "OpenAiApiKey": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  // Credentials and configuration for verifying in app purchases
  // if these are not set, authentication via these providers will fail
  // However it is not required to configure them all if you don't need them all

  // RevenueCat configuration for the v2 api
  "RevenueCatApiKey": "revenuecat_api_key_here",
  "RevenueCatProjectId": "revenuecat_project_id_here",
  "RevenueCatProEntitlementId": "pro_entitlement_id_here",
  // A general API key that can be passed.
  "WebAuthApiKey": "webauth_api_key_here",
  // Google credentials for accessing purchase information from play console -- deprecated
  "GooglePlayServiceAccountKeyBase64": "base64_encoded_service_account_key",
  "GooglePlayServiceAccountEmail": "service-account@project-id.iam.gserviceaccount.com"
}
```

### 4. Run database migrations

Migrations are applied automatically on startup.

### 5. Run the API

```sh
dotnet run --project LiftLog.Api.csproj
```

The API will be available at `http://localhost:5000` (or the port specified in your launch settings).

## Health Check

You can verify the API is running by visiting:

```
GET /health
```

## SignalR

The API exposes a SignalR hub at `/ai-chat`.
