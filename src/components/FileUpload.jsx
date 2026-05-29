import React, { useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

export default function FileUpload() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles([...files, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (idx) => {
    const newFiles = [...files];
    newFiles.splice(idx, 1);
    setFiles(newFiles);
  };

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Evidence Upload (Images/Docs)</label>
      <div 
        className={`relative w-full border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${isDragging ? 'border-teal-500 bg-teal-50 scale-[1.01]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadCloud className={`mx-auto h-10 w-10 mb-2 transition-colors ${isDragging ? 'text-teal-500' : 'text-gray-400'}`} />
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-teal-600 cursor-pointer">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">Accepts PNG, JPG, PDF (Max. 10MB)</p>
        <input 
          type="file" 
          multiple 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={(e) => {
            if(e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
          }} 
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2 opacity-0 animate-in fade-in slide-in-from-top-2 duration-300 fill-mode-forwards">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-1.5 bg-teal-50 rounded text-teal-600">
                  <FileIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate w-48 sm:w-64">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button type="button" onClick={() => removeFile(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
