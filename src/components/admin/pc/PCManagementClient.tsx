'use client';

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Check, RotateCcw, Monitor, Trash2, Settings2 } from "lucide-react";
import { getPCRoomLayouts, savePCRoomLayout, deletePCRoom, PCRoomLayout, PCItem } from "@/lib/actions/pc-management";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PCBoard } from "./PCBoard";

interface PCManagementClientProps {
  currentUserId: string;
  currentUserRole: string;
  initialAcademy: string;
}

export function PCManagementClient({ currentUserId, currentUserRole, initialAcademy }: PCManagementClientProps) {
  const [academy, setAcademy] = useState(initialAcademy);
  const [rooms, setRooms] = useState<PCRoomLayout[]>([]);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  
  // 편집 중인 현재 데이터 상태
  const [currentLayout, setCurrentLayout] = useState<PCItem[]>([]);
  const [currentRotation, setCurrentRotation] = useState(0);
  // 강의실별 스케일(Zoom) 저장용 매핑 상태
  const [roomZooms, setRoomZooms] = useState<Record<string, number>>({});

  const { toast } = useToast();

  const fetchRooms = async () => {
    setLoading(true);
    const res = await getPCRoomLayouts(academy);
    if (res.success) {
      setRooms(res.data || []);
      if (res.data && res.data.length > 0) {
        if (!selectedRoomName) {
            setSelectedRoomName(res.data[0].room_name);
            setCurrentLayout(res.data[0].layout_data || []);
            setCurrentRotation(res.data[0].rotation || 0);
        } else {
            const current = res.data.find(r => r.room_name === selectedRoomName);
            if (current) {
                setCurrentLayout(current.layout_data || []);
                setCurrentRotation(current.rotation || 0);
            }
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchAndSelectFirst = async () => {
        setLoading(true);
        const res = await getPCRoomLayouts(academy);
        if (res.success) {
            const fetchedRooms = res.data || [];
            setRooms(fetchedRooms);
            if (fetchedRooms.length > 0) {
                const firstRoom = fetchedRooms[0];
                setSelectedRoomName(firstRoom.room_name);
                setCurrentLayout(firstRoom.layout_data || []);
                setCurrentRotation(firstRoom.rotation || 0);
                // 모든 방의 줌 상태 초기화
                const initialZooms: Record<string, number> = {};
                fetchedRooms.forEach(r => {
                    initialZooms[r.room_name] = r.zoom || 2.0;
                });
                setRoomZooms(initialZooms);
            } else {
                setSelectedRoomName("");
                setCurrentLayout([]);
                setCurrentRotation(0);
            }
        }
        setLoading(false);
    };
    fetchAndSelectFirst();
  }, [academy]);

  useEffect(() => {
    const room = rooms.find(r => r.room_name === selectedRoomName);
    if (room) {
        setCurrentLayout(room.layout_data || []);
        setCurrentRotation(room.rotation || 0);
        // 해당 방의 기존 줌 값이 없거나 기본값일 때 DB 값으로 동기화
        if (!roomZooms[selectedRoomName] || roomZooms[selectedRoomName] === 1) {
            setRoomZooms(prev => ({ ...prev, [selectedRoomName]: room.zoom || 2.0 }));
        }
    }
  }, [selectedRoomName, rooms]);

  const handleUpdateLayout = async (newLayout: PCItem[], isImmediate = false) => {
    setCurrentLayout(newLayout);
    
    // 상태 변경 등 즉각 수 저장이 필요한 경우
    if (isImmediate && selectedRoomName) {
        // 즉시 저장(상태/메모 업데이트) 시에는 현재 조절된 줌이 아닌, DB에 저장된 공식 줌 값을 유지 (사용자 요청)
        const room = rooms.find(r => r.room_name === selectedRoomName);
        const savedZoom = room?.zoom || 2.0;

        await savePCRoomLayout({
            academy_name: academy,
            room_name: selectedRoomName,
            layout_data: newLayout,
            rotation: currentRotation,
            zoom: savedZoom
        });
        
        // 데이터 목록 최신화
        const updatedRooms = await getPCRoomLayouts(academy);
        if (updatedRooms.success) {
            setRooms(updatedRooms.data || []);
        }
    }
  };

  const handleToggleEditMode = async () => {
    if (isEditMode) {
        // 저장 로직
        const res = await savePCRoomLayout({
            academy_name: academy,
            room_name: selectedRoomName,
            layout_data: currentLayout,
            rotation: currentRotation,
            zoom: roomZooms[selectedRoomName] || 2.0
        });

        if (res.success) {
            toast({ title: "성공", description: "변경사항이 저장되었습니다." });
            fetchRooms();
        } else {
            toast({ title: "오류", description: res.error || "저장에 실패했습니다.", variant: "destructive" });
            return; // 에러 시 모드 유지
        }
    }
    setIsEditMode(!isEditMode);
  };

  const handleDeleteRoom = async (roomToDelete?: string) => {
    const targetRoom = roomToDelete || selectedRoomName;
    if (!targetRoom || !confirm(`'${targetRoom}' 강의실을 삭제하시겠습니까?`)) return;
 
    const res = await deletePCRoom(academy, targetRoom);
    if (res.success) {
        toast({ title: "성공", description: "강의실이 삭제되었습니다." });
        if (targetRoom === selectedRoomName) setSelectedRoomName("");
        fetchRooms();
    } else {
        toast({ title: "오류", description: res.error || "삭제에 실패했습니다.", variant: "destructive" });
    }
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;
    
    // 중복 확인
    if (rooms.some(r => r.room_name === newRoomName.trim())) {
        toast({ title: "오류", description: "이미 존재하는 강의실 이름입니다.", variant: "destructive" });
        return;
    }

    const res = await savePCRoomLayout({
        academy_name: academy,
        room_name: newRoomName.trim(),
        layout_data: [],
        rotation: 0,
        zoom: 2.0
    });

    if (res.success) {
        toast({ title: "성공", description: "강의실이 추가되었습니다." });
        setNewRoomName("");
        setIsAddRoomDialogOpen(false);
        fetchRooms();
        setSelectedRoomName(newRoomName.trim());
    } else {
        toast({ title: "오류", description: res.error || "강의실 추가에 실패했습니다.", variant: "destructive" });
    }
  };

  const selectedRoom = rooms.find(r => r.room_name === selectedRoomName);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-[0_0_8px_#14b8a6]">PC 상태 관리</h1>
      </div>

      {/* 학원 선택 (탭) */}
      <div className="flex flex-col gap-4">
        <Tabs value={academy} onValueChange={setAcademy} className="w-full">
            <TabsList className="bg-cyan-950/20 border border-cyan-500/20 p-1">
                <TabsTrigger value="코딩메이커" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100">코딩메이커</TabsTrigger>
                <TabsTrigger value="광양코딩" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-100">광양코딩</TabsTrigger>
            </TabsList>
        </Tabs>

        {/* 강의실 선택 및 관리 라인 */}
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none flex-1 -mt-2">
                {loading ? (
                    <div className="h-10 w-32 bg-cyan-950/20 animate-pulse rounded-full"></div>
                ) : (
                    <>
                        {rooms.map(room => (
                            <div key={room.id} className="relative group">
                                <Button
                                    variant={selectedRoomName === room.room_name ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedRoomName(room.room_name)}
                                    className={`whitespace-nowrap rounded-full px-6 h-10 transition-all ${
                                        selectedRoomName === room.room_name 
                                            ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)] border-cyan-400/50' 
                                            : 'text-cyan-400 hover:text-cyan-100 hover:bg-cyan-500/10 border border-cyan-500/10'
                                    }`}
                                >
                                    {room.room_name}
                                </Button>

                                {isEditMode ? (
                                    /* 삭제 버튼 (편집 모드일 때 숫자 배지 대신 표시) */
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRoomName(room.room_name);
                                            handleDeleteRoom();
                                        }}
                                        className="absolute -top-2 -right-1 w-6 h-6 bg-red-600 rounded-full border-2 border-[#0a1837] flex items-center justify-center text-white shadow-lg z-30 transition-all hover:bg-red-500 hover:scale-110 active:scale-95"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                ) : (
                                    /* 문제 발생 PC 숫자 배지 (일반 모드) */
                                    (() => {
                                        const faultyInRoom = (room.layout_data as PCItem[] || []).filter(pc => pc.status !== '정상 작동').length;
                                        return faultyInRoom > 0 && (
                                            <Badge className="absolute -top-2 -right-1 bg-red-600 hover:bg-red-700 text-[10px] px-1.5 h-5 min-w-[20px] flex items-center justify-center border-2 border-[#0a1837] shadow-lg z-20 animate-in zoom-in duration-300">
                                                {faultyInRoom}
                                            </Badge>
                                        );
                                    })()
                                )}
                            </div>
                        ))}
                        
                        {isEditMode && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsAddRoomDialogOpen(true)}
                                className="w-10 h-10 rounded-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 flex-shrink-0 animate-in zoom-in duration-300"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* 배치 수정 버튼 (우측 끝) */}
            <div className="flex bg-[#0a203f]/60 p-1 rounded-full border border-cyan-500/20 shadow-lg">
                <Button 
                    variant={isEditMode ? "default" : "ghost"}
                    size="sm"
                    onClick={handleToggleEditMode}
                    className={`h-8 rounded-full gap-2 transition-all px-4 ${isEditMode ? 'bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'text-cyan-400 hover:text-cyan-100 hover:bg-cyan-500/10'}`}
                >
                    {isEditMode ? <Check className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                    <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">{isEditMode ? "저장하기" : "배치 변경"}</span>
                </Button>
            </div>
        </div>
      </div>

      {/* 메인 보드 (Step 4에서 구현 예정) */}
      <Card className="bg-[#0a1837]/60 border-cyan-500/30 min-h-[500px] relative overflow-hidden flex items-center justify-center">
        {loading ? (
            <div className="text-cyan-500 animate-pulse flex flex-col items-center gap-2">
                <Monitor className="w-12 h-12" />
                <span>데이터를 불러오는 중...</span>
            </div>
        ) : !selectedRoomName ? (
            <div className="text-cyan-600 flex flex-col items-center gap-4">
                <Monitor className="w-16 h-16 opacity-20" />
                <div className="text-center">
                    <p className="text-lg font-medium">관리할 강의실을 선택하거나 추가해 주세요.</p>
                    {isEditMode && (
                        <Button 
                            className="mt-4 bg-cyan-600 hover:bg-cyan-700"
                            onClick={() => setIsAddRoomDialogOpen(true)}
                        >
                            새 강의실 만들기
                        </Button>
                    )}
                </div>
            </div>
        ) : (
            <PCBoard 
                items={currentLayout}
                onItemsChange={handleUpdateLayout}
                isEditMode={isEditMode}
                rotation={currentRotation}
                onRotationChange={setCurrentRotation}
                zoom={roomZooms[selectedRoomName] || 1}
                onZoomChange={(newZoom) => setRoomZooms(prev => ({ ...prev, [selectedRoomName]: newZoom }))}
                onAddRoom={() => setIsAddRoomDialogOpen(true)}
                onDeleteRoom={handleDeleteRoom}
                roomName={selectedRoomName}
            />
        )}
      </Card>

      {/* 강의실 추가 다이얼로그 */}
      <Dialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen}>
        <DialogContent className="bg-[#0a1837] border-cyan-500/30 text-cyan-100">
            <DialogHeader>
                <DialogTitle>새 강의실 추가</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="room-name">강의실 이름</Label>
                    <Input 
                        id="room-name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="예: 1강의실, A-201"
                        className="bg-[#0a203f] border-cyan-500/20 text-cyan-100"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddRoomDialogOpen(false)} className="text-cyan-400">취소</Button>
                <Button onClick={handleAddRoom} className="bg-cyan-600 hover:bg-cyan-700 text-white">추가하기</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
