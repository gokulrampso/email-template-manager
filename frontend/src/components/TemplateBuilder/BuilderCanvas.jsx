function BuilderCanvas({ blocks, settings, selectedBlockId, onSelectBlock, onMoveBlock, onDeleteBlock, isExistingTemplate = false, hasFallbackHtml = false }) {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center py-20">
          {isExistingTemplate && hasFallbackHtml ? (
            // Message for existing templates with HTML content
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Code-Based Template</h3>
              <p className="text-white/50 max-w-sm mb-4">
                This template was created in Code mode. You can see the preview on the right, or add visual blocks here to rebuild it.
              </p>
              <p className="text-white/40 text-sm max-w-sm">
                💡 Tip: Use <span className="text-primary-400">Code mode</span> to edit the existing HTML directly.
              </p>
            </>
          ) : (
            // Default message for new templates
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Start Building</h3>
              <p className="text-white/50 max-w-sm">
                Click on blocks from the left panel to add them to your email template
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto rounded-lg shadow-2xl overflow-hidden"
      style={{
        maxWidth: settings.contentWidth,
        backgroundColor: settings.backgroundColor,
      }}
    >
      {blocks.map((block, index) => (
        <BlockPreview
          key={block.id}
          block={block}
          index={index}
          totalBlocks={blocks.length}
          isSelected={selectedBlockId === block.id}
          onSelect={() => onSelectBlock(block.id)}
          onMoveUp={() => onMoveBlock(block.id, 'up')}
          onMoveDown={() => onMoveBlock(block.id, 'down')}
          onDelete={() => onDeleteBlock(block.id)}
        />
      ))}
    </div>
  );
}

function BlockPreview({ block, index, totalBlocks, isSelected, onSelect, onMoveUp, onMoveDown, onDelete }) {
  const { type, content } = block;

  return (
    <div
      onClick={onSelect}
      className={`relative group cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-900' : ''
      }`}
    >
      {/* Block Controls */}
      <div
        className={`absolute top-2 right-2 flex items-center gap-1 z-10 transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={index === 0}
          className="p-1 rounded bg-dark-800/90 text-white/70 hover:text-white disabled:opacity-30"
          title="Move up"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={index === totalBlocks - 1}
          className="p-1 rounded bg-dark-800/90 text-white/70 hover:text-white disabled:opacity-30"
          title="Move down"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded bg-red-500/90 text-white hover:bg-red-600"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Block Type Badge */}
      <div
        className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded bg-dark-800/90 text-white/70 capitalize transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {type}
      </div>

      {/* Block Content */}
      <div style={{ backgroundColor: content.backgroundColor }}>
        {type === 'header' && <HeaderPreview content={content} />}
        {type === 'text' && <TextPreview content={content} />}
        {type === 'button' && <ButtonPreview content={content} />}
        {type === 'image' && <ImagePreview content={content} />}
        {type === 'divider' && <DividerPreview content={content} />}
        {type === 'spacer' && <SpacerPreview content={content} />}
        {type === 'social' && <SocialPreview content={content} />}
        {type === 'footer' && <FooterPreview content={content} />}
      </div>
    </div>
  );
}

// Preview Components
function HeaderPreview({ content }) {
  const fontSize = content.level === 'h1' ? '28px' : content.level === 'h2' ? '24px' : '20px';
  return (
    <div style={{ padding: content.padding, textAlign: content.align }}>
      <div style={{ fontSize, fontWeight: 'bold', color: content.color, margin: 0 }}>
        {content.text}
      </div>
    </div>
  );
}

function TextPreview({ content }) {
  return (
    <div style={{ padding: content.padding, textAlign: content.align }}>
      <p style={{ fontSize: content.fontSize, color: content.color, lineHeight: content.lineHeight, margin: 0 }}>
        {content.text}
      </p>
    </div>
  );
}

function ButtonPreview({ content }) {
  const alignStyle = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };
  return (
    <div style={{ padding: content.padding, display: 'flex', justifyContent: alignStyle[content.align] }}>
      <span
        style={{
          display: 'inline-block',
          padding: '12px 30px',
          backgroundColor: content.buttonColor,
          color: content.textColor,
          borderRadius: content.borderRadius,
          fontWeight: 'bold',
          textDecoration: 'none',
        }}
      >
        {content.text}
      </span>
    </div>
  );
}

function ImagePreview({ content }) {
  return (
    <div style={{ padding: content.padding, textAlign: content.align }}>
      <img
        src={content.src}
        alt={content.alt}
        style={{ width: content.width, maxWidth: '100%', display: 'inline-block' }}
      />
    </div>
  );
}

function DividerPreview({ content }) {
  return (
    <div style={{ padding: content.padding }}>
      <hr
        style={{
          border: 'none',
          borderTop: `${content.thickness}px ${content.style} ${content.color}`,
          width: content.width,
          margin: '0 auto',
        }}
      />
    </div>
  );
}

function SpacerPreview({ content }) {
  return <div style={{ height: content.height }} />;
}

function SocialPreview({ content }) {
  const icons = [];
  if (content.facebook) icons.push({ name: 'Facebook', color: '#1877f2' });
  if (content.twitter) icons.push({ name: 'Twitter', color: '#1da1f2' });
  if (content.instagram) icons.push({ name: 'Instagram', color: '#e4405f' });
  if (content.linkedin) icons.push({ name: 'LinkedIn', color: '#0077b5' });

  const alignStyle = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <div style={{ padding: content.padding, display: 'flex', justifyContent: alignStyle[content.align], gap: '12px' }}>
      {icons.length > 0 ? (
        icons.map((icon) => (
          <div
            key={icon.name}
            style={{
              width: content.iconSize,
              height: content.iconSize,
              backgroundColor: icon.color,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {icon.name[0]}
          </div>
        ))
      ) : (
        <span style={{ color: '#999', fontSize: '14px' }}>Add social links in the editor</span>
      )}
    </div>
  );
}

function FooterPreview({ content }) {
  return (
    <div style={{ padding: content.padding, textAlign: content.align, backgroundColor: content.backgroundColor }}>
      <p style={{ fontSize: content.fontSize, color: content.color, margin: '0 0 8px' }}>
        {content.text}
      </p>
      {content.address && (
        <p style={{ fontSize: content.fontSize, color: content.color, margin: '0 0 8px' }}>
          {content.address}
        </p>
      )}
      {content.unsubscribeText && (
        <p style={{ fontSize: content.fontSize, margin: 0 }}>
          <span style={{ color: content.color, textDecoration: 'underline', cursor: 'pointer' }}>
            {content.unsubscribeText}
          </span>
        </p>
      )}
    </div>
  );
}

export default BuilderCanvas;

