import { Router, Request, Response } from 'express';
import {
  MockLLMProvider,
  MockEmbeddingProvider,
  MockOCRProvider,
  MockMalwareScanner,
  MockObjectStorage,
} from '@legallens/ai';

export const healthRouter = Router();

healthRouter.get(['/health', '/api/v1/health'], async (req: Request, res: Response) => {
  const llm = new MockLLMProvider();
  const embed = new MockEmbeddingProvider();
  const ocr = new MockOCRProvider();
  const scanner = new MockMalwareScanner();
  const storage = new MockObjectStorage();

  const healthStatus = {
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    request_id: req.requestId,
    services: {
      api: { status: 'healthy' },
      ai_provider: {
        status: 'healthy',
        llm_model: llm.getModelName(),
        embedding_model: embed.getModelName(),
        ocr_provider: ocr.getProviderName(),
        malware_scanner: scanner.getScannerName(),
      },
      storage: {
        status: 'healthy',
        provider: storage.getStorageProviderName(),
      },
      database: {
        status: process.env.DATABASE_URL ? 'configured' : 'mock_ready',
      },
    },
  };

  res.status(200).json(healthStatus);
});
