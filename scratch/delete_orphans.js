const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteOrphanedParents() {
    const parentIds = [
        'bcd2384f-f364-4ab3-96ef-20a4985e9b29', // 홍길동20p
        '719425ec-c7f0-4362-9adc-6302788cbdd7', // 테스트10p
        '3537d21c-2c0c-4d53-8fa3-ebe44f65ad51', // 테스뚜10p
        '925cc55a-0a8b-4c5a-94ed-f092beeb8559', // 김송윤10p
        '1809b374-45fe-45b7-be2c-779ebe590a28', // 이수호83p
        '1ccaacc3-4b63-4f88-929d-761465b616ca'  // 김준민08p
    ];

    console.log("Deleting orphaned parent accounts...");
    for (const id of parentIds) {
        // First delete any community posts/comments by this parent to avoid FK error
        await supabaseAdmin.from('community_posts').delete().eq('user_id', id);
        await supabaseAdmin.from('community_comments').delete().eq('user_id', id);
        await supabaseAdmin.from('consultations').delete().eq('user_id', id);
        await supabaseAdmin.from('approval_logs').delete().eq('user_id', id);
        await supabaseAdmin.from('approval_logs').delete().eq('target_user_id', id);

        const { error } = await supabaseAdmin.from('users').delete().eq('id', id);
        if (error) {
            console.error(`Failed to delete parent ${id}:`, error);
        } else {
            console.log(`Successfully deleted parent ${id}`);
        }
    }
    console.log("Done.");
}

deleteOrphanedParents();
