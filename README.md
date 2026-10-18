# Distributed Payments System

An early-stage Node.js/TypeScript monorepo for a distributed payments system. The repository currently contains two Express services with health-check endpoints. Payment workflows, persistence, messaging, API gateway, and container orchestration are not implemented yet.

## Requirements

- Node.js 20 or newer
- npm (included with Node.js)

This repository uses npm workspaces and a single root `package-lock.json`.

## Getting Started

From the repository root, install dependencies:

```sh
npm install
```

Copy the example environment files. In PowerShell:

```powershell
Copy-Item services/user-management-service/.env.example services/user-management-service/.env
Copy-Item services/distributed-wallet-engine/.env.example services/distributed-wallet-engine/.env
```

Start a service from the repository root:

```sh
npm run dev:users
```

In a second terminal, start the wallet service:

```sh
npm run dev:wallet
```

The services listen on ports `3001` and `3002` by default. Set `PORT` in the corresponding service `.env` file to change a port.

## Services

| Workspace                        | Location                             | Purpose                            | Health endpoint                           |
| -------------------------------- | ------------------------------------ | ---------------------------------- | ----------------------------------------- |
| `@dps/user-management-service`   | `services/user-management-service`   | User-management service foundation | `GET http://localhost:3001/api/v1/health` |
| `@dps/distributed-wallet-engine` | `services/distributed-wallet-engine` | Wallet service foundation          | `GET http://localhost:3002/api/v1/health` |

Both health endpoints return a JSON status and timestamp, for example:

```json
{
  "status": "OK",
  "timestamp": "2026-10-18T12:00:00.000Z"
}
```

## Repository Layout

```text
.
├── services/
│   ├── distributed-wallet-engine/
│   └── user-management-service/
├── packages/                  # Reserved for shared workspace packages
├── package.json               # Root npm workspace configuration and scripts
├── package-lock.json          # Shared dependency lockfile
└── README.md
```

Each service has its own `package.json`, TypeScript configuration, and `src/` directory. Install dependencies from the repository root so npm manages the workspaces together.

## Available Commands

| Command              | Description                                     |
| -------------------- | ----------------------------------------------- |
| `npm run dev:users`  | Run the user-management service in watch mode   |
| `npm run dev:wallet` | Run the distributed-wallet engine in watch mode |

Docker Compose, automated tests, and production build scripts have not been set up yet.

## Environment Files

Keep service-specific local configuration in each service's `.env` file. These files are ignored by Git; commit only `.env.example` templates, never credentials or local secrets.
