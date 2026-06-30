'use client';

import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8">
          <Logo size="md" />
        </div>

        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-8">
          {submitted ? (
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                  <CheckCircle size={28} className="text-[#16A34A]" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-[#0F172A] mb-2">Check your email</h1>
              <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                We&apos;ve sent password reset instructions to your email address. Please check your
                inbox and follow the link to reset your password.
              </p>
              <p className="text-xs text-[#94A3B8] mb-6">
                Didn&apos;t receive the email?{' '}
                <button
                  type="button"
                  className="text-[#2563EB] font-medium hover:text-[#1D4ED8] transition-colors"
                  onClick={() => setSubmitted(false)}
                >
                  Try again
                </button>
              </p>
              <Link href="/login">
                <Button variant="secondary" size="md" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-[#0F172A] mb-1.5">Forgot your password?</h1>
                <p className="text-sm text-[#64748B]">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
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

                <Button type="submit" size="lg" className="w-full">
                  Send reset link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
