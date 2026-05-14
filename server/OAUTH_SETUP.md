# OAuth Setup Guide for Roamg

To enable Google, Facebook, and Instagram login, you need to set up applications on their respective developer consoles and add the credentials to your `.env` file.

## 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.developers.google.com/).
2. Create a new project.
3. Go to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
5. Choose **Web application**.
6. Set **Authorized redirect URIs** to: `http://localhost:5005/api/auth/google/callback` (or your production URL).
7. Copy the **Client ID** and **Client Secret**.

## 2. Facebook OAuth Setup
1. Go to [Meta for Developers](https://developers.facebook.com/).
2. Create a new app and choose **Allow people to log in with their Facebook account**.
3. Go to **App Settings > Basic**.
4. Copy the **App ID** and **App Secret**.
5. Under **Facebook Login > Settings**, set **Valid OAuth Redirect URIs** to: `http://localhost:5005/api/auth/facebook/callback`.

## 3. Instagram OAuth Setup
1. Use the same [Meta for Developers](https://developers.facebook.com/) dashboard.
2. Add the **Instagram Graph API** product to your app.
3. Go to **Instagram Settings > Basic**.
4. Copy the **Instagram Client ID** and **Instagram Client Secret**.
5. Set **Valid OAuth Redirect URIs** to: `http://localhost:5005/api/auth/instagram/callback`.

## Environment Variables
Add these to your `server/.env` file:

```env
# Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5005/api/auth/google/callback

# Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5005/api/auth/facebook/callback

# Instagram
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_CALLBACK_URL=http://localhost:5005/api/auth/instagram/callback

# JWT & Session
JWT_SECRET=your_secure_jwt_secret
SESSION_SECRET=your_secure_session_secret
FRONTEND_URL=http://localhost:5173
```
