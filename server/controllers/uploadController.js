const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const { Readable } = require('stream');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
        }
    }
});

const uploadSingle = async (req, res) => {
    try {
        if (!req.file) return res.json({ url: null, publicId: null });

        if (!process.env.CLOUDINARY_API_KEY) {
            return res.json({ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: 'sample' });
        }

        const stream = cloudinary.uploader.upload_stream(
            { folder: 'roam_squad' },
            (error, result) => {
                if (error) {
                    console.error("[uploadSingle] Error:", error);
                    return res.status(500).json({ success: false, error: error.message });
                }
                res.status(200).json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
            }
        );

        Readable.from(req.file.buffer).pipe(stream);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const uploadMultiple = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.json({ urls: [], data: [] });

        if (!process.env.CLOUDINARY_API_KEY) {
            const urls = req.files.map((_, i) => `https://res.cloudinary.com/demo/image/upload/sample${i}.jpg`);
            return res.json({
                urls,
                data: req.files.map((_, i) => ({ url: `https://res.cloudinary.com/demo/image/upload/sample${i}.jpg`, publicId: `sample${i}` }))
            });
        }

        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'roam_squad' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve({ url: result.secure_url, publicId: result.public_id });
                    }
                );
                Readable.from(file.buffer).pipe(stream);
            });
        });

        const results = await Promise.all(uploadPromises);
        res.status(200).json({ success: true, data: { urls: results.map(r => r.url), data: results } });
    } catch (error) {
        console.error("[uploadMultiple] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId) return res.status(400).json({ error: 'publicId is required' });

        if (!process.env.CLOUDINARY_API_KEY) {
            return res.json({ result: 'ok', mocked: true });
        }

        const result = await cloudinary.uploader.destroy(publicId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("[deleteImage] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { upload, uploadSingle, uploadMultiple, deleteImage };
