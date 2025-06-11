'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Leaf, LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const Navigation = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/features', label: 'Features' },
    { href: '/contact', label: 'Contact' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-carbon-border bg-carbon-dark/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-carbon">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-white hover:text-primary-green transition-colors">
            <Leaf size={24} className="text-primary-green" />
            <h2 className="text-xl font-bold tracking-tight">CarbonWise</h2>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary-green ${
                  isActive(item.href) ? 'text-primary-green nav-active' : 'text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-carbon-card animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-full bg-primary-green/20 flex items-center justify-center">
                    <User size={16} className="text-primary-green" />
                  </div>
                  <span className="text-sm">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-sm text-carbon-muted hover:text-white transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm text-white hover:text-primary-green transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-primary-green transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-carbon-border py-4 animate-slide-up">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary-green ${
                    isActive(item.href) ? 'text-primary-green nav-active' : 'text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {/* Mobile Auth Buttons */}
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-carbon-card animate-pulse mt-2"></div>
              ) : session ? (
                <div className="pt-2 border-t border-carbon-border mt-2">
                  <div className="flex items-center gap-2 text-white mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-green/20 flex items-center justify-center">
                      <User size={16} className="text-primary-green" />
                    </div>
                    <span className="text-sm">{session.user?.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-sm text-carbon-muted hover:text-white transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-carbon-border mt-2 space-y-2">
                  <Link 
                    href="/auth/signin" 
                    className="block text-sm text-white hover:text-primary-green transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="btn-primary w-fit"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation; 