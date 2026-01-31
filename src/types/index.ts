/**
 * Type definitions for PolyAI Zoom Phone integration
 */

// PolyAI API Response
export interface PolyAIResponse {
  data: Record<string, any>;
  id: string | null;
  shared_id: string;
}

// Zoom Phone Context from SDK
export interface ZoomPhoneContext {
  activeTab?: string;
  callId?: string;
  callObject?: {
    accountId?: string;
    answerStartTime?: string;
    callEndTime?: string;
    callStatus?: string;
    status?: string;
    callee?: {
      deviceId?: string;
      extensionId?: string;
      extensionNumber?: string;
      extensionType?: string;
      phoneNumber?: string;
      timezone?: string;
      userId?: string;
    };
    caller?: {
      deviceId?: string;
      extensionId?: string;
      extensionNumber?: string;
      extensionType?: string;
      phoneNumber?: string;
      timezone?: string;
      userId?: string;
    };
    forwardedBy?: {
      extensionNumber?: string;
      extensionType?: string;
      name?: string;
    };
    ringingStartTime?: string;
    traceId?: string;
  };
  callStatus?: string;
  direction?: string;
  eventTs?: string;
  traceId?: string;
}

// Field Configuration
export interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'datetime' | 'boolean' | 'url' | 'email';
  format?: string;
}

// Section Configuration
export interface SectionConfig {
  title: string;
  fields: FieldConfig[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Project Configuration
export interface ProjectConfig {
  title?: string;
  sections: SectionConfig[];
  showRawByDefault?: boolean;
}

// All Project Configurations
export interface ProjectConfigs {
  [projectId: string]: ProjectConfig;
}

// Component Props
export interface DataViewProps {
  data: PolyAIResponse;
  projectId: string;
}

export interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export interface FieldProps {
  label: string;
  value: any;
  type?: 'text' | 'number' | 'datetime' | 'boolean' | 'url' | 'email';
  format?: string;
}

export interface FieldSectionProps {
  title: string;
  fields: FieldConfig[];
  data: Record<string, any>;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}
