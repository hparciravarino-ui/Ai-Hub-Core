# AI Engine

## Providers
* Google Gemini (`@google/genai` SDK via `GeminiService`)
* OpenRouter API (Fallback mechanism)
* OpenAI Native (via raw fetch in `apiClient.ts`)
* Anthropic API (via raw fetch in `apiClient.ts`)

## Model Manager
* Supports Model definitions, context lengths, system prompts.
* Handles Local Models (Ollama proxy capabilities mapping).
* Location: `src/core/models/EnterpriseModelManager.ts`

## Routing
* Primary: Gemini.
* Fallback: OpenRouter if Gemini key fails or custom model requested.
* Specific: Direct OpenAI/Anthropic/Groq paths when keys present.
* Location: `apiClient.ts`
