const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        async (err, decoded) => {
            if (err) {
                return res.sendStatus(403); // invalid token
            }

            try {
                const user = await prisma.user.findUnique({
                    where: { id: decoded.id }
                });
                if (!user) return res.sendStatus(401);

                req.user = user;
                next();
            } catch (error) {
                console.error('Auth Middleware Error:', error);
                res.sendStatus(500);
            }
        }
    );
};

const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

module.exports = { verifyJWT, isAdmin };
