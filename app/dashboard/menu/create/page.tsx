"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { PlusCircle, Trash2, Edit } from "lucide-react"
import { auth, db, collection, safeAddDoc, serverTimestamp, query, where, safeGetDocs } from "@/lib/firebase"

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
}

interface Category {
  id: string
  name: string
  items: MenuItem[]
}

export default function CreateMenuPage() {
  const router = useRouter()
  const [menuName, setMenuName] = useState("")
  const [menuDescription, setMenuDescription] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "category-" + Date.now(),
      name: "New Category",
      items: [],
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [checkingExistingMenu, setCheckingExistingMenu] = useState(true)

  useEffect(() => {
    // Check if user already has a menu
    const checkExistingMenu = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          router.push("/login")
          return
        }

        const menusQuery = query(collection(db, "menus"), where("restaurantId", "==", user.uid))
        const menusSnapshot = await safeGetDocs(menusQuery)

        if (menusSnapshot.docs.length > 0) {
          toast({
            title: "Menu already exists",
            description: "You can only create one menu. Redirecting to dashboard.",
          })
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error checking existing menu:", error)
      } finally {
        setCheckingExistingMenu(false)
      }
    }

    checkExistingMenu()
  }, [router])

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        id: "category-" + Date.now(),
        name: "New Category",
        items: [],
      },
    ])
  }

  const removeCategory = (categoryId: string) => {
    setCategories(categories.filter((category) => category.id !== categoryId))
  }

  const updateCategoryName = (categoryId: string, name: string) => {
    setCategories(categories.map((category) => (category.id === categoryId ? { ...category, name } : category)))
  }

  const addMenuItem = (categoryId: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
            ...category,
            items: [
              ...category.items,
              {
                id: "item-" + Date.now(),
                name: "New Item",
                description: "Description",
                price: "0.00",
              },
            ],
          }
          : category,
      ),
    )
  }

  const removeMenuItem = (categoryId: string, itemId: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
            ...category,
            items: category.items.filter((item) => item.id !== itemId),
          }
          : category,
      ),
    )
  }

  const updateMenuItem = (categoryId: string, itemId: string, field: keyof MenuItem, value: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
            ...category,
            items: category.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
          }
          : category,
      ),
    )
  }

  const handleSaveMenu = async () => {
    setIsLoading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("You must be logged in to create a menu")
      }

      // Check if user already has a menu
      const menusQuery = query(collection(db, "menus"), where("restaurantId", "==", user.uid))
      const menusSnapshot = await safeGetDocs(menusQuery)

      if (menusSnapshot.docs.length > 0) {
        throw new Error("You can only create one menu")
      }

      const menuData = {
        name: menuName,
        description: menuDescription,
        whatsappNumber: whatsappNumber,
        categories: categories.map((category) => ({
          name: category.name,
          items: category.items.map((item) => ({
            name: item.name,
            description: item.description,
            price: Number.parseFloat(item.price) || 0,
          })),
        })),
        restaurantId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await safeAddDoc(collection(db, "menus"), menuData)

      toast({
        title: "Menu created!",
        description: "Your menu has been successfully created.",
      })

      router.push(`/dashboard/qr-codes?menuId=${docRef.id}`)
    } catch (error: any) {
      console.error("Error creating menu:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create menu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingExistingMenu) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container py-6 px-4 md:py-8 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-600">Create Menu</h1>
        <Button onClick={handleSaveMenu} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 w-full md:w-auto">
          {isLoading ? "Saving..." : "Save Menu"}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader>
            <CardTitle className="text-orange-600">Menu Details</CardTitle>
            <CardDescription>Enter the basic information about your menu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menu-name">Menu Name</Label>
              <Input
                id="menu-name"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="Enter menu name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-description">Menu Description (Optional)</Label>
              <Textarea
                id="menu-description"
                value={menuDescription}
                onChange={(e) => setMenuDescription(e.target.value)}
                placeholder="Enter a description for your menu"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-number">Vendor WhatsApp Number</Label>
              <Input
                id="whatsapp-number"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 919999999999"
                type="tel"
                pattern="[0-9]+"
                maxLength={15}
              />
              <span className="text-xs text-gray-500">Enter WhatsApp number with country code, e.g. 919999999999</span>
            </div>
          </CardContent>
        </Card>

        {categories.map((category) => (
          <Card key={category.id} className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-col sm:flex-row items-start justify-between space-y-2 sm:space-y-0">
              <div className="space-y-1 flex-1 w-full sm:w-auto">
                <div className="flex items-center">
                  <Input
                    value={category.name}
                    onChange={(e) => updateCategoryName(category.id, e.target.value)}
                    className="text-xl font-semibold border-none p-0 h-auto focus-visible:ring-0 text-blue-600 bg-transparent"
                  />
                  <Edit className="h-4 w-4 text-blue-400 ml-2" />
                </div>
                <CardDescription>Add items to this category</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCategory(category.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border rounded-md">
                  <div className="sm:col-span-12 md:col-span-5 space-y-2">
                    <Label htmlFor={`item-name-${item.id}`}>Item Name</Label>
                    <Input
                      id={`item-name-${item.id}`}
                      value={item.name}
                      onChange={(e) => updateMenuItem(category.id, item.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-6 md:col-span-2 space-y-2">
                    <Label htmlFor={`item-price-${item.id}`}>Price</Label>
                    <Input
                      id={`item-price-${item.id}`}
                      value={item.price}
                      onChange={(e) => updateMenuItem(category.id, item.id, "price", e.target.value)}
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="sm:col-span-6 md:col-span-4 space-y-2">
                    <Label htmlFor={`item-desc-${item.id}`}>Description</Label>
                    <Input
                      id={`item-desc-${item.id}`}
                      value={item.description}
                      onChange={(e) => updateMenuItem(category.id, item.id, "description", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-12 md:col-span-1 flex items-center sm:items-end justify-end mt-2 sm:mt-0">
                    <Button variant="ghost" size="icon" onClick={() => removeMenuItem(category.id, item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addMenuItem(category.id)}
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={addCategory}
          className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
    </div>
  )
}
