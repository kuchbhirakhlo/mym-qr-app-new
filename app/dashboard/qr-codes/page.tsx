"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Download, Share2, QrCode, Users, Clock, Eye, BarChart3 } from "lucide-react"
import { collection, query, where, safeGetDocs, auth, getDocs, doc, getDoc } from "@/lib/firebase"
import { orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import QRCode from "qrcode"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface Menu {
  id: string
  name: string
  viewCount?: number
}

interface MenuView {
  date: string
  count: number
  userAgent?: string
  referrer?: string
}

export default function QRCodesPage() {
  const searchParams = useSearchParams()
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<string>("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [menuViews, setMenuViews] = useState<MenuView[]>([])
  const [totalViews, setTotalViews] = useState(0)
  const [qrForeground, setQrForeground] = useState("#000000")
  const [qrBackground, setQrBackground] = useState("#ffffff")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        const q = query(collection(db, "menus"), where("restaurantId", "==", user.uid))
        const querySnapshot = await safeGetDocs(q)

        const menuList: Menu[] = []
        querySnapshot.forEach((doc) => {
          menuList.push({
            id: doc.id,
            name: doc.data().name,
            viewCount: doc.data().viewCount || 0,
          })
        })

        setMenus(menuList)

        // Check if menuId is in URL params
        const menuId = searchParams.get("menuId")
        if (menuId) {
          setSelectedMenu(menuId)
          generateQRCode(menuId)
          fetchViewData(menuId)
        }
      } catch (error) {
        console.error("Error fetching menus:", error)
        toast({
          title: "Error",
          description: "Failed to load menus",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMenus()
  }, [searchParams])

  const fetchViewData = async (menuId: string) => {
    try {
      // Get menu document to get total view count
      const menuDoc = await getDoc(doc(db, "menus", menuId))
      if (menuDoc.exists()) {
        setTotalViews(menuDoc.data().viewCount || 0)
      }

      // Query for view analytics
      const viewsQuery = query(
        collection(db, "menu_views"),
        where("menuId", "==", menuId),
        orderBy("timestamp", "desc"),
        limit(30)
      )

      const viewsSnapshot = await getDocs(viewsQuery)
      
      const dailyViewCounts: Record<string, {count: number, agents: Record<string, number>, referrers: Record<string, number>}> = {}
      
      viewsSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.timestamp) {
          const viewDate = data.timestamp.toDate()
          const dateKey = viewDate.toISOString().split('T')[0]
          
          // Initialize if first time seeing this date
          if (!dailyViewCounts[dateKey]) {
            dailyViewCounts[dateKey] = {
              count: 0,
              agents: {},
              referrers: {}
            }
          }
          
          // Increment count
          dailyViewCounts[dateKey].count++
          
          // Track user agents
          const deviceType = getUserDeviceType(data.userAgent || '')
          if (!dailyViewCounts[dateKey].agents[deviceType]) {
            dailyViewCounts[dateKey].agents[deviceType] = 0
          }
          dailyViewCounts[dateKey].agents[deviceType]++
          
          // Track referrers
          const referrer = data.referrer || 'direct'
          if (!dailyViewCounts[dateKey].referrers[referrer]) {
            dailyViewCounts[dateKey].referrers[referrer] = 0
          }
          dailyViewCounts[dateKey].referrers[referrer]++
        }
      })
      
      // Convert to array for display
      const views = Object.entries(dailyViewCounts)
        .map(([date, data]) => ({
          date,
          count: data.count,
          userAgent: Object.entries(data.agents)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown',
          referrer: Object.entries(data.referrers)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'direct'
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
      
      setMenuViews(views)
      
    } catch (error) {
      console.error("Error fetching view data:", error)
    }
  }

  const getUserDeviceType = (userAgent: string): string => {
    if (!userAgent) return 'unknown'
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile'
    }
    if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(userAgent)) {
      return 'tablet'
    }
    return 'desktop'
  }

  const generateQRCode = async (menuId: string) => {
    try {
      const menuUrl = `${window.location.origin}/menu/${menuId}`

      // Generate QR code as data URL with custom colors
      const dataUrl = await QRCode.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: qrForeground,
          light: qrBackground,
        },
      })

      setQrCodeUrl(dataUrl)

      // Also render to canvas for better quality download
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, menuUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: qrForeground,
            light: qrBackground,
          },
        })
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    }
  }

  const handleMenuChange = (menuId: string) => {
    setSelectedMenu(menuId)
    generateQRCode(menuId)
    fetchViewData(menuId)
  }

  const handleColorChange = (type: 'foreground' | 'background', color: string) => {
    if (type === 'foreground') {
      setQrForeground(color)
    } else {
      setQrBackground(color)
    }
    
    if (selectedMenu) {
      generateQRCode(selectedMenu)
    }
  }

  const downloadQRCode = () => {
    try {
      if (!canvasRef.current) {
        console.error("Canvas ref is null");
        toast({
          title: "Error",
          description: "Could not generate QR code image",
          variant: "destructive",
        });
        return;
      }

      // Get selected menu name
      const selectedMenuObj = menus.find(menu => menu.id === selectedMenu);
      const businessName = selectedMenuObj ? selectedMenuObj.name : "Menu";
      
      // Create a new canvas with space for text
      const newCanvas = document.createElement("canvas");
      const qrWidth = canvasRef.current.width;
      const qrHeight = canvasRef.current.height;
      const padding = 20;
      const shadowSize = 15;
      
      // Set canvas size with extra space for text and shadow
      newCanvas.width = qrWidth + (padding * 2) + (shadowSize * 2);
      newCanvas.height = qrHeight + 100 + (shadowSize * 2);  // Add 100px for text area plus shadow
      
      const ctx = newCanvas.getContext("2d");
      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }
      
      // Fill background
      ctx.fillStyle = qrBackground;
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
      
      // Add orange shadow
      ctx.shadowColor = 'rgba(249, 115, 22, 0.5)'; // Orange shadow with 50% opacity
      ctx.shadowBlur = shadowSize;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Create white rectangle with shadow for QR code background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(shadowSize, shadowSize, qrWidth + (padding * 2), qrHeight + padding);
      
      // Reset shadow for the QR code and text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Draw QR code (centered)
      ctx.drawImage(canvasRef.current, padding + shadowSize, padding + shadowSize);
      
      // Add business name text
      ctx.fillStyle = qrForeground;
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(businessName, newCanvas.width / 2, qrHeight + 50 + shadowSize);
      
      // Add scan text
      ctx.font = "16px Arial";
      ctx.fillText("Scan to get the complete menu", newCanvas.width / 2, qrHeight + 80 + shadowSize);
      
      // Create download link
      const link = document.createElement("a");
      link.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-menu-qr.png`;
      
      // Get data URL and trigger download
      link.href = newCanvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const shareQRCode = async () => {
    try {
      if (!selectedMenu) return

      const menuUrl = `${window.location.origin}/menu/${selectedMenu}`

      if (navigator.share) {
        await navigator.share({
          title: "Menu QR Code",
          text: "Scan this QR code to view our menu",
          url: menuUrl,
        })
      } else {
        await navigator.clipboard.writeText(menuUrl)
        toast({
          title: "Link copied!",
          description: "Menu link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-orange-600">QR Codes</h1>
        <div className="w-full md:w-1/3">
              <Select value={selectedMenu} onValueChange={handleMenuChange} disabled={loading || menus.length === 0}>
                <SelectTrigger id="menu-select">
                  <SelectValue placeholder="Select a menu" />
                </SelectTrigger>
                <SelectContent>
                  {menus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                  {menu.name} ({menu.viewCount} views)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="bg-white border border-orange-200 p-1">
          <TabsTrigger
            value="generator"
            className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            QR Generator
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Scan Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardHeader>
                <CardTitle className="text-orange-600">QR Code Options</CardTitle>
                <CardDescription>Customize your QR code appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="foreground-color">Foreground Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded border cursor-pointer" 
                      style={{ backgroundColor: qrForeground }}
                      onClick={() => document.getElementById('foreground-color')?.click()}
                    ></div>
                    <Input 
                      id="foreground-color" 
                      type="color" 
                      value={qrForeground} 
                      onChange={(e) => handleColorChange('foreground', e.target.value)} 
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded border cursor-pointer" 
                      style={{ backgroundColor: qrBackground }}
                      onClick={() => document.getElementById('background-color')?.click()}
                    ></div>
                    <Input 
                      id="background-color" 
                      type="color" 
                      value={qrBackground} 
                      onChange={(e) => handleColorChange('background', e.target.value)} 
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => selectedMenu && generateQRCode(selectedMenu)} 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={!selectedMenu}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="text-green-600">Your QR Code</CardTitle>
            <CardDescription>Download or share your QR code</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {qrCodeUrl ? (
              <div className="flex flex-col items-center">
                <img 
                  src={qrCodeUrl || "/placeholder.svg"} 
                  alt="Menu QR Code" 
                  className="border p-4 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {loading ? "Loading..." : "Select a menu to generate a QR code"}
              </div>
            )}
          </CardContent>
          {qrCodeUrl && (
            <CardFooter className="flex justify-center gap-4">
              <Button onClick={downloadQRCode} className="bg-green-500 hover:bg-green-600">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={shareQRCode}
                className="border-green-300 text-green-600 hover:bg-green-50"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-purple-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>QR Code Scan Analytics</CardTitle>
                  <CardDescription className="text-purple-100">
                    Track how often your menu QR code is scanned
                  </CardDescription>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2 text-white">
                  <div className="text-sm">Total Scans</div>
                  <div className="text-2xl font-bold">{totalViews}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {!selectedMenu ? (
                <div className="text-center p-6 border border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500">Select a menu to view scan analytics.</p>
                </div>
              ) : menuViews.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500">No scan data available yet. Share your QR code to start tracking scans.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-purple-600 mb-4">Recent Scans by Date</h3>
                    <div className="space-y-3">
                      {menuViews.map((view, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{new Date(view.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric'
                            })}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 sm:mt-0">
                            <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                              <Eye className="h-3 w-3" />
                              <span>{view.count} scans</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                              <Users className="h-3 w-3" />
                              <span>{view.userAgent === 'mobile' ? 'Mobile' : view.userAgent === 'tablet' ? 'Tablet' : 'Desktop'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-purple-600 mb-4">Device Analytics</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {['mobile', 'tablet', 'desktop'].map(device => {
                        const count = menuViews.filter(v => v.userAgent === device)
                          .reduce((sum, v) => sum + v.count, 0);
                        const percentage = totalViews > 0 ? Math.round((count / totalViews) * 100) : 0;
                        
                        return (
                          <div key={device} className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">{device.charAt(0).toUpperCase() + device.slice(1)}</div>
                            <div className="text-xl font-bold text-purple-600">{count}</div>
                            <div className="text-sm text-gray-500">{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
