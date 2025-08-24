import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, createUserWithEmailAndPassword, onAuthStateChanged, signOut, browserLocalPersistence, setPersistence, type Auth, type User } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, serverTimestamp as firestoreServerTimestamp, type Firestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { demoRestaurant, demoMenus } from "@/lib/demo-data"

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// IMPORTANT: Force demo mode in all preview environments or during development if needed
// Set this to false to use real Firebase
const FORCE_DEMO_MODE = false;

// Check if we're running in demo mode
const isDemoMode = () => {
  // Force demo mode if the flag is set
  if (FORCE_DEMO_MODE) return true;
  
  // Check if we're in a development or preview environment
  // You can modify this logic based on your environment
  return false;
};

// Initialize Firebase conditionally
let app;
let firebaseAuth: Auth;
let firebaseDb: Firestore;
let firebaseStorage;

if (isDemoMode()) {
  console.log("Firebase initialized in DEMO MODE");
  // Use mock implementations for demo mode
  firebaseAuth = createMockAuth();
  firebaseDb = {} as Firestore;
  firebaseStorage = {};
} else {
  try {
    // Log initialization without revealing sensitive details
    console.log("Initializing Firebase...");
    
    // Initialize real Firebase
    app = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(app);
    
    // Set persistence for better user experience
    setPersistence(firebaseAuth, browserLocalPersistence)
      .then(() => console.log("Auth persistence set to LOCAL"))
      .catch(error => console.error("Error setting auth persistence:", error));
    
    firebaseDb = getFirestore(app);
    
    // Check if we're in a development environment to use emulators
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Optional: Uncomment to use Firebase emulators during local development
      // connectFirestoreEmulator(firebaseDb, 'localhost', 8080);
      // console.log("Connected to Firestore emulator");
    }
    
    firebaseStorage = getStorage(app);
    console.log("Firebase initialized with REAL configuration");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    // Fallback to demo mode on error
    console.log("Falling back to DEMO MODE due to initialization error");
    firebaseAuth = createMockAuth();
    firebaseDb = {} as Firestore;
    firebaseStorage = {};
  }
}

// Export Firebase services with better type definitions
export const auth = firebaseAuth;
export const db = firebaseDb;
export const storage = firebaseStorage;

// Export Firebase authentication methods
export { 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where
};

// Export Firestore server timestamp for consistent timestamps
export const serverTimestamp = firestoreServerTimestamp;

// Mock user for demo mode
const mockUser = {
  uid: "demo-user-id",
  email: "demo@example.com",
  displayName: "Demo Restaurant",
  photoURL: "https://ui-avatars.com/api/?name=Demo+Restaurant&background=f97316&color=fff",
  providerData: [
    {
      providerId: "password",
      uid: "demo@example.com",
      displayName: "Demo Restaurant",
      email: "demo@example.com",
      photoURL: "https://ui-avatars.com/api/?name=Demo+Restaurant&background=f97316&color=fff",
    },
  ],
}

// Mock Google user
const mockGoogleUser = {
  uid: "google-user-id",
  email: "google-user@example.com",
  displayName: "Google User",
  photoURL: "https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff",
  providerData: [
    {
      providerId: "google.com",
      uid: "google-user@example.com",
      displayName: "Google User",
      email: "google-user@example.com",
      photoURL: "https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff",
    },
  ],
}

// In-memory storage for demo data
const mockCollections: Record<string, Record<string, any>> = {
  restaurants: {
    [mockUser.uid]: demoRestaurant,
    [mockGoogleUser.uid]: {
      id: mockGoogleUser.uid,
      restaurantName: "Google Restaurant",
      email: mockGoogleUser.email,
      createdAt: new Date().toISOString(),
    },
  },
  menus: {},
}

// Add demo menus to the collections
demoMenus.forEach((menu) => {
  mockCollections.menus[menu.id] = menu
})

