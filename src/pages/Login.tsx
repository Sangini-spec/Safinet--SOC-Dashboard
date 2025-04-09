
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Shield, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Mock login - in a real app, this would call an auth API
    setTimeout(() => {
      // Demo credentials
      if (email === 'admin@safinet.com' && password === 'admin123') {
        toast({
          title: "Login successful",
          description: "Welcome to SafiNet Cyber Sentinel Hub",
        });
        // Store auth state
        localStorage.setItem('safinetUser', JSON.stringify({ 
          email, 
          role: 'admin',
          name: 'Admin User'
        }));
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    setEmail('admin@safinet.com');
    setPassword('admin123');
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
            <CardTitle>Login</CardTitle>
            <CardDescription>Access your security command center</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@company.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button variant="link" className="p-0 h-auto text-xs">
                      Forgot password?
                    </Button>
                  </div>
                  <Input 
                    id="password" 
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
                  {isLoading ? "Authenticating..." : "Login to Dashboard"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleDemoLogin}>
              Use Demo Credentials
            </Button>
          </CardFooter>
        </Card>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Not registered yet? <Button variant="link" className="p-0 h-auto">Contact your system administrator</Button>
        </p>
      </div>
    </div>
  );
};

export default Login;
