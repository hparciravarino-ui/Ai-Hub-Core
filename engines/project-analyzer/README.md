# Project Analyzer Module

## Public Interface
- `AnalysisSummary`: Schema representing detected tech stacks, files, and dependencies.
- `ProjectAnalyzer`: Class executing local recursive scanning of configurations (Docker, package.json, workflows) and mapping codebase intelligence.

## Configuration
Accepts folder paths recursively, avoiding large directories like `node_modules`.

## Implementation
Located in `/engines/project-analyzer/ProjectAnalyzer.ts`. Uses fast Node standard `fs` sync iterators.

## Tests
Self-contained unit tests located in `/engines/project-analyzer/ProjectAnalyzer.test.ts`.
