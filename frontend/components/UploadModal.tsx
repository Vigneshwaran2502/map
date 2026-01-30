import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface UploadModalProps {
    onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose }) => {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:3001/api/ingest', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Upload failed');

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        onDragEnter: () => { },
        onDragOver: () => { },
        onDragLeave: () => { }
    });

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="p-6 border-b border-gray-800 bg-gray-900/50">
                    <h2 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-2">
                        <Upload className="text-cyan-500" /> Data Ingestion
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Universal Spatial Format Converter (CSV, GeoJSON, Shapefile)</p>
                </div>

                <div className="p-8">
                    {!result ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all
                   ${isDragActive ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 hover:border-gray-500 bg-gray-900'}
                 `}
                        >
                            <input {...getInputProps()} />
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <FileText className="text-gray-400" size={32} />
                            </div>
                            {uploading ? (
                                <div className="text-cyan-400 font-bold animate-pulse">Processing...</div>
                            ) : (
                                <>
                                    <p className="text-white font-bold mb-2">Click or Drag file here</p>
                                    <p className="text-xs text-gray-500">Supports CSV (Lat/Lon), GeoJSON, ZIP (Shapefile)</p>
                                </>
                            )}
                            {error && (
                                <div className="mt-4 text-red-400 text-xs flex items-center gap-2 bg-red-900/20 px-3 py-2 rounded">
                                    <AlertCircle size={12} /> {error}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-900/20 border border-green-900 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="text-green-500" size={24} />
                                <div>
                                    <h3 className="text-green-400 font-bold">Ingestion Successful</h3>
                                    <p className="text-xs text-green-300/70">{result.metadata.filename}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                                <div className="bg-black/40 p-2 rounded">
                                    <span className="text-gray-500 block uppercase font-bold text-[10px]">Format</span>
                                    <span className="text-white font-mono">{result.metadata.format}</span>
                                </div>
                                <div className="bg-black/40 p-2 rounded">
                                    <span className="text-gray-500 block uppercase font-bold text-[10px]">Geometry</span>
                                    <span className="text-white font-mono">{result.metadata.detectedGeometry}</span>
                                </div>
                                <div className="bg-black/40 p-2 rounded col-span-2">
                                    <span className="text-gray-500 block uppercase font-bold text-[10px]">Features Parsed</span>
                                    <span className="text-white font-mono">{result.metadata.featureCount}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => { setResult(null); onClose(); }}
                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors uppercase text-xs tracking-wider"
                            >
                                Add to Map Layer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
