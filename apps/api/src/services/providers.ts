import {
  ObjectStorage,
  MockObjectStorage,
  MalwareScanner,
  MockMalwareScanner,
  OCRProvider,
  EmbeddingProvider,
  LLMProvider,
  createLLMProvider,
  createEmbeddingProvider,
  createOCRProvider,
} from '@legallens/ai';

// Configuration from environment
const config = {
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'mock',
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || 'mock',
  OCR_PROVIDER: process.env.OCR_PROVIDER || 'mock',
};

export const globalStorage: ObjectStorage = new MockObjectStorage();
export const globalMalwareScanner: MalwareScanner = new MockMalwareScanner();
export const globalOCRProvider: OCRProvider = createOCRProvider(config.OCR_PROVIDER);
export const globalEmbeddingProvider: EmbeddingProvider = createEmbeddingProvider(config.EMBEDDING_PROVIDER);
export const globalLLMProvider: LLMProvider = createLLMProvider(config.LLM_PROVIDER);
