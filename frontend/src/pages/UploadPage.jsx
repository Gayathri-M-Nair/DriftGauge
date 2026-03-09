import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Check, Zap, Target, Lock } from 'lucide-react';
import { api } from '../services/api';

const UploadPage = ({ selectedProject }) => {
  const navigate = useNavigate();
  const [baselineFile, setBaselineFile] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [mode, setMode] = useState('high_accuracy');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(null);

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      if (type === 'baseline') setBaselineFile(file);
      else setCurrentFile(file);
    }
  };

  const handleFileInput = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'baseline') setBaselineFile(file);
      else setCurrentFile(file);
    }
  };

  const handleAnalysis = async () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }
    if (!baselineFile || !currentFile) {
      alert('Please upload both datasets');
      return;
    }

    setLoading(true);
    try {
      await api.uploadBaseline(selectedProject.id, baselineFile);
      await api.uploadCurrent(selectedProject.id, currentFile);
      const response = await api.analyzeDrift(selectedProject.id, mode);
      // Navigate to dashboard with the fresh analysis result
      navigate('/dashboard', { state: { analysisResult: response.data } });
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Datasets</h1>
        <p className="text-slate-400">Compare reference and current data to detect drift</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-semibold mb-2">
              1
            </div>
            <span className="text-sm font-medium">Upload Data</span>
          </div>
          <div className="w-24 h-0.5 bg-[#2d3748] mt-[-24px]"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#2d3748] flex items-center justify-center text-slate-500 font-semibold mb-2">
              2
            </div>
            <span className="text-sm text-slate-500">Cleaning</span>
          </div>
          <div className="w-24 h-0.5 bg-[#2d3748] mt-[-24px]"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#2d3748] flex items-center justify-center text-slate-500 font-semibold mb-2">
              3
            </div>
            <span className="text-sm text-slate-500">Drift Analysis</span>
          </div>
        </div>
      </div>

      {/* Upload Cards */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 mb-8 items-center">
        {/* Reference Dataset */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-semibold text-sm">
              1
            </div>
            <div>
              <h3 className="font-semibold">Reference Dataset</h3>
              <p className="text-xs text-slate-400">(Baseline)</p>
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver('baseline'); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, 'baseline')}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragOver === 'baseline' ? 'border-[#2563eb] bg-[#2563eb] bg-opacity-5' : 'border-[#2d3748]'
            }`}
          >
            {baselineFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                  <Check size={24} className="text-green-500" />
                </div>
                <p className="text-sm font-medium text-green-500">Uploaded Successfully</p>
                <p className="text-xs text-slate-400">{baselineFile.name}</p>
                <p className="text-xs text-slate-500">
                  {(baselineFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <>
                <Upload size={40} className="mx-auto mb-3 text-slate-500" />
                <p className="text-sm text-slate-300 mb-2">Upload CSV or Parquet</p>
                <p className="text-xs text-slate-500 mb-4">or drag & drop file here</p>
                <label className="inline-block px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg cursor-pointer text-sm font-medium transition-colors">
                  Browse Files
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileInput(e, 'baseline')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-500 mt-3">Max Size: 200 MB • Supported: CSV</p>
              </>
            )}
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#252b3b] border border-[#2d3748] flex items-center justify-center font-bold text-slate-400">
            VS
          </div>
        </div>

        {/* Current Dataset */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm">
              2
            </div>
            <div>
              <h3 className="font-semibold">Current Dataset</h3>
              <p className="text-xs text-slate-400">(To Compare)</p>
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver('current'); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, 'current')}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragOver === 'current' ? 'border-teal-600 bg-teal-600 bg-opacity-5' : 'border-[#2d3748]'
            }`}
          >
            {currentFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                  <Check size={24} className="text-green-500" />
                </div>
                <p className="text-sm font-medium text-green-500">Uploaded Successfully</p>
                <p className="text-xs text-slate-400">{currentFile.name}</p>
                <p className="text-xs text-slate-500">
                  {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <>
                <Upload size={40} className="mx-auto mb-3 text-slate-500" />
                <p className="text-sm text-slate-300 mb-2">Upload CSV or Parquet</p>
                <p className="text-xs text-slate-500 mb-4">or drag & drop file here</p>
                <label className="inline-block px-5 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer text-sm font-medium transition-colors">
                  Browse Files
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileInput(e, 'current')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-500 mt-3">Max Size: 200 MB • Supported: CSV</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Processing Mode */}
      <div className="card p-6 mb-8">
        <h2 className="font-semibold mb-4">Processing Mode</h2>
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setMode('high_accuracy')}
            className={`p-5 rounded-lg cursor-pointer transition-all border-2 ${
              mode === 'high_accuracy'
                ? 'border-[#2563eb] bg-[#2563eb] bg-opacity-10'
                : 'border-[#2d3748] hover:border-[#374151]'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Target size={20} className={mode === 'high_accuracy' ? 'text-[#2563eb]' : 'text-slate-400'} />
              <h3 className="font-semibold">High Accuracy</h3>
            </div>
            <p className="text-sm text-slate-400 mb-2">Full dataset analysis – Slower</p>
            <p className="text-xs text-slate-500">
              Comprehensive analysis with Multivariate Drift (MMD), Wasserstein Distance, Concept Drift, & Feature Importance. ~5 minutes.
            </p>
          </div>

          <div
            onClick={() => setMode('fast')}
            className={`p-5 rounded-lg cursor-pointer transition-all border-2 ${
              mode === 'fast'
                ? 'border-[#2563eb] bg-[#2563eb] bg-opacity-10'
                : 'border-[#2d3748] hover:border-[#374151]'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Zap size={20} className={mode === 'fast' ? 'text-[#2563eb]' : 'text-slate-400'} />
              <h3 className="font-semibold">Fast Mode</h3>
            </div>
            <p className="text-sm text-slate-400 mb-2">Smart sampling – Faster</p>
            <p className="text-xs text-slate-500">
              Quick drift check using Kolmogorov-Smirnov & Population Stability Index (PSI). High speed, approximate drift alerts. ~10 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Start Analysis Button */}
      <button
        onClick={handleAnalysis}
        disabled={loading || !baselineFile || !currentFile}
        className="w-full py-4 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <span>Start Drift Analysis</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
        <Lock size={14} />
        <span>Secure & Encrypted</span>
      </div>
    </div>
  );
};

export default UploadPage;
