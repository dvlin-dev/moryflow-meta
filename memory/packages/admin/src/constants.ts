/**
 * Shared constants for Admin UI
 *
 * [PROVIDES]: API_BASE, USER_ID, ENTITY_TYPES, TYPE_COLORS, NAVIGATION
 * [DEPENDS]: none
 * [POS]: Central constants file, imported by client.ts, pages, components
 */

// API Configuration
export const API_BASE = '/api';
export const USER_ID = 'admin';

// Entity types matching @moryflow/memory-core
export const ENTITY_TYPES = [
  'person',
  'organization',
  'location',
  'concept',
  'event',
  'custom',
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

// Graph visualization colors by entity type
export const TYPE_COLORS: Record<string, string> = {
  person: '#3b82f6',
  organization: '#10b981',
  location: '#f59e0b',
  concept: '#8b5cf6',
  event: '#ef4444',
  custom: '#6b7280',
};

// Navigation items
export const NAVIGATION = [
  { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { name: 'Memories', href: '/memories', icon: 'Brain' },
  { name: 'Entities', href: '/entities', icon: 'Network' },
  { name: 'Relations', href: '/relations', icon: 'GitBranch' },
  { name: 'Graph', href: '/graph', icon: 'Share2' },
] as const;
