const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/users/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                const newUser = {
                    googleId: profile.id,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                };

                try {
                    let user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // Link Google ID if they signed up manually first
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            user.avatar = user.avatar || profile.photos[0].value;
                            await user.save();
                        }
                        return done(null, user);
                    } else {
                        // Brand new user
                        user = await User.create(newUser);
                        return done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    done(err, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
};
