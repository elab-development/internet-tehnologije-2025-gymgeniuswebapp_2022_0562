'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail, isStrongPassword } from '@/utils/validation';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Ime je obavezno';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Ime mora imati najmanje 2 karaktera';
    }

    if (!formData.email) {
      newErrors.email = 'Imejl je obavezan';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Neispravan format imejla';
    }

    if (!formData.password) {
      newErrors.password = 'Lozinka je obavezna';
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password =
        'Lozinka mora imati najmanje 8 karaktera sa velikim slovima, malim slovima, brojevima i specijalnim karakterom';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Molimo potvrdite lozinku';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Lozinke se ne podudaraju';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsLoading(true);

    const result = await register(
      formData.email,
      formData.password,
      formData.displayName
    );

    setIsLoading(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setApiError(result.error || 'Registracija nije uspela');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💪 GymGenius
          </h1>
          <p className="text-gray-600">Kreirajte vaš nalog</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}

            <Input
              label="Ime i prezime"
              type="text"
              name="displayName"
              placeholder="Marko Marković"
              value={formData.displayName}
              onChange={handleChange}
              error={errors.displayName}
              leftIcon={<User size={20} />}
              fullWidth
              autoComplete="name"
            />

            <Input
              label="Imejl"
              type="email"
              name="email"
              placeholder="vas.imejl@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={20} />}
              fullWidth
              autoComplete="email"
            />

            <Input
              label="Lozinka"
              type="password"
              name="password"
              placeholder="Kreirajte jaku lozinku"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={20} />}
              fullWidth
              autoComplete="new-password"
              helperText="Min. 8 karaktera sa velikim slovima, malim slovima, brojevima i specijalnim znakom"
            />

            <Input
              label="Potvrda lozinke"
              type="password"
              name="confirmPassword"
              placeholder="Ponovite vašu lozinku"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<Lock size={20} />}
              fullWidth
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading || authLoading}
            >
              Kreiraj nalog
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Već imate nalog?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Prijavite se
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Kreiranjem naloga, slažete se sa našim{' '}
          <a href="#" className="underline">
            Uslovima korišćenja
          </a>{' '}
          i{' '}
          <a href="#" className="underline">
            Politikom privatnosti
          </a>
        </p>
      </div>
    </div>
  );
}