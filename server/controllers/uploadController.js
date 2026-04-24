const cloudinary = require('../utils/cloudinary');
const multer = require('multer');

// Use Memory Storage for Cloudinary uploads
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB as requested
    fileFilter: (req, file, cb) => {
        // Enforce image-only for this pipeline
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

/**
 * Helper to upload a buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder = 'roamsquad') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { 
                folder, 
                resource_type: 'image', 
                quality: 'auto', 
                fetch_format: 'auto' 
            },
            (err, res) => {
                if (err) return reject(err);
                resolve(res);
            }
        ).end(buffer);
    });
};

const uploadSingle = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const folder = req.body.folder || 'roamsquad';
        const result = await uploadToCloudinary(req.file.buffer, folder);

        res.status(200).json({ 
            success: true, 
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error("[uploadSingle] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const uploadMultiple = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

        const folder = req.body.folder || 'roamsquad';
        
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, folder));
        const results = await Promise.all(uploadPromises);

        res.status(200).json({ 
            success: true, 
            data: results.map(r => ({
                url: r.secure_url,
                public_id: r.public_id
            }))
        });
    } catch (error) {
        console.error("[uploadMultiple] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteImage = async (req, res) => {
    try {
        const { public_id } = req.body;
        if (!public_id) return res.status(400).json({ error: 'public_id is required' });

        const result = await cloudinary.uploader.destroy(public_id);
        
        if (result.result === 'ok') {
            res.status(200).json({ success: true, message: 'Image deleted from Cloudinary' });
        } else {
            res.status(404).json({ success: false, error: 'Image not found on Cloudinary', details: result });
        }
    } catch (error) {
        console.error("[deleteImage] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { upload, uploadSingle, uploadMultiple, deleteImage };

