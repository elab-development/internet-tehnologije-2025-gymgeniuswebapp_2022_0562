'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { isValidEmail } from '@/utils/validation';
import { apiFetch } from '@/utils/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Imejl je obavezan');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Neispravan format imejla');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Nije moguće poslati email za reset');
      }
    } catch {
      setError('Mrežna greška. Molimo pokušajte ponovo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💪 GymGenius</h1>
          <p className="text-gray-600">Resetujte lozinku</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Imejl je poslat!</h2>
              <p className="text-gray-600 text-sm mb-6">
                Ako postoji nalog sa <strong>{email}</strong>, brzo ćete dobiti
                link za reset lozinke.
              </p>
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                ← Nazad na prijavu
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Unesite vašu imejl adresu i poslacemo vam link za reset lozinke.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Imejl"
                  type="email"
                  name="email"
                  placeholder="vas.imejl@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  error={error && !email ? error : undefined}
                  leftIcon={<Mail size={20} />}
                  fullWidth
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                >
                  Pošalji link za reset
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600"
                >
                  <ArrowLeft size={14} /> Nazad na prijavu
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
