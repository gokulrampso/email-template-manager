import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { templateApi } from '../services/api';
import { LoadingSpinner, FullPageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function VersionHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringVersion, setRestoringVersion] = useState(null);
  
  // Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [comparisonData, setComparisonData] = useState({ v1: null, v2: null });
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [templateRes, versionsRes] = await Promise.all([
        templateApi.getById(id),
        templateApi.listVersions(id),
      ]);
      setTemplate(templateRes.data);
      setVersions(versionsRes.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load version history');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (version) => {
    if (version === template?.version) {
      toast.error('This is already the current version');
      return;
    }

    setRestoringVersion(version);
    try {
      const response = await templateApi.restoreVersion(id, version);
      toast.success(`Version ${version} restored as version ${response.data.version}`);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to restore version');
    } finally {
      setRestoringVersion(null);
    }
  };

  const toggleVersionSelection = async (version) => {
    if (selectedVersions.includes(version)) {
      setSelectedVersions(selectedVersions.filter(v => v !== version));
    } else {
      if (selectedVersions.length >= 2) {
        // Replace oldest selection
        setSelectedVersions([selectedVersions[1], version]);
      } else {
        setSelectedVersions([...selectedVersions, version]);
      }
    }
  };

  // Load comparison data when two versions are selected
  useEffect(() => {
    if (selectedVersions.length === 2) {
      loadComparisonData();
    } else {
      setComparisonData({ v1: null, v2: null });
    }
  }, [selectedVersions]);

  const loadComparisonData = async () => {
    const [v1, v2] = selectedVersions.sort((a, b) => a - b);
    setIsLoadingComparison(true);
    try {
      const [res1, res2] = await Promise.all([
        templateApi.getVersion(id, v1),
        templateApi.getVersion(id, v2),
      ]);
      setComparisonData({ v1: res1.data, v2: res2.data });
    } catch (error) {
      toast.error('Failed to load comparison data');
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedVersions([]);
    setComparisonData({ v1: null, v2: null });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (isLoading) {
    return <FullPageLoader message="Loading version history..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
          <Link to="/" className="hover:text-white">Templates</Link>
          <span>/</span>
          <span className="text-white">{template?.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Version History</h1>
            <p className="text-white/60">
              {compareMode 
                ? 'Select two versions to compare' 
                : 'View and restore previous versions of your template'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {compareMode ? (
              <button onClick={exitCompareMode} className="btn-secondary">
                Exit Compare Mode
              </button>
            ) : (
              <button 
                onClick={() => setCompareMode(true)} 
                className="btn-secondary flex items-center gap-2"
                disabled={versions.length < 2}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Compare Versions</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Current Version Info */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">{template?.name}</h2>
            <p className="text-white/50 text-sm mt-1">
              Current version: <span className="badge badge-primary">v{template?.version}</span>
            </p>
          </div>
          <Link to={`/templates/${id}/edit`} className="btn-primary">
            Edit Template
          </Link>
        </div>
      </div>

      {/* Comparison View */}
      {compareMode && selectedVersions.length === 2 && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">
              Comparing Version {Math.min(...selectedVersions)} → Version {Math.max(...selectedVersions)}
            </h3>
            <div className="flex items-center gap-2">
              <span className="badge badge-neutral">
                <span className="w-2 h-2 rounded-full bg-red-400 mr-1.5"></span>
                Removed
              </span>
              <span className="badge badge-neutral">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
                Added
              </span>
            </div>
          </div>

          {isLoadingComparison ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : comparisonData.v1 && comparisonData.v2 ? (
            <DiffView 
              oldContent={comparisonData.v1.htmlContent} 
              newContent={comparisonData.v2.htmlContent}
              oldVersion={comparisonData.v1.version}
              newVersion={comparisonData.v2.version}
            />
          ) : null}
        </div>
      )}

      {/* Version List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-medium">All Versions ({versions.length})</h3>
          {compareMode && selectedVersions.length > 0 && (
            <span className="text-sm text-white/50">
              {selectedVersions.length}/2 selected
            </span>
          )}
        </div>

        {versions.length === 0 ? (
          <div className="p-8 text-center text-white/50">
            No version history available
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {versions.map((version, index) => {
              const isLatest = index === 0;
              const isRestoring = restoringVersion === version.version;
              const isSelected = selectedVersions.includes(version.version);

              return (
                <div
                  key={version.version}
                  onClick={() => compareMode && toggleVersionSelection(version.version)}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    compareMode 
                      ? 'cursor-pointer hover:bg-white/5' 
                      : 'hover:bg-white/5'
                  } ${isSelected ? 'bg-primary-500/10 border-l-2 border-l-primary-500' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {compareMode && (
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-primary-500 border-primary-500' 
                          : 'border-white/30'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isLatest 
                        ? 'bg-primary-500/20 text-primary-400' 
                        : 'bg-white/10 text-white/50'
                    }`}>
                      <span className="font-mono font-medium">v{version.version}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Version {version.version}</span>
                        {isLatest && (
                          <span className="badge badge-primary text-xs">Current</span>
                        )}
                      </div>
                      <p className="text-white/50 text-sm">
                        Created: {formatDate(version.createdAt)}
                      </p>
                    </div>
                  </div>

                  {!compareMode && (
                    <div className="flex items-center gap-2">
                      {isLatest && (
                        <Link
                          to={`/templates/${id}/versions/${version.version}/preview`}
                          className="btn-ghost p-2"
                          title="Preview this version"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      )}

                      {!isLatest && (
                        <button
                          onClick={() => handleRestore(version.version)}
                          disabled={isRestoring}
                          className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1"
                        >
                          {isRestoring ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <span>Restoring...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              <span>Restore</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Diff View Component
function DiffView({ oldContent, newContent, oldVersion, newVersion }) {
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const isScrollingRef = useRef(false);

  const diff = useMemo(() => {
    return computeLineDiff(oldContent, newContent);
  }, [oldContent, newContent]);

  // Synchronize scrolling between left and right panels
  const handleLeftScroll = useCallback((e) => {
    if (isScrollingRef.current) return;
    isScrollingRef.current = true;
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = e.target.scrollTop;
      rightScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 10);
  }, []);

  const handleRightScroll = useCallback((e) => {
    if (isScrollingRef.current) return;
    isScrollingRef.current = true;
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = e.target.scrollTop;
      leftScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 10);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Old Version */}
      <div>
        <div className="text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          Version {oldVersion} (Old)
        </div>
        <div 
          ref={leftScrollRef}
          onScroll={handleLeftScroll}
          className="bg-dark-900 rounded-xl max-h-[500px] overflow-y-auto overflow-x-auto"
        >
          <pre className="p-4 text-xs font-mono leading-relaxed">
            {diff.map((line, index) => (
              <div
                key={index}
                className={`flex ${
                  line.type === 'removed' 
                    ? 'bg-red-500/20 text-red-300' 
                    : line.type === 'unchanged'
                    ? 'text-white/60'
                    : 'invisible h-0'
                }`}
              >
                <span className="inline-block w-8 text-right mr-3 text-white/30 select-none flex-shrink-0">
                  {line.type !== 'added' ? line.oldLineNum : ''}
                </span>
                <span className={`whitespace-nowrap ${line.type === 'removed' ? 'bg-red-500/30 px-1' : ''}`}>
                  {line.type !== 'added' ? line.content : '\n'}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* New Version */}
      <div>
        <div className="text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          Version {newVersion} (New)
        </div>
        <div 
          ref={rightScrollRef}
          onScroll={handleRightScroll}
          className="bg-dark-900 rounded-xl max-h-[500px] overflow-y-auto overflow-x-auto"
        >
          <pre className="p-4 text-xs font-mono leading-relaxed">
            {diff.map((line, index) => (
              <div
                key={index}
                className={`flex ${
                  line.type === 'added' 
                    ? 'bg-green-500/20 text-green-300' 
                    : line.type === 'unchanged'
                    ? 'text-white/60'
                    : 'invisible h-0'
                }`}
              >
                <span className="inline-block w-8 text-right mr-3 text-white/30 select-none flex-shrink-0">
                  {line.type !== 'removed' ? line.newLineNum : ''}
                </span>
                <span className={`whitespace-nowrap ${line.type === 'added' ? 'bg-green-500/30 px-1' : ''}`}>
                  {line.type !== 'removed' ? line.content : '\n'}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Simple line-by-line diff computation
function computeLineDiff(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  const result = [];
  
  // Use longest common subsequence for better diff
  const lcs = longestCommonSubsequence(oldLines, newLines);
  
  let oldIdx = 0;
  let newIdx = 0;
  let oldLineNum = 1;
  let newLineNum = 1;
  
  for (const [oldLcsIdx, newLcsIdx] of lcs) {
    // Add removed lines (in old but not in common)
    while (oldIdx < oldLcsIdx) {
      result.push({
        type: 'removed',
        content: oldLines[oldIdx],
        oldLineNum: oldLineNum++,
        newLineNum: null,
      });
      oldIdx++;
    }
    
    // Add added lines (in new but not in common)
    while (newIdx < newLcsIdx) {
      result.push({
        type: 'added',
        content: newLines[newIdx],
        oldLineNum: null,
        newLineNum: newLineNum++,
      });
      newIdx++;
    }
    
    // Add unchanged line
    result.push({
      type: 'unchanged',
      content: oldLines[oldIdx],
      oldLineNum: oldLineNum++,
      newLineNum: newLineNum++,
    });
    
    oldIdx++;
    newIdx++;
  }
  
  // Add remaining removed lines
  while (oldIdx < oldLines.length) {
    result.push({
      type: 'removed',
      content: oldLines[oldIdx],
      oldLineNum: oldLineNum++,
      newLineNum: null,
    });
    oldIdx++;
  }
  
  // Add remaining added lines
  while (newIdx < newLines.length) {
    result.push({
      type: 'added',
      content: newLines[newIdx],
      oldLineNum: null,
      newLineNum: newLineNum++,
    });
    newIdx++;
  }
  
  return result;
}

// Compute longest common subsequence indices
function longestCommonSubsequence(arr1, arr2) {
  const m = arr1.length;
  const n = arr2.length;
  
  // Create DP table
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find the actual subsequence
  const result = [];
  let i = m, j = n;
  
  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      result.unshift([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return result;
}

export default VersionHistory;
