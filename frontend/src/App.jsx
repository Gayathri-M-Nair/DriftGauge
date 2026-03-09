import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import AnalysisHistory from './pages/AnalysisHistory';
import Settings from './pages/Settings';

function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <BrowserRouter>
      <div className="gradient-bg min-h-screen flex">
        <Sidebar selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
        <main className="flex-1 ml-56 p-8">
          <Routes>
            <Route path="/" element={<UploadPage selectedProject={selectedProject} />} />
            <Route path="/dashboard" element={<DashboardPage selectedProject={selectedProject} />} />
            <Route path="/history" element={<AnalysisHistory selectedProject={selectedProject} />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
