const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/core/services/GeminiService.ts');
let content = fs.readFileSync(file, 'utf8');

// Replace mock answer with throw
content = content.replace(/if \(\!process\.env\.GEMINI_API_KEY\) \{\n\s*return `\[MOCK AI ANSWER\][^`]*`;\n\s*\}/, `if (!process.env.GEMINI_API_KEY) {
      throw new Error("Chiave GEMINI_API_KEY non configurata sul server (variabile d'ambiente mancante).");
    }`);

// Replace mock embedding with throw
content = content.replace(/if \(\!process\.env\.GEMINI_API_KEY\) \{\n\s*return this\.generateMockEmbedding[^\n]*\n\s*\}/, `if (!process.env.GEMINI_API_KEY) {
      throw new Error("Chiave GEMINI_API_KEY non configurata sul server (variabile d'ambiente mancante).");
    }`);

content = content.replace(/catch \(e: any\) \{\n\s*console\.error\("Error generating Gemini embedding, falling back to mock:", e\.message\);\n\s*return this\.generateMockEmbedding[^\n]*\n\s*\}/, `catch (e: any) {
      console.error("Error generating Gemini embedding:", e.message);
      throw e;
    }`);
    
content = content.replace(/catch \(e: any\) \{\n\s*console\.error\("Error calling Gemini generateContent:", e\.message\);\n\s*return `\[GEMINI ERROR\] \$\{e\.message\}`;\n\s*\}/, `catch (e: any) {
      console.error("Error calling Gemini generateContent:", e.message);
      throw e;
    }`);

content = content.replace(/apiKey: apiKey \|\| "MOCK_KEY"/, 'apiKey: apiKey');

fs.writeFileSync(file, content);
