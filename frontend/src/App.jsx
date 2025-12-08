import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TemplateList from './pages/TemplateList';
import TemplateEditor from './pages/TemplateEditor';
import VersionHistory from './pages/VersionHistory';
import TemplatePreview from './pages/TemplatePreview';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TemplateList />} />
        <Route path="/templates/new" element={<TemplateEditor />} />
        <Route path="/templates/:id/edit" element={<TemplateEditor />} />
        <Route path="/templates/:id/versions" element={<VersionHistory />} />
        <Route path="/templates/:id/preview" element={<TemplatePreview />} />
        <Route path="/templates/:id/versions/:version/preview" element={<TemplatePreview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;

