'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export type PCStatus = '정상 작동' | '점검 필요' | '가동 불가';

export interface PCItem {
  id: string;
  name: string;
  status: PCStatus;
  notes: string;
  x: number;
  y: number;
}

export interface PCRoomLayout {
  id: string;
  academy_name: string;
  room_name: string;
  layout_data: PCItem[];
  rotation: number;
  zoom: number;
  updated_at: string;
}

/**
 * 특정 학원의 모든 강의실 레이아웃 정보를 가져옵니다.
 */
export async function getPCRoomLayouts(academyName: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('pc_room_layouts')
      .select('*')
      .eq('academy_name', academyName)
      .order('room_name', { ascending: true });

    if (error) throw error;
    return { success: true, data: data as PCRoomLayout[] };
  } catch (error: any) {
    console.error('getPCRoomLayouts error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 강의실 레이아웃 정보를 저장하거나 업데이트합니다.
 */
export async function savePCRoomLayout(data: {
  academy_name: string;
  room_name: string;
  layout_data: PCItem[];
  rotation: number;
  zoom: number;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('pc_room_layouts')
      .upsert({
        ...data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'academy_name,room_name'
      });

    if (error) throw error;
    
    // 관련 경로 캐시 갱신
    revalidatePath('/dashboard/admin/pc-management');
    revalidatePath('/dashboard/teacher/pc-management');

    return { success: true };
  } catch (error: any) {
    console.error('savePCRoomLayout error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 문제가 있는(점검 필요, 가동 불가) PC의 총 대수를 조회합니다.
 * 실시간 알림 배지용으로 사용됩니다.
 */
export async function getTotalFaultyPCsCount() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pc_room_layouts')
      .select('layout_data');

    if (error) throw error;

    let count = 0;
    data?.forEach((room: any) => {
      const layout = room.layout_data as PCItem[] || [];
      layout.forEach(pc => {
        if (pc.status === '점검 필요' || pc.status === '가동 불가') {
          count++;
        }
      });
    });

    return { success: true, count };
  } catch (error: any) {
    console.error('getTotalFaultyPCsCount error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 특정 강의실 정보를 삭제합니다.
 */
export async function deletePCRoom(academyName: string, roomName: string) {
  try {
    const { error } = await supabaseAdmin
      .from('pc_room_layouts')
      .delete()
      .eq('academy_name', academyName)
      .eq('room_name', roomName);

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/pc-management');
    revalidatePath('/dashboard/teacher/pc-management');

    return { success: true };
  } catch (error: any) {
    console.error('deletePCRoom error:', error);
    return { success: false, error: error.message };
  }
}
