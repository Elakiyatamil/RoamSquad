import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

const ImageUpload = ({ value, onChange, label = "Upload Image", folder = "general" }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(value);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview locally
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload to server
        const formData = new FormData();
        formData.append('image', file);
        
        setUploading(true);
        try {
            const response = await apiClient.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                const url = response.data.data.url;
                onChange(url);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange('');
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{label}</label>
            
            <div className="relative group">
                {preview ? (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-ink/5 bg-white shadow-sm">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button 
                                onClick={() => document.getElementById(`file-${label}`).click()}
                                className="p-2 bg-white rounded-full text-ink hover:scale-110 transition-transform"
                            >
                                <Upload size={18} />
                            </button>
                            <button 
                                onClick={handleRemove}
                                className="p-2 bg-red rounded-full text-white hover:scale-110 transition-transform"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="animate-spin text-ink" size={24} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div 
                        onClick={() => document.getElementById(`file-${label}`).click()}
                        className="w-full h-48 rounded-2xl border-2 border-dashed border-ink/10 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-red/40 hover:bg-red/5 transition-all group"
                    >
                        <div className="p-4 bg-ink/5 rounded-2xl text-ink/40 group-hover:bg-red/10 group-hover:text-red transition-all mb-3">
                            <Upload size={24} />
                        </div>
                        <p className="text-sm font-bold text-ink/40 group-hover:text-ink transition-colors">Click to upload</p>
                        <p className="text-[10px] font-medium text-ink/20 mt-1 uppercase tracking-widest">JPG, PNG or WEBP (Max 50MB)</p>
                    </div>
                )}
                
                <input 
                    id={`file-${label}`}
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                />
            </div>
            
            {value && !uploading && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg w-fit">
                    <CheckCircle2 size={12} className="text-green-600" />
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-tight">Sync Active</span>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
