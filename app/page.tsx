import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Coffee, Pizza, QrCode, Smartphone } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <Image
              src="/logo.png"
              alt="Make Your Menu Logo"
              width={40}
              height={40}
              className="h-14 w-auto rounded-2xl"
            />
            <span className="text-white">MakeYourMenu</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-white hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-white hover:underline underline-offset-4">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium text-white hover:underline underline-offset-4">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full bg-gradient-to-b from-orange-50 to-white">
          <div className="container px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-4 p-4">
              <div className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 font-medium text-sm">
                Digital Menu Solution
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-orange-600 tracking-tight">
                Showcase Your Culinary Masterpieces
              </h1>
              <p className="text-gray-600 md:text-xl">
                Create beautiful digital menus featuring your signature dishes from gourmet pizzas to decadent desserts - all accessible via QR code.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/signup">
                  <Button size="lg" className="gap-1 bg-orange-500 hover:bg-orange-600">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button variant="outline" size="lg" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Image with blur circles */}
            <div className="flex p-8 justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full opacity-50 blur-xl"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-400 rounded-full opacity-50 blur-xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1579684947550-22e945225d9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80"
                  alt="Delicious artisan pizza"
                  className="rounded-xl shadow-2xl relative z-10 w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 font-medium text-sm">
                  Why Choose Us
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-orange-600">
                  Features
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Everything you need to digitize your restaurant menu
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-md bg-gradient-to-b from-orange-50 to-white">
                  <div className="p-3 rounded-full bg-orange-100">
                    <Pizza className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-600">Menu Management</h3>
                  <p className="text-gray-600 text-center">
                    Easily create and update your menu items, categories, and prices
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-md bg-gradient-to-b from-green-50 to-white">
                  <div className="p-3 rounded-full bg-green-100">
                    <QrCode className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600">QR Code Generation</h3>
                  <p className="text-gray-600 text-center">
                    Generate unique QR codes for your menu that customers can scan
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-md bg-gradient-to-b from-blue-50 to-white">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Smartphone className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-600">Mobile Friendly</h3>
                  <p className="text-gray-600 text-center">Beautiful menus that look great on any device</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-orange-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 font-medium text-sm">
                  Limited Time Offer
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-orange-600">
                  Pricing
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Our straightforward pricing makes it easy to get started
                </p>
              </div>

              <div className="mt-10 w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <div className="px-6 py-8 bg-gradient-to-r from-orange-500 to-amber-500 sm:p-10 sm:pb-6">
                    <div className="flex justify-center">
                      <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-white text-orange-600">
                        Launch Special
                      </span>
                    </div>
                    <div className="mt-4 flex justify-center text-white">
                      <span className="text-5xl font-extrabold">FREE</span>
                    </div>
                    <p className="mt-5 text-lg text-center text-white">
                      No credit card required
                    </p>
                  </div>
                  <div className="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700">Unlimited menu items</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700">QR code generation</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700">Mobile-friendly design</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700">Basic customization</p>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Link href="/signup">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                          Get Started For Free
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8 bg-orange-50">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 text-center">
          <div className="flex items-center gap-2 font-bold text-orange-600">
            <Image
              src="/logo.png"
              alt="Make Your Menu Logo"
              width={40}
              height={40}
              className="h-20 w-auto rounded-2xl"
            />
          </div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Proco Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
