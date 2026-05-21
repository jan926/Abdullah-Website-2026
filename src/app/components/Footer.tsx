import { Link } from "react-router";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900 text-gray-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">SF Games PC</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your ultimate destination for downloading the latest and greatest PC games.
              Discover, download, and play today!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-cyan-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm hover:text-cyan-400 transition">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm hover:text-cyan-400 transition">
                  Search Games
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-sm hover:text-cyan-400 transition">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/action" className="text-sm hover:text-cyan-400 transition">
                  Action Games
                </Link>
              </li>
              <li>
                <Link to="/category/adventure" className="text-sm hover:text-cyan-400 transition">
                  Adventure Games
                </Link>
              </li>
              <li>
                <Link to="/category/rpg" className="text-sm hover:text-cyan-400 transition">
                  RPG Games
                </Link>
              </li>
              <li>
                <Link to="/category/racing" className="text-sm hover:text-cyan-400 transition">
                  Racing Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Connect With Us</h3>
            <div className="flex gap-3 mb-4">
              <a
                href="#"
                className="bg-gray-800 hover:bg-cyan-500 p-2 rounded-full transition"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-cyan-500 p-2 rounded-full transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-cyan-500 p-2 rounded-full transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-cyan-500 p-2 rounded-full transition"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm mb-4">
              <Mail className="h-4 w-4" />
              <a href="mailto:malikwork72@gmail.com" className="hover:text-cyan-400 transition">
                malikwork72@gmail.com
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Creators</p>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-violet-400">
                  Malik Muhammad Abdullah Jan Zia
                </p>
                <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-rose-300 to-fuchsia-500">
                  Awais Qammer
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-900 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 SF Games PC. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-cyan-400 transition">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-cyan-400 transition">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-cyan-400 transition">
                DMCA
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
