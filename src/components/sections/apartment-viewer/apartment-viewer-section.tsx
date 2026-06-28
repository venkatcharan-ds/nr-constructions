"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

// Lazy-load the heavy Canvas component — never SSR
const ApartmentScene = dynamic(
  () => import("./apartment-viewer-scene").then((m) => ({ default: m.ApartmentScene })),
  { ssr: false },
);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RoomHotspot {
  id: string;
  label: string;
  /** World-space position of the floating label */
  labelPosition: [number, number, number];
  /** Camera position when this room is selected */
  cameraPosition: [number, number, number];
  /** OrbitControls target when this room is selected */
  cameraTarget: [number, number, number];
}

// ── Room definitions (matched to build_apartment.py coordinates) ──────────────

const ROOMS: RoomHotspot[] = [
  {
    id: "living",
    label: "Living & Dining",
    labelPosition: [4.0, 2.0, 2.2],
    cameraPosition: [1.8, 1.8, 5.5],
    cameraTarget:   [4.0, 1.0, 2.0],
  },
  {
    id: "kitchen",
    label: "Kitchen",
    labelPosition: [7.8, 2.0, 1.5],
    cameraPosition: [6.2, 2.0, 4.5],
    cameraTarget:   [8.0, 0.9, 1.2],
  },
  {
    id: "master-br",
    label: "Master Bedroom",
    labelPosition: [2.0, 2.0, -5.5],
    cameraPosition: [4.5, 2.0, -3.5],
    cameraTarget:   [1.0, 0.9, -6.0],
  },
  {
    id: "bedroom2",
    label: "Bedroom 2",
    labelPosition: [6.0, 2.0, -5.5],
    cameraPosition: [8.5, 2.0, -3.5],
    cameraTarget:   [5.5, 0.9, -6.0],
  },
  {
    id: "balcony",
    label: "Balcony",
    labelPosition: [7.8, 2.0, -2.5],
    cameraPosition: [6.0, 2.0, -1.5],
    cameraTarget:   [8.0, 1.0, -3.0],
  },
];

const DEFAULT_CAMERA_POS = new THREE.Vector3(6, 4, 10);
const DEFAULT_CAMERA_TGT = new THREE.Vector3(4.5, 1.2, 3);

const GLB_PATH = "/assets/3d/apartment.glb";

// ── Loading overlay ───────────────────────────────────────────────────────────

function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1A18] z-20">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-2 border-[#C17F4A]/30 rounded-full relative">
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C17F4A]"
            style={{ animation: "spin 1s linear infinite" }}
          />
        </div>
        <p className="text-[#F5F2ED] text-sm font-medium tracking-widest uppercase">
          Loading Apartment
        </p>
        <p className="text-[#8C8680] text-xs mt-1">3D Virtual Tour</p>
      </div>
      <div className="w-48 h-0.5 bg-[#8C8680]/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#C17F4A] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[#8C8680] text-xs mt-3">{Math.round(progress)}%</p>
    </div>
  );
}

// ── No-GLB notice ─────────────────────────────────────────────────────────────

function NoGlbNotice() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-center max-w-sm">
        <p className="text-white/70 text-xs">
          3D model not yet available — showing preview mode.{" "}
          <span className="text-[#C17F4A]">Run build_apartment.py in Blender to generate the GLB.</span>
        </p>
      </div>
    </div>
  );
}

// ── Control bar ───────────────────────────────────────────────────────────────

interface ControlBarProps {
  isFullscreen: boolean;
  onFullscreen: () => void;
  onReset: () => void;
}

function ControlBar({ isFullscreen, onFullscreen, onReset }: ControlBarProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <button
        onClick={onReset}
        title="Reset camera"
        className="w-9 h-9 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20
                   flex items-center justify-center text-white/80 hover:text-white
                   hover:bg-black/70 transition-all duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
        </svg>
      </button>
      <button
        onClick={onFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        className="w-9 h-9 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20
                   flex items-center justify-center text-white/80 hover:text-white
                   hover:bg-black/70 transition-all duration-150"
      >
        {isFullscreen ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.5 1h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 1zm9 0a.5.5 0 0 1 0-1h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4zm-9 9a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm13 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 14.5 16h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
          </svg>
        )}
      </button>
    </div>
  );
}

// ── Room selector tabs ────────────────────────────────────────────────────────

interface RoomTabsProps {
  rooms: RoomHotspot[];
  activeRoom: string | null;
  onSelect: (id: string) => void;
}

