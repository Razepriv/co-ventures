require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const investmentData = {
  'contemporary-eco-villa-bangalore': {
    investment_type: 'fractional',
    total_investment_amount: 24500000,
    minimum_investment: 500000,
    maximum_investment: 5000000,
    investment_slots: 100,
    expected_roi_percentage: 12.5,
    investment_duration_months: 36,
    rental_yield_percentage: 4.5,
    appreciation_rate: 8.0,
    estimated_monthly_rental: 80000,
    maintenance_charges: 8000,
    property_tax: 50000,
    investment_highlights: [
      'Prime location in Koramangala',
      'High rental demand from IT professionals',
      'Excellent connectivity to tech parks',
      'Sustainable eco-friendly features',
      'Expected 12.5% annual returns'
    ],
    developer_name: 'Prestige Group',
    years_of_experience: 35,
    total_projects: 280,
    rera_number: 'PRM/KA/RERA/1251/309/PR/171114/001800',
    legal_status: 'verified',
    super_area_sqft: 4500,
    carpet_area_sqft: 3800
  },
  'skyline-penthouse-mumbai': {
    investment_type: 'fractional',
    total_investment_amount: 18750000,
    minimum_investment: 1000000,
    maximum_investment: 10000000,
    investment_slots: 75,
    expected_roi_percentage: 11.0,
    investment_duration_months: 48,
    rental_yield_percentage: 3.8,
    appreciation_rate: 7.5,
    estimated_monthly_rental: 120000,
    maintenance_charges: 12000,
    property_tax: 75000,
    investment_highlights: [
      'Premium location in Nariman Point',
      '360-degree skyline views',
      'Rooftop infinity pool access',
      '24/7 concierge service',
      'Strong appreciation potential'
    ],
    developer_name: 'Lodha Group',
    years_of_experience: 40,
    total_projects: 150,
    rera_number: 'P51900018765',
    legal_status: 'verified',
    super_area_sqft: 3100,
    carpet_area_sqft: 2500
  },
  'colonial-estate-hyderabad': {
    investment_type: 'full',
    total_investment_amount: 9500000,
    minimum_investment: 9500000,
    expected_roi_percentage: 10.5,
    investment_duration_months: 60,
    rental_yield_percentage: 5.2,
    appreciation_rate: 6.5,
    estimated_monthly_rental: 45000,
    maintenance_charges: 5000,
    property_tax: 30000,
    investment_highlights: [
      'Near international schools',
      'Family-friendly neighborhood',
      'Large plot with garden',
      'Excellent for rental income',
      'Steady appreciation zone'
    ],
    developer_name: 'Modi Builders',
    years_of_experience: 25,
    total_projects: 85,
    rera_number: 'P02400001234',
    legal_status: 'verified',
    super_area_sqft: 3800,
    carpet_area_sqft: 3200
  },
  'oceanfront-retreat-goa': {
    investment_type: 'fractional',
    total_investment_amount: 31000000,
    minimum_investment: 2000000,
    maximum_investment: 15000000,
    investment_slots: 50,
    expected_roi_percentage: 14.0,
    investment_duration_months: 36,
    rental_yield_percentage: 6.5,
    appreciation_rate: 9.0,
    estimated_monthly_rental: 200000,
    maintenance_charges: 20000,
    property_tax: 80000,
    investment_highlights: [
      'Beachfront property with direct access',
      'High demand vacation rental',
      'Separate guest cottage',
      'Premium Goa real estate',
      'Year-round tourist attraction'
    ],
    developer_name: 'Peninsula Land',
    years_of_experience: 30,
    total_projects: 45,
    rera_number: 'PRGO01232024',
    legal_status: 'verified',
    super_area_sqft: 5500,
    carpet_area_sqft: 4800
  },
  'heritage-home-pondicherry': {
    investment_type: 'equity',
    total_investment_amount: 4500000,
    minimum_investment: 450000,
    maximum_investment: 2000000,
    investment_slots: 20,
    expected_roi_percentage: 18.0,
    investment_duration_months: 24,
    rental_yield_percentage: 4.0,
    appreciation_rate: 15.0,
    estimated_monthly_rental: 25000,
    maintenance_charges: 3000,
    property_tax: 15000,
    investment_highlights: [
      'Historic 1920s architecture',
      'Located in gentrifying arts district',
      'Restoration value-add opportunity',
      'Unique heritage property',
      'High appreciation potential'
    ],
    developer_name: 'Heritage Restorations',
    years_of_experience: 15,
    total_projects: 25,
    rera_number: 'PRPY00789',
    legal_status: 'pending',
    super_area_sqft: 2000,
    carpet_area_sqft: 1650
  }
};

async function updateProperties() {
  console.log('🔄 Updating properties with investment data...\n');

  try {
    // Fetch all properties
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, slug');

    if (error) throw error;

    for (const property of properties) {
      const updates = investmentData[property.slug];
      if (updates) {
        console.log(`📝 Updating: ${property.slug}`);
        
        const { error: updateError } = await supabase
          .from('properties')
          .update(updates)
          .eq('id', property.id);

        if (updateError) {
          console.error(`   ❌ Error:`, updateError.message);
        } else {
          console.log(`   ✅ Updated successfully`);
        }
      }
    }

    console.log('\n✅ All properties updated with investment data!');
    console.log('\n📊 Added fields:');
    console.log('   - Investment type & amounts');
    console.log('   - ROI & yield percentages');
    console.log('   - Investment highlights');
    console.log('   - Developer information');
    console.log('   - RERA numbers');
    console.log('\n🌐 View properties at: http://localhost:3000/properties\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateProperties();
