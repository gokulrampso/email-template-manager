function BlockEditor({ block, onUpdate, onDelete, onDuplicate }) {
  if (!block) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <p className="text-white/50 text-sm">Select a block to edit</p>
        <p className="text-white/30 text-xs mt-1">Click on any block in the canvas</p>
      </div>
    );
  }

  const updateContent = (key, value) => {
    onUpdate({ content: { ...block.content, [key]: value } });
  };

  return (
    <div className="space-y-4">
      {/* Block Type Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium capitalize">{block.type} Block</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Block-specific editors */}
      {block.type === 'header' && (
        <HeaderEditor content={block.content} onChange={updateContent} />
      )}
      {block.type === 'text' && (
        <TextEditor content={block.content} onChange={updateContent} />
      )}
      {block.type === 'button' && (
        <ButtonEditor content={block.content} onChange={updateContent} />
      )}
      {block.type === 'image' && (
        <ImageEditor content={block.content} onChange={updateContent} />
      )}
      {block.type === 'divider' && (
        <DividerEditor content={block.content} onChange={updateContent} />
      )}
      {block.type === 'spacer' && (
        <SpacerEditor content={block.content} onChange={updateContent} />
      )}
      {block.type === 'social' && (
        <SocialEditor content={block.content} onChange={updateContent} />
      )}
      {block.type === 'footer' && (
        <FooterEditor content={block.content} onChange={updateContent} />
      )}

      {/* Common: Background & Padding */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-white/70 text-xs uppercase tracking-wider mb-3">Background</h4>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.content.backgroundColor || '#ffffff'}
            onChange={(e) => updateContent('backgroundColor', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={block.content.backgroundColor || '#ffffff'}
            onChange={(e) => updateContent('backgroundColor', e.target.value)}
            className="input py-2 text-sm flex-1"
          />
        </div>
      </div>

      {block.content.padding !== undefined && (
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">
            Padding (px)
          </label>
          <input
            type="range"
            min="0"
            max="60"
            value={block.content.padding}
            onChange={(e) => updateContent('padding', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-right text-white/40 text-xs">{block.content.padding}px</div>
        </div>
      )}
    </div>
  );
}

// Header Editor
function HeaderEditor({ content, onChange }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Text</label>
        <input
          type="text"
          value={content.text}
          onChange={(e) => onChange('text', e.target.value)}
          className="input py-2 text-sm"
          placeholder="Enter heading text..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Level</label>
          <select
            value={content.level}
            onChange={(e) => onChange('level', e.target.value)}
            className="input py-2 text-sm"
          >
            <option value="h1">H1 - Large</option>
            <option value="h2">H2 - Medium</option>
            <option value="h3">H3 - Small</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Align</label>
          <select
            value={content.align}
            onChange={(e) => onChange('align', e.target.value)}
            className="input py-2 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Text Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={content.color}
            onChange={(e) => onChange('color', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={content.color}
            onChange={(e) => onChange('color', e.target.value)}
            className="input py-2 text-sm flex-1"
          />
        </div>
      </div>
    </>
  );
}

// Text Editor
function TextEditor({ content, onChange }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Content</label>
        <textarea
          value={content.text}
          onChange={(e) => onChange('text', e.target.value)}
          className="input py-2 text-sm min-h-[100px] resize-y"
          placeholder="Enter your text..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Font Size</label>
          <input
            type="number"
            value={content.fontSize}
            onChange={(e) => onChange('fontSize', parseInt(e.target.value))}
            className="input py-2 text-sm"
            min="10"
            max="32"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Align</label>
          <select
            value={content.align}
            onChange={(e) => onChange('align', e.target.value)}
            className="input py-2 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Text Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={content.color}
            onChange={(e) => onChange('color', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={content.color}
            onChange={(e) => onChange('color', e.target.value)}
            className="input py-2 text-sm flex-1"
          />
        </div>
      </div>
    </>
  );
}

// Button Editor
function ButtonEditor({ content, onChange }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Button Text</label>
        <input
          type="text"
          value={content.text}
          onChange={(e) => onChange('text', e.target.value)}
          className="input py-2 text-sm"
          placeholder="Click Here"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Link URL</label>
        <input
          type="text"
          value={content.url}
          onChange={(e) => onChange('url', e.target.value)}
          className="input py-2 text-sm"
          placeholder="https://... or {{action.url}}"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Button Color</label>
          <div className="flex gap-1">
            <input
              type="color"
              value={content.buttonColor}
              onChange={(e) => onChange('buttonColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Text Color</label>
          <div className="flex gap-1">
            <input
              type="color"
              value={content.textColor}
              onChange={(e) => onChange('textColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Border Radius</label>
          <input
            type="number"
            value={content.borderRadius}
            onChange={(e) => onChange('borderRadius', parseInt(e.target.value))}
            className="input py-2 text-sm"
            min="0"
            max="30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Align</label>
          <select
            value={content.align}
            onChange={(e) => onChange('align', e.target.value)}
            className="input py-2 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </>
  );
}

// Image Editor
function ImageEditor({ content, onChange }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Image URL</label>
        <input
          type="text"
          value={content.src}
          onChange={(e) => onChange('src', e.target.value)}
          className="input py-2 text-sm"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Alt Text</label>
        <input
          type="text"
          value={content.alt}
          onChange={(e) => onChange('alt', e.target.value)}
          className="input py-2 text-sm"
          placeholder="Image description"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Link (optional)</label>
        <input
          type="text"
          value={content.link}
          onChange={(e) => onChange('link', e.target.value)}
          className="input py-2 text-sm"
          placeholder="https://..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Width</label>
          <input
            type="text"
            value={content.width}
            onChange={(e) => onChange('width', e.target.value)}
            className="input py-2 text-sm"
            placeholder="100% or 300px"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Align</label>
          <select
            value={content.align}
            onChange={(e) => onChange('align', e.target.value)}
            className="input py-2 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </>
  );
}

// Divider Editor
function DividerEditor({ content, onChange }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={content.color}
            onChange={(e) => onChange('color', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={content.color}
            onChange={(e) => onChange('color', e.target.value)}
            className="input py-2 text-sm flex-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Thickness</label>
          <input
            type="number"
            value={content.thickness}
            onChange={(e) => onChange('thickness', parseInt(e.target.value))}
            className="input py-2 text-sm"
            min="1"
            max="10"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Style</label>
          <select
            value={content.style}
            onChange={(e) => onChange('style', e.target.value)}
            className="input py-2 text-sm"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
      </div>
    </>
  );
}

// Spacer Editor
function SpacerEditor({ content, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/60 mb-1.5">
        Height (px)
      </label>
      <input
        type="range"
        min="10"
        max="100"
        value={content.height}
        onChange={(e) => onChange('height', parseInt(e.target.value))}
        className="w-full"
      />
      <div className="text-right text-white/40 text-xs">{content.height}px</div>
    </div>
  );
}

// Social Editor
function SocialEditor({ content, onChange }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Facebook URL</label>
        <input
          type="text"
          value={content.facebook}
          onChange={(e) => onChange('facebook', e.target.value)}
          className="input py-2 text-sm"
          placeholder="https://facebook.com/..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Twitter URL</label>
        <input
          type="text"
          value={content.twitter}
          onChange={(e) => onChange('twitter', e.target.value)}
          className="input py-2 text-sm"
          placeholder="https://twitter.com/..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Instagram URL</label>
        <input
          type="text"
          value={content.instagram}
          onChange={(e) => onChange('instagram', e.target.value)}
          className="input py-2 text-sm"
          placeholder="https://instagram.com/..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">LinkedIn URL</label>
        <input
          type="text"
          value={content.linkedin}
          onChange={(e) => onChange('linkedin', e.target.value)}
          className="input py-2 text-sm"
          placeholder="https://linkedin.com/..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Align</label>
        <select
          value={content.align}
          onChange={(e) => onChange('align', e.target.value)}
          className="input py-2 text-sm"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </>
  );
}

// Footer Editor
function FooterEditor({ content, onChange }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Copyright Text</label>
        <input
          type="text"
          value={content.text}
          onChange={(e) => onChange('text', e.target.value)}
          className="input py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Address</label>
        <input
          type="text"
          value={content.address}
          onChange={(e) => onChange('address', e.target.value)}
          className="input py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Unsubscribe Text</label>
        <input
          type="text"
          value={content.unsubscribeText}
          onChange={(e) => onChange('unsubscribeText', e.target.value)}
          className="input py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Unsubscribe URL</label>
        <input
          type="text"
          value={content.unsubscribeUrl}
          onChange={(e) => onChange('unsubscribeUrl', e.target.value)}
          className="input py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Text Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={content.color}
            onChange={(e) => onChange('color', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={content.color}
            onChange={(e) => onChange('color', e.target.value)}
            className="input py-2 text-sm flex-1"
          />
        </div>
      </div>
    </>
  );
}

export default BlockEditor;

