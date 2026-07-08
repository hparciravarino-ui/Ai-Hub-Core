import React, { useState } from 'react';
import { Image as ImageIcon, Video, Mic, Wand2, Download, Play, RefreshCw } from 'lucide-react';
import { chatAPI, huggingfaceGenerateAPI } from '../apiClient';

export default function MediaLab() {
  const [activeTab, setActiveTab] = useState<"image" | "video" | "audio">("image");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Suggested best OS models
  const models = {
    image: [
      { id: "flux-1-schnell", name: "FLUX.1 Schnell", type: "Image", size: "23.8 GB" },
      { id: "sd-3.5-large", name: "Stable Diffusion 3.5", type: "Image", size: "16 GB" },
    ],
    video: [
      { id: "text-to-video-ms-1.7b", name: "ModelScope T2V", type: "Video", size: "12 GB" },
      { id: "cogvideox-5b", name: "CogVideoX-5B", type: "Video", size: "9.5 GB" },
    ],
    audio: [
      { id: "stable-audio-open", name: "Stable Audio Open", type: "Audio", size: "4 GB" },
      { id: "audioldm-2", name: "AudioLDM 2", type: "Audio", size: "3.2 GB" },
    ]
  };

  const selectedModel = models[activeTab][0];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);
    setErrorMsg(null);

    const startTime = Date.now();

    try {
      // Use real API call
      const finalResult = await huggingfaceGenerateAPI(activeTab, prompt);
      setResult(finalResult);
      setGenerationTime(parseFloat(((Date.now() - startTime) / 1000).toFixed(2)));
    } catch (e: any) {
      console.error(e);
      // Fallback per immagini gratuite se non ha chiave (usando Pollinations come backup)
      if (activeTab === "image" && e.message.includes("Hugging Face API Key")) {
         setResult(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=512&nologo=true`);
         setGenerationTime(parseFloat(((Date.now() - startTime) / 1000).toFixed(2)));
      } else {
         setErrorMsg(e.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <Wand2 className="text-violet-500 w-6 h-6" />
            Media Generation Lab
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Generazione di Immagini, Video e Audio ad alta fedeltà utilizzando i migliori modelli Open Source.
          </p>
        </div>
      </div>

      <div className="flex border-b border-zinc-800 space-x-4 bg-barbg p-2 rounded-xl">
        <button
          onClick={() => { setActiveTab("image"); setResult(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === "image" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Immagini
        </button>
        <button
          onClick={() => { setActiveTab("video"); setResult(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === "video" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Video className="w-4 h-4" /> Video
        </button>
        <button
          onClick={() => { setActiveTab("audio"); setResult(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === "audio" ? "bg-zinc-800/60 text-zinc-100 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Mic className="w-4 h-4" /> Audio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 bg-appbg border border-zinc-800 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">Modelli Consigliati</h3>
            <div className="space-y-2">
              {models[activeTab].map((m) => (
                <div key={m.id} className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  selectedModel.id === m.id ? 'bg-violet-950/20 border-violet-900 text-violet-300' : 'bg-barbg border-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}>
                  <div className="font-semibold">{m.name}</div>
                  <div className="flex justify-between mt-1 text-[10px] opacity-70">
                    <span>{m.type}</span>
                    <span>{m.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-appbg border border-zinc-800 rounded-xl space-y-3">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Prompt di Generazione</label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Descrivi il ${activeTab === 'image' ? "tuo capolavoro visivo" : activeTab === 'video' ? "video che vuoi generare" : "brano o effetto sonoro"}...`}
              className="w-full bg-panelbg border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Elaborazione Tensori...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Genera {activeTab === "image" ? "Immagine" : activeTab === "video" ? "Video" : "Audio"}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="h-full min-h-[400px] p-4 bg-appbg border border-zinc-800 rounded-xl flex items-center justify-center relative overflow-hidden">
            {isGenerating ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-violet-500 animate-spin mx-auto"></div>
                <div className="text-zinc-400 font-mono text-xs">
                  Integrazione {selectedModel.name} tramite API Inference...
                </div>
              </div>
            ) : errorMsg ? (
              <div className="text-center text-red-400 text-xs flex flex-col items-center bg-red-950/20 p-6 rounded-lg border border-red-900/30">
                <Wand2 className="w-8 h-8 text-red-500 mb-4" />
                <div className="font-semibold mb-2">Errore di Generazione</div>
                <div className="max-w-md">{errorMsg}</div>
              </div>
            ) : result ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                {activeTab === "image" && (
                  <img src={result} alt="Generated output" className="max-w-full max-h-[500px] object-contain rounded-lg border border-zinc-800 shadow-2xl" />
                )}
                
                {activeTab === "video" && (
                  <video src={result} controls className="w-full max-w-lg aspect-video bg-black rounded-lg border border-zinc-800 shadow-2xl" />
                )}

                {activeTab === "audio" && (
                  <div className="w-full max-w-lg bg-barbg p-6 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
                    <audio src={result} controls className="w-full" />
                    <div className="text-[10px] text-zinc-500 font-mono mt-4">
                      Modello: {selectedModel.name}
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-mono text-zinc-500 pt-4">
                  Generato in <strong className="text-violet-400">{generationTime} secondi</strong>
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-600 text-xs flex flex-col items-center">
                <Wand2 className="w-12 h-12 text-zinc-800 mb-4" />
                Il Media Lab è in attesa.<br/>Seleziona un modello e inserisci un prompt per iniziare.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
