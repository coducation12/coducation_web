'use client';
import { useState } from 'react';

export function ChangePassword({ userId }: { userId: string }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = async () => {
    setMsg('');
    if (!pw || !pw2) {
      setMsg('비밀번호를 모두 입력하세요.');
      return;
    }
    if (pw !== pw2) {
      setMsg('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/users/${userId}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: pw }),
    });
    const data = await res.json();
    setLoading(false);
    setMsg(data.success ? '비밀번호가 성공적으로 변경되었습니다.' : data.error || '오류가 발생했습니다.');
    setPw('');
    setPw2('');
  };

  return (
    <div className="space-y-4">
      <input
        type="password"
        value={pw}
        onChange={e => setPw(e.target.value)}
        placeholder="새 비밀번호"
        className="w-full rounded-lg bg-[#181c2f] border border-[#2de0ff] text-cyan-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2de0ff] transition"
        disabled={loading}
      />
      <input
        type="password"
        value={pw2}
        onChange={e => setPw2(e.target.value)}
        placeholder="새 비밀번호 확인"
        className="w-full rounded-lg bg-[#181c2f] border border-[#2de0ff] text-cyan-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2de0ff] transition"
        disabled={loading}
      />
      <button
        onClick={handleChange}
        disabled={loading || !pw || !pw2}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-[#2de0ff] to-[#7f5cff] text-white font-bold shadow-md hover:brightness-125 transition"
      >
        {loading ? '변경 중...' : '비밀번호 변경'}
      </button>
      {msg && <div className="text-center text-cyan-300 mt-2">{msg}</div>}
    </div>
  );
} 