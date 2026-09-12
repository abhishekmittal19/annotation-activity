'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';
import { authApi } from '@/lib/api/auth';
import { UserRole } from '@/types/auth';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, Eye, Lock } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('admin@aurora.ai');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const quickPersonas: { role: UserRole; label: string; email: string }[] = [
    { role: 'ADMIN', label: 'Admin Connor', email: 'admin@aurora.ai' },
    { role: 'MANAGER', label: 'Manager Vance', email: 'manager@aurora.ai' },
    { role: 'ANNOTATOR', label: 'Annotator Alex', email: 'annotator@aurora.ai' },
    { role: 'REVIEWER', label: 'Reviewer Elena', email: 'reviewer@aurora.ai' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      dispatch(setCredentials({ user: res.user, token: res.token }));
      router.push('/dashboard');
    } catch {
      alert('Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 mx-auto shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 uppercase">AURORA</h1>
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            AI ANNOTATION OPERATIONS PLATFORM
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-200">Enterprise Single Sign-On</h2>
            <p className="text-xs text-slate-400">Sign in to access your RBAC task pipeline & workspace</p>
          </div>

          {/* Quick Persona Switcher */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              ⚡ Demo Quick Persona Selector
            </span>
            <div className="grid grid-cols-2 gap-2">
              {quickPersonas.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => {
                    setEmail(p.email);
                    setPassword('password123');
                  }}
                  className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all ${
                    email === p.email
                      ? 'bg-indigo-950 border-indigo-500/80 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400">{p.role}</span>
                  </div>
                  <span className="truncate block text-slate-200 mt-0.5">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Corporate Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Aurora AnnotOps v7.1 | Production AI Operations Platform
        </p>
      </div>
    </div>
  );
}
