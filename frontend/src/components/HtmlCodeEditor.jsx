import { useRef, useEffect, useCallback } from 'react';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';

// Custom dark theme styles for the editor (Dracula-inspired)
const editorStyles = {
  fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  fontSize: 13,
  lineHeight: 1.7,
  backgroundColor: '#12121a',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  minHeight: '500px',
  overflow: 'auto',
  color: '#f8f8f2',
};

// Vibrant Dracula-inspired syntax highlighting colors
const customCss = `
  /* Base token colors - Dracula theme inspired */
  .token.tag { color: #ff79c6; font-weight: 500; }
  .token.tag .token.punctuation { color: #f8f8f2; }
  .token.attr-name { color: #50fa7b; }
  .token.attr-value { color: #f1fa8c; }
  .token.attr-value .token.punctuation { color: #f1fa8c; }
  .token.punctuation { color: #f8f8f2; }
  .token.comment { color: #6272a4; font-style: italic; }
  .token.doctype { color: #8be9fd; font-weight: 500; }
  .token.doctype .token.name { color: #ff79c6; }
  .token.string { color: #f1fa8c; }
  .token.selector { color: #8be9fd; }
  .token.property { color: #66d9ef; }
  .token.entity { color: #f1fa8c; }
  .token.prolog { color: #6272a4; font-style: italic; }
  .token.cdata { color: #6272a4; }
  
  /* CSS specific */
  .token.atrule { color: #ff79c6; }
  .token.rule { color: #ff79c6; }
  .token.keyword { color: #ff79c6; font-weight: 500; }
  .token.important { color: #ff5555; font-weight: bold; }
  .token.url { color: #8be9fd; text-decoration: underline; }
  .token.number { color: #bd93f9; }
  .token.unit { color: #bd93f9; }
  .token.hexcode { color: #bd93f9; }
`;

function HtmlCodeEditor({ value, onChange, placeholder, disabled = false, height = '500px' }) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const containerRef = useRef(null);

  const handleHighlight = useCallback((code) => {
    if (!code) return '';
    try {
      return highlight(code, languages.markup, 'markup');
    } catch (e) {
      return code;
    }
  }, []);

  // Sync scroll between textarea and highlight overlay
  const handleScroll = useCallback((e) => {
    if (highlightRef.current && e.target) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  // Update highlight when value changes
  useEffect(() => {
    if (highlightRef.current && textareaRef.current) {
      const highlighted = handleHighlight(value || '');
      highlightRef.current.innerHTML = highlighted;
      // Ensure scroll positions stay in sync after highlight update
      if (textareaRef.current) {
        highlightRef.current.scrollTop = textareaRef.current.scrollTop;
        highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
    }
  }, [value, handleHighlight]);

  // Sync scroll positions
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', handleScroll);
      return () => textarea.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="relative group" ref={containerRef}>
      {/* Inject custom CSS */}
      <style>{customCss}</style>
      
      {/* Editor header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border border-white/10 border-b-0 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
          </div>
          <span className="text-xs text-white/40 ml-2 font-mono">HTML</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span>Syntax Highlighted</span>
        </div>
      </div>
      
      {/* Editor container with overlay */}
      <div 
        className="relative"
        style={{
          ...editorStyles,
          height: height,
          maxHeight: height,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        {/* Syntax highlight overlay (behind textarea) - shows colored syntax highlighting */}
        <pre
          ref={highlightRef}
          className="absolute inset-0 m-0 pointer-events-none"
          style={{
            fontFamily: editorStyles.fontFamily,
            fontSize: editorStyles.fontSize,
            lineHeight: editorStyles.lineHeight,
            padding: '16px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflow: 'auto',
            margin: 0,
            boxSizing: 'border-box',
            zIndex: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
          aria-hidden="true"
        />
        
        {/* Editable textarea (on top) - text is transparent so highlight shows through */}
        <textarea
          ref={textareaRef}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder={placeholder}
          disabled={disabled}
          className="absolute inset-0 w-full h-full m-0 bg-transparent border-0 resize-none outline-none font-mono"
          style={{
            fontFamily: editorStyles.fontFamily,
            fontSize: editorStyles.fontSize,
            lineHeight: editorStyles.lineHeight,
            padding: '16px',
            color: 'transparent', // Transparent so highlight overlay shows through
            caretColor: '#22c55e',
            zIndex: 1,
            margin: 0,
            boxSizing: 'border-box',
            overflow: 'auto',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            WebkitTextFillColor: 'transparent', // For Safari
          }}
          spellCheck={false}
        />
      </div>
      
      {/* Additional styles */}
      <style>{`
        .code-editor-container:focus-within {
          border-color: rgba(34, 197, 94, 0.3);
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.1);
        }
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.25);
          font-style: italic;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.25);
        }
        textarea::selection {
          background: rgba(34, 197, 94, 0.3);
        }
        /* Hide scrollbar on highlight overlay */
        pre::-webkit-scrollbar {
          display: none;
        }
        /* Ensure both textarea and pre render text identically */
        textarea, pre {
          tab-size: 2;
          -moz-tab-size: 2;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        /* Ensure Prism tokens don't break layout */
        pre .token {
          display: inline;
        }
      `}</style>
    </div>
  );
}

export default HtmlCodeEditor;
