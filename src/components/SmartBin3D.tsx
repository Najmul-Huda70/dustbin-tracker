"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Radio, Eye, RefreshCw, Zap } from "lucide-react";

interface SmartBin3DProps {
  initialFill?: number;
}

export default function SmartBin3D({ initialFill = 65 }: SmartBin3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [fillLevel, setFillLevel] = useState(initialFill);
  const [isOpen, setIsOpen] = useState(false);

  // Refs for animation loop
  const fillLevelRef = useRef(initialFill);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    fillLevelRef.current = fillLevel;
  }, [fillLevel]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ─── Scene, Camera, Renderer ───
    const scene = new THREE.Scene();

    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 5.2);

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

    // ─── Lighting ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(4, 8, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x10b981, 1.0);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(0, -4, -4);
    scene.add(rimLight);

    // Dynamic LED PointLight
    const ledLight = new THREE.PointLight(0x10b981, 1.5, 4);
    ledLight.position.set(0, 1.15, 0.95);
    scene.add(ledLight);

    // ─── Main Group (For Tilt & Follow Cursor) ───
    const binGroup = new THREE.Group();
    binGroup.position.set(0, -0.4, 0);
    scene.add(binGroup);

    // ─── 3D Smart Dustbin Meshes ───
    // 1. Bin Outer Shell
    const binHeight = 2.4;
    const binRadiusTop = 0.85;
    const binRadiusBottom = 0.72;

    const binGeometry = new THREE.CylinderGeometry(
      binRadiusTop,
      binRadiusBottom,
      binHeight,
      48,
      1,
      true
    );
    const binMaterial = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Deep Eco Emerald Green
      roughness: 0.25,
      metalness: 0.45,
      side: THREE.DoubleSide,
    });
    const binMesh = new THREE.Mesh(binGeometry, binMaterial);
    binMesh.position.y = binHeight / 2;
    binMesh.castShadow = true;
    binMesh.receiveShadow = true;
    binGroup.add(binMesh);

    // Bin Bottom Cap
    const bottomGeometry = new THREE.CircleGeometry(binRadiusBottom, 48);
    const bottomMaterial = new THREE.MeshStandardMaterial({ color: 0x022c22, roughness: 0.4 });
    const bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottomMesh.rotation.x = Math.PI / 2;
    bottomMesh.position.y = 0.01;
    binGroup.add(bottomMesh);

    // Rim Ring
    const rimGeometry = new THREE.TorusGeometry(binRadiusTop, 0.035, 16, 64);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.8,
      roughness: 0.2,
    });
    const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = binHeight;
    binGroup.add(rimMesh);

    // Front Smart Badge
    const badgeGeo = new THREE.PlaneGeometry(0.5, 0.22);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.2,
      emissive: 0x065f46,
      emissiveIntensity: 0.2,
    });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.position.set(0, 1.4, 0.84);
    badgeMesh.rotation.y = 0;
    binGroup.add(badgeMesh);

    // 2. Waste Level Inside (Animated Height)
    const maxWasteHeight = binHeight * 0.92;
    const wasteGeometry = new THREE.CylinderGeometry(
      binRadiusTop * 0.94,
      binRadiusBottom * 0.96,
      1,
      36
    );
    const wasteMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.5,
      metalness: 0.15,
      emissive: 0x047857,
      emissiveIntensity: 0.2,
    });
    const wasteMesh = new THREE.Mesh(wasteGeometry, wasteMaterial);
    wasteMesh.position.y = 0.5;
    binGroup.add(wasteMesh);

    // 3. Lid & Hinge Pivot
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, binHeight, -binRadiusTop);
    binGroup.add(lidPivot);

    const lidGeometry = new THREE.CylinderGeometry(
      binRadiusTop * 1.04,
      binRadiusTop * 1.02,
      0.12,
      48
    );
    const lidMaterial = new THREE.MeshStandardMaterial({
      color: 0x047857,
      roughness: 0.2,
      metalness: 0.6,
    });
    const lidMesh = new THREE.Mesh(lidGeometry, lidMaterial);
    lidMesh.position.set(0, 0.06, binRadiusTop);
    lidMesh.castShadow = true;
    lidPivot.add(lidMesh);

    // Lid Handle
    const handleGeo = new THREE.BoxGeometry(0.35, 0.06, 0.1);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.9, roughness: 0.1 });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.position.set(0, 0.14, binRadiusTop);
    lidPivot.add(handleMesh);

    // 4. HC-SR04 Ultrasonic Sensor on the Lid / Rim
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(0, 0.16, binRadiusTop * 0.7);
    lidPivot.add(sensorGroup);

    // Sensor PCB Board
    const pcbGeo = new THREE.BoxGeometry(0.42, 0.03, 0.2);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 }); // Blue PCB
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    sensorGroup.add(pcbMesh);

    // Ultrasonic Transducer Cylinders (Transmitter T & Receiver R)
    const barrelGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.09, 24);
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.9,
      roughness: 0.2,
    });

    const barrel1 = new THREE.Mesh(barrelGeo, barrelMat);
    barrel1.rotation.x = Math.PI / 2;
    barrel1.position.set(-0.11, 0.04, 0);
    sensorGroup.add(barrel1);

    const barrel2 = new THREE.Mesh(barrelGeo, barrelMat);
    barrel2.rotation.x = Math.PI / 2;
    barrel2.position.set(0.11, 0.04, 0);
    sensorGroup.add(barrel2);

    // 5. Status LEDs (Red & Green)
    const ledGeo = new THREE.SphereGeometry(0.035, 16, 16);

    const greenLedMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });
    const greenLed = new THREE.Mesh(ledGeo, greenLedMat);
    greenLed.position.set(0.24, 0.05, 0.06);
    sensorGroup.add(greenLed);

    const redLedMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.2,
      roughness: 0.1,
    });
    const redLed = new THREE.Mesh(ledGeo, redLedMat);
    redLed.position.set(0.24, 0.05, -0.06);
    sensorGroup.add(redLed);

    // 6. Floating Ultrasonic Sound Wave Rings
    const waveRings: THREE.Mesh[] = [];
    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      const ringGeo = new THREE.TorusGeometry(0.15 + i * 0.12, 0.012, 12, 36);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, -0.15 - i * 0.25, 0);
      sensorGroup.add(ringMesh);
      waveRings.push(ringMesh);
    }

    // Pedestal Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.01;
    shadowMesh.receiveShadow = true;
    binGroup.add(shadowMesh);

    // ─── Mouse Follow & Gyro State ───
    let targetRotationX = 0.15;
    let targetRotationY = -0.3;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 0.85;
      targetRotationX = 0.15 - y * 0.55;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // ─── Raycaster Click on Bin to Open Lid ───
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseCoord, camera);
      const intersects = raycaster.intersectObjects(binGroup.children, true);
      if (intersects.length > 0) {
        setIsOpen((prev) => !prev);
      }
    };

    canvas.addEventListener("click", handleCanvasClick);

    // ─── Resize Handler ───
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 480;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // ─── Render / Animation Loop ───
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // 1. Gyro Tilt Smooth LERP
      binGroup.rotation.y += (targetRotationY - binGroup.rotation.y) * 0.06;
      binGroup.rotation.x += (targetRotationX - binGroup.rotation.x) * 0.06;

      // Gentle floating breathing animation
      binGroup.position.y = -0.4 + Math.sin(elapsedTime * 1.5) * 0.04;

      // 2. Click & Open Lid Hinge LERP
      const targetLidAngle = isOpenRef.current ? -Math.PI * 0.52 : 0;
      lidPivot.rotation.x += (targetLidAngle - lidPivot.rotation.x) * 0.1;

      // 3. Dynamic Waste Level Height & Color
      const currentFill = fillLevelRef.current;
      const targetHeight = Math.max(0.1, (currentFill / 100) * maxWasteHeight);
      wasteMesh.scale.y += (targetHeight - wasteMesh.scale.y) * 0.08;
      wasteMesh.position.y = wasteMesh.scale.y / 2 + 0.02;

      // Dynamic Color based on fill
      const isCrit = currentFill >= 80;
      const isAttn = currentFill >= 50 && currentFill < 80;

      const wasteColor = isCrit ? 0xdc2626 : isAttn ? 0xd97706 : 0x059669;
      (wasteMaterial.color as THREE.Color).setHex(wasteColor);
      (wasteMaterial.emissive as THREE.Color).setHex(wasteColor);

      // 4. Glowing Status LEDs Pulsation
      const pulse = Math.sin(elapsedTime * 6) * 0.5 + 0.5;
      if (isCrit) {
        // Red LED pulses urgently
        redLedMat.emissiveIntensity = 1.5 + pulse * 2.0;
        greenLedMat.emissiveIntensity = 0.1;
        ledLight.color.setHex(0xef4444);
        ledLight.intensity = 1.2 + pulse * 1.5;
      } else {
        // Green LED breathes softly
        const softPulse = Math.sin(elapsedTime * 2.5) * 0.3 + 0.7;
        greenLedMat.emissiveIntensity = 1.5 + softPulse * 1.0;
        redLedMat.emissiveIntensity = 0.1;
        ledLight.color.setHex(0x10b981);
        ledLight.intensity = 1.0 + softPulse * 0.8;
      }

      // 5. Floating Ultrasonic Sound Waves (Propagating downward)
      waveRings.forEach((ring, idx) => {
        const speed = 1.8;
        const progress = (elapsedTime * speed + idx * (1 / ringCount)) % 1;
        ring.position.y = -0.05 - progress * 0.9;
        const scale = 0.8 + progress * 0.6;
        ring.scale.set(scale, scale, scale);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          (1 - progress) * 0.75
        );
      });

      renderer.render(scene, camera);
    };

    animate();

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("click", handleCanvasClick);

      // Dispose Geometries and Materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] sm:h-[520px] rounded-3xl bg-gradient-to-b from-white via-emerald-50/40 to-emerald-100/30 border border-emerald-200/80 shadow-2xl shadow-emerald-950/10 flex flex-col items-center justify-between p-4 overflow-hidden group select-none"
    >
      {/* ── Top Floating Badges ── */}
      <div className="w-full flex items-center justify-between z-10 px-2 pt-1 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-900">
            Interactive 3D IoT Model
          </span>
        </div>

        {/* Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs border ${
            fillLevel >= 80
              ? "bg-red-50 text-red-700 border-red-200"
              : fillLevel >= 50
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>
            {fillLevel}% {fillLevel >= 80 ? "Critical" : fillLevel >= 50 ? "Attention" : "Normal"}
          </span>
        </div>
      </div>

      {/* ── Three.js WebGL Canvas ── */}
      <div className="relative w-full flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Ambient Click Hint */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-emerald-950 text-xs font-bold border border-emerald-200 shadow-md backdrop-blur-xs transition-all hover:scale-105 active:scale-95"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isOpen ? "Click to Close Lid" : "Click Bin to Open Lid"}</span>
        </button>
      </div>

      {/* ── Bottom Interactive Controller Strip ── */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-100 p-3 shadow-sm z-10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Fill Slider Controller */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-1">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Simulate 3D Fill Level:
              </span>
              <span
                className="font-mono text-sm font-black"
                style={{
                  color: fillLevel >= 80 ? "#dc2626" : fillLevel >= 50 ? "#d97706" : "#059669",
                }}
              >
                {fillLevel}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={98}
              value={fillLevel}
              onChange={(e) => setFillLevel(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${
                  fillLevel >= 80 ? "#dc2626" : fillLevel >= 50 ? "#d97706" : "#059669"
                } ${fillLevel}%, #e5e7eb ${fillLevel}%)`,
              }}
            />
          </div>

          {/* Quick Lid Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                isOpen
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              {isOpen ? "Lid Open ✓" : "Open Lid"}
            </button>
            <button
              onClick={() => {
                setFillLevel(25);
                setIsOpen(false);
              }}
              className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200"
              title="Reset 3D Bin"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Feature Badges Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2.5 pt-2 border-t border-emerald-50 text-[10px] font-semibold text-zinc-500">
          <span className="flex items-center gap-1 text-emerald-700">
            ✓ Gyro Tilt
          </span>
          <span className="flex items-center gap-1 text-emerald-700">
            ✓ Click & Open
          </span>
          <span className="flex items-center gap-1 text-emerald-700">
            ✓ Glowing LED
          </span>
          <span className="flex items-center gap-1 text-emerald-700">
            ✓ Ultrasonic Waves
          </span>
        </div>
      </div>
    </div>
  );
}