// Create mock auth implementation
function createMockAuth(): Auth {
  const listeners: Array<(user: User | null) => void> = []
  let currentUser = mockUser as unknown as User

  return {
    currentUser,
    onAuthStateChanged: (callback: (user: User | null) => void) => {
      listeners.push(callback)
      // Simulate authenticated state
      setTimeout(() => callback(currentUser), 100)
      return () => {
        const index = listeners.indexOf(callback)
        if (index !== -1) listeners.splice(index, 1)
      }
    },
    signOut: async () => {
      currentUser = null as unknown as User
      listeners.forEach((listener) => listener(null))
      return Promise.resolve()
    },
    // Add other required properties to satisfy the Auth type
  } as unknown as Auth
}

// Conditional Firebase functions based on mode
export async function safeCreateUserWithEmailAndPassword(auth: Auth, email: string, password: string) {
  if (isDemoMode()) {
    console.log("DEMO: Creating user with", email);
    
    // Create a custom user with the provided email
    const customUser = {
      ...mockUser,
      email,
      uid: `email-user-${Date.now()}`,
      displayName: email.split("@")[0],
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split("@")[0])}&background=f97316&color=fff`,
    };

    // Update the current user
    (auth as any).currentUser = customUser as unknown as User;

    // Notify listeners
    const listeners = (auth as any).onAuthStateChanged.listeners || [];
    listeners.forEach((listener: any) => listener(auth.currentUser));

    return {
      user: customUser as unknown as User,
    };
  } else {
    // Use real Firebase
    return createUserWithEmailAndPassword(auth, email, password);
  }
}

export async function safeSignInWithEmailAndPassword(auth: Auth, email: string, password: string) {
  if (isDemoMode()) {
    console.log("DEMO: Signing in user with", email);

    // Create a custom user with the provided email
    const customUser = {
      ...mockUser,
      email,
      uid: `email-user-${Date.now()}`,
      displayName: email.split("@")[0],
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split("@")[0])}&background=f97316&color=fff`,
    };

    // Update the current user
    (auth as any).currentUser = customUser as unknown as User;

    // Notify listeners
    const listeners = (auth as any).onAuthStateChanged.listeners || [];
    listeners.forEach((listener: any) => listener(auth.currentUser));

    return { user: customUser as unknown as User };
  } else {
    // Use real Firebase
    return signInWithEmailAndPassword(auth, email, password);
  }
}

export async function safeSignInWithPopup(auth: Auth, provider: any) {
  if (isDemoMode()) {
    console.log("DEMO: Google sign in with popup");

    // Check if we have a stored Google auth result from the simulated Google auth page
    const storedAuthResult = sessionStorage.getItem("googleAuthResult");

    if (storedAuthResult) {
      // Clear the stored auth result
      sessionStorage.removeItem("googleAuthResult");

      // Parse the stored auth result
      const authResult = JSON.parse(storedAuthResult);

      // Update the current user
      (auth as any).currentUser = authResult.user as unknown as User;

      // Notify listeners
      const listeners = (auth as any).onAuthStateChanged.listeners || [];
      listeners.forEach((listener: any) => listener(auth.currentUser));

      return authResult;
    }

    // If no stored auth result, we need to redirect to the simulated Google auth page
    window.location.href = `/auth/google?mode=signin&redirect=${encodeURIComponent(window.location.pathname)}`;

    // This will never be reached due to the redirect, but TypeScript needs a return value
    return new Promise(() => {});
  } else {
    // Use real Firebase
    return signInWithPopup(auth, provider);
  }
}

export async function safeSignInWithRedirect(auth: Auth, provider: any) {
  if (isDemoMode()) {
    console.log("DEMO: Google sign in with redirect");

    // Redirect to the simulated Google auth page
    window.location.href = `/auth/google?mode=signin&redirect=${encodeURIComponent(window.location.pathname)}`;

    // This will never be reached due to the redirect, but TypeScript needs a return value
    return new Promise(() => {});
  } else {
    // Use real Firebase
    return signInWithRedirect(auth, provider);
  }
}

export async function safeSignOut(auth: Auth) {
  if (isDemoMode()) {
    console.log("DEMO: Sign out");

    // Set current user to null
    (auth as any).currentUser = null as unknown as User;

    // Notify listeners
    const listeners = (auth as any).onAuthStateChanged.listeners || [];
    listeners.forEach((listener: any) => listener(null));

    return Promise.resolve();
  } else {
    // Use real Firebase
    return signOut(auth);
  }
}

