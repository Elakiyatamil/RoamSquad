const cloudinary = require('../utils/cloudinary');
const multer = require('multer');

// Use Memory Storage for Cloudinary uploads
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB as requested
    fileFilter: (req, file, cb) => {
        // Allow images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
});

console.log("[uploadController] Multer initialized. Methods available:", Object.keys(upload));

/**
 * Helper to upload a buffer to Cloudinary
 */
const uploadToCloudinary = async (buffer, mimetype, folder = 'roamsquad') => {
    const b64 = buffer.toString('base64');
    const dataURI = `data:${mimetype};base64,${b64}`;
    
    console.log(`[uploadToCloudinary] Uploading ${mimetype} (${buffer.length} bytes) to ${folder}...`);
    
    return await cloudinary.uploader.upload(dataURI, {
        folder,
        resource_type: 'auto',
    });
};

const uploadSingle = async (req, res) => {
    try {
        console.log("[uploadSingle] Request received:", {
            file: req.file ? {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : 'No file',
            body: req.body
        });

        if (!req.file) {
            console.warn("[uploadSingle] No file provided");
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const folder = req.body.folder || 'roamsquad';
        
        try {
            console.log(`[uploadSingle] Uploading to Cloudinary (folder: ${folder})...`);
            const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, folder);
            console.log("[uploadSingle] Cloudinary upload successful:", result.secure_url);

            res.status(200).json({ 
                success: true, 
                data: {
                    url: result.secure_url,
                    public_id: result.public_id
                }
            });
        } catch (cloudinaryError) {
            console.error("[uploadSingle] Cloudinary failed, falling back to local storage:", cloudinaryError.message);
            
            const fs = require('fs');
            const path = require('path');
            
            // Ensure uploads directory exists
            const uploadsDir = path.join(__dirname, '../public/uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            // Generate unique filename
            const ext = req.file.originalname.split('.').pop() || 'png';
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
            const filepath = path.join(uploadsDir, filename);
            
            // Save file
            fs.writeFileSync(filepath, req.file.buffer);
            
            // Construct local URL
            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            const localUrl = `${baseUrl}/uploads/${filename}`;
            
            res.status(200).json({
                success: true,
                data: {
                    url: localUrl,
                    public_id: filename // Use filename as identifier for potential future deletion
                }
            });
        }
    } catch (error) {
        console.error("[uploadSingle] FATAL ERROR:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const uploadMultiple = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

        const folder = req.body.folder || 'roamsquad';
        
        try {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, file.mimetype, folder));
            const results = await Promise.all(uploadPromises);

            res.status(200).json({ 
                success: true, 
                data: results.map(r => ({
                    url: r.secure_url,
                    public_id: r.public_id
                }))
            });
        } catch (cloudinaryError) {
            console.error("[uploadMultiple] Cloudinary failed, falling back to local storage:", cloudinaryError.message);
            
            const fs = require('fs');
            const path = require('path');
            
            // Ensure uploads directory exists
            const uploadsDir = path.join(__dirname, '../public/uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            const localResults = [];
            
            for (const file of req.files) {
                const ext = file.originalname.split('.').pop() || 'png';
                const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
                const filepath = path.join(uploadsDir, filename);
                
                fs.writeFileSync(filepath, file.buffer);
                
                localResults.push({
                    url: `${baseUrl}/uploads/${filename}`,
                    public_id: filename
                });
            }
            
            res.status(200).json({
                success: true,
                data: localResults
            });
        }
    } catch (error) {
        console.error("[uploadMultiple] Error:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
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

