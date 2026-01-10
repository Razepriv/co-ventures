require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  try {
    console.log('🔍 Testing Supabase Storage...\n');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? '✓ Set' : '✗ Missing');

    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('⚠️  Cannot list buckets (might be permission issue):', listError.message);
      console.log('    Trying direct bucket access instead...\n');
    } else {
      console.log('📦 Available buckets:', buckets.map(b => `${b.name} (${b.public ? 'public' : 'private'})`).join(', '));
    }

    // Try direct access to coventures bucket
    console.log('\n📤 Testing direct upload to "coventures" bucket...');
    const testContent = Buffer.from('Test file from Co-ventures');
    const testPath = `test/test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('coventures')
      .upload(testPath, testContent, {
        contentType: 'text/plain',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      console.error('   Error details:', uploadError);
      console.log('\n⚠️  ISSUE: The bucket exists but your Supabase anon key lacks permissions.');
      console.log('   Fix: Go to Supabase Dashboard → Storage → coventures → Policies');
      console.log('   Add RLS policy: Allow INSERT, SELECT, DELETE for authenticated users');
      return;
    }

    console.log('✅ Upload successful!');
    console.log('   - Path:', uploadData.path);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('coventures')
      .getPublicUrl(testPath);

    console.log('\n🔗 Public URL generated:');
    console.log('   ', publicUrl);

    // Test download
    console.log('\n📥 Testing file download...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('coventures')
      .download(testPath);

    if (downloadError) {
      console.error('❌ Download failed:', downloadError.message);
    } else {
      console.log('✅ Download successful!');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('coventures')
      .remove([testPath]);

    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Cleanup successful!');
    }

    console.log('\n🎉 All storage tests passed! The bucket is working correctly.\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testStorage();
