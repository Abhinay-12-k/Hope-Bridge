import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const Hero3D = () => {
    const containerRef = useRef();

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance" 
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        camera.position.z = 25; 

        // Colors
        const gold = "#C9A84C";
        const planet1Green = "#1a5c38";
        const planet2Green = "#1e6b45";
        const lightGold = "#d4a853";
        const ambientGreen = "#0d3a1e";
        const moonColor = "#d4c5a0";

        // --- 1. LIGHTING (Shared Solar Source) ---
        const dirLight = new THREE.DirectionalLight(lightGold, 1.0);
        dirLight.position.set(-15, 20, 15); 
        scene.add(dirLight);
        scene.add(new THREE.AmbientLight(ambientGreen, 0.3));

        // --- 2. PLANET 1 (Hope Planet - Bottom Right Anchor) ---
        const p1Group = new THREE.Group();
        scene.add(p1Group);

        const planet1 = new THREE.Mesh(
            new THREE.SphereGeometry(1, 64, 64),
            new THREE.MeshStandardMaterial({ color: planet1Green, emissive: "#8a6a1a", emissiveIntensity: 0.2, roughness: 0.75, metalness: 0.15 })
        );
        p1Group.add(planet1);

        const halo1 = new THREE.Mesh(
            new THREE.SphereGeometry(1.18, 64, 64),
            new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.05, side: THREE.BackSide, depthWrite: false })
        );
        p1Group.add(halo1);

        // Moon
        const moon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), new THREE.MeshStandardMaterial({ color: moonColor, roughness: 1.0 }));
        p1Group.add(moon);
        const orbitLine = new THREE.Points(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0,0,2.5,2.5).getPoints(100)), new THREE.PointsMaterial({ color: gold, size: 0.04, transparent: true, opacity: 0.1 }));
        orbitLine.rotation.x = Math.PI / 2; orbitLine.rotation.y = 0.43;
        p1Group.add(orbitLine);

        // --- 3. PLANET 2 (Earth Twin - Top Left Anchor) ---
        const p2Group = new THREE.Group();
        scene.add(p2Group);

        const planet2 = new THREE.Mesh(
            new THREE.SphereGeometry(1, 64, 64),
            new THREE.MeshStandardMaterial({ color: planet2Green, emissive: "#1a4a2e", emissiveIntensity: 0.12, roughness: 0.8 })
        );
        p2Group.add(planet2);

        const halo2 = new THREE.Mesh(
            new THREE.SphereGeometry(1.12, 64, 64),
            new THREE.MeshBasicMaterial({ color: "#2a8a5a", transparent: true, opacity: 0.05, side: THREE.BackSide })
        );
        p2Group.add(halo2);

        // --- 4. BRIDGE CABLES ---
        const cableGroup = new THREE.Group();
        scene.add(cableGroup);
        const curves = [];
        const createCable = (y) => {
            const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-35, 2+y, 0), new THREE.Vector3(0, -3+y, 0), new THREE.Vector3(35, 2+y, 0));
            curves.push(curve);
            return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)), new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.18 }));
        };
        cableGroup.add(createCable(0), createCable(-0.4));

        const orbs = [];
        for(let i=0; i<4; i++){
            const orb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: gold, blending: THREE.AdditiveBlending }));
            scene.add(orb); orbs.push({ mesh: orb, t: i*0.25, curve: i%2===0 ? curves[0] : curves[1] });
        }

        // --- ANIMATION LOOP ---
        const clock = new THREE.Clock();
        const animate = () => {
            const t = clock.getElapsedTime();
            planet1.rotation.y = t * 0.22; planet2.rotation.y = t * 0.15;
            p2Group.position.x += Math.sin(t*0.3)*0.005; p2Group.position.y += Math.cos(t*0.3)*0.002;
            const mA = t * 0.6; moon.position.set(Math.cos(mA)*2.5, Math.sin(mA)*2.5*Math.sin(0.43), Math.sin(mA)*2.5*Math.cos(0.43));
            const sway = Math.sin(t*1.0) * 0.08; cableGroup.position.y = sway;
            orbs.forEach(o => { o.t+=0.0012; if(o.t>1) o.t=0; o.mesh.position.copy(o.curve.getPoint(o.t)); o.mesh.position.y += sway; });
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            const w = window.innerWidth; const h = window.innerHeight;
            renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();

            // RESPONSIVE ANCHORS
            const vw = w / 100;
            // Planet 1 (Bottom Right) peeking 30%
            const p1Scale = Math.min(8 * vw, 130) / 110; 
            p1Group.scale.setScalar(p1Scale * 4.5);
            // Anchor to corner based on aspect
            const aspect = w / h;
            p1Group.position.set(12 * aspect, -8, 0); 

            // Planet 2 (Top Left) fully visible
            const p2Scale = Math.min(3.5 * vw, 55) / 110;
            p2Group.scale.setScalar(p2Scale * 4.5);
            p2Group.position.set(-10 * aspect, 8, -5);
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => { window.removeEventListener('resize', handleResize); renderer.dispose(); };
    }, []);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[75vh] min-h-[600px] max-h-[800px]">
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
};

export default Hero3D;
