'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import SplashScreen from '@/components/Splash/SplashScreen';

// Dynamic import to avoid SSR issues with canvas/chart libs
const Terminal = dynamic(() => import('@/components/Terminal/Terminal'), { ssr: false });

export default function Home() {
  const [showTerminal, setShowTerminal] = useState(false);

  if (showTerminal) {
    return <Terminal />;
  }

  return <SplashScreen onEnter={() => setShowTerminal(true)} />;
}
