import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { footerLinks } from "@/components/landing/landing-data";

const SocialIcon = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="text-text-muted transition-colors hover:text-white"
    aria-label={label}
  >
    {children}
  </a>
);

export const LandingFooter = () => {
  return (
    <footer className="border-t border-white/5 bg-surface-base px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mt-10 flex flex-col items-center justify-between text-xs text-text-faint md:flex-row">
          <p>&copy; 2026 Watchly Inc. All rights reserved.</p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <a href="/privacy" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
