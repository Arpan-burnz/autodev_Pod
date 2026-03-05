"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Cpu, Loader2, ArrowLeft, Ghost } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full scanline opacity-20 pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-white/40 hover:text-white transition-colors uppercase">
        <ArrowLeft size={14} />
        Exit System
      </Link>

      <div className="w-full max-w-md space-y-12 relative">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            <Cpu size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold tracking-tighter text-white">
              ACCESS_PROTOCOL
            </h1>
            <p className="text-[10px] text-white/40 font-bold tracking-[0.4em] uppercase">Security Clearance Required</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-white/5 border border-white/10 rounded-none p-1">
            <TabsTrigger value="login" className="font-bold text-[10px] uppercase tracking-widest rounded-none data-[state=active]:bg-white data-[state=active]:text-black">Login</TabsTrigger>
            <TabsTrigger value="signup" className="font-bold text-[10px] uppercase tracking-widest rounded-none data-[state=active]:bg-white data-[state=active]:text-black">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-white/10 bg-white/[0.02] rounded-none shadow-2xl">
              <form onSubmit={handleLogin}>
                <CardHeader className="border-b border-white/10 pb-6 px-8 pt-8">
                  <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">Operator Credentials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] font-bold tracking-widest uppercase text-white/40">Identifier</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="EMAIL@SYSTEM.COM" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-none h-12 text-xs font-code focus:border-white/40 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password" title="password" className="text-[10px] font-bold tracking-widest uppercase text-white/40">Access Key</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-none h-12 text-xs font-code focus:border-white/40 transition-all"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 p-8 pt-0">
                  <Button type="submit" className="w-full h-12 font-bold rounded-none bg-white text-black hover:bg-white/90 text-xs tracking-widest uppercase" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : "Initialize Session"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full h-12 text-[10px] font-bold tracking-widest uppercase text-white/40 hover:text-white hover:bg-white/5"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    <Ghost size={14} className="mr-2" /> Guest Access (Anonymous)
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-white/10 bg-white/[0.02] rounded-none shadow-2xl">
              <form onSubmit={handleSignUp}>
                <CardHeader className="border-b border-white/10 pb-6 px-8 pt-8">
                  <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">Enlist Operator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-[10px] font-bold tracking-widest uppercase text-white/40">Identifier</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="EMAIL@SYSTEM.COM" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-none h-12 text-xs font-code focus:border-white/40 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" title="signup-password" className="text-[10px] font-bold tracking-widest uppercase text-white/40">Access Key</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-none h-12 text-xs font-code focus:border-white/40 transition-all"
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button type="submit" className="w-full h-12 font-bold rounded-none bg-white text-black hover:bg-white/90 text-xs tracking-widest uppercase" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : "Create Clearance"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <p className="text-center text-[8px] text-white/20 tracking-[0.5em] uppercase font-bold">
          TERMINAL_ENCRYPTION_ACTIVE_V4.0
        </p>
      </div>
    </div>
  );
}
