import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, LayoutDashboard, Clock, Settings as SettingsIcon, LogOut, FolderOpen } from 'lucide-react';
import { api } from '../services/api';

const Sidebar = ({ selectedProject, setSelectedProject }) => {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await api.listProjects();
      setProjects(res.data);
      if (res.data.length > 0 && !selectedProject) {
        setSelectedProject(res.data[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await api.createProject({ name: newProjectName });
      setNewProjectName('');
      setShowProjectModal(false);
      loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: Upload, label: 'Upload Datasets' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/history', icon: Clock, label: 'Analysis History' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-56 bg-[#1a1f2e] border-r border-[#2d3748] flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">DriftGauge</h1>
          </div>
          <p className="text-xs text-slate-500">Detection Tool</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? 'bg-[#2563eb] text-white'
                      : 'text-slate-400 hover:bg-[#252b3b] hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}

          {/* Projects Section */}
          <div className="mt-8 mb-3">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</span>
              <button
                onClick={() => setShowProjectModal(true)}
                className="text-slate-500 hover:text-slate-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedProject?.id === p.id
                      ? 'bg-[#252b3b] text-white'
                      : 'text-slate-400 hover:bg-[#252b3b] hover:text-slate-200'
                  }`}
                >
                  <FolderOpen size={16} />
                  <span className="text-sm truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[#2d3748]">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-[#252b3b] rounded-lg text-sm transition-colors">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6 w-96"
          >
            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-4 py-2.5 rounded-lg mb-4 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && createProject()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowProjectModal(false)}
                className="flex-1 px-4 py-2.5 bg-[#252b3b] hover:bg-[#2d3748] rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="flex-1 px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg text-sm font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
