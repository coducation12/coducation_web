export const TIME_SLOTS = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

export const timeToIndex = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    const idx = (h - 12) * 2 + (m === 30 ? 1 : 0);
    return Math.max(0, idx);
};
