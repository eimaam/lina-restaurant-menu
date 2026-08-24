import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.model';
import { MenuCategory } from '../models/MenuCategory.model';
import { MenuItem } from '../models/MenuItem.model';
import { Banner } from '../models/Banner.model';
import { UserRole, OptionSelectionType, BannerType } from '../types';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lina_restaurant_db';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Seed Users (SuperAdmin & Staff)
    console.log('👤 Seeding default users...');
    await User.deleteMany({});

    await User.create([
      {
        name: 'Lina Lead Developer',
        email: 'dev@linarestaurant.com',
        password: 'dev123456',
        phone: '09165196622',
        role: UserRole.Developer,
        isActive: true,
      },
      {
        name: 'Lina Super Admin',
        email: 'admin@linarestaurant.com',
        password: 'admin123456',
        phone: '09165196622',
        role: UserRole.Admin,
        isActive: true,
      },
      {
        name: 'Lina Floor Staff',
        email: 'staff@linarestaurant.com',
        password: 'staff123456',
        phone: '09165196622',
        role: UserRole.Staff,
        isActive: true,
      },
    ]);
    console.log('✅ Users seeded: dev@linarestaurant.com, admin@linarestaurant.com and staff@linarestaurant.com');

    // 2. Seed Menu Categories
    console.log('📂 Seeding Menu Categories...');
    await MenuCategory.deleteMany({});
    await MenuItem.deleteMany({});

    const categoriesData = [
      { name: 'Rice & Pastas', slug: 'rice-pastas', icon: '🍚', sortOrder: 1, description: 'Freshly prepared rice and pasta delicacies' },
      { name: 'Proteins & Pepper Soups', slug: 'proteins-pepper-soups', icon: '🍗', sortOrder: 2, description: 'Succulent meats, fresh fish, and hot aromatic pepper soups' },
      { name: 'Sides & Local Delicacies', slug: 'sides-delicacies', icon: '🥘', sortOrder: 3, description: 'Isi Ewu, Nkwobi, plantain, and traditional sides' },
      { name: 'Soups', slug: 'soups', icon: '🍲', sortOrder: 4, description: 'Rich traditional Nigerian soups prepared with authentic spices' },
      { name: 'Swallows', slug: 'swallows', icon: '🥣', sortOrder: 5, description: 'Freshly made swallows to pair with your choice of soup' },
      { name: 'Shawarma', slug: 'shawarma', icon: '🌯', sortOrder: 6, description: 'Juicy, seasoned Shawarma wraps with single/double sausage choices' },
      { name: 'SAF Arabian Herbal Tea', slug: 'arabian-tea', icon: '🫖', sortOrder: 7, description: 'Authentic invigorating Arabian herbal tea in small and big jugs' },
      { name: 'Shisha', slug: 'shisha', icon: '💨', sortOrder: 8, description: 'Premium shisha pots and charcoal refills for the lounge' },
      { name: 'Spirits, Whiskeys & Wines', slug: 'spirits-wines', icon: '🍾', sortOrder: 9, description: 'Top-shelf cognac, whiskeys, champagnes, and fine wines' },
      { name: 'Shots', slug: 'shots', icon: '🥃', sortOrder: 10, description: 'Tequila, vodka, and whiskey shots' },
      { name: 'Beers, Stouts & Ciders', slug: 'beers-stouts', icon: '🍺', sortOrder: 11, description: 'Ice-cold premium beers, stouts, and ciders' },
      { name: 'Soft Drinks & Energy Drinks', slug: 'soft-drinks', icon: '🥤', sortOrder: 12, description: 'Chilled soft drinks, bitters, water, and energy boosters' },
      { name: 'Fresh Juices & Smoothies', slug: 'juices-smoothies', icon: '🍹', sortOrder: 13, description: 'Fresh natural juices and thick fruit smoothies' },
      { name: 'Mocktails (Non-Alcoholic)', slug: 'mocktails', icon: '🍸', sortOrder: 14, description: 'Artisan handcrafted zero-proof virgin cocktails' },
      { name: 'Cocktails (Alcoholic)', slug: 'cocktails', icon: '🥂', sortOrder: 15, description: 'Signature alcoholic mixes, classics, and tropical cocktails' },
      { name: 'Milkshakes & Shooters', slug: 'milkshakes-shooters', icon: '🍨', sortOrder: 16, description: 'Creamy milkshakes and fiery specialty shooters' },
    ];

    const createdCategories = await MenuCategory.insertMany(categoriesData);
    const catMap = new Map<string, mongoose.Types.ObjectId>(
      createdCategories.map((c) => [c.slug, c._id as mongoose.Types.ObjectId])
    );
    console.log(`✅ ${createdCategories.length} categories seeded.`);

    // 3. Seed Menu Items
    console.log('🍽️ Seeding Menu Items...');
    const itemsData: any[] = [
      // 1. Rice & Pastas
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Fried Rice',
        description: 'Seasoned golden fried rice cooked with mixed vegetables, liver bits, and herbs.',
        basePrice: 2300,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 2300, isDefault: true },
          { name: 'Big Pack', price: 2900 },
        ],
        tags: ['popular', 'rice', 'main'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Jollof Rice',
        description: 'Smoky, party-style Nigerian Jollof rice infused with rich tomato and pepper base.',
        basePrice: 2300,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 2300, isDefault: true },
          { name: 'Big Pack', price: 2900 },
        ],
        tags: ['popular', 'rice', 'smoky'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'White Rice',
        description: 'Steamed fragrant long-grain white rice. Pairs perfectly with our stew or pepper soups.',
        basePrice: 2300,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 2300, isDefault: true },
          { name: 'Big Pack', price: 2900 },
          { name: 'Family Pack', price: 3800 },
        ],
        tags: ['rice', 'staple'],
        sortOrder: 3,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Coconut Rice',
        description: 'Fragrant rice cooked in seasoned natural coconut milk and spices.',
        basePrice: 3300,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 3300, isDefault: true },
          { name: 'Big Pack', price: 3800 },
        ],
        tags: ['special', 'coconut', 'rice'],
        sortOrder: 4,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Village Rice',
        description: 'Native palm oil seasoned rice prepared with dried fish bits, scent leaf, and locust beans (iru).',
        basePrice: 3300,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 3300, isDefault: true },
          { name: 'Big Pack', price: 3800 },
        ],
        tags: ['native', 'traditional'],
        sortOrder: 5,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Vegetable Rice',
        description: 'Healthy stir-fried rice loaded with crunchy fresh vegetables and aromatics.',
        basePrice: 3800,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 3800, isDefault: true },
          { name: 'Big Pack', price: 4300 },
        ],
        tags: ['vegetable', 'rice'],
        sortOrder: 6,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Chinese Rice',
        description: 'Oriental style egg and vegetable wok-fried rice.',
        basePrice: 3800,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 3800, isDefault: true },
          { name: 'Big Pack', price: 4300 },
        ],
        tags: ['oriental', 'fried rice'],
        sortOrder: 7,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Asun Rice',
        description: 'Flavor-packed spicy rice infused with smoky peppered goat meat cuts (Asun).',
        basePrice: 3800,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 3800, isDefault: true },
          { name: 'Big Pack', price: 4300 },
        ],
        isChefSpecial: true,
        tags: ['spicy', 'asun', 'signature'],
        sortOrder: 8,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Caribbean Rice',
        description: 'Spiced island-style tropical rice cooked with sweet peppers and pineapple essence.',
        basePrice: 3800,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 3800, isDefault: true },
          { name: 'Big Pack', price: 4300 },
        ],
        tags: ['caribbean', 'special'],
        sortOrder: 9,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Jollof Spaghetti',
        description: 'Richly seasoned spaghetti pasta tossed in savory tomato pepper sauce.',
        basePrice: 2300,
        hasSizes: true,
        sizes: [
          { name: 'Single Pack', price: 2300, isDefault: true },
          { name: 'Jumbo Platter', price: 9200 },
        ],
        tags: ['pasta', 'spaghetti'],
        sortOrder: 10,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Milky Spaghetti',
        description: 'Creamy gourmet spaghetti cooked in seasoned rich cream sauce.',
        basePrice: 3800,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 3800, isDefault: true },
          { name: 'Big Pack', price: 4300 },
        ],
        tags: ['pasta', 'creamy'],
        sortOrder: 11,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Porridge Yam',
        description: 'Tender yam cubes slow-cooked in palm oil sauce with crayfish and greens.',
        basePrice: 2800,
        hasSizes: true,
        sizes: [
          { name: 'Small Pack', price: 2800, isDefault: true },
          { name: 'Big Pack', price: 3800 },
        ],
        tags: ['yam', 'traditional'],
        sortOrder: 12,
      },
      {
        categoryId: catMap.get('rice-pastas'),
        name: 'Porridge Beans (1 Spoon)',
        description: 'Slow-simmered honey beans in sweet palm oil broth.',
        basePrice: 1500,
        hasSizes: false,
        tags: ['beans', 'protein'],
        sortOrder: 13,
      },

      // 2. Proteins, Fish & Pepper Soups
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Turkey',
        description: 'Crispy fried or peppered jumbo turkey piece.',
        basePrice: 5000,
        tags: ['turkey', 'protein'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Chicken Lap',
        description: 'Seasoned succulent chicken quarter / drumstick.',
        basePrice: 4000,
        tags: ['chicken', 'protein'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Chicken Wings',
        description: 'Crispy glazed and peppered chicken wings portion.',
        basePrice: 5000,
        tags: ['chicken', 'wings'],
        sortOrder: 3,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Cow Leg',
        description: 'Tender slow-cooked cow leg portion in spicy sauce.',
        basePrice: 3000,
        tags: ['beef', 'cow leg'],
        sortOrder: 4,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Cowtail',
        description: 'Rich, flavorful, gelatinous cooked cowtail cut.',
        basePrice: 3000,
        tags: ['beef', 'cowtail'],
        sortOrder: 5,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Bush Meat',
        description: 'Exotic dried and peppered wild game delicacy.',
        basePrice: 10000,
        isChefSpecial: true,
        tags: ['bush meat', 'delicacy', 'premium'],
        sortOrder: 6,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Goat Meat',
        description: 'Succulent tender fried or peppered goat meat cut.',
        basePrice: 1000,
        tags: ['goat meat', 'meat'],
        sortOrder: 7,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Beef',
        description: 'Seasoned fried or boiled beef cut.',
        basePrice: 1000,
        tags: ['beef'],
        sortOrder: 8,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Kpomo',
        description: 'Chewy, tender soft cow skin simmered in pepper broth.',
        basePrice: 1000,
        tags: ['kpomo'],
        sortOrder: 9,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Assorted Meat',
        description: 'Mix of shaki, liver, kidney, and tender meat cuts.',
        basePrice: 1500,
        tags: ['assorted', 'meat'],
        sortOrder: 10,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Dried Fish',
        description: 'Traditional smoked and dried catfish piece.',
        basePrice: 3500,
        tags: ['fish', 'dried'],
        sortOrder: 11,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Kote Fish',
        description: 'Crispy fried Kote fish portion.',
        basePrice: 2000,
        tags: ['fish'],
        sortOrder: 12,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Titus Fish',
        description: 'Freshly fried spicy Titus (Mackerel) fish cut.',
        basePrice: 3000,
        tags: ['fish', 'titus'],
        sortOrder: 13,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Fried Catfish Tail / Head',
        description: 'Crispy deep-fried fresh catfish tail or head portion.',
        basePrice: 5000,
        tags: ['fish', 'catfish'],
        sortOrder: 14,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Fried Catfish Middle',
        description: 'Succulent fried center cut of fresh catfish.',
        basePrice: 4000,
        tags: ['fish', 'catfish'],
        sortOrder: 15,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Roasted Fish',
        description: 'Full whole roasted fresh catfish served with spicy roasted dip and chips.',
        basePrice: 8000,
        isChefSpecial: true,
        tags: ['roasted fish', 'special'],
        sortOrder: 16,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Asun (Spicy Goat Meat)',
        description: 'Smoky, fiery grilled goat meat diced and tossed with scotch bonnet habanero peppers.',
        basePrice: 5000,
        isChefSpecial: true,
        tags: ['asun', 'spicy', 'popular'],
        sortOrder: 17,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Assorted Pepper Soup',
        description: 'Steaming hot aromatic herbal broth cooked with assorted meat cuts.',
        basePrice: 5000,
        tags: ['peppersoup', 'spicy', 'hot'],
        sortOrder: 18,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Fresh Fish Pepper Soup',
        description: 'Fresh point-and-kill catfish simmered in hot traditional pepper soup spices.',
        basePrice: 4000,
        hasSizes: true,
        sizes: [
          { name: 'Standard Bowl', price: 4000, isDefault: true },
          { name: 'Jumbo Bowl', price: 5000 },
        ],
        tags: ['peppersoup', 'fish', 'signature'],
        sortOrder: 19,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Goat Meat Pepper Soup',
        description: 'Tender goat meat steeped in aromatic herbal pepper broth.',
        basePrice: 3000,
        tags: ['peppersoup', 'goat meat'],
        sortOrder: 20,
      },
      {
        categoryId: catMap.get('proteins-pepper-soups'),
        name: 'Egg / Egg Sauce / Moi Moi',
        description: 'Side protein options: boiled egg, seasoned egg sauce, or warm bean pudding.',
        basePrice: 500,
        hasSizes: true,
        sizes: [
          { name: 'Boiled Egg', price: 500, isDefault: true },
          { name: 'Egg Sauce', price: 1000 },
          { name: 'Moi Moi', price: 1000 },
        ],
        tags: ['egg', 'moimoi', 'side'],
        sortOrder: 21,
      },

      // 3. Sides & Local Delicacies
      {
        categoryId: catMap.get('sides-delicacies'),
        name: 'Isi Ewu',
        description: 'Authentic Eastern spiced goat head delicacy simmered in rich potash-infused palm oil paste and utazi leaves.',
        basePrice: 10000,
        isChefSpecial: true,
        tags: ['isi ewu', 'delicacy', 'signature'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('sides-delicacies'),
        name: 'Nkwobi',
        description: 'Tender cow foot cuts tossed in savory seasoned palm oil paste, garnished with onion rings and utazi.',
        basePrice: 10000,
        isChefSpecial: true,
        tags: ['nkwobi', 'delicacy', 'signature'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('sides-delicacies'),
        name: 'Cow Head Special',
        description: 'Tender spiced cow head meat portion in savory sauce.',
        basePrice: 5000,
        tags: ['cow head', 'delicacy'],
        sortOrder: 3,
      },
      {
        categoryId: catMap.get('sides-delicacies'),
        name: 'Fried Plantain (Dodo)',
        description: 'Sweet, golden-fried ripe plantain slices.',
        basePrice: 1000,
        tags: ['plantain', 'dodo', 'side'],
        sortOrder: 4,
      },
      {
        categoryId: catMap.get('sides-delicacies'),
        name: 'Fresh Salad (1 Portion)',
        description: 'Crisp vegetable coleslaw salad with salad cream dressing.',
        basePrice: 500,
        tags: ['salad', 'side'],
        sortOrder: 5,
      },
      {
        categoryId: catMap.get('sides-delicacies'),
        name: 'Takeaway Pack',
        description: 'Heavy-duty food container and packaging bag.',
        basePrice: 300,
        tags: ['packaging'],
        sortOrder: 6,
      },

      // 4. Soups (Without Protein)
      {
        categoryId: catMap.get('soups'),
        name: 'Okro Soup',
        description: 'Freshly grated okro soup cooked with crayfish and natural spices.',
        basePrice: 1600,
        tags: ['soup', 'okro'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('soups'),
        name: 'Egusi Soup',
        description: 'Rich melon seed soup prepared with bitterleaf, spinach greens, and palm oil.',
        basePrice: 1600,
        tags: ['soup', 'egusi'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('soups'),
        name: 'Ogbono Soup',
        description: 'Traditional draw soup made with wild mango seeds and aromatics.',
        basePrice: 1600,
        tags: ['soup', 'ogbono'],
        sortOrder: 3,
      },
      {
        categoryId: catMap.get('soups'),
        name: 'Vegetable Soup / Bitterleaf / Oha',
        description: 'Authentic Nigerian vegetable soups: fresh green Vegetable, traditional Bitterleaf, or tender Oha soup.',
        basePrice: 1900,
        hasSizes: true,
        sizes: [
          { name: 'Vegetable Soup', price: 1900, isDefault: true },
          { name: 'Bitterleaf Soup', price: 1900 },
          { name: 'Oha Soup', price: 1900 },
        ],
        tags: ['soup', 'greens'],
        sortOrder: 4,
      },
      {
        categoryId: catMap.get('soups'),
        name: 'Efo Riro / Vegetable Okro / Afang',
        description: 'Rich leafy soups cooked in locust beans, crayfish, and assorted spices.',
        basePrice: 2500,
        hasSizes: true,
        sizes: [
          { name: 'Efo Riro', price: 2500, isDefault: true },
          { name: 'Vegetable Okro', price: 2500 },
          { name: 'Afang Soup', price: 2500 },
        ],
        tags: ['soup', 'efo riro', 'afang'],
        sortOrder: 5,
      },
      {
        categoryId: catMap.get('soups'),
        name: 'White Soup (Ofe Nsala)',
        description: 'Aromatic Igbo delicacy white soup cooked with utazi and yam thickener.',
        basePrice: 2900,
        tags: ['soup', 'white soup', 'nsala'],
        sortOrder: 6,
      },
      {
        categoryId: catMap.get('soups'),
        name: 'Banga Soup (Delta Palm Nut)',
        description: 'Rich palm nut fruit concentrate simmered with oburunbebe stick and Delta herbs.',
        basePrice: 8000,
        isChefSpecial: true,
        tags: ['soup', 'banga', 'specialty'],
        sortOrder: 7,
      },
      {
        categoryId: catMap.get('soups'),
        name: 'Fisherman Soup',
        description: 'Luxurious Rivers-style seafood broth loaded with crab, prawns, fish, and periwinkles.',
        basePrice: 15000,
        isChefSpecial: true,
        tags: ['soup', 'seafood', 'fisherman', 'luxury'],
        sortOrder: 8,
      },
      {
        categoryId: catMap.get('soups'),
        name: 'Seafood Okro',
        description: 'Gourmet fresh okro soup cooked with jumbo prawns, calamari, crabs, and fish.',
        basePrice: 15000,
        isChefSpecial: true,
        tags: ['soup', 'seafood', 'luxury'],
        sortOrder: 9,
      },

      // 5. Swallows
      {
        categoryId: catMap.get('swallows'),
        name: 'Semo / Garri (Eba)',
        description: 'Smooth hot Semovita or yellow cassava Garri (Eba).',
        basePrice: 300,
        hasSizes: true,
        sizes: [
          { name: 'Semo', price: 300, isDefault: true },
          { name: 'Garri (Eba)', price: 300 },
        ],
        tags: ['swallow', 'eba', 'semo'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('swallows'),
        name: 'Pounded Yam / Fufu / Starch / Wheat',
        description: 'Freshly made Pounded Yam, tender Fufu, Delta Starch, or healthy Wheat swallow.',
        basePrice: 500,
        hasSizes: true,
        sizes: [
          { name: 'Pounded Yam', price: 500, isDefault: true },
          { name: 'Fufu', price: 500 },
          { name: 'Starch', price: 500 },
          { name: 'Wheat', price: 500 },
        ],
        tags: ['swallow', 'pounded yam'],
        sortOrder: 2,
      },

      // 6. Shawarma
      {
        categoryId: catMap.get('shawarma'),
        name: 'Chicken Shawarma',
        description: 'Shredded seasoned grilled chicken breast wrapped in warm pita bread with crunchy cabbage and cream sauce.',
        basePrice: 2900,
        hasSizes: true,
        sizes: [
          { name: 'No Sausage', price: 2900 },
          { name: 'Single Sausage', price: 3000, isDefault: true },
          { name: 'Double Sausage', price: 3200 },
        ],
        optionGroups: [
          {
            name: 'Spice Level',
            required: false,
            selectionType: OptionSelectionType.SingleSelect,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { name: 'Mild / Not Spicy', extraPrice: 0, isAvailable: true },
              { name: 'Medium Spicy', extraPrice: 0, isAvailable: true },
              { name: 'Extra Spicy 🔥', extraPrice: 0, isAvailable: true },
            ],
          },
          {
            name: 'Extra Add-ons',
            required: false,
            selectionType: OptionSelectionType.MultiSelect,
            minSelections: 0,
            maxSelections: 2,
            options: [
              { name: 'Extra Cheese', extraPrice: 500, isAvailable: true },
              { name: 'Extra Cream Sauce', extraPrice: 300, isAvailable: true },
            ],
          },
        ],
        tags: ['shawarma', 'chicken', 'popular'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('shawarma'),
        name: 'Beef Shawarma',
        description: 'Succulent seasoned grilled beef strips wrapped with cream and spices.',
        basePrice: 2900,
        hasSizes: true,
        sizes: [
          { name: 'No Sausage', price: 2900 },
          { name: 'Single Sausage', price: 3000, isDefault: true },
          { name: 'Double Sausage', price: 3200 },
        ],
        tags: ['shawarma', 'beef'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('shawarma'),
        name: 'Goat Meat Shawarma',
        description: 'Signature smoky grilled goat meat chunks wrapped in flatbread with tangy cream sauce.',
        basePrice: 4000,
        isChefSpecial: true,
        tags: ['shawarma', 'goat meat', 'signature'],
        sortOrder: 3,
      },

      // 7. SAF Arabian Herbal Tea
      {
        categoryId: catMap.get('arabian-tea'),
        name: 'Normal Arabian Herbal Tea',
        description: 'Invigorating fragrant herbal tea infused with natural Middle Eastern botanicals and honey.',
        basePrice: 3000,
        hasSizes: true,
        sizes: [
          { name: 'Small Jug', price: 3000, isDefault: true },
          { name: 'Big Jug', price: 4000 },
        ],
        tags: ['tea', 'arabian', 'hot', 'wellness'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('arabian-tea'),
        name: 'Double Double Arabian Herbal Tea',
        description: 'Potent double-strength blend of exotic spices, mint, and restorative Arabian roots.',
        basePrice: 4000,
        hasSizes: true,
        sizes: [
          { name: 'Small Jug', price: 4000, isDefault: true },
          { name: 'Big Jug', price: 5000 },
        ],
        isChefSpecial: true,
        tags: ['tea', 'double double', 'signature'],
        sortOrder: 2,
      },

      // 8. Shisha
      {
        categoryId: catMap.get('shisha'),
        name: 'Shisha (Complete Pot)',
        description: 'Premium hookah pot served with your choice of flavor and fresh burning coals.',
        basePrice: 8000,
        optionGroups: [
          {
            name: 'Choice of Flavor',
            required: false,
            selectionType: OptionSelectionType.SingleSelect,
            options: [
              { name: 'Mint & Grape', extraPrice: 0, isAvailable: true },
              { name: 'Double Apple', extraPrice: 0, isAvailable: true },
              { name: 'Blueberry Splash', extraPrice: 0, isAvailable: true },
              { name: 'Love 66', extraPrice: 0, isAvailable: true },
              { name: 'Watermelon Mint', extraPrice: 0, isAvailable: true },
            ],
          },
        ],
        tags: ['shisha', 'hookah', 'lounge'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('shisha'),
        name: 'Extra Coal Refill',
        description: 'Fresh glowing coconut briquette coals for your shisha pot.',
        basePrice: 500,
        tags: ['shisha', 'coal'],
        sortOrder: 2,
      },

      // 9. Spirits, Whiskeys, Wines & Champagnes
      {
        categoryId: catMap.get('spirits-wines'),
        name: 'Martell Blue Swift (Bottle)',
        description: 'Cognac VSOP finished in Kentucky bourbon casks.',
        basePrice: 130000,
        tags: ['cognac', 'bottle', 'luxury'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('spirits-wines'),
        name: 'Martell V.S (Bottle)',
        description: 'Harmonious blend of rich fruity and woody notes.',
        basePrice: 90000,
        tags: ['cognac', 'bottle'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('spirits-wines'),
        name: 'Chivas Regal 15yrs / Jameson Black',
        description: 'Smooth blended Scotch or triple-distilled Irish whiskey aged in double-charred barrels.',
        basePrice: 65000,
        hasSizes: true,
        sizes: [
          { name: 'Chivas Regal 15yrs', price: 65000, isDefault: true },
          { name: 'Jameson Black Barrel', price: 65000 },
        ],
        tags: ['whiskey', 'bottle'],
        sortOrder: 3,
      },
      {
        categoryId: catMap.get('spirits-wines'),
        name: 'Monkey Shoulder / Black Label',
        description: 'Premium blended malt whiskey / Johnnie Walker Black Label 12yo.',
        basePrice: 55000,
        hasSizes: true,
        sizes: [
          { name: 'Monkey Shoulder', price: 55000, isDefault: true },
          { name: 'Black Label', price: 55000 },
        ],
        tags: ['whiskey', 'bottle'],
        sortOrder: 4,
      },
      {
        categoryId: catMap.get('spirits-wines'),
        name: 'Campari / Absolut Vodka / Olmeca Tequila',
        description: 'Top-shelf aperitif, Swedish vodka, or Mexican blue agave tequila bottle.',
        basePrice: 40000,
        hasSizes: true,
        sizes: [
          { name: 'Campari (Bottle)', price: 40000, isDefault: true },
          { name: 'Absolut Vodka', price: 40000 },
          { name: 'Olmeca Tequila', price: 40000 },
        ],
        tags: ['spirits', 'bottle'],
        sortOrder: 5,
      },
      {
        categoryId: catMap.get('spirits-wines'),
        name: 'Baileys / Jack Daniel’s / Red Label',
        description: 'Irish cream liqueur, Tennessee whiskey, or Johnnie Walker Red Label.',
        basePrice: 35000,
        hasSizes: true,
        sizes: [
          { name: 'Baileys Irish Cream', price: 35000, isDefault: true },
          { name: 'Jack Daniel’s Old No. 7', price: 35000 },
          { name: 'Red Label', price: 35000 },
        ],
        tags: ['whiskey', 'cream'],
        sortOrder: 6,
      },
      {
        categoryId: catMap.get('spirits-wines'),
        name: 'American Honey / Jameson Green / William Lawson',
        description: 'Honey bourbon, classic Jameson Irish whiskey, or Scottish blended whiskey.',
        basePrice: 30000,
        hasSizes: true,
        sizes: [
          { name: 'American Honey', price: 30000, isDefault: true },
          { name: 'Jameson Green', price: 30000 },
          { name: 'William Lawson', price: 30000 },
        ],
        tags: ['whiskey'],
        sortOrder: 7,
      },
      {
        categoryId: catMap.get('spirits-wines'),
        name: 'Fine Wines: Baron Romero / Carlo Rossi / 4th Street / Agor',
        description: 'Smooth red and sweet wines to accompany your dinner.',
        basePrice: 20000,
        hasSizes: true,
        sizes: [
          { name: 'Baron Romero', price: 20000, isDefault: true },
          { name: 'Baron de Valls', price: 20000 },
          { name: 'Carlo Rossi / Ice', price: 20000 },
          { name: 'Four Cousins', price: 20000 },
          { name: 'Agor Sweet Wine', price: 20000 },
          { name: '4th Street (White / Red)', price: 20000 },
        ],
        tags: ['wine', 'bottle'],
        sortOrder: 8,
      },

      // 10. Shots
      {
        categoryId: catMap.get('shots'),
        name: 'Tequila / Vodka / Whiskey Shot',
        description: 'Single premium shot poured fresh at the bar.',
        basePrice: 3000,
        hasSizes: true,
        sizes: [
          { name: 'Olmeca Tequila Shot', price: 3000, isDefault: true },
          { name: 'Vodka Shot', price: 3000 },
          { name: 'Whiskey Shot', price: 3000 },
        ],
        tags: ['shot', 'spirits'],
        sortOrder: 1,
      },

      // 11. Beers, Stouts & Ciders
      {
        categoryId: catMap.get('beers-stouts'),
        name: 'Heineken / Legend Extra Stout',
        description: 'Ice-cold premium international lager or rich extra stout.',
        basePrice: 1800,
        hasSizes: true,
        sizes: [
          { name: 'Heineken', price: 1800, isDefault: true },
          { name: 'Legend Extra Stout', price: 1800 },
        ],
        tags: ['beer', 'heineken'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('beers-stouts'),
        name: 'Guinness Stout / Double Black',
        description: 'Iconic Nigerian Guinness Big Stout or Smirnoff Double Black bottle/can.',
        basePrice: 2000,
        hasSizes: true,
        sizes: [
          { name: 'Big Stout', price: 2000, isDefault: true },
          { name: 'Smirnoff Ice', price: 2000 },
          { name: 'Double Black (Bottle)', price: 2000 },
          { name: 'Double Black (Can)', price: 3500 },
        ],
        tags: ['stout', 'beer'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('beers-stouts'),
        name: 'Lager Beers: Gulder / Star / Life / Goldberg / Desperados',
        description: 'Classic crisp lager beers served ice-cold.',
        basePrice: 1500,
        hasSizes: true,
        sizes: [
          { name: 'Gulder', price: 1500, isDefault: true },
          { name: 'Star Lager', price: 1500 },
          { name: 'Life Continental', price: 1500 },
          { name: 'Goldberg', price: 1500 },
          { name: 'Goldberg Black', price: 1500 },
          { name: 'Origin Beer', price: 1500 },
          { name: 'Desperados', price: 1500 },
          { name: 'Castle Lite', price: 1500 },
          { name: 'Budweiser', price: 1500 },
        ],
        tags: ['beer', 'lager'],
        sortOrder: 3,
      },

      // 12. Soft Drinks & Energy Drinks
      {
        categoryId: catMap.get('soft-drinks'),
        name: 'Pure Bottled Water',
        description: 'Chilled premium table water.',
        basePrice: 300,
        tags: ['water', 'cold'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('soft-drinks'),
        name: 'Soft Drinks: Coke / Pepsi / Maltina / Amstel',
        description: 'Chilled refreshing sodas and malts.',
        basePrice: 800,
        hasSizes: true,
        sizes: [
          { name: 'Coke / Pepsi', price: 800, isDefault: true },
          { name: 'Amstel Malt / Maltina / Fayrouz', price: 1000 },
        ],
        tags: ['soda', 'soft drink'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('soft-drinks'),
        name: 'Energy Drinks (Red Bull / Fearless / Bullet / Climax)',
        description: 'Chilled invigorating energy cans.',
        basePrice: 2500,
        tags: ['energy drink'],
        sortOrder: 3,
      },

      // 13. Fresh Juices & Smoothies
      {
        categoryId: catMap.get('juices-smoothies'),
        name: 'Zobo Drink / Tiger Nut',
        description: 'Fresh chilled hibiscus Zobo infused with cloves and pineapple or creamy Tiger Nut milk.',
        basePrice: 1000,
        hasSizes: true,
        sizes: [
          { name: 'Zobo Drink', price: 1000, isDefault: true },
          { name: 'Tiger Nut Milk', price: 1500 },
        ],
        tags: ['zobo', 'tigernut', 'fresh'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('juices-smoothies'),
        name: 'Fresh Pressed Juice',
        description: '100% freshly pressed Orange, Watermelon, or Mixed Fruit Juice.',
        basePrice: 2000,
        tags: ['juice', 'fresh'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('juices-smoothies'),
        name: 'Mix Fruit Smoothies',
        description: 'Creamy cold blended smoothies: Pineapple-Banana-Ginger-Apple / Watermelon-Banana-Avocado / Banana-Coconut Milk-Pineapple.',
        basePrice: 6500,
        isChefSpecial: true,
        tags: ['smoothie', 'healthy'],
        sortOrder: 3,
      },

      // 14. Mocktails (Non-Alcoholic)
      {
        categoryId: catMap.get('mocktails'),
        name: 'Chapman (Signature Nigerian)',
        description: 'Fanta, 7Up, grenadine syrup, Angostura bitters, cucumber, and orange slices.',
        basePrice: 5500,
        isChefSpecial: true,
        tags: ['mocktail', 'chapman', 'popular'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('mocktails'),
        name: 'Virgin Pina Colada',
        description: 'Rich coconut cream, sweet pineapple juice, topped with whipped cream.',
        basePrice: 5500,
        tags: ['mocktail', 'pina colada'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('mocktails'),
        name: 'Virgin Mojito / Minted Lemonade',
        description: 'Fresh crushed mint leaves, lime juice, simple syrup, and sparkling soda.',
        basePrice: 5500,
        tags: ['mocktail', 'mojito'],
        sortOrder: 3,
      },
      {
        categoryId: catMap.get('mocktails'),
        name: 'Virgin Strawberry Daiquiri',
        description: 'Fresh blended strawberries, tangy lime juice, and sweet simple syrup.',
        basePrice: 7000,
        isChefSpecial: true,
        tags: ['mocktail', 'strawberry'],
        sortOrder: 4,
      },

      // 15. Cocktails (Alcoholic)
      {
        categoryId: catMap.get('cocktails'),
        name: 'Long Island Iced Tea',
        description: 'Tequila, vodka, white rum, triple sec, gin, sweet sour mix, and a splash of cola.',
        basePrice: 6500,
        isChefSpecial: true,
        tags: ['cocktail', 'strong', 'popular'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('cocktails'),
        name: 'Margarita / Strawberry Margarita',
        description: 'Tequila, triple sec, fresh lime juice with salted rim (optionally blended with fresh strawberry).',
        basePrice: 6500,
        tags: ['cocktail', 'margarita'],
        sortOrder: 2,
      },
      {
        categoryId: catMap.get('cocktails'),
        name: 'Pina Colada (Rum)',
        description: 'White rum, coconut cream, pineapple juice, and coconut syrup.',
        basePrice: 6500,
        tags: ['cocktail', 'tropical'],
        sortOrder: 3,
      },
      {
        categoryId: catMap.get('cocktails'),
        name: 'Sex on the Beach / Cosmopolitan',
        description: 'Vodka, peach schnapps, cranberry juice, orange juice / Vodka, triple sec, cranberry, lime.',
        basePrice: 6500,
        tags: ['cocktail', 'classic'],
        sortOrder: 4,
      },
      {
        categoryId: catMap.get('cocktails'),
        name: 'Whiskey Sour / Negroni / Old Fashioned',
        description: 'Bar master classics: Bourbon/Whiskey, citrus, bitters, or Gin, Campari, Sweet Vermouth.',
        basePrice: 6500,
        tags: ['cocktail', 'classic', 'whiskey'],
        sortOrder: 5,
      },

      // 16. Milkshakes & Shooters
      {
        categoryId: catMap.get('milkshakes-shooters'),
        name: 'Oreo Shake Special / Strawberry Shake',
        description: 'Thick dairy ice cream, whole skimmed milk, blended with crunchy Oreo cookies or strawberries.',
        basePrice: 5500,
        hasSizes: true,
        sizes: [
          { name: 'Oreo Shake Special', price: 5500, isDefault: true },
          { name: 'Strawberry Shake', price: 5500 },
          { name: 'Vanilla / Banana Shake', price: 5500 },
        ],
        tags: ['milkshake', 'dessert'],
        sortOrder: 1,
      },
      {
        categoryId: catMap.get('milkshakes-shooters'),
        name: 'Flaming Lamborghini / Slippery Nipple Shooter',
        description: 'Sambuca, coffee liqueur, blue curacao, and Baileys layered shooter.',
        basePrice: 5500,
        hasSizes: true,
        sizes: [
          { name: 'Flaming Lamborghini', price: 5500, isDefault: true },
          { name: 'Slippery Nipple', price: 5500 },
        ],
        isChefSpecial: true,
        tags: ['shooter', 'shot'],
        sortOrder: 2,
      },
    ];

    await MenuItem.insertMany(itemsData);
    console.log(`✅ ${itemsData.length} menu items successfully seeded.`);

    // 4. Seed Promotional Banners
    console.log('🖼️ Seeding Banners...');
    await Banner.deleteMany({});
    await Banner.create([
      {
        title: 'Welcome to Lina Restaurant & Bar',
        subtitle: 'Experience exquisite African gastronomy, Arabian teas, and luxury lounge ambiance in Gwarinpa.',
        bannerType: BannerType.Announcement,
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Chef Special: Asun & Smoky Jollof',
        subtitle: 'Pair our famous spicy goat meat with authentic party jollof rice today!',
        bannerType: BannerType.MealPromo,
        isActive: true,
        sortOrder: 2,
      },
      {
        title: 'Lounge Night & Shisha Sessions',
        subtitle: 'Relax with handcrafted cocktails and complete shisha pots every evening.',
        bannerType: BannerType.SpecialDiscount,
        isActive: true,
        sortOrder: 3,
      },
    ]);
    console.log('✅ Banners seeded.');

    console.log('🎉 Seeding complete! Database is fully initialized.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
