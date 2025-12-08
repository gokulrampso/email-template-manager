function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-2',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-white/20 border-t-primary-400 rounded-full animate-spin ${className}`}
    />
  );
}

function FullPageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/90 backdrop-blur-sm">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-white/70">{message}</p>
      </div>
    </div>
  );
}

export { LoadingSpinner, FullPageLoader };


