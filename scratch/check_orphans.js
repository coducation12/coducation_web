const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOrphanedParents() {
    console.log("Fetching all students and parents...");
    
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, username, role');
        
    if (error) {
        console.error("Error fetching users:", error);
        return;
    }
    
    const students = users.filter(u => u.role === 'student');
    const parents = users.filter(u => u.role === 'parent');
    
    const studentUsernames = new Set(students.map(s => s.username));
    
    console.log(`Total students: ${students.length}`);
    console.log(`Total parents: ${parents.length}`);
    
    const orphanedParents = [];
    
    for (const parent of parents) {
        // Assume parent username is student username + 'p'
        // or check if there's any student that matches
        let matchFound = false;
        if (parent.username.endsWith('p')) {
            const expectedStudentUsername = parent.username.slice(0, -1);
            if (studentUsernames.has(expectedStudentUsername)) {
                matchFound = true;
            }
        }
        
        if (!matchFound) {
            orphanedParents.push(parent);
        }
    }
    
    console.log(`\nFound ${orphanedParents.length} orphaned parent accounts:`);
    orphanedParents.forEach(p => {
        console.log(`- ID: ${p.id}, Username: ${p.username}`);
    });
}

checkOrphanedParents();
