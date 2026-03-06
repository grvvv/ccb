import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/lib/auth';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Lock, Mail, User, Store } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_auth/register')({
  beforeLoad: () => {
    if (authService.isAuth()) {
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isRegistering, registerError } = useAuth();
  const navigate = useNavigate({ from: '/register' });

  const registerForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      register(value);
      toast.success('Registration Successful', {
        description: 'Please login with your credentials',
      });
      navigate({to: '/login'})
    },
  });

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

          {/* Register Form */}
          <form
            className="px-8 py-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              registerForm.handleSubmit();
            }}
          >
            {/* Name */}
            <registerForm.Field
              name="name"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return 'Name is required';
                  if (value.length < 3) return 'Name must be at least 3 characters';
                },
              }}
              children={({ state, handleChange, handleBlur }) => (
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <Input
                      type="text"
                      value={state.value}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all ${
                        state.meta.errors.length > 0
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-border focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {state.meta.errors[0] && (
                    <p className="text-destructive text-sm mt-1">{state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            />

            {/* Email */}
            <registerForm.Field
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
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all ${
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

            {/* Phone */}
            <registerForm.Field
              name="phone"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return 'Phone number is required';
                  const cleanValue = value.replace(/\D/g, '');
                  const indianMobileRegex = /^[6-9]\d{9}$/;
                  
                  if (!indianMobileRegex.test(cleanValue)) {
                    return 'Enter a valid 10-digit Indian mobile number starting with 6-9';
                  }
                },
              }}
              children={({ state, handleChange, handleBlur }) => (
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {/* Optional: Add +91 prefix UI for better UX */}
                      <span className="text-sm text-muted-foreground font-medium">+91</span>
                    </div>
                    <Input
                      type="tel"
                      value={state.value}
                      // Limit input to 10 digits manually if desired
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleChange(val);
                      }}
                      onBlur={handleBlur}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all ${
                        state.meta.errors.length > 0
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-border focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="98765 43210"
                    />
                  </div>
                  {state.meta.errors[0] && (
                    <p className="text-destructive text-sm mt-1">{state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            />

            {/* Password */}
            <registerForm.Field
              name="password"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return 'Password is required';
                  if (value.length < 6) return 'Password must be at least 6 characters';
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
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all ${
                        state.meta.errors.length > 0
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-border focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="Create a strong password"
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

            {/* Confirm Password */}
            <registerForm.Field
              name="confirmPassword"
              validators={{
                onSubmit: ({ value, fieldApi }) => {
                  const password = fieldApi.form.getFieldValue('password');
                  if (!value) return 'Please confirm your password';
                  if (value !== password) return 'Passwords do not match';
                },
              }}
              children={({ state, handleChange, handleBlur }) => (
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={state.value}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all ${
                        state.meta.errors.length > 0
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : 'border-border focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isRegistering}
              className="w-full py-6 text-base font-medium"
            >
              {isRegistering ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing Up...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>

          </form>
        
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/login" className="text-primary hover:underline font-medium">
            Already have an account?
          </Link>
        </p>
      </div>
    </div>
  );
}