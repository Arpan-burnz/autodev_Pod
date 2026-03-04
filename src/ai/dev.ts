import { config } from 'dotenv';
config();

import '@/ai/flows/ai-product-manager-requirements-generation.ts';
import '@/ai/flows/ai-qa-test-generation-and-execution.ts';
import '@/ai/flows/ai-developer-code-generation.ts';
import '@/ai/flows/ai-system-architect-design-generation.ts';
import '@/ai/flows/ai-dev-ops-deployment-suggestions.ts';