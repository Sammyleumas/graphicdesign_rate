import React, { useState } from "react";
import { Upload, X, HelpCircle, Loader2 } from "lucide-react";
import { CATEGORIES, SOFTWARE_OPTIONS, Submission } from "../types";
import { DbManager } from "../dbMock";

interface UploadModalProps {
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  onClose: () => void;
  onSuccess: (newSub: Submission) => void;
  activeChallengeId?: string;
}

const SPINNER_MESSAGES = [
  "Formulating visual composition metrics...",
  "Running vector alignment auditing...",
  "Analyzing typography contrast and scaling ratios...",
  "Formulating weighted brand message index...",
  "Generating professional constructive feedback report..."
];

export default function UploadModal({
  userId,
  userDisplayName,
  userPhotoURL,
  onClose,
  onSuccess,
  activeChallengeId
}: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<{ base64: string; mime: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Loading & AI analysis states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalStep, setEvalStep] = useState(0);

  // Periodic spinner messages rotation
  React.useEffect(() => {
    let interval: any;
    if (isEvaluating) {
      interval = setInterval(() => {
        setEvalStep(prev => (prev + 1) % SPINNER_MESSAGES.length);
      }, 3000);
    } else {
      setEvalStep(0);
    }
    return () => clearInterval(interval);
  }, [isEvaluating]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) {
        alert("Only image uploads (JPEG/PNG/WebP) are supported.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageFiles(prev => [...prev, { base64: reader.result as string, mime: file.type }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSoftwareToggle = (sw: string) => {
    setSelectedSoftware(prev =>
      prev.includes(sw) ? prev.filter(s => s !== sw) : [...prev, sw]
    );
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTag.trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags(prev => [...prev, clean]);
      setNewTag("");
    }
  };

  const removeTag = (t: string) => {
    setTags(prev => prev.filter(tag => tag !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter a design title.");
    if (imageFiles.length === 0) return alert("Please upload at least one design image preview.");

    setIsEvaluating(true);

    try {
      // 1. Call server API to perform professional Gemini AI Evaluation
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category,
          tags: tags,
          software: selectedSoftware.join(", "),
          imageBase64: imageFiles[0].base64,
          imageMime: imageFiles[0].mime
        })
      });

      if (!response.ok) {
        throw new Error("AI evaluation failed.");
      }

      const evalData = await response.json();

      // 2. Prepare final submission document
      const newSubmission: Submission = {
        id: `sub-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        description: description.trim(),
        userId: userId,
        userDisplayName: userDisplayName,
        userPhotoURL: userPhotoURL,
        images: imageFiles.map(img => img.base64),
        category: category,
        tags: tags,
        software: selectedSoftware.join(", ") || "Other Tool",
        createdAt: new Date().toISOString(),
        commentsCount: 0,
        likesCount: 0,
        viewsCount: 1,
        challengeId: activeChallengeId || undefined,
        scores: {
          creativity: evalData.creativityScore,
          visualAppeal: evalData.visualAppealScore,
          uxFunctionality: evalData.uxScore,
          technical: evalData.technicalScore,
          brandComm: evalData.brandCommScore,
          overall: evalData.overallScore
        },
        aiFeedback: {
          feedback: evalData.feedback,
          strengths: evalData.strengths,
          improvements: evalData.improvements
        }
      };

      // 3. Save to database manager
      DbManager.addSubmission(newSubmission);

      setIsEvaluating(false);
      onSuccess(newSubmission);
    } catch (error) {
      console.error("Evaluation error:", error);
      alert("AI Judge was unable to process your artwork. Please check your network connection and try again.");
      setIsEvaluating(false);
    }
  };

  return (
    <div id="upload_modal_container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#12141a] rounded-xl border border-white/5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Upload Design Canvas
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Your upload will be automatically critiqued and scored by our professional AI Design Judge.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
            disabled={isEvaluating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evaluating / Scoring Overlay */}
        {isEvaluating && (
          <div className="absolute inset-0 bg-[#0d0f12]/95 z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="relative flex items-center justify-center w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-emerald-500/10 border-b-emerald-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
              <Loader2 className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            
            <h3 className="text-lg font-display font-bold text-white">
              Consulting AI Jury Board
            </h3>
            
            <p className="max-w-md text-sm text-indigo-200 mt-2 font-mono h-12 flex items-center justify-center">
              {SPINNER_MESSAGES[evalStep]}
            </p>
            
            <p className="text-xs text-gray-500 mt-8 max-w-sm">
              Applying weights: Creativity (30%), Visual (25%), UX (20%), Technical (15%), Brand (10%).
            </p>
          </div>
        )}

        {/* Content Form Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Drag & Drop Canvas */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Design Artworks & Previews <span className="text-red-500">*</span>
            </label>
            
            {imageFiles.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-500/5"
                    : "border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.01]"
                }`}
                onClick={() => document.getElementById("file-upload-input")?.click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400 mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium text-white">
                  Drag and drop your images here, or <span className="text-indigo-400">browse</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Supports High-Res JPEG, PNG, or WebP. First image is the primary cover.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 border border-white/5 p-4 rounded-lg bg-[#0d0f12]">
                {imageFiles.map((img, index) => (
                  <div key={index} className="relative aspect-video rounded overflow-hidden border border-white/10 group">
                    <img src={img.base64} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white hover:text-red-400 rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                        PRIMARY COVER
                      </span>
                    )}
                  </div>
                ))}
                
                {imageFiles.length < 3 && (
                  <button
                    type="button"
                    onClick={() => document.getElementById("file-upload-additional")?.click()}
                    className="border border-dashed border-white/10 rounded flex flex-col items-center justify-center hover:border-indigo-500/50 hover:bg-white/[0.01] transition-all aspect-video"
                  >
                    <input
                      id="file-upload-additional"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Upload className="w-5 h-5 text-gray-500 mb-1" />
                    <span className="text-xs text-gray-400 text-center">Add Image</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="design-title-input" className="block text-sm font-medium text-gray-300 mb-2">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                id="design-title-input"
                type="text"
                placeholder="e.g. Aetherial Brand Identity Suite"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={60}
                required
                className="w-full px-4 py-2.5 bg-[#0d0f12] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div>
              <label htmlFor="design-category-select" className="block text-sm font-medium text-gray-300 mb-2">
                Design Category <span className="text-red-500">*</span>
              </label>
              <select
                id="design-category-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0d0f12] border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-sans"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="design-description-textarea" className="block text-sm font-medium text-gray-300 mb-2">
              Design Abstract & Description
            </label>
            <textarea
              id="design-description-textarea"
              placeholder="Detail the design strategy, creative problem-solving approach, conceptual elements, and client considerations..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-2.5 bg-[#0d0f12] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-sans text-sm resize-none"
            />
          </div>

          {/* Software checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Software & Assets Used <span className="text-gray-500 text-xs">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SOFTWARE_OPTIONS.map(sw => {
                const isActive = selectedSoftware.includes(sw);
                return (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => handleSoftwareToggle(sw)}
                    className={`px-3 py-1.5 rounded-lg border text-xs text-left transition-all flex items-center justify-between ${
                      isActive
                        ? "border-indigo-500/70 bg-indigo-500/10 text-indigo-300"
                        : "border-white/5 bg-[#0d0f12] text-gray-400 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <span>{sw}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tag-input-field" className="block text-sm font-medium text-gray-300 mb-2">
              Tags & Keywords
            </label>
            <div className="flex gap-2">
              <input
                id="tag-input-field"
                type="text"
                placeholder="Press ENTER to add tags"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(e);
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-[#0d0f12] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-sans text-sm"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1c23] border border-white/5 text-xs text-gray-300 rounded font-mono">
                    #{t}
                    <button type="button" onClick={() => removeTag(t)} className="text-gray-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
            {activeChallengeId && (
              <div className="flex-1 text-xs text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SUBMITTING TO WEEKLY CHALLENGE
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isEvaluating}
              className="px-5 py-2.5 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-medium rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEvaluating}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium rounded-lg text-sm shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-2"
            >
              Analyze & Score Project
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
