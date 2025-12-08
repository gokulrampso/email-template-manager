import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { templateApi } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SAMPLE_TEMPLATES } from '../components/TemplateBuilder/sampleTemplates';
import toast from 'react-hot-toast';

function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, template: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await templateApi.list();
      setTemplates(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (template) => {
    setDeleteModal({ isOpen: true, template });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.template) return;

    setIsDeleting(true);
    try {
      await templateApi.delete(deleteModal.template.templateId);
      toast.success(`Template "${deleteModal.template.name}" deleted successfully`);
      setDeleteModal({ isOpen: false, template: null });
      fetchTemplates(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, template: null });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Email Templates</h1>
          <p className="text-white/60">Manage your email templates with version control</p>
        </div>
        <Link to="/templates/new" className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Template</span>
        </Link>
      </div>

      {/* Template List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : templates.length === 0 ? (
          <div className="py-12 px-6">
            <div className="text-center mb-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to Email Templates</h3>
              <p className="text-white/50 max-w-lg mx-auto">
                Get started by creating your first email template. Choose from our pre-built templates or start from scratch.
              </p>
            </div>

            {/* Quick Start Templates */}
            <div className="max-w-4xl mx-auto">
              <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Quick Start Templates</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {SAMPLE_TEMPLATES.filter(t => t.id !== 'blank').map((template) => (
                  <button
                    key={template.id}
                    onClick={() => navigate(`/templates/new?template=${template.id}`)}
                    className="p-5 rounded-xl border-2 border-white/10 hover:border-primary-500/50 bg-dark-700/50 hover:bg-dark-700 transition-all text-left group"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{template.thumbnail}</div>
                    <h5 className="text-white font-medium mb-1">{template.name}</h5>
                    <p className="text-white/40 text-sm line-clamp-2">{template.description}</p>
                  </button>
                ))}
              </div>

              {/* Or Start Blank */}
              <div className="text-center">
                <span className="text-white/30 text-sm">or</span>
              </div>

              <div className="text-center mt-4">
                <Link to="/templates/new?template=blank" className="btn-primary inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Start From Scratch</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Version</th>
                <th>Brand</th>
                <th>Language</th>
                <th>Last Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.templateId}>
                  <td>
                    <div className="font-medium text-white">{template.name}</div>
                    <div className="text-xs text-white/40 font-mono mt-0.5">
                      {template.templateId.slice(0, 8)}...
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">v{template.version}</span>
                  </td>
                  <td>
                    {template.brandId ? (
                      <span className="text-white/70">{template.brandId}</span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td>
                    {template.language ? (
                      <span className="badge badge-neutral">{template.language}</span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="text-white/60 text-sm">
                    {formatDate(template.updatedAt)}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/templates/${template.templateId}/preview`}
                        className="btn-ghost p-2"
                        title="Preview"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        to={`/templates/${template.templateId}/versions`}
                        className="btn-ghost p-2"
                        title="Version History"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Link>
                      <Link
                        to={`/templates/${template.templateId}/edit`}
                        className="btn-primary py-1.5 px-3 text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(template)}
                        className="btn-ghost p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        title="Delete Template"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-dark-900/90 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          />

          {/* Modal */}
          <div className="relative glass-card w-full max-w-md mx-4 p-6 animate-modal-enter">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Delete Template?</h3>
                <p className="text-white/60 text-sm mb-1">
                  Are you sure you want to delete <span className="text-white font-medium">"{deleteModal.template?.name}"</span>?
                </p>
                <p className="text-red-400/80 text-sm">
                  This will permanently delete the template and all {deleteModal.template?.version} version(s). This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleDeleteCancel}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn-danger flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Template</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateList;
