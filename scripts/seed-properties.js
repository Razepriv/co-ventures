require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample images from Unsplash (high-quality real estate photos)
const propertyImages = {
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
  ],
  penthouse: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
  ],
  suburban: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
  ],
  beach: [
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800'
  ],
  heritage: [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800'
  ]
};

const properties = [
  {
    title: 'Contemporary Eco-Villa with Private Grove',
    slug: 'contemporary-eco-villa-bangalore',
    price: 2450000,
    description: 'Experience the pinnacle of modern living in this architecturally stunning 4-bedroom villa. Featuring floor-to-ceiling glass walls that blur the line between indoor luxury and outdoor serenity, this home includes a sustainable rain-harvesting system, a chef\'s kitchen with smart appliances, and a landscaped Zen garden. Perfect for those seeking privacy in the heart of the city.\n\nAddress: 124 Green Leaf Avenue, 4th Block, 560034\nYear Built: 2024\nParking: 2 Cars',
    city: 'Bangalore',
    location: '4th Block, Koramangala',
    state: 'Karnataka',
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 4200,
    property_type: 'Villa',
    bhk_type: '4BHK',
    status: 'available',
    is_featured: true,
    amenities: ['Air Conditioning', 'Swimming Pool', 'Home Theater', 'Smart Home System', 'Solar Panels'],
    images: propertyImages.villa,
    categoryName: 'Luxury'
  },
  {
    title: 'Skyline Penthouse with Panoramic Views',
    slug: 'skyline-penthouse-mumbai',
    price: 1875000,
    description: 'A breathtaking penthouse located on the 45th floor, offering 360-degree views of the metropolitan skyline. This open-concept residence features imported Italian marble flooring, a wrap-around terrace, and private elevator access. Residents enjoy exclusive access to the rooftop infinity pool and a 24/7 concierge service.\n\nAddress: The Aurora Tower, Unit 45B, 400001\nYear Built: 2023\nParking: 3 Underground Spaces',
    city: 'Mumbai',
    location: 'Nariman Point',
    state: 'Maharashtra',
    bedrooms: 3,
    bathrooms: 3.5,
    area_sqft: 2800,
    property_type: 'Apartment',
    bhk_type: '3BHK',
    status: 'available',
    is_featured: true,
    amenities: ['Gym', 'Elevator', 'Concierge', 'Spa/Jacuzzi', 'Central Heating'],
    images: propertyImages.penthouse,
    categoryName: 'Luxury'
  },
  {
    title: 'Spacious Colonial Estate near International School',
    slug: 'colonial-estate-hyderabad',
    price: 950000,
    description: 'The perfect sanctuary for a growing family. This charming estate sits on a half-acre lot and features a renovated kitchen with a large island, a cozy fireplace in the living room, and a backyard engineered for entertainment with a BBQ pit and playground. Located within walking distance of top-rated schools and parks.\n\nAddress: 88 Willow Creek Drive, 500033\nYear Built: 2015\nParking: 2 Cars',
    city: 'Hyderabad',
    location: 'Banjara Hills',
    state: 'Telangana',
    bedrooms: 5,
    bathrooms: 4,
    area_sqft: 3500,
    property_type: 'House',
    bhk_type: '5BHK',
    status: 'available',
    is_featured: true,
    amenities: ['Laundry Room', 'Lawn', 'Fireplace', 'Barbeque Area', 'WiFi'],
    images: propertyImages.suburban,
    categoryName: 'Residential'
  },
  {
    title: 'Oceanfront Retreat with Direct Beach Access',
    slug: 'oceanfront-retreat-goa',
    price: 3100000,
    description: 'Wake up to the sound of waves in this pristine beachfront property. Designed for relaxation, the home features a breezy open layout, natural stone finishes, and expansive decks on every level. Includes a separate guest cottage and storage for water sports equipment. An ideal investment for vacation rentals or a retirement paradise.\n\nAddress: 404 Coastal Highway, 403509\nYear Built: 2022\nParking: 4 Cars',
    city: 'Goa',
    location: 'Candolim Beach',
    state: 'Goa',
    bedrooms: 6,
    bathrooms: 6,
    area_sqft: 5100,
    property_type: 'Villa',
    bhk_type: '6BHK',
    status: 'available',
    is_featured: true,
    amenities: ['Swimming Pool', 'Ocean View', 'Guest House', 'Outdoor Shower', 'Alarm'],
    images: propertyImages.beach,
    categoryName: 'Vacation'
  },
  {
    title: 'Historic Heritage Home - Investment Opportunity',
    slug: 'heritage-home-pondicherry',
    price: 450000,
    description: 'A rare opportunity to restore a piece of history. This 1920s bungalow retains its original teak wood frames, mosaic flooring, and high ceilings. While it requires renovation, the structure is solid and located in a rapidly gentrifying arts district. Massive potential for value appreciation or conversion into a boutique cafe/gallery.\n\nAddress: 22 Old French Colony, 605001\nYear Built: 1925\nParking: Street Parking',
    city: 'Pondicherry',
    location: 'White Town',
    state: 'Puducherry',
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1800,
    property_type: 'House',
    bhk_type: '3BHK',
    status: 'available',
    is_featured: true,
    amenities: ['High Ceilings', 'Garden', 'Historic Status', 'Balcony'],
    images: propertyImages.heritage,
    categoryName: 'Investment'
  }
];

