"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth, doc, safeGetDoc, db, collection, query, where, safeGetDocs, getDocs } from "@/lib/firebase"
import { orderBy, limit } from "firebase/firestore"
import { QrCode, Utensils, Users, Coffee, Pizza, IceCream, BarChart3, ChevronUp, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [restaurantName, setRestaurantName] = useState("")
  const [loading, setLoading] = useState(true)
  const [hasMenu, setHasMenu] = useState(false)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [viewCount, setViewCount] = useState(0)
  const [recentViews, setRecentViews] = useState<{date: string, count: number}[]>([])
  const [todayViews, setTodayViews] = useState(0)
  const [weeklyViews, setWeeklyViews] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser
        if (user) {
          console.log("Fetching restaurant data for user:", user.uid)
          // Get restaurant data
          const docRef = doc(db, "restaurants", user.uid)
          const docSnap = await safeGetDoc(docRef)

          if (docSnap.exists()) {
            setRestaurantName(docSnap.data().restaurantName || "My Restaurant")
            console.log("Restaurant name:", docSnap.data().restaurantName)
          } else {
            console.log("No restaurant document found")
          }

          // Check if user already has a menu
          const menusQuery = query(collection(db, "menus"), where("restaurantId", "==", user.uid))
          const menusSnapshot = await safeGetDocs(menusQuery)

          if (menusSnapshot.docs.length > 0) {
            setHasMenu(true)
            const menuDoc = menusSnapshot.docs[0];
            setMenuId(menuDoc.id)
            
            // Get view count
            const menuData = menuDoc.data();
            setViewCount(menuData.viewCount || 0);
            
            // Get recent views from menu_views collection
            if (menuDoc.id) {
              await fetchAnalytics(user.uid, menuDoc.id);
            }
            
            console.log("User already has a menu with ID:", menuDoc.id)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchAnalytics = async (userId: string, menuId: string) => {
    try {
      // Get today's views
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get weekly views
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      lastWeek.setHours(0, 0, 0, 0);
      
      // Query for recent views for analytics tab
      const viewsQuery = query(
        collection(db, "menu_views"), 
        where("restaurantId", "==", userId),
        where("menuId", "==", menuId),
        orderBy("timestamp", "desc"),
        limit(50)
      );
      
      const viewsSnapshot = await getDocs(viewsQuery);
      
      let todayCount = 0;
      let weeklyCount = 0;
      const dailyViewCounts: Record<string, number> = {};
      
      viewsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.timestamp) {
          const viewDate = data.timestamp.toDate();
          
          // Count today's views
          if (viewDate >= today) {
            todayCount++;
          }
          
          // Count weekly views
          if (viewDate >= lastWeek) {
            weeklyCount++;
          }
          
          // Group by day for chart
          const dateKey = viewDate.toISOString().split('T')[0];
          if (dailyViewCounts[dateKey]) {
            dailyViewCounts[dateKey]++;
          } else {
            dailyViewCounts[dateKey] = 1;
          }
        }
      });
      
      // Convert to array for chart
      const recentViewsData = Object.entries(dailyViewCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-7); // Last 7 days with data
      
      setTodayViews(todayCount);
      setWeeklyViews(weeklyCount);
      setRecentViews(recentViewsData);
      
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-orange-600">Welcome, {restaurantName}!</h2>
          <p className="text-orange-600/80">Manage your digital menu and QR codes</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {!hasMenu ? (
            <Link href="/dashboard/menu/create" className="w-full md:w-auto">
              <Button className="bg-orange-500 hover:bg-orange-600 shadow-md w-full">
                <Utensils className="mr-2 h-4 w-4" />
                Create Menu
              </Button>
            </Link>
          ) : (
            <Link href={`/dashboard/menu/edit/${menuId}`} className="w-full md:w-auto">
              <Button className="bg-orange-500 hover:bg-orange-600 shadow-md w-full">
                <Utensils className="mr-2 h-4 w-4" />
                Edit Menu
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-lg font-medium text-blue-600">Total Views</CardTitle>
            <Users className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-blue-700">{viewCount}</div>
            <p className="text-sm text-blue-500">All-time menu views</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-lg font-medium text-green-600">Today</CardTitle>
            <ChevronUp className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-green-700">{todayViews}</div>
            <p className="text-sm text-green-500">Views today</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-bl-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-lg font-medium text-purple-600">This Week</CardTitle>
            <BarChart3 className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-purple-700">{weeklyViews}</div>
            <p className="text-sm text-purple-500">Views this week</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-lg font-medium text-orange-600">Menu Status</CardTitle>
            <Utensils className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl font-bold text-orange-700">{hasMenu ? "Created" : "Not Created"}</div>
            <p className="text-sm text-orange-500">
              {hasMenu ? "Your menu is ready to share" : "Create your first menu"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border border-orange-200 p-1 w-full flex">
          <TabsTrigger
            value="overview"
            className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="border-orange-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <CardTitle>Get Started with MakeMyMenu</CardTitle>
              <CardDescription className="text-orange-100">
                Follow these steps to create your digital menu and QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-blue-100 rounded-bl-full"></div>
                  <CardHeader className="p-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Coffee className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg text-blue-600">1. Create Menu</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 relative z-10">
                    <p className="text-sm text-blue-600 mb-4">Add categories and items to your digital menu</p>
                    {!hasMenu ? (
                      <Link href="/dashboard/menu/create" className="block">
                        <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                          Create Menu
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/dashboard/menu/edit/${menuId}`} className="block">
                        <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                          Edit Menu
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-md overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-orange-100 rounded-bl-full"></div>
                  <CardHeader className="p-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Pizza className="h-5 w-5 text-orange-600" />
                      </div>
                      <CardTitle className="text-lg text-orange-600">2. Customize</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 relative z-10">
                    <p className="text-sm text-orange-600 mb-4">Personalize your menu with categories and items</p>
                    {!hasMenu ? (
                      <Button variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50" disabled>
                        Create Menu First
                      </Button>
                    ) : (
                      <Link href={`/dashboard/menu/edit/${menuId}`} className="block">
                        <Button variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50">
                          Customize Menu
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-green-100 rounded-bl-full"></div>
                  <CardHeader className="p-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-full">
                        <QrCode className="h-5 w-5 text-green-600" />
                      </div>
                      <CardTitle className="text-lg text-green-600">3. Share</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 relative z-10">
                    <p className="text-sm text-green-600 mb-4">Generate QR code for customers to scan</p>
                    {!hasMenu ? (
                      <Button variant="outline" className="w-full border-green-300 text-green-600 hover:bg-green-50" disabled>
                        Create Menu First
                      </Button>
                    ) : (
                      <Link href={`/dashboard/qr-codes?menuId=${menuId}`} className="block">
                        <Button variant="outline" className="w-full border-green-300 text-green-600 hover:bg-green-50">
                          Generate QR Code
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-purple-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <CardTitle>Menu View Analytics</CardTitle>
              <CardDescription className="text-purple-100">
                Track how often your menu QR code is scanned
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-purple-600 mb-4">Recent Views</h3>
                
                {recentViews.length > 0 ? (
                  <div className="space-y-3">
                    {recentViews.map((view, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{new Date(view.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-purple-600">{view.count} views</span>
                          <div 
                            className="h-8 bg-purple-200 rounded" 
                            style={{ 
                              width: `${Math.min(Math.max(view.count * 8, 20), 200)}px` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500">No view data available yet. Share your QR code to start tracking views.</p>
                </div>
                )}
              </div>
              
              {hasMenu && (
                <div className="flex justify-center mt-6">
                  <Link href={`/dashboard/qr-codes?menuId=${menuId}`}>
                    <Button className="bg-purple-500 hover:bg-purple-600 shadow-md">
                      <QrCode className="mr-2 h-4 w-4" />
                      Get QR Code
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
