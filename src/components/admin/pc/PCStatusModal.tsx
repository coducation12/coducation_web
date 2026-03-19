'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PCItem, PCStatus } from "@/lib/actions/pc-management";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PCStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  pc: PCItem;
  onSave: (updatedPC: PCItem) => void;
}

export function PCStatusModal({ isOpen, onClose, pc, onSave }: PCStatusModalProps) {
  const [name, setName] = useState(pc.name);
  const [status, setStatus] = useState<PCStatus>(pc.status);
  const [notes, setNotes] = useState(pc.notes);

  const handleSave = () => {
    onSave({
      ...pc,
      name,
      status,
      notes
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a1837] border-cyan-500/30 text-cyan-100 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-cyan-50">PC 상세 정보 및 상태 변경</DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pc-name" className="text-cyan-300">표시 이름</Label>
            <Input 
              id="pc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#0a203f] border-cyan-500/20 text-cyan-100 focus:border-cyan-400"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-cyan-300">현재 상태</Label>
            <RadioGroup value={status} onValueChange={(v: any) => setStatus(v)} className="grid grid-cols-1 gap-2">
              <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${status === '정상 작동' ? 'bg-green-500/10 border-green-500/50' : 'bg-[#0a203f] border-transparent hover:border-cyan-500/30'}`}>
                <RadioGroupItem value="정상 작동" id="status-normal" className="border-green-500 text-green-500" />
                <Label htmlFor="status-normal" className="flex-1 cursor-pointer font-bold text-green-400">정상 작동</Label>
              </div>
              <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${status === '점검 필요' ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-[#0a203f] border-transparent hover:border-cyan-500/30'}`}>
                <RadioGroupItem value="점검 필요" id="status-check" className="border-yellow-500 text-yellow-500" />
                <Label htmlFor="status-check" className="flex-1 cursor-pointer font-bold text-yellow-400">점검 필요</Label>
              </div>
              <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${status === '가동 불가' ? 'bg-red-500/10 border-red-500/50' : 'bg-[#0a203f] border-transparent hover:border-cyan-500/30'}`}>
                <RadioGroupItem value="가동 불가" id="status-broken" className="border-red-500 text-red-500" />
                <Label htmlFor="status-broken" className="flex-1 cursor-pointer font-bold text-red-400">가동 불가</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pc-notes" className="text-cyan-300">특이사항 (메모)</Label>
            <Textarea 
              id="pc-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="고장 증상이나 점검 내역을 입력하세요..."
              className="bg-[#0a203f] border-cyan-500/20 text-cyan-100 min-h-[100px] focus:border-cyan-400"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="text-cyan-400">취소</Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)]">저장하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
