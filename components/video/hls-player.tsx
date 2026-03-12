"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Loader2, AlertTriangle, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HlsPlayerProps {
  videoId: string;
  /** Fallback direct video URL for legacy lessons without HLS */
  fallbackUrl?: string;
  onEnded?: () => void;
  className?: string;
}

export function HlsPlayer({ videoId, fallbackUrl, onEnded, className }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [status, setStatus] = useState<"loading" | "processing" | "ready" | "error" | "fallback">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentQuality, setCurrentQuality] = useState<string>("auto");

  const loadHls = useCallback(async () => {
    try {
      const res = await fetch(`/api/videos/${videoId}/play`);

      if (!res.ok) {
        // Check if video is still processing
        const statusRes = await fetch(`/api/videos/${videoId}/status`);
        if (statusRes.ok) {
          const { status: videoStatus }: { status: string } = await statusRes.json();
          if (videoStatus === "PROCESSING" || videoStatus === "UPLOADING") {
            setStatus("processing");
            return;
          }
        }

        // If we have a fallback URL, use it
        if (fallbackUrl) {
          setStatus("fallback");
          return;
        }

        setStatus("error");
        setErrorMessage("Video not available");
        return;
      }

      const { url }: { url: string } = await res.json();

      if (!url) {
        if (fallbackUrl) {
          setStatus("fallback");
          return;
        }
        setStatus("error");
        setErrorMessage("No video URL available");
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      // Check HLS support
      if (Hls.isSupported()) {
        // Destroy existing instance
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          // hls.js resolves sub-resource URLs relative to the master playlist's
          // origin (R2 bucket). Our rewritten playlists use /api/hls?key=... paths,
          // which get incorrectly resolved to https://r2.../api/hls?key=...
          // causing CORS errors. We intercept and rewrite them to our app origin.
          xhrSetup: (xhr, url) => {
            if (url.includes('/api/hls')) {
              const path = url.substring(url.indexOf('/api/hls'));
              xhr.open('GET', path, true);
            }
          },
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus("ready");
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          const level = hls.levels[data.level];
          if (level) {
            setCurrentQuality(`${level.height}p`);
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error("[HLS] Fatal error:", data);
            if (fallbackUrl) {
              hls.destroy();
              setStatus("fallback");
            } else {
              setStatus("error");
              setErrorMessage("Playback error");
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          setStatus("ready");
        });
      } else {
        if (fallbackUrl) {
          setStatus("fallback");
        } else {
          setStatus("error");
          setErrorMessage("HLS not supported in this browser");
        }
      }
    } catch (err) {
      console.error("[HLS] Load error:", err);
      if (fallbackUrl) {
        setStatus("fallback");
      } else {
        setStatus("error");
        setErrorMessage("Failed to load video");
      }
    }
  }, [videoId, fallbackUrl]);

  // Poll for processing status
  useEffect(() => {
    if (status !== "processing") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/videos/${videoId}/status`);
        if (res.ok) {
          const { status: videoStatus }: { status: string } = await res.json();
          if (videoStatus === "READY") {
            clearInterval(interval);
            setStatus("loading");
            loadHls();
          } else if (videoStatus === "FAILED") {
            clearInterval(interval);
            if (fallbackUrl) {
              setStatus("fallback");
            } else {
              setStatus("error");
              setErrorMessage("Video processing failed");
            }
          }
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [status, videoId, fallbackUrl, loadHls]);

  // Initial load
  useEffect(() => {
    if (videoId) {
      loadHls();
    } else if (fallbackUrl) {
      setStatus("fallback");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoId, loadHls, fallbackUrl]);

  // Prevent right-click / context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div className={`relative bg-black w-full h-full ${className || ""}`}>
      {/* Processing state */}
      {status === "processing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4 z-10">
          <Loader2 className="animate-spin" size={40} />
          <div className="text-center space-y-2">
            <p className="font-bold text-lg">Processing Video...</p>
            <p className="text-sm text-white/60">
              Your video is being transcoded to HLS format. This may take a few minutes.
            </p>
          </div>
          <Badge variant="outline" className="border-yellow-500 text-yellow-400 font-bold">
            <Loader2 size={12} className="animate-spin mr-1" />
            TRANSCODING
          </Badge>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 z-10">
          <AlertTriangle className="text-red-400" size={40} />
          <p className="font-bold">{errorMessage || "Playback error"}</p>
        </div>
      )}

      {/* Loading state */}
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="animate-spin text-white" size={32} />
        </div>
      )}

      {/* Quality badge */}
      {status === "ready" && currentQuality && (
        <div className="absolute top-3 right-3 z-20">
          <Badge variant="secondary" className="bg-black/60 text-white border-none font-bold text-xs backdrop-blur-sm">
            {currentQuality === "auto" ? "AUTO" : currentQuality}
          </Badge>
        </div>
      )}

      {/* HLS Video element */}
      {(status === "loading" || status === "ready") && (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          playsInline
          onContextMenu={handleContextMenu}
          onEnded={onEnded}
        />
      )}

      {/* Fallback: direct video */}
      {status === "fallback" && fallbackUrl && (
        <video
          src={fallbackUrl}
          className="w-full h-full object-contain"
          controls
          controlsList="nodownload"
          playsInline
          onContextMenu={handleContextMenu}
          onEnded={onEnded}
        />
      )}
    </div>
  );
}
