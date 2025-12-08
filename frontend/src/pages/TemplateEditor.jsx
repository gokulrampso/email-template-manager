import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { templateApi, toSnakeCase } from '../services/api';
import { LoadingSpinner, FullPageLoader } from '../components/LoadingSpinner';
import ImageUploader from '../components/ImageUploader';
import HtmlCodeEditor from '../components/HtmlCodeEditor';
import TemplateBuilder from '../components/TemplateBuilder';
import TemplateSelectorModal from '../components/TemplateSelectorModal';
import { SAMPLE_DATA_SETS, SAMPLE_TEMPLATES } from '../components/TemplateBuilder/sampleTemplates';
import { generateHtml } from '../components/TemplateBuilder/htmlGenerator';
import toast from 'react-hot-toast';

function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewTemplate = !id;

  // Check if a template was pre-selected via query param
  const preSelectedTemplateId = searchParams.get('template');

  const [isLoading, setIsLoading] = useState(!isNewTemplate);
  const [isSaving, setIsSaving] = useState(false);
  // Default to 'code' mode when editing existing templates (since they don't have blocks data)
  const [editorMode, setEditorMode] = useState(isNewTemplate ? 'builder' : 'code');
  const [showTemplateSelector, setShowTemplateSelector] = useState(isNewTemplate && !preSelectedTemplateId);
  
  // Template data
  const [template, setTemplate] = useState({
    name: '',
    brandId: '',
    language: '',
    htmlContent: '',
  });
  
  // Builder state
  const [blocks, setBlocks] = useState([]);
  const [builderSettings, setBuilderSettings] = useState({
    backgroundColor: '#f4f4f4',
    contentWidth: 600,
    fontFamily: 'Arial, sans-serif',
  });
  const [builderKey, setBuilderKey] = useState(0); // Key to force re-mount of TemplateBuilder
  
  // Sample data for preview
  const [sampleData, setSampleData] = useState(SAMPLE_DATA_SETS[0].data);
  const [showSampleDataPanel, setShowSampleDataPanel] = useState(false);

  const [placeholders, setPlaceholders] = useState([]);
  
  // Name validation state
  const [nameValidation, setNameValidation] = useState({
    isChecking: false,
    exists: false,
    snakeCaseName: '',
    error: null,
  });
  const nameCheckTimeoutRef = useRef(null);

  // Extract placeholders from HTML
  const extractPlaceholders = useCallback((html) => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = html.matchAll(regex);
    const found = new Set();
    for (const match of matches) {
      found.add(match[1].trim());
    }
    return Array.from(found).sort();
  }, []);

  // Update placeholders when HTML changes
  useEffect(() => {
    const found = extractPlaceholders(template.htmlContent);
    setPlaceholders(found);
  }, [template.htmlContent, extractPlaceholders]);

  // Load pre-selected template from query param
  useEffect(() => {
    if (isNewTemplate && preSelectedTemplateId) {
      const selectedTemplate = SAMPLE_TEMPLATES.find(t => t.id === preSelectedTemplateId);
      if (selectedTemplate) {
        const newBlocks = selectedTemplate.blocks.map(b => ({ ...b, id: crypto.randomUUID() }));
        const newSettings = selectedTemplate.settings || builderSettings;
        
        // Generate HTML from the template blocks
        const generatedHtml = generateHtml(newBlocks, newSettings);
        
        setBlocks(newBlocks);
        setBuilderSettings(newSettings);
        setTemplate(prev => ({
          ...prev,
          name: selectedTemplate.name === 'Blank Template' ? '' : selectedTemplate.name,
          htmlContent: generatedHtml,
        }));
        
        // Set the template's sample data
        if (selectedTemplate.sampleData) {
          setSampleData(selectedTemplate.sampleData);
        }
        
        // Force TemplateBuilder to re-mount with new blocks
        setBuilderKey(prev => prev + 1);
      }
    }
  }, [isNewTemplate, preSelectedTemplateId]);

  // Load template if editing
  useEffect(() => {
    if (!isNewTemplate) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      const [templateResponse, sampleDataResponse] = await Promise.all([
        templateApi.getById(id),
        templateApi.getSampleData(id).catch(() => ({ data: { sampleData: {} } })), // Fallback if no sample data
      ]);
      
      const data = templateResponse.data;
      setTemplate({
        name: data.name || '',
        brandId: data.brandId || '',
        language: data.language || '',
        htmlContent: data.htmlContent || '',
      });
      
      // Load saved sample data separately
      if (sampleDataResponse.data?.sampleData && Object.keys(sampleDataResponse.data.sampleData).length > 0) {
        setSampleData(sampleDataResponse.data.sampleData);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load template');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setTemplate((prev) => ({ ...prev, [field]: value }));
    
    // Real-time name validation with debounce
    if (field === 'name' && isNewTemplate) {
      const snakeName = toSnakeCase(value);
      setNameValidation(prev => ({ ...prev, snakeCaseName: snakeName, isChecking: true }));
      
      // Clear previous timeout
      if (nameCheckTimeoutRef.current) {
        clearTimeout(nameCheckTimeoutRef.current);
      }
      
      // Debounce the API call
      nameCheckTimeoutRef.current = setTimeout(async () => {
        if (!value.trim()) {
          setNameValidation({ isChecking: false, exists: false, snakeCaseName: '', error: null });
          return;
        }
        
        try {
          const result = await templateApi.checkName(value);
          setNameValidation({
            isChecking: false,
            exists: result.data.exists,
            snakeCaseName: result.data.snakeCaseName,
            error: null,
          });
        } catch (err) {
          setNameValidation(prev => ({
            ...prev,
            isChecking: false,
            error: 'Failed to check name',
          }));
        }
      }, 400); // 400ms debounce
    }
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (nameCheckTimeoutRef.current) {
        clearTimeout(nameCheckTimeoutRef.current);
      }
    };
  }, []);

  // Save sample data separately (doesn't create version)
  const saveSampleData = useCallback(async (templateId, data) => {
    try {
      await templateApi.updateSampleData(templateId, data);
      // Silent save - no toast for sample data updates
    } catch (error) {
      console.error('Failed to save sample data:', error);
      // Don't show error toast for sample data - it's not critical
    }
  }, []);

  // Auto-save sample data when it changes (debounced) - only for existing templates
  const sampleDataTimeoutRef = useRef(null);
  useEffect(() => {
    if (!isNewTemplate && id && Object.keys(sampleData).length > 0) {
      if (sampleDataTimeoutRef.current) {
        clearTimeout(sampleDataTimeoutRef.current);
      }
      sampleDataTimeoutRef.current = setTimeout(() => {
        saveSampleData(id, sampleData);
      }, 1000); // 1 second debounce
    }
    return () => {
      if (sampleDataTimeoutRef.current) {
        clearTimeout(sampleDataTimeoutRef.current);
      }
    };
  }, [sampleData, isNewTemplate, id, saveSampleData]);

  const handleSave = async (htmlContent = template.htmlContent) => {
    if (!template.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!htmlContent.trim()) {
      toast.error('HTML content is required');
      return;
    }
    
    // Check for duplicate name before creating
    if (isNewTemplate && nameValidation.exists) {
      toast.error(`Template name "${nameValidation.snakeCaseName}" already exists`);
      return;
    }

    setIsSaving(true);
    try {
      // Save template (without sampleData - that's separate)
      const dataToSave = { 
        ...template, 
        htmlContent,
      };
      
      if (isNewTemplate) {
        // Create template with initial sample data
        const response = await templateApi.create({
          ...dataToSave,
          sampleData: sampleData, // Include for initial creation
        });
        
        // Save sample data separately
        if (Object.keys(sampleData).length > 0) {
          await templateApi.updateSampleData(response.data.templateId, sampleData);
        }
        
        toast.success(`Template "${response.data.name}" created successfully!`);
        navigate(`/templates/${response.data.templateId}/edit`);
      } else {
        // Update template (sampleData is saved separately via auto-save)
        const response = await templateApi.update(id, dataToSave);
        // Check if a new version was created or no changes detected
        if (response.message.includes('No changes')) {
          toast.success('No changes detected - version unchanged');
        } else {
          toast.success(`Template updated (version ${response.data.version} created)!`);
        }
        loadTemplate();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle template selection from modal
  const handleSelectTemplate = (selectedTemplate) => {
    if (selectedTemplate) {
      const newBlocks = selectedTemplate.blocks.map(b => ({ ...b, id: crypto.randomUUID() }));
      const newSettings = selectedTemplate.settings || builderSettings;
      
      // Generate HTML from the template blocks
      const generatedHtml = generateHtml(newBlocks, newSettings);
      
      setBlocks(newBlocks);
      setBuilderSettings(newSettings);
      setTemplate(prev => ({
        ...prev,
        name: selectedTemplate.name === 'Blank Template' ? '' : selectedTemplate.name,
        htmlContent: generatedHtml,
      }));
      
      // Set the template's sample data
      if (selectedTemplate.sampleData) {
        setSampleData(selectedTemplate.sampleData);
      }
      
      // Force TemplateBuilder to re-mount with new blocks
      setBuilderKey(prev => prev + 1);
    }
    setShowTemplateSelector(false);
  };

  // Handle sample data selection
  const handleSelectData = (data) => {
    setSampleData(data);
  };

  // Handle builder changes (real-time sync)
  const handleBuilderChange = useCallback((html, newBlocks, newSettings) => {
    setTemplate((prev) => ({ ...prev, htmlContent: html }));
    setBlocks(newBlocks);
    setBuilderSettings(newSettings);
  }, []);

  // Handle builder save
  const handleBuilderSave = (html, newBlocks, newSettings) => {
    setTemplate((prev) => ({ ...prev, htmlContent: html }));
    setBlocks(newBlocks);
    setBuilderSettings(newSettings);
    handleSave(html);
  };

  const handleImageUpload = (imageUrl) => {
    const imgTag = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%;" />`;
    handleChange('htmlContent', template.htmlContent + '\n' + imgTag);
    toast.success('Image inserted into template');
  };

  // Update sample data value
  const updateSampleDataValue = (key, value) => {
    setSampleData(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <FullPageLoader message="Loading template..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Template Selector Modal (for new templates) */}
      <TemplateSelectorModal
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleSelectTemplate}
        onSelectData={handleSelectData}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isNewTemplate ? 'Create New Template' : 'Edit Template'}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {isNewTemplate
              ? 'Create a new email template with version control'
              : `Editing will create a new version`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sample Data Toggle */}
          <button
            onClick={() => setShowSampleDataPanel(!showSampleDataPanel)}
            className={`btn-secondary py-2 px-3 text-sm flex items-center gap-2 ${showSampleDataPanel ? 'bg-primary-500/20 border-primary-500/30' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            Sample Data
          </button>

          {/* Template Selector (for new templates) */}
          {isNewTemplate && (
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="btn-secondary py-2 px-3 text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
              </svg>
              Sample Templates
            </button>
          )}

          {/* Editor Mode Toggle - Only show for new templates */}
          {isNewTemplate && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-dark-700 rounded-xl p-1">
              <button
                onClick={() => setEditorMode('builder')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  editorMode === 'builder'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Visual
                </span>
              </button>
              <button
                onClick={() => setEditorMode('code')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  editorMode === 'code'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Code
                </span>
              </button>
            </div>
            {editorMode === 'code' && (
              <span className="text-xs text-amber-400/70" title="Code changes won't update visual blocks">
                ⚠️ Direct edit mode
              </span>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Sample Data Panel */}
      {showSampleDataPanel && (
        <div className="glass-card p-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-medium">Sample Data for Preview</h3>
              <p className="text-white/50 text-sm">
                {isNewTemplate 
                  ? 'Edit values to test your placeholders'
                  : 'Edit values to test your placeholders • Auto-saves (does not create version)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Only show dropdown selector for new templates */}
              {isNewTemplate && (
                <select
                  onChange={(e) => {
                    const dataSet = SAMPLE_DATA_SETS.find(d => d.id === e.target.value);
                    if (dataSet) setSampleData(dataSet.data);
                  }}
                  className="input py-1.5 text-sm w-48"
                >
                  {SAMPLE_DATA_SETS.map((ds) => (
                    <option key={ds.id} value={ds.id}>{ds.name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setShowSampleDataPanel(false)}
                className="btn-ghost p-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
            {Object.entries(sampleData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-xs font-mono text-primary-400 mb-1">
                  {`{{${key}}}`}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateSampleDataValue(key, e.target.value)}
                  className="input py-1.5 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Name & Settings Bar */}
      <div className="glass-card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Template Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={template.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Welcome Email"
                className={`input py-2 pr-10 ${
                  isNewTemplate && nameValidation.exists 
                    ? 'border-red-500/50 focus:border-red-500' 
                    : isNewTemplate && template.name && !nameValidation.isChecking && !nameValidation.exists
                    ? 'border-green-500/50 focus:border-green-500'
                    : ''
                }`}
              />
              {/* Validation indicator */}
              {isNewTemplate && template.name && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {nameValidation.isChecking ? (
                    <svg className="w-4 h-4 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : nameValidation.exists ? (
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            {/* Show snake_case preview and validation message */}
            {isNewTemplate && template.name && (
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-xs text-white/40">
                  Will be saved as: <span className="font-mono text-primary-400">{nameValidation.snakeCaseName || toSnakeCase(template.name)}</span>
                </span>
                {nameValidation.exists && (
                  <span className="text-xs text-red-400">
                    ⚠️ Name already exists
                  </span>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Brand ID
            </label>
            <input
              type="text"
              value={template.brandId}
              onChange={(e) => handleChange('brandId', e.target.value)}
              placeholder="e.g., acme-corp"
              className="input py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Language
            </label>
            <input
              type="text"
              value={template.language}
              onChange={(e) => handleChange('language', e.target.value)}
              placeholder="e.g., en-US"
              className="input py-2"
            />
          </div>
        </div>
      </div>

      {/* Editor Content */}
      {/* Visual builder only for new templates, Code editor for existing templates */}
      {isNewTemplate && editorMode === 'builder' ? (
        <TemplateBuilder
          key={builderKey}
          initialBlocks={blocks}
          initialSettings={builderSettings}
          sampleData={sampleData}
          fallbackHtml={template.htmlContent}
          isExistingTemplate={!isNewTemplate}
          onChange={handleBuilderChange}
          onSave={handleBuilderSave}
        />
      ) : (
        <CodeEditor
          template={template}
          placeholders={placeholders}
          sampleData={sampleData}
          isNewTemplate={isNewTemplate}
          isSaving={isSaving}
          id={id}
          onChangeHtml={(html) => handleChange('htmlContent', html)}
          onSave={() => handleSave()}
          onImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
}

// Code Editor Component (original editor)
function CodeEditor({ template, placeholders, sampleData, isNewTemplate, isSaving, id, onChangeHtml, onSave, onImageUpload }) {
  // Generate preview with sample data
  const getPreviewHtml = () => {
    let html = template.htmlContent;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
      html = html.replace(regex, value);
    });
    return html;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <div className="space-y-6">
        {/* HTML Editor */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">HTML Content</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Use {"{{variable}}"} for placeholders</span>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{isNewTemplate ? 'Create' : 'Save'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <HtmlCodeEditor
            value={template.htmlContent}
            onChange={onChangeHtml}
            placeholder="Enter your HTML email template..."
            height="500px"
          />
        </div>

        {/* Image Upload */}
        {!isNewTemplate && (
          <div className="glass-card p-6">
            <ImageUploader templateId={id} onUpload={onImageUpload} />
          </div>
        )}

        {/* Placeholders */}
        {placeholders.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-medium text-white mb-4">Detected Placeholders</h2>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder) => (
                <span key={placeholder} className="badge badge-accent font-mono">
                  {`{{${placeholder}}}`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="glass-card p-6 sticky top-24">
        <h2 className="text-lg font-medium text-white mb-4">Live Preview (with Sample Data)</h2>
        <div className="preview-container h-[600px] rounded-xl overflow-hidden">
          <iframe
            srcDoc={getPreviewHtml() || '<p style="color: #999; padding: 20px;">Enter HTML to see preview...</p>'}
            title="Template Preview"
            className="w-full h-full bg-white"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default TemplateEditor;
