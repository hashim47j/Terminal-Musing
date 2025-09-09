import bcrypt from 'bcrypt';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Since this script is in Terminal-Musing/backend/AdminKey/
// We need to go up one level to backend/, then into admin/
const BACKEND_DIR = path.dirname(__dirname); // Goes up to backend/
const ADMIN_DIR = path.join(BACKEND_DIR, 'admin');
const KEY_FILE_PATH = path.join(ADMIN_DIR, 'adminKey.hash');
const GENERATED_FLAG_PATH = path.join(ADMIN_DIR, '.key-generated');

// Ensure admin directory exists
fs.ensureDirSync(ADMIN_DIR);

async function generateAdminKey() {
  try {
    // Check if key already exists
    if (fs.existsSync(KEY_FILE_PATH)) {
      console.log('❌ Admin key already exists at:', KEY_FILE_PATH);
      console.log('🔒 Key generation is locked. Delete the existing key file to regenerate.');
      console.log('💡 To regenerate: rm -f ../admin/adminKey.hash ../admin/.key-generated');
      return;
    }

    // Check if generation flag exists (extra security)
    if (fs.existsSync(GENERATED_FLAG_PATH)) {
      console.log('❌ Key generation has already been completed.');
      console.log('🔒 Delete both .key-generated flag and adminKey.hash to regenerate.');
      console.log('💡 To regenerate: rm -f ../admin/adminKey.hash ../admin/.key-generated');
      return;
    }

    // Generate a secure random key
    const randomKey = crypto.randomBytes(32).toString('hex');
    console.log('');
    console.log('🔑 Generated secure key:', randomKey);
    console.log('⚠️  SAVE THIS KEY - it will not be shown again!');
    console.log('💾 Save this key in a text file for login');
    console.log('');
    
    // Hash the key
    const saltRounds = 12;
    const hashedKey = await bcrypt.hash(randomKey, saltRounds);
    
    // Save the hashed key
    await fs.writeFile(KEY_FILE_PATH, hashedKey, 'utf8');
    
    // Create generation flag to prevent future runs
    await fs.writeFile(GENERATED_FLAG_PATH, new Date().toISOString(), 'utf8');
    
    console.log('✅ Admin key successfully generated and saved!');
    console.log('📁 Hash saved to:', KEY_FILE_PATH);
    console.log('🔐 Use the displayed key above to login to admin panel');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Copy the key above and save it in a .txt file');
    console.log('   2. Go to your website/admin/login');
    console.log('   3. Triple-tap the author icon');
    console.log('   4. Insert your key file and click play');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error generating admin key:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateAdminKey();
