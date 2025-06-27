import Link from 'next/link';
import { Leaf, Github, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-carbon-card border-t border-carbon-border">
      <div className="container-carbon py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Leaf size={24} className="text-primary-green" />
              <h3 className="text-xl font-bold text-white">CarbonWise</h3>
            </div>
            <p className="text-carbon-muted text-sm leading-relaxed">
              AI-driven carbon footprint tracking platform helping individuals and businesses make sustainable choices for a greener future.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com/carbonwise" 
                className="text-carbon-muted hover:text-primary-green transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </Link>
              <Link 
                href="https://twitter.com/carbonwise" 
                className="text-carbon-muted hover:text-primary-green transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </Link>
              <Link 
                href="mailto:vishrutmalhotra8@gmail.com" 
                className="text-carbon-muted hover:text-primary-green transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Quick Links</h4>
            <nav className="space-y-2">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/features', label: 'Features' },
                { href: '/contact', label: 'Contact' },
                { href: '/dashboard', label: 'Dashboard' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-carbon-muted text-sm hover:text-primary-green transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Resources</h4>
            <nav className="space-y-2">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/api-docs', label: 'API Documentation' },
                { href: '/blog', label: 'Blog' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-carbon-muted text-sm hover:text-primary-green transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-primary-green mt-1 flex-shrink-0" />
                <p className="text-carbon-muted text-sm">
                  123 Green Street<br />
                  San Francisco, CA 94111
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary-green flex-shrink-0" />
                <Link 
                  href="tel:+1-415-632-7673" 
                  className="text-carbon-muted text-sm hover:text-primary-green transition-colors"
                >
                  +1 (415) 632-7673
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-primary-green flex-shrink-0" />
                <Link 
                  href="mailto:vishrutmalhotra8@gmail.com" 
                  className="text-carbon-muted text-sm hover:text-primary-green transition-colors"
                >
                  vishrutmalhotra8@gmail.com
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-carbon-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-carbon-muted text-sm">
            © {currentYear} CarbonWise. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link 
              href="/privacy" 
              className="text-carbon-muted text-sm hover:text-primary-green transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-carbon-muted text-sm hover:text-primary-green transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/cookies" 
              className="text-carbon-muted text-sm hover:text-primary-green transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 