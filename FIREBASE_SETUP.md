# Firebase Setup Guide

Firebase authentication and storage has been integrated into your Typst editor. Follow these steps to complete the setup:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "typst-editor")
4. Follow the setup wizard (you can disable Google Analytics if you want)

## 2. Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Give your app a nickname (e.g., "Typst Editor Web")
3. **Don't** check "Set up Firebase Hosting" (unless you want to use it)
4. Click "Register app"
5. Copy the Firebase configuration object

## 3. Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your Firebase config:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 4. Enable Authentication Methods

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click on it and toggle "Enable"
   - **Google** (optional): Click on it, enable, and provide project support email

## 5. Set Up Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll add security rules next)
4. Select a location (choose one close to your users)
5. Click "Enable"

## 6. Configure Firestore Security Rules

1. In Firestore, go to the **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own documents
    match /documents/{document} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
                    && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click "Publish"

## 7. Create Firestore Index (for queries)

1. Go to **Firestore > Indexes** tab
2. Click "Create index"
3. Configure:
   - Collection ID: `documents`
   - Fields to index:
     - `userId` (Ascending)
     - `updatedAt` (Descending)
   - Query scope: Collection
4. Click "Create"

*Note: You might also get prompted to create this index automatically when you first run a query.*

## 8. Start Your Application

```bash
npm start
```

## Features Implemented

✅ **Authentication**
- Email/password registration and login
- Google sign-in
- Auto-logout on browser close
- Secure session management

✅ **Document Storage**
- Create, read, update, delete documents
- Auto-save (2 seconds after typing stops)
- Document list with timestamps
- User-specific documents (isolation)

✅ **UI Components**
- Login/Signup forms
- Document manager sidebar
- Document title editing
- Save status indicator
- User email display

## Testing

1. Register a new account with email/password
2. Try Google sign-in (if enabled)
3. Create a new document
4. Type some Typst content
5. Wait for auto-save indicator
6. Create multiple documents
7. Switch between documents
8. Delete a document
9. Logout and login again to verify persistence

## Free Tier Limits

Your app will stay within Firebase free tier as long as you have:
- Less than 50,000 document reads/day
- Less than 20,000 document writes/day
- Less than 1 GB stored data
- Reasonable number of users

## Troubleshooting

**"Firebase: Error (auth/configuration-not-found)"**
- Make sure you've added your Firebase config to `.env.local`
- Restart your development server after changing `.env.local`

**"Missing or insufficient permissions"**
- Check your Firestore security rules
- Make sure you're logged in

**"Failed to create index"**
- Go to Firestore > Indexes and create the composite index for `userId` + `updatedAt`

**Documents not loading**
- Check browser console for errors
- Verify Firestore rules allow read access
- Check that the collection name is "documents"

## Next Steps

Consider adding:
- Password reset functionality
- Email verification
- Document sharing between users
- Export to PDF/PNG
- Document templates
- Search functionality
- Document folders/tags
