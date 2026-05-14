const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const prisma = require('../utils/prisma');

const upsertUser = async (profile, provider) => {
    try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const name = profile.displayName || profile.username;
        const providerId = profile.id;
        const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        if (!email && provider !== 'instagram') {
            throw new Error(`Email not provided by ${provider}`);
        }

        // For Instagram, email might not be available, we use providerId as a fallback for lookup if needed
        // but generally email is the primary key.
        let user;
        if (email) {
            user = await prisma.user.findUnique({ where: { email } });
        } else {
            // Fallback for providers without email (like Instagram sometimes)
            user = await prisma.user.findFirst({
                where: { [`${provider}Id`]: providerId }
            });
        }

        const providerData = { [`${provider}Id`]: providerId };
        if (avatarUrl && (!user || !user.avatarUrl)) {
            providerData.avatarUrl = avatarUrl;
        }

        if (!user) {
            if (!email) throw new Error("Cannot create user without email");
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    ...providerData,
                    role: 'USER'
                }
            });
        } else if (!user[`${provider}Id`]) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: providerData
            });
        }

        return user;
    } catch (error) {
        console.error(`Error upserting user from ${provider}:`, error);
        throw error;
    }
};

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await upsertUser(profile, 'google');
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || "/api/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'emails', 'photos']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await upsertUser(profile, 'facebook');
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
}

// Instagram Strategy
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
    passport.use(new InstagramStrategy({
        clientID: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        callbackURL: process.env.INSTAGRAM_CALLBACK_URL || "/api/auth/instagram/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await upsertUser(profile, 'instagram');
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
}

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
