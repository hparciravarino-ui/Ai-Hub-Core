# Architecture Map

## Presentation Layer
React SPA (`src/components`, `src/App.tsx`)
Tailwind CSS (`src/index.css`)
Lucide React Icons

## Application Layer
Express Routers (`src/server/routes`)
Core Services (`src/core/services`)

## Domain Layer
Engine Logic (`src/shared/hardware`, `src/core/models`, `src/core/knowledge`, `src/core/benchmark`, `src/core/security`)
Type Definitions (`src/types.ts`)

## Infrastructure Layer
Vite Dev Server
Node.js File System (`fs`)
Local Vector DB Simulation (`src/core/vector/LocalVectorDatabase.ts`)
