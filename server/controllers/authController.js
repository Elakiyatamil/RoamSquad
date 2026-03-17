const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        console.log(`Login attempt for: ${email}`);
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match: ${isMatch}`);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // #region agent log
        try {
            const fs = require('fs');
            fs.appendFileSync(
                'c:\\Users\\sange\\MyProjecct\\roamrevier\\debug-b1a21f.log',
                `${JSON.stringify({
                    sessionId: 'b1a21f',
                    runId: 'pre-fix',
                    hypothesisId: 'H6',
                    location: 'server/controllers/authController.js:login',
                    message: 'login issued token',
                    data: { userIdType: typeof user.id, userRole: user.role, hasJWTSecret: Boolean(process.env.JWT_SECRET) },
                    timestamp: Date.now(),
                })}\n`,
                'utf8'
            );
        } catch (_) {}
        // #endregion agent log

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { login };
