'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PromoModalProps {
    active: boolean; // Controls if the promo is effectively "active" from the server's perspective
    imageUrl?: string;
    onClose?: () => void;
}

export default function PromoModal({ active, imageUrl, onClose }: PromoModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const hideUntil = localStorage.getItem('hidePromoUntil');
        const now = new Date().getTime();

        console.log('[PromoModal] Debug:', {
            active,
            imageUrl,
            hideUntil,
            shouldShow: active && imageUrl && (!hideUntil || now > parseInt(hideUntil))
        });

        // 이미 오늘 하루 안 보기를 선택했고, 아직 하루가 지나지 않았으면 모달을 띄우지 않음
        if (hideUntil && now < parseInt(hideUntil)) {
            return;
        }

        if (active && imageUrl) {
            setIsOpen(true);
        }
    }, [active, imageUrl]);

    const handleClose = (hideForDay = false) => {
        setIsOpen(false);
        if (onClose) onClose();

        if (hideForDay) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            localStorage.setItem('hidePromoUntil', tomorrow.getTime().toString());
        }
    };

    if (!isMounted) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="fixed left-4 top-20 translate-x-0 translate-y-0 sm:max-w-xl p-0 overflow-hidden bg-transparent border-none shadow-none z-[100]">
                <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col w-full">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Promotion</DialogTitle>
                    </DialogHeader>

                    <button
                        onClick={() => handleClose()}
                        className="absolute top-2 right-2 z-[110] p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative w-full aspect-[4/5] sm:aspect-square bg-gray-100">
                        {imageUrl && (
                            <Image
                                src={imageUrl}
                                alt="Promotion"
                                fill
                                className="object-cover"
                                priority
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-900/95 text-white text-sm backdrop-blur-sm">
                        <button
                            onClick={() => handleClose(true)}
                            className="text-gray-300 hover:text-white transition-colors px-2"
                        >
                            오늘 하루 보지 않기
                        </button>
                        <button
                            onClick={() => handleClose()}
                            className="font-medium hover:text-cyan-400 transition-colors px-2"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
