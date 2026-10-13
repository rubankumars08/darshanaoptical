'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The Quick Counter has been consolidated into the full POS (/admin/pos).
 * This redirect ensures any links/bookmarks to /admin/counter still work.
 */
export default function CounterRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/pos'); }, [router]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8', fontSize: 14 }}>
      Redirecting to POS…
    </div>
  );
}
