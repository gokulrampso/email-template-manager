import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { templateApi } from '../services/api';
import { FullPageLoader } from '../components/LoadingSpinner';
import { SAMPLE_DATA_SETS } from '../components/TemplateBuilder/sampleTemplates';
import toast from 'react-hot-toast';

function TemplatePreview() {
  const { id, version } = useParams();
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [showPlaceholderPanel, setShowPlaceholderPanel] = useState(true);
  const [selectedDataSet, setSelectedDataSet] = useState('default');

  useEffect(() => {
    loadTemplate();
  }, [id, version]);

  // Initialize placeholder values when template loads
  useEffect(() => {
    if (template?.placeholders) {
      const initialValues = {};
      template.placeholders.forEach((p) => {
        initialValues[p] = '';
      });
      setPlaceholderValues(initialValues);
    }
  }, [template?.placeholders]);

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (version) {
        response = await templateApi.getVersion(id, parseInt(version));
      } else {
        response = await templateApi.getById(id);
      }
      
      setTemplate(response.data);
    } catch (error) {
      toast.error(error.message || 'Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate preview HTML with placeholder values replaced
  const previewHtml = useMemo(() => {
    if (!template?.htmlContent) return '';
    
    let html = template.htmlContent;
    
    // Replace placeholders with values or show placeholder name in brackets
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
      if (value.trim()) {
        html = html.replace(regex, value);
      } else {
        // Show placeholder name in styled brackets when no value
        html = html.replace(regex, `<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 12px;">[${key}]</span>`);
      }
    });
    
    return html;
  }, [template?.htmlContent, placeholderValues]);

  const handlePlaceholderChange = (placeholder, value) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [placeholder]: value,
    }));
  };

  const clearAllValues = () => {
    const cleared = {};
    template?.placeholders?.forEach((p) => {
      cleared[p] = '';
    });
    setPlaceholderValues(cleared);
  };

  const fillSampleValues = (dataSetId = null) => {
    const dataSet = SAMPLE_DATA_SETS.find(d => d.id === (dataSetId || selectedDataSet));
    const samples = {};
    template?.placeholders?.forEach((p) => {
      // First try to get value from selected data set
      if (dataSet?.data[p]) {
        samples[p] = dataSet.data[p];
      } else {
        // Fall back to auto-generated sample
        samples[p] = getSampleValue(p);
      }
    });
    setPlaceholderValues(samples);
  };

  const handleDataSetChange = (dataSetId) => {
    setSelectedDataSet(dataSetId);
    fillSampleValues(dataSetId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <FullPageLoader message="Loading preview..." />;
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Template Not Found</h2>
        <Link to="/" className="btn-primary">Back to Templates</Link>
      </div>
    );
  }

  const hasPlaceholders = template.placeholders && template.placeholders.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
          <Link to="/" className="hover:text-white">Templates</Link>
          <span>/</span>
          <Link to={`/templates/${id}/versions`} className="hover:text-white">{template.name}</Link>
          <span>/</span>
          <span className="text-white">Preview</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {template.name}
              <span className="badge badge-primary">v{template.version}</span>
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {version ? `Viewing version ${version}` : 'Latest version'} • 
              Updated: {formatDate(template.updatedAt)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to={`/templates/${id}/versions`} className="btn-secondary">
              Version History
            </Link>
            <Link to={`/templates/${id}/edit`} className="btn-primary">
              Edit Template
            </Link>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Template ID</div>
          <div className="text-white font-mono text-sm truncate">{template.templateId}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Brand</div>
          <div className="text-white">{template.brandId || '—'}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Language</div>
          <div className="text-white">{template.language || '—'}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Placeholders</div>
          <div className="text-white">{template.placeholders?.length || 0} variables</div>
        </div>
      </div>

      <div className={`grid gap-6 ${hasPlaceholders && showPlaceholderPanel ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Placeholder Values Panel */}
        {hasPlaceholders && showPlaceholderPanel && (
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">Test Values</h2>
                <button
                  onClick={() => setShowPlaceholderPanel(false)}
                  className="btn-ghost p-1.5"
                  title="Hide panel"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-white/50 text-sm mb-4">
                Enter values to preview how your email will look with real data.
              </p>

              {/* Data Set Selector */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Load Sample Data
                </label>
                <select
                  value={selectedDataSet}
                  onChange={(e) => handleDataSetChange(e.target.value)}
                  className="input py-2 text-sm w-full"
                >
                  {SAMPLE_DATA_SETS.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => fillSampleValues()}
                  className="btn-secondary py-1.5 px-3 text-xs flex-1"
                >
                  Apply Sample Data
                </button>
                <button
                  onClick={clearAllValues}
                  className="btn-ghost py-1.5 px-3 text-xs"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {template.placeholders.map((placeholder) => (
                  <div key={placeholder}>
                    <label className="block text-xs font-medium text-white/60 mb-1.5 font-mono">
                      {`{{${placeholder}}}`}
                    </label>
                    <input
                      type="text"
                      value={placeholderValues[placeholder] || ''}
                      onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                      placeholder={getSampleValue(placeholder)}
                      className="input py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Panel */}
        <div className={hasPlaceholders && showPlaceholderPanel ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Email Preview</h2>
              <div className="flex items-center gap-2">
                {hasPlaceholders && !showPlaceholderPanel && (
                  <button
                    onClick={() => setShowPlaceholderPanel(true)}
                    className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Test Values</span>
                  </button>
                )}
              </div>
            </div>
            <div className="preview-container rounded-xl overflow-hidden shadow-2xl" style={{ height: '650px' }}>
              <iframe
                srcDoc={previewHtml}
                title="Email Preview"
                className="w-full h-full bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Raw HTML */}
      <div className="glass-card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">HTML Source</h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(template.htmlContent);
              toast.success('HTML copied to clipboard!');
            }}
            className="btn-ghost p-2"
            title="Copy HTML"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <pre className="bg-dark-900 rounded-xl p-4 overflow-x-auto text-sm font-mono text-white/70 max-h-[400px]">
          {template.htmlContent}
        </pre>
      </div>
    </div>
  );
}

// Helper to escape special regex characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Generate sample values based on placeholder name
function getSampleValue(placeholder) {
  const lower = placeholder.toLowerCase();
  
  if (lower.includes('name')) return 'John Doe';
  if (lower.includes('email')) return 'john@example.com';
  if (lower.includes('company')) return 'Acme Corp';
  if (lower.includes('url') || lower.includes('link')) return 'https://example.com';
  if (lower.includes('date')) return new Date().toLocaleDateString();
  if (lower.includes('phone')) return '+1 (555) 123-4567';
  if (lower.includes('address')) return '123 Main St, City';
  if (lower.includes('logo')) return 'https://via.placeholder.com/150x50';
  if (lower.includes('amount') || lower.includes('price')) return '$99.99';
  if (lower.includes('order') || lower.includes('id')) return 'ORD-12345';
  
  return `Sample ${placeholder}`;
}

export default TemplatePreview;