export function safeOnAuthStateChanged(auth: Auth, callback: (user: User | null) => void) {
  if (isDemoMode()) {
    console.log("DEMO: Setting up auth state change listener");

    // Store the callback in the listeners array
    if (!(auth as any).onAuthStateChanged.listeners) {
      (auth as any).onAuthStateChanged.listeners = [];
    }
    (auth as any).onAuthStateChanged.listeners.push(callback);

    // Check if we have a stored Google auth result from the simulated Google auth page
    const storedAuthResult = sessionStorage.getItem("googleAuthResult");

    if (storedAuthResult) {
      // Parse the stored auth result
      const authResult = JSON.parse(storedAuthResult);

      // Update the current user
      (auth as any).currentUser = authResult.user as unknown as User;

      // Call the callback with the current user
      setTimeout(() => callback(auth.currentUser), 100);
    } else {
      // Call the callback with the current user
      setTimeout(() => callback(auth.currentUser), 100);
    }

    return () => {
      // Remove the callback from the listeners array
      const listeners = (auth as any).onAuthStateChanged.listeners || [];
      const index = listeners.indexOf(callback);
      if (index !== -1) listeners.splice(index, 1);
    };
  } else {
    // Use real Firebase
    return onAuthStateChanged(auth, callback);
  }
}

// Firestore functions
export async function safeGetDoc(docRef: any) {
  if (isDemoMode()) {
    console.log("DEMO: Getting document", docRef.path);

    const [collectionName, docId] = docRef.path.split("/");

    if (mockCollections[collectionName] && mockCollections[collectionName][docId]) {
      return {
        exists: () => true,
        data: () => mockCollections[collectionName][docId],
        id: docId,
      };
    }

    // Default mock document
    return {
      exists: () => true,
      data: () => ({
        name: "Mock Document",
        createdAt: new Date().toISOString(),
      }),
      id: docRef.id || "mock-doc-id",
    };
  } else {
    // Use real Firebase
    return getDoc(docRef);
  }
}

export async function safeSetDoc(docRef: any, data: any, options?: any) {
  if (isDemoMode()) {
    console.log("DEMO: Setting document", docRef.path, data);

    const [collectionName, docId] = docRef.path.split("/");

    if (!mockCollections[collectionName]) {
      mockCollections[collectionName] = {};
    }

    if (options?.merge && mockCollections[collectionName][docId]) {
      mockCollections[collectionName][docId] = {
        ...mockCollections[collectionName][docId],
        ...data,
      };
    } else {
      mockCollections[collectionName][docId] = {
        ...data,
        id: docId,
      };
    }

    return Promise.resolve();
  } else {
    // Use real Firebase
    return setDoc(docRef, data, options);
  }
}

export async function safeAddDoc(collectionRef: any, data: any) {
  if (isDemoMode()) {
    console.log("DEMO: Adding document to collection", collectionRef.path, data);

    const collectionName = collectionRef.path;
    const id = `mock-doc-${Date.now()}`;

    if (!mockCollections[collectionName]) {
      mockCollections[collectionName] = {};
    }

    mockCollections[collectionName][id] = {
      ...data,
      id,
    };

    return { id };
  } else {
    // Use real Firebase
    return addDoc(collectionRef, data);
  }
}

export async function safeGetDocs(queryRef: any) {
  if (isDemoMode()) {
    console.log("DEMO: Getting documents from query");

    const collectionName = queryRef.collection?.path || queryRef.path;

    if (mockCollections[collectionName]) {
      const docs = Object.entries(mockCollections[collectionName]).map(([id, data]) => ({
        id,
        data: () => data,
      }));

      return {
        forEach: (callback: (doc: any) => void) => {
          docs.forEach(callback);
        },
        docs,
      };
    }

    // Default mock response
    return {
      forEach: (callback: (doc: any) => void) => {
        callback({
          id: "mock-doc-1",
          data: () => ({
            name: "Mock Document 1",
            createdAt: new Date().toISOString(),
          }),
        });
      },
      docs: [
        {
          id: "mock-doc-1",
          data: () => ({
            name: "Mock Document 1",
            createdAt: new Date().toISOString(),
          }),
        },
      ],
    };
  } else {
    // Use real Firebase
    return getDocs(queryRef);
  }
}
