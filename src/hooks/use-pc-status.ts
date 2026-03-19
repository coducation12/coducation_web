'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getTotalFaultyPCsCount, PCItem } from "@/lib/actions/pc-management";

export function usePCStatus() {
  const [faultyCount, setFaultyCount] = useState(0);

  const fetchCount = async () => {
    const res = await getTotalFaultyPCsCount();
    if (res.success) {
      setFaultyCount(res.count || 0);
    }
  };

  useEffect(() => {
    fetchCount();

    // 실시간 구독 설정
    const channel = supabase
      .channel('pc_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pc_room_layouts'
        },
        (payload: any) => {
          console.log('PC 상태 데이터 변경 감지:', payload);
          // 데이터가 변경되면 카운트 다시 계산
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { faultyCount };
}
