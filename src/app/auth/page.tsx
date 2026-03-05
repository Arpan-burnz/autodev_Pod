"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Cpu, Loader2, ArrowLeft, Ghost, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Smooth redirect if already logged in
  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    initiateEmailSignIn(auth, email, password);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    initiateEmailSignUp(auth, email, password);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    initiateAnonymousSignIn(auth);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-white/20" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative selection:bg-white selection:text-black">
      {/* Background Polish */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full scanline opacity-10 pointer-events-none" />
      
      <Link href="/" className="absolute top-12 left-12 flex items-center gap-2 text-[10px] font-bold tracking-[0.4em] text-white/30 hover:text-white transition-all uppercase group">
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        BACK_TO_HOME
      </Link>

      <div className="w-full max-w-md space-y-12 relative z-10">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 border border-white/20 bg-black shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            <Cpu size={36} className="text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-headline font-bold tracking-tighter text-white">
              CORE_ACCESS
            </h1>
            <p className="text-[9px] text-white/30 font-bold tracking-[0.5em] uppercase">Authorized Operators Only</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-10 h-14 bg-white/5 border border-white/10 rounded-none p-1">
            <TabsTrigger value="login" className="font-bold text-[11px] uppercase tracking-[0.2em] rounded-none data-[state=active]:bg-white data-[state=active]:text-black transition-all">AUTHENTICATE</TabsTrigger>
            <TabsTrigger value="signup" className="font-bold text-[11px] uppercase tracking-[0.2em] rounded-none data-[state=active]:bg-white data-[state=active]:text-black transition-all">ENROLL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-6">
            <Card className="border-white/10 bg-white/[0.02] rounded-none shadow-2xl overflow-hidden">
              <form onSubmit={handleLogin}>
                <CardHeader className="border-b border-white/10 pb-8 px-10 pt-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-headline font-bold uppercase tracking-[0.3em]">Protocol Input</CardTitle>
                    <ShieldCheck size={14} className="text-white/20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 p-10">
                  <div className="space-y-4">
                    <Label htmlFor="email" className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">IDENTIFIER</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="USER@AUTODEV.SYSTEM" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-black border-white/10 rounded-none h-14 text-xs font-code focus:border-white focus:ring-0 transition-all placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="password" title="password" className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">ACCESS_KEY</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-black border-white/10 rounded-none h-14 text-xs font-code focus:border-white focus:ring-0 transition-all"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 p-10 pt-0">
                  <Button type="submit" className="w-full h-14 font-bold rounded-none bg-white text-black hover:bg-white/90 text-[11px] tracking-[0.3em] uppercase group" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                      <span className="flex items-center gap-2">BOOT_SESSION <Zap size={14} className="fill-current" /></span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em]">
                <span className="bg-black px-4 text-white/20 font-bold">OR_BYPASS</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-14 text-[11px] font-bold tracking-[0.3em] uppercase border-white/10 rounded-none hover:bg-white hover:text-black transition-all group"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              <Ghost size={16} className="mr-3 opacity-40 group-hover:opacity-100" /> 
              INITIALIZE_GUEST_ACCESS
            </Button>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-white/10 bg-white/[0.02] rounded-none shadow-2xl">
              <form onSubmit={handleSignUp}>
                <CardHeader className="border-b border-white/10 pb-8 px-10 pt-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-headline font-bold uppercase tracking-[0.3em]">New Registry</CardTitle>
                    <Zap size={14} className="text-white/20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 p-10">
                  <div className="space-y-4">
                    <Label htmlFor="signup-email" className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">IDENTIFIER</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="NEW_USER@AUTODEV.SYSTEM" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-black border-white/10 rounded-none h-14 text-xs font-code focus:border-white focus:ring-0 transition-all placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="signup-password" title="signup-password" className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">SET_KEY</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-black border-white/10 rounded-none h-14 text-xs font-code focus:border-white focus:ring-0 transition-all"
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                  <Button type="submit" className="w-full h-14 font-bold rounded-none bg-white text-black hover:bg-white/90 text-[11px] tracking-[0.3em] uppercase" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : "CREATE_CREDENTIALS"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <p className="text-center text-[7px] text-white/10 tracking-[1em] uppercase font-bold">
          TERMINAL_ENCRYPTION_V4.0_SECURE
        </p>
      </div>
    </div>
  );
}
