"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePageBlocks } from "@/actions/page.actions";

type Block = {
  id?: string;
  type: string;
  content?: string;
  mediaUrl?: string;
  sortOrder: number;
};

export default function PageBuilder({ pageId, initialBlocks = [] }: { pageId: string, initialBlocks: any[] }) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const addBlock = (type: string) => {
    setBlocks([...blocks, { type, sortOrder: blocks.length, content: "", mediaUrl: "" }]);
  };

  const updateBlock = (index: number, updates: Partial<Block>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    // update sortOrder
    newBlocks.forEach((b, i) => b.sortOrder = i);
    setBlocks(newBlocks);
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        updateBlock(index, { mediaUrl: data.url });
      } else {
        alert("Yükleme başarısız");
      }
    } catch (err) {
      alert("Hata oluştu");
    }
  };

  const saveBlocks = async () => {
    setIsSaving(true);
    const res = await updatePageBlocks(pageId, blocks);
    setIsSaving(false);
    if (res.success) {
      alert("Sayfa başarıyla güncellendi!");
      router.push("/admin/pages");
    } else {
      alert("Hata: " + res.error);
    }
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      {blocks.map((block, index) => (
        <div key={index} className="glass" style={{ padding: "var(--space-4)", borderRadius: "var(--radius-lg)", position: "relative" }}>
          <button 
            type="button"
            onClick={() => removeBlock(index)}
            style={{ position: "absolute", top: "10px", right: "10px", background: "red", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", padding: "4px 8px" }}
          >
            Sil
          </button>
          
          <h3 style={{ marginBottom: "var(--space-4)" }}>Blok: {block.type}</h3>
          
          {block.type === "TEXT" && (
            <div className="form-group">
              <label className="form-label">İçerik (HTML destekler)</label>
              <textarea 
                className="form-input" 
                rows={5} 
                value={block.content || ""} 
                onChange={(e) => updateBlock(index, { content: e.target.value })}
              />
            </div>
          )}

          {block.type === "IMAGE" && (
            <div className="form-group">
              <label className="form-label">Görsel Yükle</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(index, e)} className="form-input" />
              {block.mediaUrl && (
                <img src={block.mediaUrl} alt="Preview" style={{ marginTop: "10px", maxHeight: "150px", borderRadius: "8px" }} />
              )}
            </div>
          )}

          {block.type === "VIDEO" && (
            <div className="form-group">
              <label className="form-label">Video Yükle (veya MP4 URL girin)</label>
              <input type="file" accept="video/mp4" onChange={(e) => handleFileUpload(index, e)} className="form-input" />
              <div style={{ margin: "10px 0" }}>Veya URL:</div>
              <input type="text" className="form-input" value={block.mediaUrl || ""} onChange={(e) => updateBlock(index, { mediaUrl: e.target.value })} />
              {block.mediaUrl && (
                <video src={block.mediaUrl} controls style={{ marginTop: "10px", maxHeight: "200px", borderRadius: "8px", width: "100%" }} />
              )}
            </div>
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", padding: "var(--space-4)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "var(--radius-lg)" }}>
        <button onClick={() => addBlock("TEXT")} className="btn btn-outline">+ Metin Ekle</button>
        <button onClick={() => addBlock("IMAGE")} className="btn btn-outline">+ Görsel Ekle</button>
        <button onClick={() => addBlock("VIDEO")} className="btn btn-outline">+ Video Ekle</button>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
        <button onClick={saveBlocks} disabled={isSaving} className="btn btn-primary btn-lg">
          {isSaving ? "Kaydediliyor..." : "Sayfayı Kaydet"}
        </button>
      </div>
    </div>
  );
}
