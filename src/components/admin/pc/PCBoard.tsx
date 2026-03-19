'use client';

import { useState, useRef, useEffect } from "react";
import { PCItem, PCStatus } from "@/lib/actions/pc-management";
import { PCCard } from "./PCCard";
import { Button } from "@/components/ui/button";
import { RotateCw, Maximize, Minimize, Plus, Trash2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface PCBoardProps {
  items: PCItem[];
  onItemsChange: (items: PCItem[], isImmediate?: boolean) => void;
  isEditMode: boolean;
  rotation: number;
  onRotationChange: (rotation: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onAddRoom?: () => void;
  onDeleteRoom?: () => void;
  roomName?: string;
}

export function PCBoard({ 
  items, 
  onItemsChange, 
  isEditMode, 
  rotation, 
  onRotationChange,
  zoom,
  onZoomChange,
  onAddRoom,
  onDeleteRoom,
  roomName 
}: PCBoardProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [responsiveScale, setResponsiveScale] = useState(1);
  const panStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  const GRID_SIZE = 20; 
  const BASE_WIDTH = 1200; // 기준 너비

  // 컨테이너 너비 감지 및 반응형 스케일 계산
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // 기준 대비 비율 계산 (최소 0.3, 최대 1.2 등 제한 가능)
        setResponsiveScale(Math.max(0.2, width / BASE_WIDTH));
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const totalScale = responsiveScale * zoom;

  const handleAddPC = () => {
    const newId = `pc-${Date.now()}`;
    const newPC: PCItem = {
      id: newId,
      name: `${items.length + 1}번 PC`,
      status: '정상 작동',
      notes: '',
      x: 100,
      y: 100
    };
    onItemsChange([...items, newPC]);
  };

  const handleUpdatePC = (updatedPC: PCItem) => {
    onItemsChange(items.map(item => item.id === updatedPC.id ? updatedPC : item), true);
  };

  const handleDeletePC = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id), true);
  };

  const handleDragPC = (id: string, x: number, y: number) => {
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
    onItemsChange(items.map(item => item.id === id ? { ...item, x: snappedX, y: snappedY } : item));
  };

  const handlePanStart = (e: React.MouseEvent) => {
    // 배치 변경 모드일 때만 보드 이동 가능하도록 수정 (사용자 요청)
    if (!isEditMode) return;
    if ((e.target as HTMLElement).closest('.pc-card-element')) return;

    setIsPanning(true);
    panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startX: offset.x,
        startY: offset.y
    };

    document.addEventListener('mousemove', handlePanMove);
    document.addEventListener('mouseup', handlePanEnd);
  };

  const handlePanMove = (e: MouseEvent) => {
    const deltaX = (e.clientX - panStartRef.current.x) / totalScale;
    const deltaY = (e.clientY - panStartRef.current.y) / totalScale;
    
    setOffset({
        x: panStartRef.current.startX + deltaX,
        y: panStartRef.current.startY + deltaY
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
    document.removeEventListener('mousemove', handlePanMove);
    document.removeEventListener('mouseup', handlePanEnd);
  };

  useEffect(() => {
    return () => {
        document.removeEventListener('mousemove', handlePanMove);
        document.removeEventListener('mouseup', handlePanEnd);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* 메인 보드 컨테이너 */}
      <div 
        ref={containerRef}
        className={`relative w-full aspect-[4/3] max-h-[85vh] bg-[#0a1837] overflow-hidden border border-cyan-500/10 rounded-xl ${isEditMode ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'} shadow-inner`}
        onMouseDown={handlePanStart}
      >
        {/* 이동 가능한 칠판 (Chalkboard) - 회전에 따라 위치 및 크기 변경 */}
        {(() => {
            let style: React.CSSProperties = {};
            const isVertical = rotation === 90 || rotation === 270;
            
            switch(rotation) {
                case 90: // Right
                    style = { top: '50%', right: '0', width: '2.5%', height: '60%', transform: 'translate(0, -50%)' };
                    break;
                case 180: // Bottom
                    style = { bottom: '0', left: '50%', width: '60%', height: '2.5%', transform: 'translate(-50%, 0)' };
                    break;
                case 270: // Left
                    style = { top: '50%', left: '0', width: '2.5%', height: '60%', transform: 'translate(0, -50%)' };
                    break;
                default: // Top (0)
                    style = { top: '0', left: '50%', width: '60%', height: '2.5%', transform: 'translate(-50%, 0)' };
            }
            
            return (
                <div 
                    className="absolute bg-zinc-100 rounded-sm border-2 border-zinc-300 z-10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    style={style}
                >
                    <span 
                        className={`inline-block text-[1vw] md:text-[10px] text-cyan-900 font-black tracking-widest uppercase whitespace-nowrap ${isVertical ? 'rotate-90' : ''}`}
                    >
                        Chalkboard
                    </span>
                </div>
            );
        })()}

        {/* 메인 보드 캔버스 */}
        <div 
            ref={boardRef}
            className="relative w-[3000px] h-[3000px] transition-transform duration-300 ease-out origin-top-left p-10"
            style={{ 
                transform: `translate(${offset.x * totalScale}px, ${offset.y * totalScale}px) scale(${totalScale})`,
            }}
        >
            <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{ 
                    backgroundImage: `radial-gradient(circle, #0891b2 1px, transparent 1.5px)`,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
                }}
            />

            {items.map((pc) => (
                <PCCard 
                    key={pc.id}
                    pc={pc}
                    isEditMode={isEditMode}
                    zoom={zoom}
                    rotation={rotation}
                    onUpdate={(updated: PCItem) => handleUpdatePC(updated)}
                    onDelete={() => handleDeletePC(pc.id)}
                    onDrag={(x: number, y: number) => handleDragPC(pc.id, x, y)}
                />
            ))}
        </div>

        {/* 조작 가이드 (편집 모드에서만 표시) */}
        {isEditMode && (
            <div className="absolute bottom-4 left-4 pointer-events-none text-[8px] sm:text-[10px] text-cyan-500/30 font-mono flex items-center gap-2 z-20">
                <span>DRAG TO PAN</span>
                <span className="w-1 h-1 bg-cyan-900 rounded-full" />
                <span>CLICK PC FOR STATUS</span>
            </div>
        )}
      </div>

      {/* 줌 및 조작 도구 (모바일에서는 하단 배치, 데스크톱에서는 플로팅) */}
      <div className={`mt-4 md:mt-0 md:absolute md:bottom-8 md:left-1/2 md:-translate-x-1/2 flex items-center bg-[#0f2a4a]/75 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-30 transition-all duration-500 ease-in-out px-2 py-2 gap-3 sm:gap-4 ${isEditMode ? 'max-w-[95%] w-auto' : 'w-auto'}`}>
          {/* 1. 보드 회전 (배치 변경 시에만 노출) */}
          {isEditMode && (
              <div className="flex items-center border-r border-cyan-500/20 pr-3 sm:pr-4 animate-in fade-in slide-in-from-left-4 duration-500">
                  <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRotationChange((rotation + 90) % 360)} 
                      className="h-10 text-cyan-100 hover:bg-cyan-500/20 gap-2 px-3 italic"
                  >
                      <RotateCw className="w-4 h-4" /> 
                      <span className="hidden sm:inline">회전</span>
                  </Button>
              </div>
          )}

          {/* 2. 줌 슬라이더 (항상 노출) */}
          <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10"
                  onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
              >
                  <Minimize className="w-4 h-4" />
              </Button>
              <div className="flex flex-col items-center gap-1">
                  <Slider 
                      value={[zoom]} 
                      min={0.5} 
                      max={2.0} 
                      step={0.1} 
                      onValueChange={([v]) => onZoomChange(v)} 
                      className="w-20 sm:w-32 md:w-48" 
                  />
              </div>
              <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10"
                  onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))}
              >
                  <Maximize className="w-4 h-4" />
              </Button>
              <span className="text-[10px] sm:text-xs text-cyan-300 font-mono w-8 sm:w-12 text-right border-l border-cyan-500/20 pl-2 sm:pl-3 ml-1">
                  {Math.round(zoom * 100)}%
              </span>
          </div>

          {/* 3. PC 추가 (배치 변경 시에만 노출) */}
          {isEditMode && (
              <div className="flex items-center border-l border-cyan-500/20 pl-3 sm:pl-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <Button 
                      onClick={handleAddPC} 
                      className="h-10 bg-cyan-600 hover:bg-cyan-500 text-white gap-2 px-4 font-bold shadow-lg shadow-cyan-900/40"
                  >
                      <Plus className="w-5 h-5" /> 
                      <span className="hidden sm:inline">PC 추가</span>
                  </Button>
              </div>
          )}
      </div>
    </div>
  );
}
