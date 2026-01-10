const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '..', 'app', 'properties', '[id]', 'page-new.tsx');
const targetFile = path.join(__dirname, '..', 'app', 'properties', '[id]', 'page.tsx');

console.log('📝 Replacing property page...');
console.log('Source:', sourceFile);
console.log('Target:', targetFile);

try {
  // Read the new content
  const content = fs.readFileSync(sourceFile, 'utf8');
  console.log(`✅ Read ${content.length} bytes from source`);
  
  // Write to target
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('✅ Successfully replaced page.tsx with new co-investment version');
  console.log('\n🔄 Please refresh your browser at:');
  console.log('   http://localhost:3001/properties/contemporary-eco-villa-bangalore\n');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
