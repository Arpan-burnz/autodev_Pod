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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Boxes, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleAuthError = (error: any) => {
    console.error("Auth Error:", error);
    toast({
      title: "Authentication Failed",
      description: error.message || "Please check your credentials and try again.",
      variant: "destructive"
    });
    setIsLoading(false);
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    initiateEmailSignIn(auth, email, password).catch(handleAuthError);
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    initiateEmailSignUp(auth, email, password).catch(handleAuthError);
  };

  const handleGoogleSignIn = () => {
    if (isLoading) return;
    setIsLoading(true);
    initiateGoogleSignIn(auth).catch(handleAuthError);
  };

  const handleGithubSignIn = () => {
    if (isLoading) return;
    setIsLoading(true);
    initiateGithubSignIn(auth).catch(handleAuthError);
  };

  const handleGuestSignIn = () => {
    if (isLoading) return;
    setIsLoading(true);
    initiateAnonymousSignIn(auth).catch(handleAuthError);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Left Brand Showcase Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-950 text-slate-100 flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/30 transition-colors">
              <Boxes size={20} />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-white">AutoDev Studio</span>
              <span className="block text-[10px] text-slate-400 font-mono">Autonomous Engineering Pod</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-300">
            <Sparkles size={12} />
            <span>Autonomous Software Delivery</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
            From business requirement to working software in seconds.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            Chains 5 specialized AI agents to formulate requirements, design scalable architecture, compile production TypeScript, audit test suites, and launch live working applications.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Sequential 5-Agent Pod (PM, Architect, Dev, QA, DevOps)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Live dynamic application runtime with local storage CRUD</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Interactive tables, dynamic forms with real-time field validation</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Enterprise Secure Workspace</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-slate-400" />
            <span>Firebase Auth Protected</span>
          </div>
        </div>

        {/* Ambient subtle background glow */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>

          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Boxes size={16} />
            </div>
            <span className="text-xs font-semibold">AutoDev</span>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto space-y-6 py-8">
          <div className="space-y-1.5 text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {activeTab === 'signin' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {activeTab === 'signin' 
                ? 'Sign in to access your autonomous engineering studio.' 
                : 'Get started with autonomous application generation in seconds.'}
            </p>
          </div>

          {/* Social Logins */}
          <div className="space-y-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-10 text-xs font-medium gap-3 bg-background hover:bg-muted/40 border-border"
            >
              {/* Google Multicolored SVG Logo */}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleGithubSignIn}
              disabled={isLoading}
              className="w-full h-10 text-xs font-medium gap-3 bg-background hover:bg-muted/40 border-border"
            >
              {/* GitHub SVG Logo */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-background px-3 text-[11px] text-muted-foreground uppercase tracking-wider shrink-0 font-medium">
              or continue with email
            </span>
          </div>

          {/* Email / Password Form Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')}>
            <TabsList className="grid grid-cols-2 w-full h-9 bg-muted/50 p-1 border border-border">
              <TabsTrigger value="signin" className="text-xs font-medium">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs font-medium">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 pt-3">
              <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-xs font-medium text-foreground">Email address</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 text-xs bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password" title="password" className="text-xs font-medium text-foreground">Password</Label>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 text-xs bg-background"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-10 text-xs font-semibold shadow-sm mt-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" /> Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 pt-3">
              <form onSubmit={handleEmailSignUp} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-medium text-foreground">Work email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 text-xs bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" title="password" className="text-xs font-medium text-foreground">Create password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 6 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 text-xs bg-background"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-10 text-xs font-semibold shadow-sm mt-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" /> Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Guest Access Alternative */}
          <div className="pt-2 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleGuestSignIn}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-foreground h-9 px-4 font-normal"
            >
              <UserCheck size={14} className="mr-2 text-primary" />
              Continue as guest without credentials
            </Button>
          </div>
        </div>

        <div className="text-center text-[11px] text-muted-foreground">
          By signing in, you agree to the Workspace Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