function RoomTabs({ rooms, activeRoom, onSelect }: RoomTabsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex gap-2 bg-black/50 backdrop-blur-md rounded-full px-3 py-2 border border-white/10">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onSelect(room.id)}
            className={[
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap",
              activeRoom === room.id
                ? "bg-[#C17F4A] text-white shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/10",
            ].join(" ")}
          >
            {room.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

export function ApartmentViewerSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef  = useRef<OrbitControlsType | null>(null);

  const [isLoading,    setIsLoading]    = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRoom,   setActiveRoom]   = useState<string | null>(null);
  const [camPos,       setCamPos]       = useState<THREE.Vector3 | null>(null);
  const [camTgt,       setCamTgt]       = useState<THREE.Vector3 | null>(null);
  const [glbExists,    setGlbExists]    = useState(false);
  const [sceneReady,   setSceneReady]   = useState(false);

  // Simulate loading progress + check GLB availability
  useEffect(() => {
    let frame: number;
    let start: number | null = null;

    // Check if GLB file exists
    fetch(GLB_PATH, { method: "HEAD" })
      .then((r) => setGlbExists(r.ok))
      .catch(() => setGlbExists(false));

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(90, (elapsed / 2000) * 90);
      setLoadProgress(p);
      if (p < 90) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const timeout = setTimeout(() => {
      setLoadProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setSceneReady(true);
      }, 400);
    }, 2400);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, []);

  // Fullscreen
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleReset = useCallback(() => {
    setActiveRoom(null);
    setCamPos(DEFAULT_CAMERA_POS.clone());
    setCamTgt(DEFAULT_CAMERA_TGT.clone());
  }, []);

  const handleRoomSelect = useCallback((id: string) => {
    const room = ROOMS.find((r) => r.id === id);
    if (!room) return;
    setActiveRoom(id);
    setCamPos(new THREE.Vector3(...room.cameraPosition));
    setCamTgt(new THREE.Vector3(...room.cameraTarget));
  }, []);

  return (
    <section id="virtual-tour" className="bg-[#1A1A18] py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-[#C17F4A] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Virtual Tour
          </p>
          <h2 className="text-[#F5F2ED] text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Explore the Apartment in 3D
          </h2>
          <p className="text-[#8C8680] text-base max-w-xl mx-auto">
            Navigate through every room. Drag to rotate, scroll to zoom, or
            select a room below.
          </p>
        </motion.div>

        {/* Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden border border-white/10"
            style={{ height: isFullscreen ? "100vh" : "min(70vh, 640px)" }}
          >
            {/* Loading */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  key="loader"
                  className="absolute inset-0 z-20"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <LoadingOverlay progress={loadProgress} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3D Scene — always mounted so GLB starts loading immediately */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: sceneReady ? 1 : 0 }}
            >
              <ApartmentScene
                glbPath={GLB_PATH}
                hotspots={ROOMS}
                activeRoom={activeRoom}
                cameraPosition={camPos}
                cameraTarget={camTgt}
                onRoomSelect={handleRoomSelect}
                controlsRef={controlsRef}
                glbExists={glbExists}
              />
            </div>

            {/* Controls */}
            {sceneReady && (
              <>
                <ControlBar
                  isFullscreen={isFullscreen}
                  onFullscreen={handleFullscreen}
                  onReset={handleReset}
                />
                <RoomTabs
                  rooms={ROOMS}
                  activeRoom={activeRoom}
                  onSelect={handleRoomSelect}
                />
                {!glbExists && <NoGlbNotice />}
              </>
            )}
          </div>
        </motion.div>

        {/* Room cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
        >
          {ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => handleRoomSelect(room.id)}
              className={[
                "rounded-xl border p-3 text-left transition-all duration-200 group",
                activeRoom === room.id
                  ? "border-[#C17F4A] bg-[#C17F4A]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
              ].join(" ")}
            >
              <div className={[
                "w-2 h-2 rounded-full mb-2 transition-colors",
                activeRoom === room.id ? "bg-[#C17F4A]" : "bg-white/30 group-hover:bg-white/50",
              ].join(" ")} />
              <span className={[
                "text-xs font-medium block transition-colors",
                activeRoom === room.id ? "text-[#C17F4A]" : "text-white/70 group-hover:text-white",
              ].join(" ")}>
                {room.label}
              </span>
            </button>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
