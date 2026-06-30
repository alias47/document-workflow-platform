'use client';

import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full min-h-screen flex">
      {/* Left panel — form */}
      <div className="flex flex-col justify-center w-full max-w-[480px] mx-auto px-8 py-12 lg:mx-0">
        <div className="mb-10">
          <Logo size="lg" />
        </div>

        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-[#0F172A] mb-1.5">Welcome back</h1>
          <p className="text-[#64748B] text-sm">Sign in to your account to continue</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
              />
              <Input
                id="email"
                type="email"
                placeholder="you@organization.com"
                autoComplete="email"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full mt-2">
            Sign in
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-[#64748B]">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>

      {/* Right panel — brand illustration */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#2563EB] p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating cards */}
        <div className="relative z-10 text-center max-w-sm">
          <div className="mb-8 flex flex-col gap-3">
            {[
              {
                title: 'Application Submitted',
                sub: 'John Smith • 2 minutes ago',
                color: 'bg-white/10',
              },
              {
                title: 'Documents Verified',
                sub: 'Sarah Johnson • 1 hour ago',
                color: 'bg-white/5',
              },
              { title: 'Review Completed', sub: 'Mike Chen • Yesterday', color: 'bg-white/10' },
            ].map((card) => (
              <div
                key={card.title}
                className={`${card.color} backdrop-blur-sm rounded-[12px] px-4 py-3 text-left border border-white/20`}
              >
                <p className="text-white text-sm font-semibold">{card.title}</p>
                <p className="text-white/60 text-xs mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">Streamline your document workflow</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Manage applications, verify documents, and collaborate with your team — all in one
            place.
          </p>
        </div>
      </div>
    </div>
  );
}
