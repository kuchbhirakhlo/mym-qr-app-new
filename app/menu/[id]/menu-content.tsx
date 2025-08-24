"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { doc, safeGetDoc, setDoc } from "@/lib/firebase"
import { db } from "@/lib/firebase"
import { updateDoc, increment, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Pizza, QrCode } from "lucide-react"
import React from "react"

interface MenuItem {
  name: string
  description: string
  price: number
}

interface Category {
  name: string
  items: MenuItem[]
}

interface Menu {
  name: string
  description: string
  categories: Category[]
  restaurantId: string
  viewCount?: number
  whatsappNumber?: string // Add this field for vendor's WhatsApp
}

export function MenuContent({ id }: { id: string }) {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Cart state: { [productName]: { item: MenuItem, quantity: number } }
  const [cart, setCart] = useState<{ [key: string]: { item: MenuItem, quantity: number } }>({});
  const [placingOrder, setPlacingOrder] = useState(false);

  // Place order handler using vendor's WhatsApp number from menu
  const handlePlaceOrder = () => {
    if (Object.keys(cart).length === 0 || !menu?.whatsappNumber) return;
    setPlacingOrder(true);
    // Build order message
    let message = `*New Order from: ${menu?.name || ''}*\n`;
    message += '\n';
    Object.values(cart).forEach((entry, idx) => {
      message += `${idx + 1}. ${entry.item.name} x${entry.quantity} - ₹${(entry.item.price * entry.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total: ₹${totalAmount.toFixed(2)}*`;
    setTimeout(() => {
      setPlacingOrder(false);
      // WhatsApp URL encoding
      const url = `https://wa.me/${menu.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }, 1200); // Simulate loading
  };

  // Add to cart handler
  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const key = item.name;
      if (prev[key]) {
        return { ...prev, [key]: { item, quantity: prev[key].quantity + 1 } };
      } else {
        return { ...prev, [key]: { item, quantity: 1 } };
      }
    });
  };

  // Calculate total amount
  const totalAmount = Object.values(cart).reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuDocRef = doc(db, "menus", id);
        const menuDoc = await safeGetDoc(menuDocRef);

        if (!menuDoc.exists()) {
          setError("Menu not found")
          return
        }

        const menuData = menuDoc.data() as Menu;
        setMenu(menuData);

        // Track the menu view
        try {
          await updateDoc(menuDocRef, {
            viewCount: increment(1),
            lastViewed: serverTimestamp()
          });

          // Get more detailed device information
          const deviceInfo = getDeviceInfo();
          const referrerInfo = document.referrer || 'direct';
          const screenSize = `${window.innerWidth}x${window.innerHeight}`;

          // Generate a unique view ID combining menu ID and timestamp
          const uniqueViewId = `${id}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

          // Also add a view record to track analytics
          const viewsRef = doc(db, "menu_views", uniqueViewId);
          await setDoc(viewsRef, {
            menuId: id,
            timestamp: serverTimestamp(),
            restaurantId: menuData.restaurantId,
            userAgent: navigator.userAgent,
            deviceType: deviceInfo.deviceType,
            deviceVendor: deviceInfo.vendor,
            browserName: deviceInfo.browserName,
            referrer: referrerInfo,
            screenSize: screenSize,
            language: navigator.language || 'unknown',
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay()
          });
        } catch (trackingError) {
          // Don't break the app if tracking fails
          console.error("Error tracking menu view:", trackingError);
        }
      } catch (err) {
        console.error("Error fetching menu:", err)
        setError("Failed to load menu")
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [id])

  // Function to determine device information from user agent
  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let deviceType = 'unknown';
    let vendor = 'unknown';
    let browserName = 'unknown';

    // Detect device type
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) {
        deviceType = 'tablet';
      } else {
        deviceType = 'mobile';
      }
    } else {
      deviceType = 'desktop';
    }

    // Detect vendor
    if (/iPhone|iPad|iPod/i.test(ua)) {
      vendor = 'Apple';
    } else if (/Android/i.test(ua)) {
      if (/Samsung/i.test(ua)) {
        vendor = 'Samsung';
      } else if (/LG/i.test(ua)) {
        vendor = 'LG';
      } else if (/HTC/i.test(ua)) {
        vendor = 'HTC';
      } else if (/Sony/i.test(ua)) {
        vendor = 'Sony';
      } else {
        vendor = 'Android';
      }
    } else if (/Windows/i.test(ua)) {
      vendor = 'Microsoft';
    } else if (/Macintosh/i.test(ua)) {
      vendor = 'Apple';
    } else if (/Linux/i.test(ua)) {
      vendor = 'Linux';
    }

    // Detect browser
    if (/Chrome/i.test(ua)) {
      browserName = 'Chrome';
    } else if (/Firefox/i.test(ua)) {
      browserName = 'Firefox';
    } else if (/Safari/i.test(ua)) {
      browserName = 'Safari';
    } else if (/Edge/i.test(ua)) {
      browserName = 'Edge';
    } else if (/Opera|OPR/i.test(ua)) {
      browserName = 'Opera';
    } else if (/MSIE|Trident/i.test(ua)) {
      browserName = 'Internet Explorer';
    }

    return {
      deviceType,
      vendor,
      browserName
    };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Something went wrong"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container py-8 max-w-3xl mx-auto px-4">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-3xl font-bold text-orange-600">
            <Image
              src="/logo.png"
              alt="Make Your Menu Logo"
              width={40}
              height={40}
              className="h-20 w-auto rounded-2xl"
            />
          </div>
        </div>

        <Card className="mb-10 border-orange-200 bg-gradient-to-br from-orange-100 to-white overflow-hidden shadow-lg">
          <div className="absolute w-24 h-24 rounded-full bg-orange-300 opacity-20 -top-10 -right-10"></div>
          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-4xl text-orange-600 mb-2">{menu.name}</CardTitle>
            {menu.description && <CardDescription className="text-lg text-gray-700">{menu.description}</CardDescription>}
          </CardHeader>
        </Card>

        {menu.categories.map((category, index) => (
          <div key={index} className="mb-12">
            <div className="relative">
              <h2 className="text-2xl font-bold mb-6 text-orange-600 inline-block">
                {category.name}
                <div className="absolute h-1 w-20 bg-orange-400 bottom-0 left-0 rounded-full"></div>
              </h2>
            </div>

            <div className="space-y-5">
              {category.items.map((item, itemIndex) => (
                <Card key={itemIndex} className="border-orange-100 hover:shadow-lg transition-shadow overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-orange-600 mb-1">{item.name}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="font-bold text-lg text-green-600 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                          ₹{item.price.toFixed(2)}
                        </div>
                        <button
                          className="mt-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-semibold shadow"
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to Cart
                        </button>
                        {cart[item.name] && (
                          <span className="text-xs text-gray-600">In cart: {cart[item.name].quantity}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {index < menu.categories.length - 1 && (
              <div className="flex justify-center my-10">
                <Separator className="w-1/2 bg-orange-200" />
              </div>
            )}
          </div>
        ))}

        {/* Cart total and Place Order display */}
        {totalAmount > 0 && menu?.whatsappNumber && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-orange-200 shadow-lg z-50 py-4">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 px-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center">
                <span className="text-lg font-semibold text-orange-700">Total: ₹{totalAmount.toFixed(2)}</span>
                <span className="text-sm text-gray-500">Items in cart: {Object.values(cart).reduce((sum, entry) => sum + entry.quantity, 0)}</span>
              </div>
              <button
                className="relative px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold text-base shadow flex items-center min-w-[120px] justify-center"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                    Placing Order...
                  </span>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        )}
        {/* Optionally, show a message if no WhatsApp number is set */}
        {totalAmount > 0 && !menu?.whatsappNumber && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-orange-200 shadow-lg z-50 py-4">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 px-4">
              <span className="text-lg font-semibold text-orange-700">Total: ₹{totalAmount.toFixed(2)}</span>
              <span className="text-sm text-red-500">Vendor WhatsApp number not available</span>
            </div>
          </div>
        )}
        <div className="text-center text-gray-500 text-sm mt-8 mb-12">
          Make Your Menu powered by <span className="font-semibold text-orange-600">Proco Technologies</span>
        </div>
      </div>
    </div>
  )
} 