"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp, 
  initiateAnonymousSignIn,
  initiateGoogleSignIn,
  initiateGithubSignIn
} from '@/firebase/non-blocking-login';
import { getRedirectResult } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Cpu, Loader2, ArrowLeft, Ghost, Zap, ShieldCheck, Github, Chrome, AlertTriangle, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizingAuth, setIsFinalizingAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  const [apiErrorContext, setApiErrorContext] = useState<{ title: string; message: string; link?: string } | null>(null);
  const [currentHostname, setCurrentHostname] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHostname(window.location.hostname);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;

    const checkRedirect = async () => {
      try {
        setIsFinalizingAuth(true);
        const result = await getRedirectResult(auth);
        if (result?.user) {
          router.push('/');
        } else {
          if (user && !isUserLoading) {
            router.push('/');
          } else {
            setIsFinalizingAuth(false);
          }
        }
      } catch (error: any) {
        setIsFinalizingAuth(false);
        handleAuthError(error);
      }
    };

    checkRedirect();
  }, [auth, router, user, isUserLoading]);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleAuthError = (error: any) => {
    console.error("Auth Error:", error);
    let message = "An unexpected error occurred during authentication.";
    let title = "AUTH_FAILURE";
    let link = "";

    const errorStr = error.message || "";
    
    if (errorStr.includes('identitytoolkit.googleapis.com')) {
      title = "API_DISABLED";
      message = "The Identity Toolkit API is not enabled for this project. This is required for authentication to work.";
      // Extract project number if possible, or just provide a general link
      const projectMatch = errorStr.match(/project-(\d+)/);
      const projectNum = projectMatch ? projectMatch[1] : "";
      link = `https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview${projectNum ? `?project=${projectNum}` : ''}`;
      setApiErrorContext({ title, message, link });
    } else if (error.code === 'auth/operation-not-allowed') {
      message = "This sign-in method is not enabled in the Firebase Console.";
    } else if (error.code === 'auth/unauthorized-domain' || error.message?.includes('403') || error.message?.includes('unauthorized')) {
      title = "DOMAIN_AUTHORIZATION_REQUIRED";
      message = `Domain ${window.location.hostname} needs to be whitelisted in Firebase.`;
      setShowDomainHelp(true);
    } else if (error.code === 'auth/popup-blocked') {
      title = "POPUP_BLOCKED";
      message = "The authentication window was blocked. Please allow popups or use the redirect method.";
    } else if (error.code === 'auth/popup-closed-by-user') {
      message = "Authentication window was closed before completion.";
    } else if (error.message) {
      message = error.message;
    }

    toast({
      title: title,
      description: message,
      variant: "destructive"
    });
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    initiateEmailSignIn(auth, email, password).catch(handleAuthError);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    initiateEmailSignUp(auth, email, password).catch(handleAuthError);
  };

  const handleGuestLogin = () => {
    if (isLoading) return;
    setIsLoading(true);
    initiateAnonymousSignIn(auth).catch(handleAuthError);
  };

  const handleGoogleLogin = () => {
    if (isLoading) return;
    setIsLoading(true);
    initiateGoogleSignIn(auth).catch(handleAuthError);
  };

  const handleGithubLogin = () => {
    if (isLoading) return;
    setIsLoading(true);
    initiateGithubSignIn(auth).catch(handleAuthError);
  };

  if (isUserLoading || isFinalizingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="animate-spin text-black/20" size={32} />
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
          {isFinalizingAuth ? 'Finalizing_Authentication' : 'Verifying_Session'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative selection:bg-black selection:text-white technical-grid">
      <div className="absolute top-0 left-0 w-full h-full scanline opacity-5 pointer-events-none" />
      
      <Link href="/" className="absolute top-12 left-12 flex items-center gap-2 text-[10px] font-bold tracking-[0.4em] text-black/30 hover:text-black transition-all uppercase group">
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        BACK_TO_TERMINAL
      </Link>

      <div className="w-full max-w-md space-y-12 relative z-10">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 border border-black/10 bg-white shadow-2xl">
            <Cpu size={36} className="text-black" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-headline font-bold tracking-tight text-black">
              CORE_ACCESS
            </h1>
            <p className="text-[9px] text-black/30 font-bold tracking-[0.6em] uppercase">Security Protocol v4.0</p>
          </div>
        </div>

        {apiErrorContext && (
          <Alert variant="destructive" className="rounded-none border-destructive bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
            <Settings className="h-4 w-4" />
            <AlertTitle className="text-[10px] font-bold tracking-[0.2em] uppercase">Service Activation Required</AlertTitle>
            <AlertDescription className="text-[9px] uppercase tracking-wider font-medium mt-2 space-y-4">
              <p>{apiErrorContext.message}</p>
              <div className="p-3 bg-destructive/5 border border-destructive/20">
                <p className="font-bold mb-2">REQUIRED ACTION:</p>
                <a 
                  href={apiErrorContext.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-destructive text-white px-4 py-2 text-[10px] font-bold tracking-widest hover:bg-destructive/90 transition-all uppercase"
                >
                  ENABLE_IDENTITY_TOOLKIT <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-destructive/60 italic">* After enabling, wait 2-3 minutes for the changes to propagate before retrying.</p>
            </AlertDescription>
          </Alert>
        )}

        {showDomainHelp && !apiErrorContext && (
          <Alert className="rounded-none border-black bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-[10px] font-bold tracking-[0.2em] uppercase">Authorization Required (403)</AlertTitle>
            <AlertDescription className="text-[9px] uppercase tracking-wider font-medium mt-2 space-y-4">
              <p>Firebase requires this domain to be explicitly whitelisted. If you are seeing a 403 error, follow these steps:</p>
              
              <div className="p-3 bg-muted border border-border space-y-2">
                <p className="font-bold">1. COPY CURRENT DOMAIN</p>
                <code className="block bg-black text-white p-2 text-[9px] font-code break-all select-all cursor-pointer" title="Click to select all">
                  {currentHostname}
                </code>
              </div>

              <div className="p-3 bg-muted border border-border space-y-2">
                <p className="font-bold">2. ADD TO FIREBASE CONSOLE</p>
                <p>Go to <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized Domains</strong> and add the hostname above.</p>
              </div>

              <div className="flex justify-between items-center">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-[9px] font-bold tracking-widest text-black/40 hover:text-black uppercase"
                  onClick={() => setShowDomainHelp(false)}
                >
                  CLOSE_NOTICE
                </Button>
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] font-bold tracking-widest text-primary flex items-center gap-1 uppercase"
                >
                  OPEN_FIREBASE <ExternalLink size={10} />
                </a>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-10 h-14 bg-black/5 border border-black/5 rounded-none p-1">
            <TabsTrigger value="login" className="font-bold text-[10px] uppercase tracking-[0.2em] rounded-none data-[state=active]:bg-white data-[state=active]:text-black transition-all shadow-none">VERIFY</TabsTrigger>
            <TabsTrigger value="signup" className="font-bold text-[10px] uppercase tracking-[0.2em] rounded-none data-[state=active]:bg-white data-[state=active]:text-black transition-all shadow-none">REGISTER</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-6">
            <Card className="border-black/5 bg-white rounded-none shadow-xl overflow-hidden">
              <form onSubmit={handleLogin}>
                <CardHeader className="border-b border-black/5 pb-8 px-10 pt-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-headline font-bold uppercase tracking-[0.3em]">Credentials</CardTitle>
                    <ShieldCheck size={14} className="text-black/20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 p-10">
                  <div className="space-y-4">
                    <Label htmlFor="email" className="text-[9px] font-bold tracking-[0.3em] uppercase text-black/40">USER_ID</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="OPERATOR@CORE.SYSTEM" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background border-black/5 rounded-none h-14 text-xs font-code focus:border-black/20 focus:ring-0 transition-all placeholder:text-black/10"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="password" title="password" className="text-[9px] font-bold tracking-[0.3em] uppercase text-black/40">PASS_KEY</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background border-black/5 rounded-none h-14 text-xs font-code focus:border-black/20 focus:ring-0 transition-all"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 p-10 pt-0">
                  <Button type="submit" className="w-full h-14 font-bold rounded-none bg-black text-white hover:bg-black/90 text-[11px] tracking-[0.3em] uppercase group shadow-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                      <span className="flex items-center gap-2">BOOT_SESSION <Zap size={14} className="fill-current" /></span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/5" />
              </div>
              <div className="relative flex justify-center text-[8px] uppercase tracking-[0.5em]">
                <span className="bg-background px-4 text-black/20 font-bold">OR_BYPASS</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-14 text-[10px] font-bold tracking-[0.2em] uppercase border-black/10 rounded-none hover:bg-black hover:text-white transition-all group bg-white shadow-sm"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <Chrome size={16} className="mr-3 opacity-30 group-hover:opacity-100" /> 
                GOOGLE
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-14 text-[10px] font-bold tracking-[0.2em] uppercase border-black/10 rounded-none hover:bg-black hover:text-white transition-all group bg-white shadow-sm"
                onClick={handleGithubLogin}
                disabled={isLoading}
              >
                <Github size={16} className="mr-3 opacity-30 group-hover:opacity-100" /> 
                GITHUB
              </Button>
            </div>

            <Button 
              type="button" 
              variant="ghost" 
              className="w-full h-14 text-[10px] font-bold tracking-[0.3em] uppercase border-transparent rounded-none hover:bg-black/5 transition-all group"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              <Ghost size={16} className="mr-3 opacity-30" /> 
              INITIALIZE_GUEST_ACCESS
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-6">
            <Card className="border-black/5 bg-white rounded-none shadow-xl">
              <form onSubmit={handleSignUp}>
                <CardHeader className="border-b border-black/5 pb-8 px-10 pt-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-headline font-bold uppercase tracking-[0.3em]">New Account</CardTitle>
                    <Zap size={14} className="text-black/20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 p-10">
                  <div className="space-y-4">
                    <Label htmlFor="signup-email" className="text-[9px] font-bold tracking-[0.3em] uppercase text-black/40">USER_ID</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="NEW_OPERATOR@CORE.SYSTEM" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background border-black/5 rounded-none h-14 text-xs font-code focus:border-black/20 focus:ring-0 transition-all placeholder:text-black/10"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="signup-password" title="signup-password" className="text-[9px] font-bold tracking-[0.3em] uppercase text-black/40">NEW_KEY</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background border-black/5 rounded-none h-14 text-xs font-code focus:border-black/20 focus:ring-0 transition-all"
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                  <Button type="submit" className="w-full h-14 font-bold rounded-none bg-black text-white hover:bg-black/90 text-[11px] tracking-[0.3em] uppercase shadow-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : "CREATE_ACCESS_TOKEN"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/5" />
              </div>
              <div className="relative flex justify-center text-[8px] uppercase tracking-[0.5em]">
                <span className="bg-background px-4 text-black/20 font-bold">QUICK_REG</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-14 text-[10px] font-bold tracking-[0.2em] uppercase border-black/10 rounded-none hover:bg-black hover:text-white transition-all group bg-white shadow-sm"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <Chrome size={16} className="mr-3 opacity-30 group-hover:opacity-100" /> 
                GOOGLE
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-14 text-[10px] font-bold tracking-[0.2em] uppercase border-black/10 rounded-none hover:bg-black hover:text-white transition-all group bg-white shadow-sm"
                onClick={handleGithubLogin}
                disabled={isLoading}
              >
                <Github size={16} className="mr-3 opacity-30 group-hover:opacity-100" /> 
                GITHUB
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <p className="text-center text-[7px] text-black/10 tracking-[1em] uppercase font-bold">
          SECURE_TERMINAL_V4.0
        </p>
      </div>
    </div>
  );
}
