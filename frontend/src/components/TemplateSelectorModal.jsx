import { useState } from 'react';
import { SAMPLE_TEMPLATES } from './TemplateBuilder/sampleTemplates';

function TemplateSelectorModal({ isOpen, onClose, onSelectTemplate, onSelectData }) {
  // onSelectData is optional
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDataPreview, setShowDataPreview] = useState(false);

  if (!isOpen) return null;

  const selectedTemplateData = SAMPLE_TEMPLATES.find((t) => t.id === selectedTemplate);

  const handleContinue = () => {
    const template = SAMPLE_TEMPLATES.find((t) => t.id === selectedTemplate);
    onSelectTemplate(template || null);
    // Sample data is now included in the template, handled by parent
    if (onSelectData) {
      onSelectData(template?.sampleData || {});
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-900/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card w-full max-w-4xl max-h-[85vh] mx-4 overflow-hidden animate-modal-enter">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Create New Template</h2>
          <p className="text-white/60 mt-1">
            Choose a starting point — each template includes matching sample data for preview
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SAMPLE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                  selectedTemplate === template.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <div className="text-4xl mb-3">{template.thumbnail}</div>
                <h3 className="text-white font-medium mb-1">{template.name}</h3>
                <p className="text-white/50 text-sm mb-2">{template.description}</p>
                
                {/* Show sample data count */}
                {template.sampleData && Object.keys(template.sampleData).length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span>{Object.keys(template.sampleData).length} sample values included</span>
                  </div>
                )}
                
                {selectedTemplate === template.id && (
                  <div className="mt-3 flex items-center gap-1 text-primary-400 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sample Data Preview Panel */}
        {selectedTemplate && selectedTemplateData?.sampleData && (
          <div className="px-6 pb-2">
            <button
              onClick={() => setShowDataPreview(!showDataPreview)}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <svg 
                className={`w-4 h-4 transition-transform ${showDataPreview ? 'rotate-90' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Preview sample data for "{selectedTemplateData.name}"
            </button>
            
            {showDataPreview && (
              <div className="mt-3 p-4 bg-dark-700/50 rounded-xl border border-white/5 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(selectedTemplateData.sampleData).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <div className="font-mono text-primary-400 text-xs mb-0.5">
                        {`{{${key}}}`}
                      </div>
                      <div className="text-white/70 truncate" title={value}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <div className="text-white/50 text-sm">
            {selectedTemplate && selectedTemplateData && (
              <span className="flex items-center gap-2">
                <span className="text-2xl">{selectedTemplateData.thumbnail}</span>
                <span>
                  <span className="text-white font-medium">{selectedTemplateData.name}</span>
                  {selectedTemplateData.sampleData && (
                    <span className="text-white/40 ml-2">
                      • {Object.keys(selectedTemplateData.sampleData).length} sample values
                    </span>
                  )}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleContinue} className="btn-primary">
              {selectedTemplate ? 'Use Template' : 'Start Blank'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateSelectorModal;
