import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

const ImageUploader = ({ folder = 'roamsquad', onUpload, currentUrl }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(currentUrl);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Client-side size guard: 10MB
        if (file.size > 10 * 1024 * 1024) {
            setError('File is too large (Max 10MB)');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        try {
            const response = await apiClient.post('/upload/single', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                const { url, public_id } = response.data.data;
                setPreview(url);
                if (onUpload) onUpload(url, public_id);
            } else {
                throw new Error(response.data.error || 'Upload failed');
            }
        } catch (err) {
            console.error('[ImageUploader] Error:', err);
            setError('Upload failed, try again');
        } finally {
            setUploading(false);
        }
    }, [folder, onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
        disabled: uploading
    });

    return (
        <div className="space-y-4">
            <div 
                {...getRootProps()} 
                className={`
                    relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden
                    ${isDragActive ? 'border-red bg-red/5' : 'border-ink/10 hover:border-red/30 bg-ink/5'}
                    ${uploading ? 'opacity-50 cursor-wait' : ''}
                    ${preview ? 'aspect-video' : 'h-32'}
                `}
            >
                <input { ...getInputProps() } />
                
                {preview ? (
                    <div className="relative w-full h-full group">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <p className="text-white text-[10px] font-bold uppercase tracking-widest">Change Image</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-ink/40">
                        <Upload size={24} className={isDragActive ? 'text-red animate-bounce' : ''} />
                        <div className="text-center">
                            <p className="text-xs font-bold uppercase tracking-widest">
                                {isDragActive ? 'Drop image here' : 'Drop image or Click'}
                            </p>
                            <p className="text-[10px] opacity-60">JPEG, PNG, WebP (Max 10MB)</p>
                        </div>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                        <Loader2 size={24} className="text-red animate-spin" />
                        <p className="text-[10px] font-bold text-ink uppercase tracking-[0.2em] animate-pulse">Uploading...</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red/10 border border-red/20 rounded-xl text-red text-[10px] font-bold uppercase tracking-wider">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {!error && !uploading && preview && preview !== currentUrl && (
                <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 size={14} />
                    Upload successful
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
