import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// Utility to convert to snake_case (matches backend)
export function toSnakeCase(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Template API
export const templateApi = {
  // Check if template name exists
  checkName: async (name, excludeId = null) => {
    const params = new URLSearchParams({ name });
    if (excludeId) {
      params.append('excludeId', excludeId);
    }
    const response = await api.get(`/templates/check-name?${params}`);
    return response.data;
  },

  // Create a new template
  create: async (data) => {
    const response = await api.post('/templates', data);
    return response.data;
  },

  // List all templates
  list: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  // Get a template by ID (latest version)
  getById: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // Update a template (creates new version)
  update: async (id, data) => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data;
  },

  // List all versions of a template
  listVersions: async (id) => {
    const response = await api.get(`/templates/${id}/versions`);
    return response.data;
  },

  // Get a specific version
  getVersion: async (id, version) => {
    const response = await api.get(`/templates/${id}/versions/${version}`);
    return response.data;
  },

  // Restore a specific version
  restoreVersion: async (id, version) => {
    const response = await api.post(`/templates/${id}/versions/${version}/restore`);
    return response.data;
  },

  // Delete a template and all its versions
  delete: async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },

  // Sample Data API
  getSampleData: async (id) => {
    const response = await api.get(`/templates/${id}/sample-data`);
    return response.data;
  },

  updateSampleData: async (id, sampleData) => {
    const response = await api.put(`/templates/${id}/sample-data`, { sampleData });
    return response.data;
  },

  deleteSampleData: async (id) => {
    const response = await api.delete(`/templates/${id}/sample-data`);
    return response.data;
  },
};

// Asset API
export const assetApi = {
  // Upload an image
  upload: async (templateId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('templateId', templateId);

    const response = await api.post('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;

