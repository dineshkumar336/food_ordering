const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const SEED_PASSWORD = process.env.SEED_PASSWORD || `${crypto.randomBytes(9).toString('base64url')}a1`;

const { hashPassword } = require('./utils/password');
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
    await User.deleteMany({ role: { $in: ['restaurant'] } });
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});

    // Create restaurant owners
    const seedHash = await hashPassword(SEED_PASSWORD);
    const restaurantOwners = [
      {
        name: 'Delhi Pizza Palace',
        username: 'delhipizzapalace',
        password: seedHash,
        phone: '+91-555-0101',
        role: 'restaurant',
        address: {
          street: '123 Pizza Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001'
        }
      },
      {
        name: 'Bombay Burger House',
        username: 'bombayburgerhouse',
        password: seedHash,
        phone: '+91-555-0102',
        role: 'restaurant',
        address: {
          street: '456 Burger Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        }
      },
      {
        name: 'Chennai Snack Shack',
        username: 'chennaisnackshack',
        password: seedHash,
        phone: '+91-555-0103',
        role: 'restaurant',
        address: {
          street: '789 Snack Lane',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600001'
        }
      }
    ];

    const createdOwners = await User.insertMany(restaurantOwners);
    console.log(`Seeded owner usernames: delhipizzapalace, bombayburgerhouse, chennaisnackshack`);
    console.log(`Seeded owner accounts use this password: ${SEED_PASSWORD}  (each owner sets up two-step sign-in at first login)`);
    console.log('Restaurant owners created');

    // Create restaurants
    const restaurants = [
      {
        owner: createdOwners[0]._id,
        name: 'Delhi Pizza Palace',
        description: 'Authentic Indian-style pizzas with a fusion of traditional flavors and modern toppings. Made with fresh ingredients and love from Delhi.',
        cuisine: ['Indian', 'Pizza'],
        image: '/images/delhi-pizza-main.svg',
        bannerImage: '/images/delhi-pizza-banner.svg',
        address: {
          street: '123 Pizza Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          coordinates: { lat: 28.7041, lng: 77.1025 }
        },
        phone: '+91-555-0101',
        email: 'delhipizzapalace@gmail.com',
        rating: 4.5,
        totalRatings: 128,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        minOrder: 15,
        isOpen: true,
        isVerified: true,
        openingHours: { open: '11:00', close: '23:00' },
        tags: ['pizza', 'indian', 'fusion']
      },
      {
        owner: createdOwners[1]._id,
        name: 'Bombay Burger House',
        description: 'Juicy burgers inspired by Mumbai street food culture, blending Indian spices with classic burger flavors.',
        cuisine: ['Indian', 'Burgers'],
        image: '/images/bombay-burger-main.svg',
        bannerImage: '/images/bombay-burger-banner.svg',
        address: {
          street: '456 Burger Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { lat: 19.0760, lng: 72.8777 }
        },
        phone: '+91-555-0102',
        email: 'bombayburgerhouse@gmail.com',
        rating: 4.3,
        totalRatings: 95,
        deliveryTime: '20-30 min',
        deliveryFee: 1.99,
        minOrder: 12,
        isOpen: true,
        isVerified: true,
        openingHours: { open: '10:00', close: '22:00' },
        tags: ['burger', 'indian', 'street-food']
      },
      {
        owner: createdOwners[2]._id,
        name: 'Chennai Snack Shack',
        description: 'Delicious South Indian snacks and street food favorites, made fresh with authentic spices and traditional recipes.',
        cuisine: ['Indian', 'Snacks', 'South Indian'],
        image: '/images/chennai-snack-main.svg',
        bannerImage: '/images/chennai-snack-banner.svg',
        address: {
          street: '789 Snack Lane',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600001',
          coordinates: { lat: 13.0827, lng: 80.2707 }
        },
        phone: '+91-555-0103',
        email: 'chennaisnackshack@gmail.com',
        rating: 4.7,
        totalRatings: 156,
        deliveryTime: '15-25 min',
        deliveryFee: 1.49,
        minOrder: 10,
        isOpen: true,
        isVerified: true,
        openingHours: { open: '09:00', close: '21:00' },
        tags: ['snacks', 'south-indian', 'street-food']
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
      // Delhi Pizza Palace
      {
        restaurant: createdRestaurants[0]._id,
        name: 'Paneer Tikka Pizza',
        description: 'Marinated paneer tikka with bell peppers, onions, and mint chutney on a thin crust.',
        price: 14.99,
        image: '/images/delhi-pizza-1.svg',
        category: 'Pizza',
        isVeg: true,
        isAvailable: true,
        preparationTime: '15-20 min',
        rating: 4.6,
        totalRatings: 45,
        tags: ['vegetarian', 'indian', 'paneer']
      },
      {
        restaurant: createdRestaurants[0]._id,
        name: 'Chicken Tandoori Pizza',
        description: 'Tandoori chicken, red onions, cilantro, and spicy sauce on our signature crust.',
        price: 16.99,
        image: '/images/delhi-pizza-2.svg',
        category: 'Pizza',
        isVeg: false,
        isAvailable: true,
        preparationTime: '15-20 min',
        rating: 4.4,
        totalRatings: 38,
        tags: ['chicken', 'spicy', 'tandoori']
      },
      {
        restaurant: createdRestaurants[0]._id,
        name: 'Veggie Delight Pizza',
        description: 'Mixed vegetables, paneer, and Indian spices with a tangy tomato base.',
        price: 13.99,
        image: '/images/delhi-pizza-3.svg',
        category: 'Pizza',
        isVeg: true,
        isAvailable: true,
        preparationTime: '15-20 min',
        rating: 4.5,
        totalRatings: 32,
        tags: ['vegetarian', 'healthy', 'mixed-veggie']
      },

      // Bombay Burger House
      {
        restaurant: createdRestaurants[1]._id,
        name: 'Masala Chicken Burger',
        description: 'Spicy chicken patty with masala spices, lettuce, tomato, and mint mayo.',
        price: 12.99,
        image: '/images/bombay-burger-1.svg',
        category: 'Burgers',
        isVeg: false,
        isAvailable: true,
        preparationTime: '10-15 min',
        rating: 4.5,
        totalRatings: 67,
        tags: ['chicken', 'spicy', 'masala']
      },
      {
        restaurant: createdRestaurants[1]._id,
        name: 'Paneer Burger',
        description: 'Grilled paneer patty with Indian spices, veggies, and tangy sauce.',
        price: 11.99,
        image: '/images/bombay-burger-2.svg',
        category: 'Burgers',
        isVeg: true,
        isAvailable: true,
        preparationTime: '10-15 min',
        rating: 4.3,
        totalRatings: 52,
        tags: ['vegetarian', 'paneer', 'grilled']
      },
      {
        restaurant: createdRestaurants[1]._id,
        name: 'Mumbai Vada Pav Burger',
        description: 'Fusion of vada pav and burger with potato patty, chutneys, and spices.',
        price: 10.99,
        image: '/images/bombay-burger-3.svg',
        category: 'Burgers',
        isVeg: true,
        isAvailable: true,
        preparationTime: '12-18 min',
        rating: 4.7,
        totalRatings: 89,
        tags: ['vegetarian', 'street-food', 'fusion']
      },

      // Chennai Snack Shack
      {
        restaurant: createdRestaurants[2]._id,
        name: 'Samosa',
        description: 'Crispy fried pastry filled with spiced potatoes, peas, and green chilies.',
        price: 3.99,
        image: '/images/chennai-snack-1.svg',
        category: 'Snacks',
        isVeg: true,
        isAvailable: true,
        preparationTime: '5-10 min',
        rating: 4.8,
        totalRatings: 73,
        tags: ['vegetarian', 'crispy', 'spicy']
      },
      {
        restaurant: createdRestaurants[2]._id,
        name: 'Pakora',
        description: 'Assorted vegetable fritters dipped in chickpea batter and fried golden.',
        price: 4.99,
        image: '/images/chennai-snack-2.svg',
        category: 'Snacks',
        isVeg: true,
        isAvailable: true,
        preparationTime: '8-12 min',
        rating: 4.5,
        totalRatings: 41,
        tags: ['vegetarian', 'fritters', 'golden']
      },
      {
        restaurant: createdRestaurants[2]._id,
        name: 'Murukku',
        description: 'Crispy South Indian snack made from rice flour and urad dal, seasoned with sesame.',
        price: 5.99,
        image: '/images/chennai-snack-3.svg',
        category: 'Snacks',
        isVeg: true,
        isAvailable: true,
        preparationTime: '10-15 min',
        rating: 4.6,
        totalRatings: 58,
        tags: ['vegetarian', 'south-indian', 'crispy']
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
