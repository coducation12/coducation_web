"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  type?: 'file' | 'url';
}

interface CurriculumUploadProps {
  stepId: number;
  uploads: UploadedFile[];
  onUpload: (files: (File | { type: 'url'; url: string; name: string })[]) => void;
  onDelete: (fileId: string) => void;
  isAdmin?: boolean;
  isCompleted?: boolean;
}

export default function CurriculumUpload({
  stepId,
  uploads,
  onUpload,
  onDelete,
  isAdmin = false,
  isCompleted = false,
}: CurriculumUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<(File | { type: 'url'; url: string; name: string })[]>([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [urlName, setUrlName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPendingFiles([...pendingFiles, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePending = (idx: number) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== idx));
  };

  const handleSingleUpload = async (idx: number) => {
    const file = pendingFiles[idx];
    if (!file) return;
    setIsUploading(true);
    try {
      await onUpload([file]);
      setPendingFiles(pendingFiles.filter((_, i) => i !== idx));
    } catch (error) {
      console.error("업로드 실패:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlValue.trim()) return;
    setPendingFiles([
      ...pendingFiles,
      { type: 'url', url: urlValue.trim(), name: urlName.trim() || urlValue.trim() }
    ]);
    setUrlValue("");
    setUrlName("");
    setShowUrlInput(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowUrlInput(v => !v)}
            className="border border-cyan-400/80 text-cyan-200 font-bold rounded-lg px-3 py-1 bg-transparent hover:shadow-[0_0_8px_2px_#00fff7] hover:text-cyan-100 transition-all duration-150"
          >
            URL 등록
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            onClick={handleButtonClick}
            disabled={isUploading}
            className="border border-cyan-400/80 text-cyan-200 font-bold rounded-lg px-4 py-1 bg-transparent hover:shadow-[0_0_8px_2px_#00fff7] hover:text-cyan-100 transition-all duration-150"
          >
            파일 선택
          </Button>
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1 text-green-400 text-xs">
            <CheckCircle className="w-3 h-3" /> 완료
          </span>
        )}
        {uploads.length > 0 && (
          <span className="ml-2 text-xs text-green-400">{uploads.length}개</span>
        )}
      </div>
      {/* URL 입력창 */}
      {showUrlInput && (
        <div className="flex gap-2 items-center mt-1 px-1">
          <input
            type="text"
            value={urlValue}
            onChange={e => setUrlValue(e.target.value)}
            placeholder="https://example.com/result"
            className="flex-1 px-2 py-1 rounded bg-[#0a192f] text-cyan-100 border border-cyan-400/40 outline-none"
          />
          <input
            type="text"
            value={urlName}
            onChange={e => setUrlName(e.target.value)}
            placeholder="표시 이름(선택)"
            className="w-40 px-2 py-1 rounded bg-[#0a192f] text-cyan-100 border border-cyan-400/40 outline-none"
          />
          <Button
            onClick={handleAddUrl}
            className="border border-cyan-400/80 text-cyan-200 font-bold rounded-lg px-3 py-1 bg-transparent hover:bg-[#22d3aa] hover:text-white transition-colors duration-150"
          >
            추가
          </Button>
        </div>
      )}
      {/* 미리보기: pendingFiles */}
      {pendingFiles.length > 0 && (
        <div className="w-full flex flex-col gap-1 mt-2">
          <div className="flex gap-2 items-center mb-1">
            <span className="text-xs text-cyan-300">업로드할 파일/URL 미리보기</span>
          </div>
          {pendingFiles.map((file, idx) => (
            <div key={(file as any).name + idx + (file as any).url} className="flex items-center justify-between bg-transparent border border-cyan-400/30 rounded px-2 py-1">
              <div className="flex items-center gap-2">
                {('type' in file && file.type === 'url') ? (
                  <>
                    <span className="text-cyan-100 text-xs drop-shadow-[0_0_4px_#00fff7]">🔗 {(file as any).name}</span>
                    <a href={(file as any).url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline text-xs">바로가기</a>
                  </>
                ) : (
                  <>
                    <span className="text-cyan-100 text-xs drop-shadow-[0_0_4px_#00fff7]">{(file as File).name}</span>
                    <span className="text-cyan-400 text-xs">({formatFileSize((file as File).size)})</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePending(idx)}
                  className="text-cyan-400 hover:text-cyan-100 text-xs px-2 border border-cyan-400/60 bg-transparent hover:shadow-[0_0_8px_2px_#00fff7]"
                >
                  삭제
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSingleUpload(idx)}
                  disabled={isUploading}
                  className="text-green-400 text-xs px-2 border border-green-400/60 bg-transparent font-bold transition-colors duration-150 hover:bg-[#22d3aa] hover:text-white hover:shadow-[0_0_8px_2px_#00fff7]"
                >
                  완료
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 업로드된 파일 목록 */}
      {uploads.length > 0 && (
        <div className="w-full flex flex-col gap-1 mt-2">
          {uploads.map((file) => (
            <div key={file.id} className="flex items-center justify-between bg-transparent border border-cyan-400/30 rounded px-2 py-1">
              <div className="flex items-center gap-2">
                <span className="text-cyan-100 text-xs drop-shadow-[0_0_4px_#00fff7]">{file.name}</span>
                <span className="text-cyan-400 text-xs">({formatFileSize(file.size)})</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(file.url, '_blank')}
                  className="text-cyan-400 text-xs px-2 border border-cyan-400/60 bg-transparent transition-colors duration-150 hover:bg-[#38bdf8] hover:text-white hover:shadow-[0_0_8px_2px_#00fff7]"
                >
                  보기
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(file.id)}
                    className="text-red-400 hover:text-cyan-100 text-xs px-2 border border-red-400/60 bg-transparent hover:shadow-[0_0_8px_2px_#00fff7]"
                  >
                    삭제
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 