async function seedProperties() {
  console.log('🌱 Starting property seeding...\n');

  try {
    // Get or create a user_id (we'll use the first admin user or any user)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);

    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }

    let userId;
    if (users && users.length > 0) {
      userId = users[0].id;
      console.log(`✅ Using user: ${users[0].email} (${users[0].role || 'user'})`);
    } else {
      console.error('❌ No users found in database. Please create a user first.');
      console.log('   You can sign up at: http://localhost:3000/auth/signup');
      return;
    }

    for (const property of properties) {
      console.log(`\n📍 Adding: ${property.title}`);

      // Check if property already exists
      const { data: existing } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', property.slug)
        .single();

      if (existing) {
        console.log('   ⚠️  Property already exists, skipping...');
        continue;
      }

      // Get or create category
      let categoryId;
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', property.categoryName)
        .single();

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // Create category if it doesn't exist
        const { data: newCategory, error: catError } = await supabase
          .from('categories')
          .insert({ name: property.categoryName, slug: property.categoryName.toLowerCase() })
          .select()
          .single();
        
        if (catError) {
          console.error(`   ❌ Error creating category:`, catError);
          continue;
        }
        categoryId = newCategory.id;
        console.log(`   ✅ Created category: ${property.categoryName}`);
      }

      // Insert property
      const propertyData = {
        title: property.title,
        slug: property.slug,
        price: property.price,
        description: property.description,
        city: property.city,
        location: property.location,
        state: property.state,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqft: property.area_sqft,
        property_type: property.property_type,
        bhk_type: property.bhk_type,
        status: property.status,
        is_featured: property.is_featured,
        amenities: property.amenities,
        category_id: categoryId,
        user_id: userId,
        featured_image: property.images[0]
      };

      const { data: insertedProperty, error: propertyError } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (propertyError) {
        console.error(`   ❌ Error inserting property:`, propertyError);
        continue;
      }

      console.log(`   ✅ Property created with ID: ${insertedProperty.id}`);

      // Insert property images
      const imageRecords = property.images.map((url, index) => ({
        property_id: insertedProperty.id,
        image_url: url,
        display_order: index,
        is_primary: index === 0
      }));

      const { error: imagesError } = await supabase
        .from('property_images')
        .insert(imageRecords);

      if (imagesError) {
        console.error(`   ❌ Error inserting images:`, imagesError);
      } else {
        console.log(`   ✅ Added ${property.images.length} images`);
      }
    }

    console.log('\n\n🎉 Property seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Properties added: ${properties.length}`);
    console.log(`   - All marked as featured: Yes`);
    console.log(`   - Status: Available`);
    console.log('\n🔗 Check your website:');
    console.log('   - Home page: http://localhost:3000 (Featured Properties section)');
    console.log('   - Properties page: http://localhost:3000/properties');
    console.log('   - Admin panel: http://localhost:3000/admin/properties\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

seedProperties();
