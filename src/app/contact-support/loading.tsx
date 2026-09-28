import React from 'react';
import { Loader } from '@/components/common/Loader/Loader';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}
