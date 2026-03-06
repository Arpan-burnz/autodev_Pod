'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth';

/** Initiate anonymous sign-in. */
export function initiateAnonymousSignIn(authInstance: Auth) {
  return signInAnonymously(authInstance);
}

/** Initiate email/password sign-up. */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string) {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string) {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in. */
export function initiateGoogleSignIn(authInstance: Auth) {
  const provider = new GoogleAuthProvider();
  // We return the promise so the UI can handle loading/error states
  return signInWithPopup(authInstance, provider);
}

/** Initiate GitHub sign-in. */
export function initiateGithubSignIn(authInstance: Auth) {
  const provider = new GithubAuthProvider();
  return signInWithPopup(authInstance, provider);
}
