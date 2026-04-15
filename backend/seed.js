const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({ role: 'restaurant' });
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});

    // Create restaurant owners
    const restaurantOwners = [
      {
        name: 'Mario Italian',
        email: 'mario@pizza.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1-555-0101',
        role: 'restaurant',
        address: {
          street: '123 Pizza Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      },
      {
        name: 'Burger King',
        email: 'king@burger.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1-555-0102',
        role: 'restaurant',
        address: {
          street: '456 Burger Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210'
        }
      },
      {
        name: 'Tokyo Ramen',
        email: 'tokyo@ramen.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1-555-0103',
        role: 'restaurant',
        address: {
          street: '789 Noodle Lane',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102'
        }
      }
    ];

    const createdOwners = await User.insertMany(restaurantOwners);
    console.log('Restaurant owners created');

    // Create restaurants
    const restaurants = [
      {
        owner: createdOwners[0]._id,
        name: 'Mario\'s Authentic Pizza',
        description: 'Traditional Italian pizza made with fresh ingredients and authentic recipes passed down through generations.',
        cuisine: ['Italian', 'Pizza'],
        image: '/images/pizza.png',
        bannerImage: '/images/pizza.png',
        address: {
          street: '123 Pizza Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        phone: '+1-555-0101',
        email: 'mario@pizza.com',
        rating: 4.5,
        totalRatings: 128,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        minOrder: 15,
        isOpen: true,
        isVerified: true,
        openingHours: { open: '11:00', close: '23:00' },
        tags: ['pizza', 'italian', 'authentic']
      },
      {
        owner: createdOwners[1]._id,
        name: 'Burger Palace',
        description: 'Juicy, flame-grilled burgers made with premium beef and fresh toppings. The ultimate burger experience.',
        cuisine: ['American', 'Burgers'],
        image: '/images/burger.png',
        bannerImage: '/images/burger.png',
        address: {
          street: '456 Burger Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        phone: '+1-555-0102',
        email: 'king@burger.com',
        rating: 4.3,
        totalRatings: 95,
        deliveryTime: '20-30 min',
        deliveryFee: 1.99,
        minOrder: 12,
        isOpen: true,
        isVerified: true,
        openingHours: { open: '10:00', close: '22:00' },
        tags: ['burger', 'american', 'fast-food']
      },
      {
        owner: createdOwners[2]._id,
        name: 'Tokyo Noodle House',
        description: 'Authentic Japanese ramen and Asian cuisine with rich, flavorful broths and fresh ingredients.',
        cuisine: ['Japanese', 'Asian', 'Noodles'],
        image: '/images/ramen.png',
        bannerImage: '/images/ramen.png',
        address: {
          street: '789 Noodle Lane',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        phone: '+1-555-0103',
        email: 'tokyo@ramen.com',
        rating: 4.7,
        totalRatings: 156,
        deliveryTime: '30-40 min',
        deliveryFee: 3.49,
        minOrder: 18,
        isOpen: true,
        isVerified: true,
        openingHours: { open: '12:00', close: '21:00' },
        tags: ['ramen', 'japanese', 'asian', 'noodles']
      }
    ];

    const createdRestaurants = await Restaurant.insertMany(restaurants);
    console.log('Restaurants created');

    // Update owners with restaurant IDs
    await User.findByIdAndUpdate(createdOwners[0]._id, { restaurantId: createdRestaurants[0]._id });
    await User.findByIdAndUpdate(createdOwners[1]._id, { restaurantId: createdRestaurants[1]._id });
    await User.findByIdAndUpdate(createdOwners[2]._id, { restaurantId: createdRestaurants[2]._id });

    // Create menu items
    const menuItems = [
      // Mario's Pizza
      {
        restaurant: createdRestaurants[0]._id,
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato sauce, basil, and olive oil on thin crust.',
        price: 14.99,
        image: '/images/pizza.png',
        category: 'Pizza',
        isVeg: true,
        isAvailable: true,
        preparationTime: '15-20 min',
        rating: 4.6,
        totalRatings: 45,
        tags: ['vegetarian', 'classic']
      },
      {
        restaurant: createdRestaurants[0]._id,
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni, mozzarella, and tomato sauce on our signature crust.',
        price: 16.99,
        image: '/images/pizza.png',
        category: 'Pizza',
        isVeg: false,
        isAvailable: true,
        preparationTime: '15-20 min',
        rating: 4.4,
        totalRatings: 38,
        tags: ['meat', 'spicy']
      },
      {
        restaurant: createdRestaurants[0]._id,
        name: 'Italian Salad',
        description: 'Mixed greens, cherry tomatoes, olives, and balsamic vinaigrette.',
        price: 8.99,
        image: '/images/pizza.png',
        category: 'Salads',
        isVeg: true,
        isAvailable: true,
        preparationTime: '5-10 min',
        rating: 4.2,
        totalRatings: 22,
        tags: ['vegetarian', 'healthy']
      },

      // Burger Palace
      {
        restaurant: createdRestaurants[1]._id,
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty with American cheese, lettuce, tomato, and special sauce.',
        price: 12.99,
        image: '/images/burger.png',
        category: 'Burgers',
        isVeg: false,
        isAvailable: true,
        preparationTime: '10-15 min',
        rating: 4.5,
        totalRatings: 67,
        tags: ['beef', 'cheese', 'classic']
      },
      {
        restaurant: createdRestaurants[1]._id,
        name: 'Bacon Deluxe Burger',
        description: 'Double beef patty with crispy bacon, cheddar cheese, and BBQ sauce.',
        price: 15.99,
        image: '/images/burger.png',
        category: 'Burgers',
        isVeg: false,
        isAvailable: true,
        preparationTime: '12-18 min',
        rating: 4.7,
        totalRatings: 52,
        tags: ['beef', 'bacon', 'premium']
      },
      {
        restaurant: createdRestaurants[1]._id,
        name: 'French Fries',
        description: 'Crispy golden fries seasoned with sea salt.',
        price: 4.99,
        image: '/images/burger.png',
        category: 'Sides',
        isVeg: true,
        isAvailable: true,
        preparationTime: '5-8 min',
        rating: 4.3,
        totalRatings: 89,
        tags: ['vegetarian', 'crispy']
      },

      // Tokyo Noodle House
      {
        restaurant: createdRestaurants[2]._id,
        name: 'Tonkotsu Ramen',
        description: 'Rich pork bone broth with chashu pork, soft-boiled egg, and green onions.',
        price: 13.99,
        image: '/images/ramen.png',
        category: 'Ramen',
        isVeg: false,
        isAvailable: true,
        preparationTime: '20-25 min',
        rating: 4.8,
        totalRatings: 73,
        tags: ['pork', 'rich', 'authentic']
      },
      {
        restaurant: createdRestaurants[2]._id,
        name: 'Vegetarian Ramen',
        description: 'Miso broth with tofu, mushrooms, corn, and seasonal vegetables.',
        price: 11.99,
        image: '/images/ramen.png',
        category: 'Ramen',
        isVeg: true,
        isAvailable: true,
        preparationTime: '18-22 min',
        rating: 4.5,
        totalRatings: 41,
        tags: ['vegetarian', 'healthy', 'miso']
      },
      {
        restaurant: createdRestaurants[2]._id,
        name: 'Gyoza Dumplings',
        description: 'Pan-fried dumplings filled with pork and vegetables, served with dipping sauce.',
        price: 7.99,
        image: '/images/ramen.png',
        category: 'Appetizers',
        isVeg: false,
        isAvailable: true,
        preparationTime: '8-12 min',
        rating: 4.6,
        totalRatings: 58,
        tags: ['dumplings', 'pork', 'appetizer']
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log('Menu items created');

    console.log('Seed data inserted successfully!');
    console.log(`Created ${createdRestaurants.length} restaurants with ${menuItems.length} menu items`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  seedData();
});