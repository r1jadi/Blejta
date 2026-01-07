import './globals.css'
import { ReactNode } from 'react'
import Link from 'next/link'
import Logo from '../components/Logo'
import UserMenu from '../components/UserMenu'

export const metadata = {
  title: 'Blejta',
  description: 'Blejta — local reseller for Kosovo',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <header className="bg-white shadow-soft sticky top-0 z-50 border-b border-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <Logo />
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary-600 after:transition-all hover:after:w-full">
                  Shop
                </Link>
                <Link href="/cart" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary-600 after:transition-all hover:after:w-full">
                  Cart
                </Link>
                <UserMenu />
              </nav>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

          <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 mt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Blejta</h3>
                  <p className="text-sm text-gray-600">Your trusted local reseller for quality products in Kosovo.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/products" className="text-gray-600 hover:text-primary-600 transition-colors">Shop</Link></li>
                    <li><Link href="/cart" className="text-gray-600 hover:text-primary-600 transition-colors">Cart</Link></li>
                    <li><Link href="/admin" className="text-gray-600 hover:text-primary-600 transition-colors">Admin</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
                  <p className="text-sm text-gray-600">We're here to help with your orders.</p>
                </div>
              </div>
              <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Blejta. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
