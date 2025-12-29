/**
 * Basic usage example for Moryflow Memory Module
 *
 * This example demonstrates how to:
 * 1. Add memories to the store
 * 2. Search for relevant memories
 * 3. List and manage memories
 */

const API_BASE = 'http://localhost:8765';
const USER_ID = 'example-user';

interface MemoryItem {
  id: string;
  content: string;
  metadata: {
    userId: string;
    source: string;
    importance: number;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface SearchResult {
  items: Array<MemoryItem & { score: number; retrievalSource: string }>;
  took: number;
}

async function addMemory(content: string, tags: string[] = []): Promise<MemoryItem> {
  const response = await fetch(`${API_BASE}/memories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      metadata: {
        userId: USER_ID,
        source: 'conversation',
        importance: 0.7,
        tags,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add memory: ${response.statusText}`);
  }

  return response.json();
}

async function searchMemories(query: string, limit = 5): Promise<SearchResult> {
  const response = await fetch(`${API_BASE}/memories/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      userId: USER_ID,
      limit,
      threshold: 0.6,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to search: ${response.statusText}`);
  }

  return response.json();
}

async function listMemories(): Promise<MemoryItem[]> {
  const response = await fetch(`${API_BASE}/memories?userId=${USER_ID}`);

  if (!response.ok) {
    throw new Error(`Failed to list: ${response.statusText}`);
  }

  return response.json();
}

async function main() {
  console.log('=== Moryflow Memory Module Example ===\n');

  // Add some memories
  console.log('Adding memories...');

  await addMemory('User prefers TypeScript over JavaScript for large projects', [
    'preference',
    'programming',
  ]);
  await addMemory('User is working on an AI assistant project using NestJS', [
    'project',
    'work',
  ]);
  await addMemory('User likes to use PostgreSQL for data storage', ['preference', 'database']);
  await addMemory('The meeting with the team is scheduled for next Monday at 2pm', [
    'schedule',
    'meeting',
  ]);

  console.log('Added 4 memories\n');

  // Search for relevant memories
  console.log('Searching for "programming preferences"...');
  const results = await searchMemories('programming preferences');

  console.log(`Found ${results.items.length} results in ${results.took}ms:\n`);
  for (const item of results.items) {
    console.log(`  [${item.score.toFixed(3)}] ${item.content}`);
  }

  // List all memories
  console.log('\nAll memories:');
  const memories = await listMemories();
  for (const memory of memories) {
    console.log(`  - ${memory.content.slice(0, 50)}...`);
  }
}

main().catch(console.error);
