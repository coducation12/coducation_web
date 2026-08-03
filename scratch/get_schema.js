const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';
const PROJECT_REF = 'xcljkkvfsufndxzfcigp';

async function runSQL(sql) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql })
    });
    return { status: res.status, data: await res.json() };
}

async function getSchema() {
    const query = `
        SELECT 
            t.table_name,
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.column_default
        FROM 
            information_schema.tables t
        JOIN 
            information_schema.columns c ON t.table_name = c.table_name
        WHERE 
            t.table_schema = 'public'
            AND c.table_schema = 'public'
        ORDER BY 
            t.table_name, 
            c.ordinal_position;
    `;
    
    console.log('Fetching database schema...');
    const result = await runSQL(query);
    if (result.status === 200) {
        const rows = result.data;
        const tables = {};
        
        rows.forEach(row => {
            if (!tables[row.table_name]) {
                tables[row.table_name] = [];
            }
            tables[row.table_name].push({
                column: row.column_name,
                type: row.data_type,
                nullable: row.is_nullable,
                default: row.column_default
            });
        });
        
        console.log(JSON.stringify(tables, null, 2));
    } else {
        console.error('Failed to fetch schema:', result.status, result.data);
    }
}

getSchema().catch(console.error);
