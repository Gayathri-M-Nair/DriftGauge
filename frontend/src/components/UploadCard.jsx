import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle } from 'lucide-react';

const UploadCard = ({ title, subtitle, onFileSelect, uploaded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass rounded-xl p-6 card-hover ${isDragging ? 'glow-blue' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>

      <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-slate-600'
      }`}>
        {uploaded ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={48} className="text-green-500" />
            <p className="text-green-500 font-medium">File uploaded successfully</p>
            <p className="text-sm text-slate-400">{uploaded.name}</p>
          </div>
        ) : (
          <>
            <Upload size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-300 mb-2">Drag and drop CSV file here</p>
            <p className="text-sm text-slate-400 mb-4">or</p>
            <label className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer font-medium">
              Browse Files
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default UploadCard;
