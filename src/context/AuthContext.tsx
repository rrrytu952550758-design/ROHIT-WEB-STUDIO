import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { BOOTSTRAP_ADMIN_EMAIL } from '../data/defaultData';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isDemoUser: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerCustomer: (email: string, pass: string, displayName: string, company?: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (role: 'admin' | 'customer') => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  claimAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check admin status and profile
  const fetchUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const adminDocRef = doc(db, 'admins', user.uid);

      let isAdminUser = false;

      // 1. Check if user is in bootstrap email
      if (user.email && user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
        isAdminUser = true;
      }

      // 2. Check Firestore admins collection
      try {
        const adminSnap = await getDoc(adminDocRef);
        if (adminSnap.exists()) {
          isAdminUser = true;
        }
      } catch {
        // Ignored if permissions not yet open
      }

      // 3. Fetch user profile
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        if (data.role === 'admin') {
          isAdminUser = true;
        }
        setUserProfile(data);
      } else {
        // Create initial profile if missing
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Studio User',
          role: isAdminUser ? 'admin' : 'customer',
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);
        } catch {
          setUserProfile(newProfile);
        }
      }

      // If bootstrapped admin, ensure admin doc exists
      if (isAdminUser) {
        try {
          await setDoc(adminDocRef, {
            email: user.email,
            grantedAt: new Date().toISOString()
          }, { merge: true });
        } catch {
          // Rule may allow once admin is verified
        }
      }

      setIsAdmin(isAdminUser);
      setIsDemoUser(false);
    } catch (err) {
      console.warn('Profile fetch notice:', err);
      // Fallback
      if (user.email && user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
      }
    }
  };

  useEffect(() => {
    // Check local demo session first if present
    const savedDemo = localStorage.getItem('rws_demo_session');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setUserProfile(parsed.profile);
        setIsAdmin(parsed.role === 'admin');
        setIsDemoUser(true);
      } catch {
        localStorage.removeItem('rws_demo_session');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.removeItem('rws_demo_session');
        setCurrentUser(user);
        await fetchUserProfile(user);
      } else {
        // Only clear if not in demo mode
        const demoActive = localStorage.getItem('rws_demo_session');
        if (!demoActive) {
          setCurrentUser(null);
          setUserProfile(null);
          setIsAdmin(false);
          setIsDemoUser(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await fetchUserProfile(cred.user);
  };

  const registerCustomer = async (
    email: string,
    pass: string,
    displayName: string,
    company?: string,
    phone?: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    const isBootstrapped = email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
    const profile: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName: displayName || email.split('@')[0],
      role: isBootstrapped ? 'admin' : 'customer',
      company: company || '',
      phone: phone || '',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      if (isBootstrapped) {
        await setDoc(doc(db, 'admins', cred.user.uid), {
          email,
          grantedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${cred.user.uid}`);
    }

    setUserProfile(profile);
    setIsAdmin(isBootstrapped);
    setIsDemoUser(false);
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await fetchUserProfile(cred.user);
  };

  const loginAsDemo = (role: 'admin' | 'customer') => {
    const isAdm = role === 'admin';
    const demoProfile: UserProfile = {
      uid: isAdm ? 'admin_studio_rohit' : 'demo_customer_id',
      email: isAdm ? BOOTSTRAP_ADMIN_EMAIL : 'demo.client@rohitwebstudio.dev',
      displayName: isAdm ? 'Rohit (Studio Lead)' : 'Demo Client',
      role: isAdm ? 'admin' : 'customer',
      company: isAdm ? 'Rohit Web Studio' : 'Venture Partners LLC',
      phone: '+1 (555) 019-2834',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('rws_demo_session', JSON.stringify({ role, profile: demoProfile }));
    setUserProfile(demoProfile);
    setIsAdmin(isAdm);
    setIsDemoUser(true);
  };

  const logout = async () => {
    localStorage.removeItem('rws_demo_session');
    try {
      await signOut(auth);
    } catch {
      // Ignored
    }
    setCurrentUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsDemoUser(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  const claimAdminStatus = async (): Promise<boolean> => {
    if (!currentUser) return false;
    if (currentUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      try {
        await setDoc(doc(db, 'admins', currentUser.uid), {
          email: currentUser.email,
          grantedAt: new Date().toISOString()
        }, { merge: true });
        await setDoc(doc(db, 'users', currentUser.uid), {
          role: 'admin'
        }, { merge: true });
        setIsAdmin(true);
        if (userProfile) {
          setUserProfile({ ...userProfile, role: 'admin' });
        }
        return true;
      } catch (err) {
        console.warn('Failed to claim admin status:', err);
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isDemoUser,
        loading,
        loginWithEmail,
        registerCustomer,
        loginWithGoogle,
        loginAsDemo,
        logout,
        resetPassword,
        refreshProfile,
        claimAdminStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
