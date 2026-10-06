import type { Category } from '@/types';

export const categories: Category[] = [
  { id: 'barberia', name: 'Barbería', icon: '✂', color: '#E87455' },
  { id: 'cabello', name: 'Cabello', icon: '◌', color: '#8E6AA8' },
  { id: 'masajes', name: 'Masajes', icon: '≈', color: '#4C8C7A' },
  { id: 'unas', name: 'Uñas', icon: '✳', color: '#D49C36' },
];

export const demoPassword = 'Glowbook2026!';

export const demoAccounts = {
  client: { email: 'cliente@glowbook.app', password: demoPassword },
  professional: { email: 'profesional@glowbook.app', password: demoPassword },
};
