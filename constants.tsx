
import React from 'react';

export const COLORS = {
  emerald: { bg: '#ECFDF5', text: '#065F46', border: '#D1FAE5', primary: '#10B981', grad: 'from-emerald-400 to-emerald-600' },
  amber: { bg: '#FFFBEB', text: '#92400E', border: '#FEF3C7', primary: '#F59E0B', grad: 'from-amber-400 to-orange-500' },
  indigo: { bg: '#EEF2FF', text: '#3730A3', border: '#E0E7FF', primary: '#6366F1', grad: 'from-indigo-400 to-violet-600' },
  cyan: { bg: '#ECFEFF', text: '#083344', border: '#CFFAFE', primary: '#06B6D4', grad: 'from-cyan-400 to-blue-500' },
  rose: { bg: '#FFF1F2', text: '#9F1239', border: '#FFE4E6', primary: '#F43F5E', grad: 'from-rose-400 to-pink-600' },
  violet: { bg: '#F5F3FF', text: '#5B21B6', border: '#EDE9FE', primary: '#8B5CF6', grad: 'from-purple-400 to-fuchsia-600' },
  cream: '#FCFBF7',
  sahih: '#10B981',
  hasan: '#F59E0B',
  daif: '#EF4444'
};

export const Icons = {
  Quran: () => (
    <div className={`w-12 h-12 bg-gradient-to-br ${COLORS.emerald.grad} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
  ),
  Hadith: () => (
    <div className={`w-12 h-12 bg-gradient-to-br ${COLORS.amber.grad} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
  ),
  Isnad: () => (
    <div className={`w-12 h-12 bg-gradient-to-br ${COLORS.indigo.grad} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </div>
  ),
  Fiqh: () => (
    <div className={`w-12 h-12 bg-gradient-to-br ${COLORS.cyan.grad} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  ),
  Library: () => (
    <div className={`w-12 h-12 bg-gradient-to-br ${COLORS.violet.grad} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
  ),
  Link: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  AI: () => (
    <div className={`w-8 h-8 bg-gradient-to-br from-violet-400 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
  ),
  Search: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Back: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Shield: ({ color }: { color: string }) => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
};
