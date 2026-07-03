# Security Module

## Public Interface
- `AuditRecord`: Type representing secure, auditable, and trace-certified event records.
- `SecurityEngine`: Singleton auditing system-wide operations, running cryptographic hash checks, and policing untrusted plugin hooks.

## Implementation
Located in `/engines/security/SecurityEngine.ts`. Completely centralizes permission controls to avoid redundant security logic.

## Tests
Self-contained unit tests located in `/engines/security/Security.test.ts`.
