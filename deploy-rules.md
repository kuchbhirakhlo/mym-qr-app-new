# Deploying Updated Firestore Rules

To deploy the updated Firestore rules that allow public access to menus for QR code scanning, follow these steps:

## Option 1: Using Firebase Console

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "menu-app-11626"
3. Navigate to "Firestore Database" in the left sidebar
4. Click on the "Rules" tab
5. Replace the existing rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read any user
    match /users/{userId} {
      allow read: if request.auth != null;
    }
    
    // Allow authenticated users to read and write restaurants they own
    match /restaurants/{restaurantId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && 
        (request.auth.uid == restaurantId || request.auth.uid == resource.data.userId);
    }
    
    // Allow public access to menus for QR code scanning
    match /menus/{menuId} {
      allow create: if request.auth != null;
      // Allow public read access for QR code scanning
      allow read: if true;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         exists(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)) &&
         get(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)).data.userId == request.auth.uid);
    }
    
    // Allow public access to menu_views collection for analytics tracking
    match /menu_views/{viewId} {
      allow create, read: if true;
    }
  }
}
```

6. Click "Publish" to deploy the rules

## Option 2: Using Firebase CLI

If you have the Firebase CLI installed:

1. Open a terminal
2. Navigate to your project directory
3. Run: `firebase login` (if not already logged in)
4. Run: `firebase deploy --only firestore:rules`

After deploying the rules, your QR codes should work properly for public access. 