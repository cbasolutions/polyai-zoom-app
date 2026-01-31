import { ProjectConfigs } from '../types';

/**
 * Project-specific field mappings and display configurations
 * Add new projects here as they are onboarded
 */
export const PROJECT_CONFIGS: ProjectConfigs = {
  'EXAMPLE-PROJECT-123': {
    title: 'Test Project',
    sections: [
      {
        title: 'Case Information',
        fields: [
          { key: 'test_value_1', label: 'Case Number', type: 'text' },
          { key: 'test_value_2', label: 'Call Purpose', type: 'text' }
        ],
        defaultExpanded: true
      },
      {
        title: 'Metadata',
        fields: [
          { key: 'current_date_time', label: 'Timestamp', type: 'datetime' },
          { key: 'x_trace_id', label: 'Trace ID', type: 'text' }
        ],
        collapsible: true,
        defaultExpanded: false
      }
    ],
    showRawByDefault: false
  }
};

/**
 * Default configuration for projects not explicitly configured
 */
export const DEFAULT_CONFIG: ProjectConfigs['default'] = {
  sections: [
    {
      title: 'Call Information',
      fields: [], // Will be auto-generated from response data
      defaultExpanded: true
    }
  ],
  showRawByDefault: false
};

/**
 * Get configuration for a project, falling back to default
 */
export function getProjectConfig(projectId: string) {
  return PROJECT_CONFIGS[projectId] || DEFAULT_CONFIG;
}

/**
 * Auto-generate field configs from data when no config exists
 */
export function autoGenerateFields(data: Record<string, any>) {
  return Object.keys(data)
    .filter(key => key !== 'id' && key !== 'shared_id') // Skip metadata fields
    .map(key => ({
      key,
      label: formatLabel(key),
      type: inferType(data[key]) as any
    }));
}

/**
 * Convert snake_case to Title Case
 */
function formatLabel(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Infer field type from value
 */
function inferType(value: any): string {
  if (value === null || value === undefined) return 'text';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    // Check for datetime patterns
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'datetime';
    // Check for URL patterns
    if (/^https?:\/\//.test(value)) return 'url';
    // Check for email patterns
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
  }
  return 'text';
}
