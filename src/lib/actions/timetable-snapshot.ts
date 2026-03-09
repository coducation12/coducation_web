'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * 시간표 스냅샷 생성 (현재 상태 저장)
 */
export async function createTimetableSnapshot(year: number, month: number, data: any) {
    try {
        const { error } = await supabase
            .from('timetable_snapshots')
            .upsert({
                year,
                month,
                snapshot_data: data,
                created_at: new Date().toISOString(),
            }, { onConflict: 'year,month' });

        if (error) throw error;
        revalidatePath('/dashboard/admin/timetable');
        return { success: true };
    } catch (error) {
        console.error('Failed to create timetable snapshot:', error);
        return { success: false, error };
    }
}

/**
 * 특정 월의 시간표 스냅샷 조회
 */
export async function getTimetableSnapshot(year: number, month: number) {
    try {
        const { data, error } = await supabase
            .from('timetable_snapshots')
            .select('snapshot_data')
            .eq('year', year)
            .eq('month', month)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return { data: null }; // No data found
            throw error;
        }

        return { data: data.snapshot_data };
    } catch (error) {
        console.error('Failed to fetch timetable snapshot:', error);
        return { data: null, error };
    }
}

/**
 * 저장된 스냅샷 목록(연/월) 조회
 */
export async function getSnapshotMonths() {
    try {
        const { data, error } = await supabase
            .from('timetable_snapshots')
            .select('year, month')
            .order('year', { ascending: false })
            .order('month', { ascending: false });

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error('Failed to fetch snapshot months:', error);
        return { data: [] };
    }
}
