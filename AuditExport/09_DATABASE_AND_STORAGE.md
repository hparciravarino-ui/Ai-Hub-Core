# Database and Storage

## Workspace Storage
* **Type**: Local File System
* **Path**: `workspace_uploads/`
* **Contents**: Uploaded documents, ZIP extractions. Used by `filesRouter`.

## Knowledge Base (Vector)
* **Type**: In-Memory / Local Simulation
* **Engine**: `LocalVectorDatabase`
* **Format**: 1536-dimensional float arrays with metadata payload. Persistence simulated in-memory.

## Caching
* **Type**: In-Memory LRU (React state & simple maps in Node).
* **Usage**: Hardware metrics caching, Model recommendations caching.

## Persistence
* **App State**: React hooks local state.
* **Env Settings**: `.env` file accessed via `fs`.
