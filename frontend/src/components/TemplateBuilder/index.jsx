import { useState, useCallback, useMemo, useEffect } from 'react';
import BlockLibrary from './BlockLibrary';
import BlockEditor from './BlockEditor';
import BuilderCanvas from './BuilderCanvas';
import { generateHtml } from './htmlGenerator';
import { v4 as uuidv4 } from 'uuid';

// Default email settings
const DEFAULT_SETTINGS = {
  backgroundColor: '#f4f4f4',
  contentWidth: 600,
  fontFamily: 'Arial, sans-serif',
};

function TemplateBuilder({ initialBlocks = [], initialSettings = {}, sampleData = {}, fallbackHtml = '', isExistingTemplate = false, onChange, onSave }) {
  // Note: Parent should use a `key` prop to force re-mount when changing templates
  const [blocks, setBlocks] = useState(initialBlocks);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...initialSettings });
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [activeTab, setActiveTab] = useState('blocks'); // 'blocks' | 'settings'

  const selectedBlock = useMemo(() => {
    return blocks.find((b) => b.id === selectedBlockId) || null;
  }, [blocks, selectedBlockId]);

  // Add a new block
  const addBlock = useCallback((blockType) => {
    const newBlock = createBlock(blockType);
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setActiveTab('edit');
  }, []);

  // Update a block
  const updateBlock = useCallback((blockId, updates) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  }, []);

  // Delete a block
  const deleteBlock = useCallback((blockId) => {
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
      setActiveTab('blocks');
    }
  }, [selectedBlockId]);

  // Duplicate a block
  const duplicateBlock = useCallback((blockId) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      const newBlock = { ...block, id: uuidv4() };
      const index = blocks.findIndex((b) => b.id === blockId);
      setBlocks((prev) => [
        ...prev.slice(0, index + 1),
        newBlock,
        ...prev.slice(index + 1),
      ]);
      setSelectedBlockId(newBlock.id);
    }
  }, [blocks]);

  // Move block up/down
  const moveBlock = useCallback((blockId, direction) => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === blockId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newBlocks = [...prev];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      return newBlocks;
    });
  }, []);

  // Generate HTML from blocks
  const html = useMemo(() => {
    return generateHtml(blocks, settings);
  }, [blocks, settings]);

  // Generate preview HTML with sample data
  // Use fallbackHtml when blocks are empty (for existing templates)
  const previewHtml = useMemo(() => {
    let previewContent = blocks.length > 0 ? html : fallbackHtml;
    // Replace placeholders with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
      previewContent = previewContent.replace(regex, value);
    });
    return previewContent;
  }, [html, fallbackHtml, blocks.length, sampleData]);

  // Notify parent of changes whenever blocks or settings change
  useEffect(() => {
    if (onChange) {
      onChange(html, blocks, settings);
    }
  }, [html, blocks, settings, onChange]);

  // Notify parent of changes
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(html, blocks, settings);
    }
  }, [html, blocks, settings, onSave]);

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] gap-4">
      {/* Left Panel - Block Library & Editor */}
      <div className="w-80 flex-shrink-0 glass-card overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'blocks'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Blocks
            </span>
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'edit'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Style
            </span>
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'blocks' && (
            <BlockLibrary onAddBlock={addBlock} />
          )}
          {activeTab === 'edit' && (
            <BlockEditor
              block={selectedBlock}
              onUpdate={(updates) => selectedBlock && updateBlock(selectedBlock.id, updates)}
              onDelete={() => selectedBlock && deleteBlock(selectedBlock.id)}
              onDuplicate={() => selectedBlock && duplicateBlock(selectedBlock.id)}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsPanel settings={settings} onChange={setSettings} />
          )}
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-medium">Email Preview</h3>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">{blocks.length} blocks</span>
            <button onClick={handleSave} className="btn-primary py-1.5 px-4 text-sm">
              Save Template
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-dark-900/50">
          <BuilderCanvas
            blocks={blocks}
            settings={settings}
            selectedBlockId={selectedBlockId}
            onSelectBlock={(id) => {
              setSelectedBlockId(id);
              setActiveTab('edit');
            }}
            onMoveBlock={moveBlock}
            onDeleteBlock={deleteBlock}
            isExistingTemplate={isExistingTemplate}
            hasFallbackHtml={!!fallbackHtml}
          />
        </div>
      </div>

      {/* Right - Live Preview */}
      <div className="w-96 flex-shrink-0 glass-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-medium">Live Preview</h3>
          <span className="text-xs text-white/40">with sample data</span>
        </div>
        <div className="flex-1 overflow-auto bg-white">
          <iframe
            srcDoc={previewHtml}
            title="Email Preview"
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

