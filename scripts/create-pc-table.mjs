const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';
const PROJECT_REF = 'xcljkkvfsufndxzfcigp';

async function runSQL(sql) {
    console.log(`Executing SQL: ${sql}`);
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, // Note: This might need a Management API token, but copying from existing script
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql })
    });
    const status = res.status;
    const data = await res.json();
    console.log(`Status: ${status}`, data);
    return { status, data };
}

async function createTable() {
    console.log('1. Creating pc_room_layouts table...');
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS pc_room_layouts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      academy_name TEXT NOT NULL,
      room_name TEXT NOT NULL,
      layout_data JSONB DEFAULT '[]'::JSONB,
      rotation INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(academy_name, room_name)
    );
    `;
    await runSQL(createTableSQL);

    console.log('2. Enabling Realtime for pc_room_layouts...');
    // Realtime activation (Note: Publication name might differ, 'supabase_realtime' is default)
    await runSQL(`ALTER PUBLICATION supabase_realtime ADD TABLE pc_room_layouts;`);

    console.log('Done.');
}

createTable().catch(console.error);
