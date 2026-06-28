"use client";

import { Suspense, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Html,
  Environment,
  ContactShadows,
  BakeShadows,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import type { RoomHotspot } from "./apartment-viewer-section";

// ── GLB model ────────────────────────────────────────────────────────────────

function ApartmentModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow    = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

// ── Camera animator ───────────────────────────────────────────────────────────

interface CameraAnimatorProps {
  target: THREE.Vector3 | null;
  position: THREE.Vector3 | null;
  controlsRef: React.RefObject<OrbitControlsType | null>;
}

function CameraAnimator({ target, position, controlsRef }: CameraAnimatorProps) {
  const { camera } = useThree();
  const progressRef = useRef(0);
  const startPosRef = useRef(new THREE.Vector3());
  const startTgtRef = useRef(new THREE.Vector3());
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!position || !target) return;
    startPosRef.current.copy(camera.position);
    startTgtRef.current.copy(
      controlsRef.current ? (controlsRef.current.target as THREE.Vector3) : new THREE.Vector3(),
    );
    progressRef.current = 0;
    animatingRef.current = true;
  }, [position, target, camera, controlsRef]);

  useFrame((_, delta) => {
    if (!animatingRef.current || !position || !target) return;
    progressRef.current = Math.min(1, progressRef.current + delta * 1.2);
    const t = THREE.MathUtils.smoothstep(progressRef.current, 0, 1);
    camera.position.lerpVectors(startPosRef.current, position, t);
    if (controlsRef.current) {
      (controlsRef.current.target as THREE.Vector3).lerpVectors(startTgtRef.current, target, t);
      controlsRef.current.update();
    }
    if (progressRef.current >= 1) animatingRef.current = false;
  });

  return null;
}

// ── Room hotspots ─────────────────────────────────────────────────────────────

interface HotspotsProps {
  hotspots: RoomHotspot[];
  activeRoom: string | null;
  onSelect: (id: string) => void;
}

function Hotspots({ hotspots, activeRoom, onSelect }: HotspotsProps) {
  return (
    <>
      {hotspots.map((h) => (
        <Html key={h.id} position={h.labelPosition} center distanceFactor={8} zIndexRange={[10, 0]}>
          <button
            onClick={() => onSelect(h.id)}
            className={[
              "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium",
              "transition-all duration-200 cursor-pointer",
              activeRoom === h.id
                ? "border-[#C17F4A] bg-[#C17F4A] text-white shadow-lg scale-110"
                : "border-white/60 bg-black/50 text-white/90 hover:bg-[#C17F4A]/80 hover:border-[#C17F4A]",
            ].join(" ")}
          >
            {h.label}
          </button>
        </Html>
      ))}
    </>
  );
}

// ── Fallback for missing GLB ──────────────────────────────────────────────────

function PlaceholderScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });
  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[2, 1.5, 3]} />
      <meshStandardMaterial color="#C17F4A" roughness={0.6} />
    </mesh>
  );
}

// ── Main scene ────────────────────────────────────────────────────────────────

export interface ApartmentSceneProps {
  glbPath: string;
  hotspots: RoomHotspot[];
  activeRoom: string | null;
  cameraPosition: THREE.Vector3 | null;
  cameraTarget: THREE.Vector3 | null;
  onRoomSelect: (id: string) => void;
  controlsRef: React.RefObject<OrbitControlsType | null>;
  glbExists: boolean;
}

export function ApartmentScene({
  glbPath,
  hotspots,
  activeRoom,
  cameraPosition,
  cameraTarget,
  onRoomSelect,
  controlsRef,
  glbExists,
}: ApartmentSceneProps) {
  const handleCreated = useCallback(
    ({ gl }: { gl: THREE.WebGLRenderer }) => {
      gl.shadowMap.enabled = true;
      gl.shadowMap.type    = THREE.PCFSoftShadowMap;
      gl.toneMapping       = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.1;
      gl.outputColorSpace  = THREE.SRGBColorSpace;
    },
    [],
  );

  return (
    <Canvas
      shadows
      camera={{ position: [3, 2, 5], fov: 55, near: 0.1, far: 60 }}
      onCreated={handleCreated}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        color="#FFF5E0"
      />
      <pointLight position={[4, 2.5, 2]} intensity={0.6} color="#FFE8C0" />
      <pointLight position={[-2, 2.5, -2]} intensity={0.4} color="#E0EEFF" />

      <Environment preset="apartment" background={false} />

      <Suspense fallback={null}>
        {glbExists ? (
          <ApartmentModel url={glbPath} />
        ) : (
          <PlaceholderScene />
        )}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={4}
        />
        <BakeShadows />
      </Suspense>

      <CameraAnimator
        position={cameraPosition}
        target={cameraTarget}
        controlsRef={controlsRef}
      />

      <Hotspots
        hotspots={hotspots}
        activeRoom={activeRoom}
        onSelect={onRoomSelect}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={1}
        maxDistance={25}
        maxPolarAngle={Math.PI * 0.85}
        makeDefault
      />
    </Canvas>
  );
}
