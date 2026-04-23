const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

// Use Disk Storage for direct local uploads
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: diskStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB to support videos
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. JPEG, PNG, WebP, and MP4/MOV are allowed.'), false);
        }
    }
});

const uploadSingle = async (req, res) => {
    try {
        if (!req.file) return res.json({ success: true, data: { url: null, publicId: null } });

        // Generate the local URL
        const protocol = req.protocol;
        const host = req.get('host');
        const url = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.status(200).json({ 
            success: true, 
            data: { 
                url, 
                filename: req.file.filename,
                mimetype: req.file.mimetype 
            } 
        });
    } catch (error) {
        console.error("[uploadSingle] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const uploadMultiple = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.json({ success: true, data: { urls: [], data: [] } });

        const protocol = req.protocol;
        const host = req.get('host');
        
        const results = req.files.map(file => ({
            url: `${protocol}://${host}/uploads/${file.filename}`,
            filename: file.filename,
            mimetype: file.mimetype
        }));

        res.status(200).json({ 
            success: true, 
            data: { 
                urls: results.map(r => r.url), 
                data: results 
            } 
        });
    } catch (error) {
        console.error("[uploadMultiple] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteImage = async (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) return res.status(400).json({ error: 'filename is required' });

        const filePath = path.join(__dirname, '../public/uploads', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ success: true, message: 'File deleted' });
        } else {
            res.status(404).json({ success: false, error: 'File not found' });
        }
    } catch (error) {
        console.error("[deleteImage] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { upload, uploadSingle, uploadMultiple, deleteImage };

