
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn(email, password);
    
    if (result.error) {
      setError(result.error);
    } else {
      toast({
        title: "Login successful",
        description: "Welcome to SafiNet Cyber Sentinel Hub",
      });
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    const result = await signUp(email, password, fullName);
    
    if (result.error) {
      setError(result.error);
    } else {
      toast({
        title: "Registration successful",
        description: "Please check your email for a confirmation link",
      });
    }
    
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await resetPassword(email);
    
    if (result.error) {
      setError(result.error);
    } else {
      setResetEmailSent(true);
      toast({
        title: "Password reset email sent",
        description: "Check your email for reset instructions",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-safinet-dark-purple to-background">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-foreground">SafiNet</h1>
            <p className="text-sm text-muted-foreground">Cyber Sentinel Hub</p>
          </div>
        </div>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Secure access to your security command center</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input 
                      id="login-email"
                      type="email" 
                      placeholder="analyst@organization.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 text-safinet-red text-sm p-2 bg-safinet-red/10 rounded-md">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      "Login to Dashboard"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input 
                      id="signup-name"
                      type="text" 
                      placeholder="John Doe" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email"
                      type="email" 
                      placeholder="analyst@organization.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be 8+ characters with uppercase, lowercase, and number
                    </p>
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 text-safinet-red text-sm p-2 bg-safinet-red/10 rounded-md">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="reset" className="space-y-4">
                {resetEmailSent ? (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Password reset instructions have been sent to your email.
                    </p>
                    <Button variant="outline" onClick={() => setResetEmailSent(false)}>
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input 
                        id="reset-email"
                        type="email" 
                        placeholder="analyst@organization.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    {error && (
                      <div className="flex items-center gap-2 text-safinet-red text-sm p-2 bg-safinet-red/10 rounded-md">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Email"
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Need help? Contact your system administrator
        </p>
      </div>
    </div>
  );
};

export default Auth;
