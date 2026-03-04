"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Cpu, Loader2, ArrowLeft } from 'lucide-react';
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
    // Redirection is handled by the auth state listener in the provider/layout
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    initiateEmailSignUp(auth, email, password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div className="w-full max-w-md space-y-8 relative">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 mb-4">
            <Cpu size={32} />
          </div>
          <h1 className="text-3xl font-headline font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AutoDev Pod
          </h1>
          <p className="text-muted-foreground">The future of software development starts here.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-card/50 backdrop-blur-xl border border-white/5">
            <TabsTrigger value="login" className="font-bold">Login</TabsTrigger>
            <TabsTrigger value="signup" className="font-bold">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-white/5 bg-card/50 backdrop-blur-xl shadow-2xl">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle className="font-headline">Welcome Back</CardTitle>
                  <CardDescription>Enter your credentials to access your development pod.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Login to Workspace"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-white/5 bg-card/50 backdrop-blur-xl shadow-2xl">
              <form onSubmit={handleSignUp}>
                <CardHeader>
                  <CardTitle className="font-headline">Create Account</CardTitle>
                  <CardDescription>Join the elite circle of AI-driven developers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Create Workspace"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <p className="text-center text-xs text-muted-foreground opacity-60">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
