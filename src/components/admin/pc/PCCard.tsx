'use client';

import { useState, useRef, useEffect } from "react";
import { PCItem, PCStatus } from "@/lib/actions/pc-management";
import { PCStatusModal } from "./PCStatusModal";
import { Trash2, GripHorizontal, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PCCardProps {
  pc: PCItem;
  isEditMode: boolean;
  zoom: number;
  rotation: number;
  onUpdate: (pc: PCItem) => void;
  onDelete: () => void;
  onDrag: (x: number, y: number) => void;
}

export function PCCard({ pc, isEditMode, zoom, rotation, onUpdate, onDelete, onDrag }: PCCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const getStatusClasses = (status: PCStatus) => {
    switch (status) {
      case '점검 필요': return 'border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.2)] text-yellow-500';
      case '가동 불가': return 'border-red-500/50 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)] text-red-500';
      default: return 'border-green-500/50 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.1)] text-green-500';
    }
  };

  const nameColorClass = pc.status === '점검 필요' ? 'text-yellow-400' : pc.status === '가동 불가' ? 'text-red-400' : 'text-green-400';

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pc.x,
      initialY: pc.y
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current) return;
    
    // 줌과 회전 고려한 델타 계산
    const deltaX = (e.clientX - dragRef.current.startX) / zoom;
    const deltaY = (e.clientY - dragRef.current.startY) / zoom;
    
    // 회전 각도에 따른 좌표 변환 (필요 시 보정)
    // 현재는 단순 드래그 구현 (회전 상태에서의 드래그는 다소 직관적이지 않을 수 있으나 기본 동작 유지)
    
    onDrag(dragRef.current.initialX + deltaX, dragRef.current.initialY + deltaY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div 
        className={`pc-card-element absolute w-[90px] h-[90px] border rounded-lg flex flex-col transition-shadow duration-200 select-none ${getStatusClasses(pc.status)} ${isDragging ? 'z-50 ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'z-20'}`}
        style={{ 
          left: `${pc.x}px`, 
          top: `${pc.y}px`,
        }}
        onClick={(e) => {
            if (!isEditMode) setIsModalOpen(true);
            e.stopPropagation();
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-inherit bg-inherit/5">
            <span className={`text-[10px] font-black truncate ${nameColorClass}`}>{pc.name}</span>
            {isEditMode && (
                <GripHorizontal className="w-3 h-3 cursor-move opacity-50" />
            )}
        </div>
        <div className="flex-1 p-1.5 flex flex-col justify-center items-center overflow-hidden">
            <div className="text-[10px] text-cyan-100 font-medium leading-tight text-center">
                {pc.notes || (pc.status === '정상 작동' ? '정상' : '설명 없음')}
            </div>
        </div>

        {isEditMode && (
            <div className="absolute -top-2 -right-2 flex gap-1 group-hover:opacity-100 transition-opacity">
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="w-5 h-5 rounded-full shadow-lg"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                    <Trash2 className="w-3 h-3 text-white" />
                </Button>
            </div>
        )}
      </div>

      <PCStatusModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pc={pc}
        onSave={onUpdate}
      />
    </>
  );
}
