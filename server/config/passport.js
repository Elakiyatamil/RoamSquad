const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../utils/prisma');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const name = profile.displayName;
                    const googleId = profile.id;

                    let user = await prisma.user.findUnique({ where: { email } });

                    if (!user) {
                        // Create user if they don't exist
                        user = await prisma.user.create({
                            data: {
                                email,
                                name,
                                googleId,
                                role: 'USER'
                            }
                        });
                    } else if (!user.googleId) {
                        // Link google account if user already exists by email
                        user = await prisma.user.update({
                            where: { email },
                            data: { googleId }
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
}

// Required for passport to work with sessions (though we use JWT for the app, 
// passport-google-oauth20 still expects some session handling during the flow)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
