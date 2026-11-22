"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Radio,
  Sparkles,
  Loader2,
  Maximize2,
} from "lucide-react";

interface ModelViewer3DProps {
  modelPath?: string;
}

export default function ModelViewer3D({
  modelPath = "/models/smart_city_iot_dustbin.glb",
}: ModelViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [simFill, setSimFill] = useState(75);

  const autoRotateRef = useRef(autoRotate);
  const zoomLevelRef = useRef(zoomLevel);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ─── Scene, Camera, Renderer ───
    const scene = new THREE.Scene();

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ─── Studio Lighting for PBR Model ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.4);
    mainLight.position.set(4, 7, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x10b981, 1.2);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    const topSoftLight = new THREE.DirectionalLight(0xffffff, 1.0);
    topSoftLight.position.set(0, 8, 0);
    scene.add(topSoftLight);

    // Root Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Soft Floor Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(1.6, 48);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x064e3b,
      transparent: true,
      opacity: 0.12,
    });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -1.05;
    scene.add(shadowDisc);

    // Animated Sonar Wave Rings
    const waveGroup = new THREE.Group();
    scene.add(waveGroup);
    const waveRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(0.35 + i * 0.18, 0.012, 12, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.8 - i * 0.4;
      waveGroup.add(ring);
      waveRings.push(ring);
    }

    // ─── Load GLB Model ───
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const root = gltf.scene;

        // Auto-center and normalize scale
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const desiredScale = 2.0 / (maxDim || 1);
        root.scale.setScalar(desiredScale);

        // Center on floor
        root.position.x = -center.x * desiredScale;
        root.position.y = -box.min.y * desiredScale - 1.05;
        root.position.z = -center.z * desiredScale;

        // Enable shadows and enhance materials
        root.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.envMapIntensity = 1.2;
            }
          }
        });

        modelGroup.add(root);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error("[ModelViewer3D] Error loading GLB model:", error);
        setLoadError("Could not load 3D model.");
        setIsLoading(false);
      }
    );

    // ─── Drag to Spin & Mouse Follow Parallax ───
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0.12;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.008;
        targetRotationX = Math.max(-0.4, Math.min(0.6, targetRotationX));
      } else {
        // Subtle gyro cursor tilt when not dragging
        const rect = container.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        if (!autoRotateRef.current) {
          targetRotationY += (nx * 0.4 - targetRotationY) * 0.05;
        }
        targetRotationX = 0.12 - ny * 0.3;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        targetRotationY += deltaX * 0.012;
        targetRotationX += deltaY * 0.008;
      }
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });

    // Resize Handler
    const onResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 520;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", onResize);

    // ─── Render Loop ───
    let animId: number;
    const clock = new THREE.Clock();

    const animateLoop = () => {
      animId = requestAnimationFrame(animateLoop);
      const elapsed = clock.getElapsedTime();

      // Auto Turntable Orbit
      if (autoRotateRef.current && !isDragging) {
        targetRotationY += 0.008;
      }

      // Smooth Rotation LERP
      modelGroup.rotation.y += (targetRotationY - modelGroup.rotation.y) * 0.08;
      modelGroup.rotation.x += (targetRotationX - modelGroup.rotation.x) * 0.08;

      // Gentle Floating Breathing Motion
      modelGroup.position.y = Math.sin(elapsed * 1.5) * 0.04;

      // Dynamic Camera Zoom LERP
      const targetCamZ = 3.8 / zoomLevelRef.current;
      camera.position.z += (targetCamZ - camera.position.z) * 0.1;

      // Sonar Sound Wave propagation
      waveRings.forEach((ring, idx) => {
        const speed = 1.6;
        const p = (elapsed * speed + idx * (1 / 3)) % 1;
        ring.position.y = 0.9 - p * 1.8;
        const s = 0.6 + p * 0.7;
        ring.scale.set(s, s, s);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          (1 - p) * 0.65
        );
      });

      renderer.render(scene, camera);
    };

    animateLoop();

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [modelPath]);

  const handleReset = () => {
    setAutoRotate(true);
    setZoomLevel(1);
    setSimFill(75);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] sm:h-[560px] rounded-3xl bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/30 border-2 border-emerald-200/90 shadow-2xl shadow-emerald-950/10 flex flex-col justify-between p-4 overflow-hidden select-none group"
    >
      {/* ── Top Bar ── */}
      <div className="w-full flex items-center justify-between z-10 px-2 pt-1">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
            3D IoT Digital Twin
          </span>
        </div>

        {/* Live Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all ${
            simFill >= 80
              ? "bg-red-50 text-red-700 border-red-200"
              : simFill >= 50
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>
            {simFill}% {simFill >= 80 ? "Critical (≥80%)" : simFill >= 50 ? "Attention" : "Normal"}
          </span>
        </div>
      </div>

      {/* ── Loading / Error State ── */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs z-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
          <span className="text-xs font-bold text-emerald-950">
            Rendering 3D Smart Dustbin Model...
          </span>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 p-4 text-center z-20">
          <span className="text-xs font-bold text-red-600 mb-2">{loadError}</span>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* ── WebGL Canvas with Click & Drag ── */}
      <div className="relative w-full flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Floating Drag Hint Pill */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 backdrop-blur-xs border border-emerald-200 shadow-xs text-[11px] font-bold text-zinc-600 pointer-events-none group-hover:opacity-100 transition-opacity">
          <Maximize2 className="w-3 h-3 text-emerald-600" />
          <span>Drag to spin 360° • Mouse tilt enabled</span>
        </div>
      </div>

      {/* ── Bottom Controls Strip ── */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/80 p-3 shadow-md z-10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Simulated Fill Slider */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Ultrasonic Depth:</span>
              </span>
              <span
                className="font-mono text-xs font-black"
                style={{
                  color: simFill >= 80 ? "#dc2626" : simFill >= 50 ? "#d97706" : "#059669",
                }}
              >
                {simFill}% Full ({100 - simFill} cm)
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              value={simFill}
              onChange={(e) => setSimFill(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${
                  simFill >= 80 ? "#dc2626" : simFill >= 50 ? "#d97706" : "#059669"
                } ${simFill}%, #e5e7eb ${simFill}%)`,
              }}
            />
          </div>

          {/* Action Buttons: Auto-rotate, Zoom, Reset */}
          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                autoRotate
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-emerald-50"
              }`}
              title={autoRotate ? "Pause Auto-Rotation" : "Start Auto-Rotation"}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
              className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-zinc-700 border border-zinc-200 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-zinc-700 border border-zinc-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-zinc-700 border border-zinc-200 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Feature Highlights Footer */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 mt-2.5 pt-2 border-t border-emerald-50">
          <span>✓ Authentic 3D Mesh (.GLB)</span>
          <span>✓ Ultrasonic Sonar Waves</span>
          <span>✓ Interactive Gyro Rotation</span>
        </div>
      </div>
    </div>
  );
}
