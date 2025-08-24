// Demo data for the application when running in demo mode

// Demo restaurant data
export const demoRestaurant = {
  id: "demo-user-id",
  restaurantName: "Demo Restaurant",
  email: "demo@example.com",
  createdAt: new Date().toISOString(),
}

// Demo menus
export const demoMenus = [
  {
    id: "demo-menu-1",
    name: "Main Menu",
    description: "Our regular menu with all offerings",
    restaurantId: "demo-user-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categories: [
      {
        name: "Appetizers",
        items: [
          {
            name: "Garlic Bread",
            description: "Toasted bread with garlic butter and herbs",
            price: 5.99,
          },
          {
            name: "Mozzarella Sticks",
            description: "Breaded and fried mozzarella with marinara sauce",
            price: 7.99,
          },
          {
            name: "Bruschetta",
            description: "Toasted bread topped with tomatoes, basil, and olive oil",
            price: 6.99,
          },
        ],
      },
      {
        name: "Main Courses",
        items: [
          {
            name: "Spaghetti Bolognese",
            description: "Classic pasta with rich meat sauce",
            price: 14.99,
          },
          {
            name: "Grilled Salmon",
            description: "Fresh salmon with lemon butter sauce and seasonal vegetables",
            price: 18.99,
          },
          {
            name: "Chicken Parmesan",
            description: "Breaded chicken topped with marinara and mozzarella, served with pasta",
            price: 16.99,
          },
        ],
      },
      {
        name: "Desserts",
        items: [
          {
            name: "Tiramisu",
            description: "Classic Italian dessert with coffee-soaked ladyfingers",
            price: 7.99,
          },
          {
            name: "Chocolate Lava Cake",
            description: "Warm chocolate cake with a molten center",
            price: 8.99,
          },
        ],
      },
    ],
  },
  {
    id: "demo-menu-2",
    name: "Lunch Special",
    description: "Available weekdays from 11am to 3pm",
    restaurantId: "demo-user-id",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    categories: [
      {
        name: "Lunch Entrees",
        items: [
          {
            name: "Soup & Salad Combo",
            description: "Cup of soup with house salad",
            price: 9.99,
          },
          {
            name: "Half Sandwich & Soup",
            description: "Half sandwich with cup of soup",
            price: 10.99,
          },
        ],
      },
    ],
  },
]

// Demo analytics data
export const demoAnalytics = {
  menuViews: 127,
  qrScans: 43,
  popularItems: [
    { name: "Spaghetti Bolognese", views: 32 },
    { name: "Chicken Parmesan", views: 28 },
    { name: "Tiramisu", views: 19 },
  ],
  viewsByDay: [
    { date: "2023-05-01", views: 12 },
    { date: "2023-05-02", views: 15 },
    { date: "2023-05-03", views: 8 },
    { date: "2023-05-04", views: 21 },
    { date: "2023-05-05", views: 18 },
    { date: "2023-05-06", views: 25 },
    { date: "2023-05-07", views: 28 },
  ],
}
