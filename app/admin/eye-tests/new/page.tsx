import { redirect } from 'next/navigation';

/**
 * Superseded by the inline "New Eye Test" form on /admin/eye-tests, which
 * captures exactly the same fields. Kept as a redirect so existing links and
 * bookmarks still work, and so the two copies cannot drift apart.
 */
export default function NewEyeTestPage() {
  redirect('/admin/eye-tests?new=1');
}
