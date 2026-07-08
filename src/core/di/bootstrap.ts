import { Container } from './Container';
import { DITokens } from './tokens';
import { GeminiService } from '../services/GeminiService';

export function bootstrapDI() {
  Container.register(DITokens.AIService, new GeminiService());
}
