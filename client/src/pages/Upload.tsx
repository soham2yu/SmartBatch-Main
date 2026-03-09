import React, { useCallback, useState } from 'react';
import { useUploadDataset } from '@/hooks/use-smartbatch';
import { useActiveDataset } from '@/context/DatasetContext';
import { UploadCloud, File, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useUploadDataset();
  const { setActiveDatasetId } = useActiveDataset();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    try {
      const result = await uploadMutation.mutateAsync(file);
      setActiveDatasetId(result.id);
      setFile(null);
      alert("Dataset uploaded and processed successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto mt-10"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold text-white mb-4">Upload Telemetry Data</h2>
        <p className="text-muted-foreground">Upload your historical manufacturing CSV data to generate digital twins and anomalies insights.</p>
      </div>

      <div 
        className={`
          glass-card rounded-3xl p-12 text-center border-2 border-dashed transition-all duration-300
          ${isDragging ? 'border-primary bg-primary/5' : 'border-white/20 hover:border-primary/50'}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {!file ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <UploadCloud className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Drag & Drop your CSV file</h3>
            <p className="text-muted-foreground mb-8">or click to browse from your computer</p>
            
            <label className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer transition-colors border border-white/10">
              Browse Files
              <input 
                type="file" 
                className="hidden" 
                accept=".csv"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
              />
            </label>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-6">
              <File className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
            <p className="text-muted-foreground mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setFile(null)}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                disabled={uploadMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold neon-glow flex items-center gap-2 disabled:opacity-50"
              >
                {uploadMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Analyze Data</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