// Settings Panel Component
function SettingsPanel({ settings, onChange }) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium mb-4">Email Settings</h3>
      
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">
          Background Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={settings.backgroundColor}
            onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
            className="input py-2 text-sm flex-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">
          Content Width (px)
        </label>
        <input
          type="number"
          value={settings.contentWidth}
          onChange={(e) => onChange({ ...settings, contentWidth: parseInt(e.target.value) || 600 })}
          className="input py-2 text-sm"
          min="400"
          max="800"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">
          Font Family
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })}
          className="input py-2 text-sm"
        >
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Times New Roman', Times, serif">Times New Roman</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
        </select>
      </div>
    </div>
  );
}

// Create a new block with default values
function createBlock(type) {
  const id = uuidv4();
  const defaults = {
    header: {
      id,
      type: 'header',
      content: {
        text: 'Welcome to Our Newsletter',
        level: 'h1',
        align: 'center',
        color: '#333333',
        backgroundColor: '#ffffff',
        padding: 30,
      },
    },
    text: {
      id,
      type: 'text',
      content: {
        text: 'This is a paragraph of text. You can customize the content, colors, and styling to match your brand.',
        align: 'left',
        color: '#666666',
        fontSize: 16,
        lineHeight: 1.6,
        backgroundColor: '#ffffff',
        padding: 20,
      },
    },
    button: {
      id,
      type: 'button',
      content: {
        text: 'Click Here',
        url: '{{action.url}}',
        align: 'center',
        buttonColor: '#22c55e',
        textColor: '#ffffff',
        borderRadius: 6,
        padding: 20,
        backgroundColor: '#ffffff',
      },
    },
    image: {
      id,
      type: 'image',
      content: {
        src: 'https://via.placeholder.com/600x200',
        alt: 'Image description',
        width: '100%',
        align: 'center',
        link: '',
        backgroundColor: '#ffffff',
        padding: 0,
      },
    },
    divider: {
      id,
      type: 'divider',
      content: {
        color: '#eeeeee',
        thickness: 1,
        style: 'solid',
        width: '100%',
        padding: 20,
        backgroundColor: '#ffffff',
      },
    },
    spacer: {
      id,
      type: 'spacer',
      content: {
        height: 30,
        backgroundColor: '#ffffff',
      },
    },
    social: {
      id,
      type: 'social',
      content: {
        align: 'center',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        iconSize: 32,
        padding: 20,
        backgroundColor: '#ffffff',
      },
    },
    footer: {
      id,
      type: 'footer',
      content: {
        text: '© 2024 {{company.name}}. All rights reserved.',
        address: '123 Main Street, City, Country',
        unsubscribeText: 'Unsubscribe',
        unsubscribeUrl: '{{unsubscribe.url}}',
        align: 'center',
        color: '#999999',
        fontSize: 12,
        backgroundColor: '#f8f8f8',
        padding: 30,
      },
    },
    columns: {
      id,
      type: 'columns',
      content: {
        columns: 2,
        gap: 20,
        backgroundColor: '#ffffff',
        padding: 20,
        column1: { type: 'text', text: 'Column 1 content' },
        column2: { type: 'text', text: 'Column 2 content' },
      },
    },
  };

  return defaults[type] || defaults.text;
}

// Helper to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default TemplateBuilder;

// Export for use in other files
export { createBlock };

