import { DataViewProps } from '../types';
import { getProjectConfig, autoGenerateFields } from '../config/projects';
import { FieldSection } from './FieldSection';
import { RawDataToggle } from './RawDataToggle';

export function DataView({ data, projectId }: DataViewProps) {
  const config = getProjectConfig(projectId);
  const sections = config.sections;

  // Auto-generate fields if configuration has empty fields
  const processedSections = sections.map((section) => {
    if (section.fields.length === 0) {
      return {
        ...section,
        fields: autoGenerateFields(data.data)
      };
    }
    return section;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {processedSections.map((section, index) => (
        <FieldSection
          key={index}
          title={section.title}
          fields={section.fields}
          data={data.data}
          collapsible={section.collapsible}
          defaultExpanded={section.defaultExpanded}
        />
      ))}

      <RawDataToggle data={data} />
    </div>
  );
}
