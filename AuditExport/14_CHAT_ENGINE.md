# Chat Engine

## Professional Chat
* UI Component: `ProfessionalChat.tsx`
* Rendering: Markdown rendering via `react-markdown`, syntax highlighting.
* File attachment tracking and display.

## Conversation Engine
* Context maintained in React State (`messages` array).
* Passed to `chatAPI()` mapping history to specific provider formats (Gemini parts, OpenAI messages).
* System instruction injection support.

## Context Injection
* File attachments are uploaded via `/api/files/upload`.
* Extracted OCR/text is appended to prompts before sending to LLM.
