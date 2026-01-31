import { useState } from 'react';
import { FieldSectionProps } from '../types';
import { Field } from './Field';

export function FieldSection({
  title,
  fields,
  data,
  collapsible = false,
  defaultExpanded = true
}: FieldSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div
        className={`px-6 py-4 border-b border-gray-200 ${
          collapsible ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
        }`}
        onClick={() => collapsible && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {collapsible && (
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expanded ? 'transform rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {expanded && (
        <dl className="px-6 py-2">
          {fields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              value={data[field.key]}
              type={field.type}
              format={field.format}
            />
          ))}
        </dl>
      )}
    </div>
  );
}
