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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Cpu, Loader2, ArrowLeft, Ghost, Zap, ShieldCheck, Github, Chrome, AlertCircle, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleAuthError = (error: any) => {
    console.error("Auth Error:", error);
    let message = "An unexpected error occurred during authentication.";
    let title = "AUTH_FAILURE";
    
    if (error.code === 'auth/operation-not-allowed') {
      message = "This sign-in method is not enabled in the Firebase Console (Authentication > Sign-in method).";
    } else if (error.code === 'auth/popup-blocked') {
      message = "The sign-in popup was blocked by your browser. Please allow popups for this site.";
    } else if (error.code === 'auth/popup-closed-by-user') {
      title = "POPUP_CLOSED";
      message = "The authentication window was closed before completion. This usually happens if your domain is not authorized in the Firebase Console or if an ad-blocker is active.";
      setShowDomainHelp(true);
    } else if (error.code === 'auth/cancelled-by-user') {
      message = "Authentication was cancelled.";
    } else if (error.code === 'auth/network-request-failed') {
      message = "Network error. Please check your connection.";
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

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-black/20" size={32} />
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

        {showDomainHelp && (
          <Alert className="rounded-none border-black bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
            <Info className="h-4 w-4" />
            <AlertTitle className="text-[10px] font-bold tracking-[0.2em] uppercase">Auth Troubleshooting</AlertTitle>
            <AlertDescription className="text-[9px] uppercase tracking-wider font-medium mt-2 space-y-2">
              <p>Still facing issues? Please ensure:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Ad-blockers are disabled for this site.</li>
                <li>Firebase Console > Auth > Settings > Authorized Domains contains <strong>{typeof window !== 'undefined' ? window.location.hostname : 'this domain'}</strong></li>
                <li>Allow 5-10 mins for Firebase settings to propagate.</li>
              </ul>
              <Button 
                variant="link" 
                className="p-0 h-auto text-[9px] font-bold tracking-widest text-black/40 hover:text-black uppercase mt-2"
                onClick={() => setShowDomainHelp(false)}
              >
                CLOSE_NOTICE
              </Button>
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
