const BLOCK_TYPES = [
  {
    type: 'header',
    name: 'Header',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
      </svg>
    ),
    description: 'Title or heading text',
  },
  {
    type: 'text',
    name: 'Text',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h10" />
      </svg>
    ),
    description: 'Paragraph or body text',
  },
  {
    type: 'button',
    name: 'Button',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
    description: 'Call-to-action button',
  },
  {
    type: 'image',
    name: 'Image',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    description: 'Image or logo',
  },
  {
    type: 'divider',
    name: 'Divider',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
    description: 'Horizontal line separator',
  },
  {
    type: 'spacer',
    name: 'Spacer',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
    description: 'Empty vertical space',
  },
  {
    type: 'social',
    name: 'Social Links',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    description: 'Social media icons',
  },
  {
    type: 'footer',
    name: 'Footer',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    description: 'Copyright & unsubscribe',
  },
  {
    type: 'columns',
    name: 'Columns',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    description: 'Multi-column layout',
  },
];

function BlockLibrary({ onAddBlock }) {
  return (
    <div className="space-y-3">
      <p className="text-white/50 text-sm mb-4">
        Click a block to add it to your email template.
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {BLOCK_TYPES.map((block) => (
          <button
            key={block.type}
            onClick={() => onAddBlock(block.type)}
            className="group p-3 rounded-xl border border-white/10 hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/50 group-hover:text-primary-400 transition-colors">
                {block.icon}
              </span>
            </div>
            <div className="text-white text-sm font-medium">{block.name}</div>
            <div className="text-white/40 text-xs mt-0.5">{block.description}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
        <h4 className="text-primary-400 text-sm font-medium mb-2">💡 Tip</h4>
        <p className="text-white/60 text-xs">
          Use placeholders like <code className="text-primary-300">{'{{user.name}}'}</code> to personalize your emails.
        </p>
      </div>
    </div>
  );
}

export default BlockLibrary;

