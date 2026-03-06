import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/lib/auth';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { Eye, EyeOff, Lock, Mail, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: () => {
    if (authService.isAuth()) {
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoginLoading, loginError } = useAuth();

  const loginForm = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      login(value);
    },
  });


  useEffect(() => {
    if (loginError) {
      if (loginError instanceof AxiosError && loginError.response) {
        toast.error('Login Failed', {
          description: loginError.response.data.detail,
        });
      } else {
        toast.error('Login Failed', {
          description: 'An unexpected error occurred',
        });
      }
    }
  }, [loginError]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-secondary/20 to-background">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center bg-linear-to-br from-primary to-primary/80">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary-foreground/10 backdrop-blur-sm border-2 border-primary-foreground/20">
              <Store className="size-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground mb-1">Crafty Cakes</h1>
            <p className="text-primary-foreground/80 text-sm">your one stop place</p>
          </div>

        
          <form
            className="px-8 py-8 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              loginForm.handleSubmit();
            }}
          >
            {/* Email */}
            <loginForm.Field
              name="email"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return 'Email is required';
                  if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
                },
              }}
              children={({ state, handleChange, handleBlur }) => (
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <Input
                      type="email"
                      value={state.value}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                        state.meta.errors.length > 0
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-border focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="vendor@example.com"
                    />
                  </div>
                  {state.meta.errors[0] && (
                    <p className="text-destructive text-sm mt-1">{state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            />

            {/* Password */}
            <loginForm.Field
              name="password"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return 'Password is required';
                },
              }}
              children={({ state, handleChange, handleBlur }) => (
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={state.value}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-200 ${
                        state.meta.errors.length > 0
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-border focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                  {state.meta.errors[0] && (
                    <p className="text-destructive text-sm mt-1">{state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            />

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoginLoading}
              className="w-full py-6 text-base font-semibold"
            >
              {isLoginLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/register" className="text-primary hover:underline font-medium">
            Don't have an account?
          </Link>
        </p>
      </div>
    </div>
  );
}