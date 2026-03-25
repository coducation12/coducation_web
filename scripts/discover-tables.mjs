
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
    console.log('--- Database Table Discovery ---');
    // Try to list tables via a common hack: querying a system view if allowed
    // Or just try common names
    const commonTables = ['students', 'users', 'student_todos', 'todolist', 'todos', 'student_memos', 'memos'];
    
    for (const table of commonTables) {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (!error) {
            console.log(`Table exists: ${table}`);
        } else if (error.code !== '42P01') { // 42P01 is undefined_table
            console.log(`Table ${table} might exist but returned error: ${error.code} (${error.message})`);
        }
    }
}

check();
