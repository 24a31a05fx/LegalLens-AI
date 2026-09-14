'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const HeaderNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Projects', href: '/' },
    { label: 'Privacy & Data', href: '/privacy' },
    { label: 'Account', href: '/account' },
  ];

  return (
    <nav aria-label="Main navigation">
      <ul className="flex-gap-6" style={{ listStyle: 'none', alignItems: 'center' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
