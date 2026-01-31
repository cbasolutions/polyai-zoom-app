import { FieldProps } from '../types';

export function Field({ label, value, type = 'text' }: FieldProps) {
  const formatValue = () => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Not provided</span>;
    }

    switch (type) {
      case 'datetime':
        try {
          const date = new Date(value);
          return date.toLocaleString();
        } catch {
          return String(value);
        }

      case 'boolean':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {value ? 'Yes' : 'No'}
          </span>
        );

      case 'url':
        return (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {String(value)}
          </a>
        );

      case 'email':
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {String(value)}
          </a>
        );

      case 'number':
        return <span className="font-mono">{Number(value).toLocaleString()}</span>;

      default:
        return <span>{String(value)}</span>;
    }
  };

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{formatValue()}</dd>
    </div>
  );
}
