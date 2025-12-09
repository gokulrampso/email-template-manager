import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { templateApi } from '../services/api';
import { FullPageLoader } from '../components/LoadingSpinner';
import { SAMPLE_TEMPLATES } from '../components/TemplateBuilder/sampleTemplates';
import toast from 'react-hot-toast';

function TemplatePreview() {
  const { id, version } = useParams();
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [showPlaceholderPanel, setShowPlaceholderPanel] = useState(true);

  // Find matching template and its sample data
  const findMatchingTemplateData = (templateName) => {
    if (!templateName) return null;
    const lowerName = templateName.toLowerCase();
    
    // Check if template name matches any sample template
    const matchedTemplate = SAMPLE_TEMPLATES.find(t => 
      lowerName.includes(t.name.toLowerCase()) || 
      lowerName.includes(t.id)
    );
    
    return matchedTemplate?.sampleData || null;
  };

  // Extract placeholders from HTML content
  const extractPlaceholders = (html) => {
    if (!html) return [];
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = html.matchAll(regex);
    const found = new Set();
    for (const match of matches) {
      found.add(match[1].trim());
    }
    return Array.from(found).sort();
  };

  // Get all placeholders from template (merge backend placeholders with dynamically extracted ones)
  const allPlaceholders = useMemo(() => {
    if (!template?.htmlContent) return template?.placeholders || [];
    const extractedPlaceholders = extractPlaceholders(template.htmlContent);
    const backendPlaceholders = template.placeholders || [];
    // Merge and deduplicate
    const merged = new Set([...backendPlaceholders, ...extractedPlaceholders]);
    return Array.from(merged).sort();
  }, [template?.htmlContent, template?.placeholders]);

  useEffect(() => {
    loadTemplate();
  }, [id, version]);

  // Update placeholder values when placeholders change (for new/modified templates)
  useEffect(() => {
    if (allPlaceholders && allPlaceholders.length > 0 && template) {
      setPlaceholderValues((prev) => {
        const updated = { ...prev };
        let hasChanges = false;
        
        // Check if we need to initialize from template sample data
        const isInitialLoad = Object.keys(prev).length === 0;
        const templateSampleData = findMatchingTemplateData(template.name);
        
        // Add any new placeholders that weren't in the previous set
        allPlaceholders.forEach((p) => {
          if (!(p in updated)) {
            hasChanges = true;
            // If initial load and we have template-specific data, use it
            if (isInitialLoad && templateSampleData && templateSampleData[p] != null) {
              updated[p] = String(templateSampleData[p]);
            } else {
              updated[p] = '';
            }
          } else if (updated[p] == null || updated[p] === undefined) {
            // Ensure existing values are strings, not null/undefined
            hasChanges = true;
            updated[p] = '';
          }
        });
        
        // Remove placeholders that no longer exist in the template
        Object.keys(updated).forEach((key) => {
          if (!allPlaceholders.includes(key)) {
            hasChanges = true;
            delete updated[key];
          }
        });
        
        // Only update if there are actual changes
        return hasChanges ? updated : prev;
      });
    }
  }, [allPlaceholders, template]);

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (version) {
        response = await templateApi.getVersion(id, parseInt(version));
      } else {
        response = await templateApi.getById(id);
      }
      
      const templateData = response.data;
      setTemplate(templateData);
      
      // Immediately initialize placeholder values when template loads
      if (templateData?.htmlContent) {
        const extractedPlaceholders = extractPlaceholders(templateData.htmlContent);
        const backendPlaceholders = templateData.placeholders || [];
        const merged = new Set([...backendPlaceholders, ...extractedPlaceholders]);
        const allPlaceholdersList = Array.from(merged).sort();
        
        if (allPlaceholdersList.length > 0) {
          const templateSampleData = findMatchingTemplateData(templateData.name);
          const initialValues = {};
          
          allPlaceholdersList.forEach((p) => {
            if (templateSampleData && templateSampleData[p] != null) {
              initialValues[p] = String(templateSampleData[p]);
            } else {
              initialValues[p] = '';
            }
          });
          
          setPlaceholderValues(initialValues);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate preview HTML with placeholder values replaced
  const previewHtml = useMemo(() => {
    if (!template?.htmlContent) return '';
    
    // Always start with the original HTML to avoid issues with multiple replacements
    let html = template.htmlContent;
    
    // Replace all placeholders - use a Set to track which ones we've replaced
    const replacedPlaceholders = new Set();
    
    // First, replace placeholders that have non-empty values
    // Process all entries in placeholderValues
    if (placeholderValues && Object.keys(placeholderValues).length > 0) {
      Object.entries(placeholderValues).forEach(([key, value]) => {
        // Check if value exists and is not empty (after trimming)
        if (value != null && value !== undefined && value !== '') {
          const stringValue = String(value);
          if (stringValue.trim() !== '') {
            const regex = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
            html = html.replace(regex, stringValue);
            replacedPlaceholders.add(key);
          }
        }
      });
    }
    
    // Then, replace any remaining placeholders (those without values) with styled brackets
    // Only process placeholders that haven't been replaced yet
    if (allPlaceholders && allPlaceholders.length > 0) {
      allPlaceholders.forEach((key) => {
        if (!replacedPlaceholders.has(key)) {
          const regex = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
          // Show placeholder name in styled brackets when no value
          html = html.replace(regex, `<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 12px;">[${key}]</span>`);
        }
      });
    }
    
    return html;
  }, [template?.htmlContent, placeholderValues, allPlaceholders]);

  const handlePlaceholderChange = (placeholder, value) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [placeholder]: value,
    }));
  };

  const clearAllValues = () => {
    const cleared = {};
    allPlaceholders.forEach((p) => {
      cleared[p] = '';
    });
    setPlaceholderValues(cleared);
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

  const hasPlaceholders = allPlaceholders && allPlaceholders.length > 0;

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
          <div className="text-white">{allPlaceholders?.length || 0} variables</div>
        </div>
      </div>

      <div className={`grid gap-6 ${hasPlaceholders && showPlaceholderPanel ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Placeholder Values Panel */}
        {hasPlaceholders && showPlaceholderPanel && (
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">Sample Data</h2>
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

              <div className="flex gap-2 mb-4">
                <button
                  onClick={clearAllValues}
                  className="btn-ghost py-1.5 px-3 text-xs"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {allPlaceholders.map((placeholder) => (
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
                    <span>Sample Data</span>
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
