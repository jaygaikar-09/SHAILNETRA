import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useRiskData } from '../../context/RiskDataContext.jsx';
import Topbar from '../../components/Topbar.jsx';
import RiskBadge from '../../components/RiskBadge.jsx';
import { riskColor } from '../../components/RiskBadge.jsx';

// Builds a stepped open-pit "bowl" geometry: concentric benches descending
// toward a pit floor, echoing the real terraced structure of an open-pit mine.
function buildPitMesh() {
  const group = new THREE.Group();
  const benchCount = 6;
  const maxRadius = 6.4;

  for (let i = 0; i < benchCount; i += 1) {
    const t = i / (benchCount - 1);
    const radius = maxRadius * (1 - t * 0.72);
    const y = -t * 2.6;
    const geo = new THREE.RingGeometry(radius * 0.86, radius, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.09, 0.28, 0.22 - t * 0.09),
      roughness: 0.95,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = y;
    group.add(ring);
  }

  const floorGeo = new THREE.CircleGeometry(maxRadius * 0.24, 48);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.65;
  group.add(floor);

  return group;
}

function buildZoneMarker(zone) {
  const group = new THREE.Group();
  const color = new THREE.Color(riskColor(zone.riskLevel));

  const coreGeo = new THREE.SphereGeometry(0.14, 20, 20);
  const coreMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.9,
    roughness: 0.3,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const beamGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.4, 8);
  const beamMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45 });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 0.7;
  group.add(beam);

  const ringGeo = new THREE.RingGeometry(0.18, 0.22, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  group.add(ring);

  group.userData.pulseRing = ring;
  group.userData.zoneId = zone.id;
  return group;
}

export default function DigitalTwin3D() {
  const mountRef = useRef(null);
  const { zones } = useRiskData();
  const [selectedZone, setSelectedZone] = useState(null);
  const sceneRef = useRef({});

  // Scene bootstrap — runs once
  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0D10');
    scene.fog = new THREE.FogExp2('#0A0D10', 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7, 6, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI / 2.05;

    const ambient = new THREE.AmbientLight('#8FA3AF', 0.55);
    const key = new THREE.DirectionalLight('#E8B85C', 1.1);
    key.position.set(6, 10, 4);
    const rim = new THREE.DirectionalLight('#3ED598', 0.25);
    rim.position.set(-6, 4, -6);
    scene.add(ambient, key, rim);

    const pit = buildPitMesh();
    scene.add(pit);

    const grid = new THREE.GridHelper(20, 40, '#232B33', '#161B20');
    grid.position.y = -2.68;
    scene.add(grid);

    const markerGroup = new THREE.Group();
    scene.add(markerGroup);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function onClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(markerGroup.children, true);
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.zoneId) obj = obj.parent;
        if (obj.userData.zoneId) setSelectedZone(obj.userData.zoneId);
      }
    }
    renderer.domElement.addEventListener('click', onClick);

    let frameId;
    const clock = new THREE.Clock();
    function animate() {
      const elapsed = clock.getElapsedTime();
      markerGroup.children.forEach((m) => {
        const ring = m.userData.pulseRing;
        if (ring) {
          const s = 1 + ((elapsed * 0.8) % 1) * 1.4;
          ring.scale.set(s, s, 1);
          ring.material.opacity = Math.max(0, 0.55 - ((elapsed * 0.8) % 1) * 0.55);
        }
      });
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    sceneRef.current = { scene, camera, renderer, markerGroup, controls };

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onClick);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // Sync zone markers whenever risk data updates
  useEffect(() => {
    const { markerGroup } = sceneRef.current;
    if (!markerGroup) return;
    markerGroup.clear();
    zones.forEach((zone) => {
      const marker = buildZoneMarker(zone);
      marker.position.set(zone.position.x, 0.02, zone.position.z);
      markerGroup.add(marker);
    });
  }, [zones]);

  const activeZone = zones.find((z) => z.id === selectedZone);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar subtitle="Module 06 · 3D Visualization" title="Mine Digital Twin" />
      <div className="flex-1 relative">
        <div ref={mountRef} className="absolute inset-0" />

        <div className="absolute top-4 left-4 panel px-3.5 py-2.5 text-xs text-ink-300 max-w-[220px]">
          <p className="eyebrow mb-1">Controls</p>
          <p>Drag to orbit · scroll to zoom · click a marker for zone detail</p>
        </div>

        <div className="absolute top-4 right-4 panel px-4 py-3 space-y-1.5">
          <p className="eyebrow mb-1.5">Legend</p>
          {['LOW', 'MEDIUM', 'HIGH'].map((lvl) => (
            <div key={lvl} className="flex items-center gap-2 text-xs text-ink-300">
              <span className="h-2 w-2 rounded-full" style={{ background: riskColor(lvl) }} />
              {lvl.charAt(0) + lvl.slice(1).toLowerCase()} risk
            </div>
          ))}
        </div>

        {activeZone && (
          <div className="absolute bottom-4 left-4 panel px-4 py-3.5 w-72">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm">{activeZone.name}</p>
              <RiskBadge level={activeZone.riskLevel} size="sm" />
            </div>
            <p className="font-mono text-3xl font-semibold mb-2">
              {activeZone.riskScore}
              <span className="text-sm text-ink-500">%</span>
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono text-ink-500">
              <span>Rainfall</span>
              <span className="text-ink-300 text-right">{activeZone.params.rainfall} mm/hr</span>
              <span>Slope angle</span>
              <span className="text-ink-300 text-right">{activeZone.params.slopeAngle}°</span>
              <span>Displacement</span>
              <span className="text-ink-300 text-right">{activeZone.params.displacement} mm</span>
              <span>Crack width</span>
              <span className="text-ink-300 text-right">{activeZone.params.crackWidth} mm</span>
              <span>Vibration</span>
              <span className="text-ink-300 text-right">{activeZone.params.vibration} mm/s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
