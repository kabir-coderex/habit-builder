import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configure dotenv to find the root .env file ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// --- Configuration ---
// Load environment variables from the root .env file
const supabaseUrl = process.env.DATABASE_URL;
const supabaseServiceKey = process.env.SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

// --- Validate Configuration ---
if (!supabaseUrl || !supabaseServiceKey || !adminEmail || !adminPassword) {
  throw new Error(
    'Missing required environment variables. Ensure DATABASE_URL, SERVICE_ROLE_KEY, ADMIN_EMAIL, and ADMIN_PASSWORD are set.'
  );
}

// --- Initialize Supabase Client (with Service Role) ---
// WARNING: This client has admin privileges and should only be used in a secure, server-side environment.
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('Supabase client initialized.');

// --- Seed Data ---
const predefinedTasks = [
  {
    name: 'Salah',
    description: 'The five daily Islamic prayers. Schedules should be created for Fajr, Dhuhr, Asr, Maghrib, and Isha.',
    default_points: 10,
  },
  {
    name: 'Drinking Water',
    description: 'Stay hydrated by drinking an adequate amount of water throughout the day.',
    default_points: 5,
  },
  {
    name: 'Sleeping Schedule',
    description: 'Maintain a consistent sleep and wake-up time for better health.',
    default_points: 10,
  },
  {
    name: 'Medicine',
    description: 'Take prescribed medicine at the correct times.',
    default_points: 15,
  },
];
// Note: The concept of "required for all" is handled by assigning tasks to members,
// not by a flag here. These are the templates available for assignment.

// --- Main Seed Function ---
async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    // 1. Create a Family for the admin user
    console.log('Creating admin family...');
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({ name: 'Admin Family' })
      .select()
      .single();

    if (familyError) throw familyError;
    console.log(`Family '${family.name}' created with ID: ${family.id}`);

    // 2. Create the Guardian Admin Auth User
    console.log(`Creating admin auth user for ${adminEmail}...`);
    // Upsert admin user: if exists, update password; else, create
    let authUser, authError;
    // Try to find existing user
    const { data: existingUser, error: findError } = await supabase.auth.admin.listUsers({
      email: adminEmail
    });
    if (findError) throw findError;
    if (existingUser && existingUser.users && existingUser.users.length > 0) {
      // User exists, update password
      const userId = existingUser.users[0].id;
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: adminPassword
      });
      if (updateError) throw updateError;
      authUser = { user: updatedUser.user };
      console.log(`Admin auth user password updated for ID: ${userId}`);
    } else {
      // User does not exist, create
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });
      if (createError) throw createError;
      authUser = { user: newUser.user };
      console.log(`Admin auth user created with ID: ${authUser.user.id}`);
    }

    // 3. Create the corresponding Guardian Member profile
    console.log('Creating guardian member profile...');
    const { error: memberError } = await supabase.from('members').insert({
      user_id: authUser.user.id,
      family_id: family.id,
      name: 'Admin Guardian',
      role: 'guardian',
    });

    if (memberError) throw memberError;
    console.log('Guardian member profile created successfully.');

    // 4. Insert Predefined Tasks
    console.log('Inserting predefined tasks...');
    const { error: tasksError } = await supabase
      .from('predefined_tasks')
      .upsert(predefinedTasks, { onConflict: ['name'] });

    if (tasksError) throw tasksError;
    console.log(`${predefinedTasks.length} predefined tasks inserted/updated successfully.`);

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

// --- Run the Seed Script ---
seedDatabase();
