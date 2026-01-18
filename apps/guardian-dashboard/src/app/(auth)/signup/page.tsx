'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.scss';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    familyName: '',
    guardianName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('User creation failed');

      // 2. Create family
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert({
          name: formData.familyName,
          timezone: 'Asia/Dhaka',
        })
        .select()
        .single();

      if (familyError) throw familyError;

      // 3. Create guardian member linked to auth user
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          family_id: familyData.id,
          user_id: authData.user.id,
          name: formData.guardianName,
          role: 'guardian',
          is_active: true,
        });

      if (memberError) throw memberError;

      // Success! Redirect to dashboard
      router.push('/members');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>🏠 Family Routine Assistant</h1>
          <p>Create your family account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
              placeholder="guardian@example.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="familyName">Family Name</label>
            <input
              id="familyName"
              type="text"
              value={formData.familyName}
              onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
              required
              disabled={loading}
              placeholder="The Smith Family"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="guardianName">Your Name</label>
            <input
              id="guardianName"
              type="text"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              required
              disabled={loading}
              placeholder="John Smith"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className={styles.footer}>
            Already have an account?{' '}
            <Link href="/login">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
