'use client';

import { Building2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        <div className="mb-8">
          <Logo size="md" />
        </div>

        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#0F172A] mb-1.5">Create your account</h1>
            <p className="text-sm text-[#64748B]">Get started with EduFlow today.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first-name">First name</Label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                  />
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="Jane"
                    autoComplete="given-name"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" type="text" placeholder="Smith" autoComplete="family-name" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="organization">Organization name</Label>
              <div className="relative">
                <Building2
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                />
                <Input
                  id="organization"
                  type="text"
                  placeholder="Acme University"
                  autoComplete="organization"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
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
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-[#94A3B8]">
            By creating an account, you agree to our{' '}
            <span className="text-[#2563EB] cursor-pointer hover:underline">Terms of Service</span>{' '}
            and{' '}
            <span className="text-[#2563EB] cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>

        <p className="mt-5 text-center text-sm text-[#64748B]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
