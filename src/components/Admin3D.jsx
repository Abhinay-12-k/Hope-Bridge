import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const Admin3D = ({ isInputFocused = false, isButtonHovered = false }) => {
    const containerRef = useRef();

    useEffect(() => {
        if (!containerRef.current) return;

        const isMobile = window.innerWidth < 768;

        // Scene setup
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

        camera.position.z = 15;

        // Colors
        const gold = "#C9A84C";
        const white = "#ffffff";
        const bg1 = "#0d2818"; // Center
        const bg2 = "#061510"; // Mid
        const bg3 = "#020a08"; // Outer

        // --- 1. BACKGROUND GRADIENT ---
        const bgGeo = new THREE.PlaneGeometry(60, 40);
        const bgMat = new THREE.ShaderMaterial({
            uniforms: {
                c1: { value: new THREE.Color(bg1) },
                c2: { value: new THREE.Color(bg2) },
                c3: { value: new THREE.Color(bg3) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform vec3 c1;
                uniform vec3 c2;
                uniform vec3 c3;
                void main() {
                    float d = distance(vUv, vec2(0.5));
                    vec3 col = mix(c1, c2, smoothstep(0.0, 0.5, d));
                    col = mix(col, c3, smoothstep(0.5, 1.0, d));
                    gl_FragColor = vec4(col, 1.0);
                }
            `
        });
        const bg = new THREE.Mesh(bgGeo, bgMat);
        bg.position.z = -12;
        scene.add(bg);

        // Circle texture helper
        const createCircleTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.arc(32, 32, 30, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            return new THREE.CanvasTexture(canvas);
        };
        const circleTex = createCircleTexture();

        // --- 2. WIREFRAME GLOBE (Highlighted) ---
        const globeGroup = new THREE.Group();
        globeGroup.position.set(0, -3, 0); 
        scene.add(globeGroup);

        const globeSize = 11;
        const globeGeo = new THREE.SphereGeometry(globeSize, 28, 28);
        const globeEdgeGeo = new THREE.EdgesGeometry(globeGeo);
        // Highlighted grid lines
        const globeMat = new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.35 });
        const globe = new THREE.LineSegments(globeEdgeGeo, globeMat);
        globeGroup.add(globe);

        // Highlighted Halo
        const glowGeo = new THREE.SphereGeometry(globeSize * 1.05, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.15, side: THREE.BackSide, blending: THREE.AdditiveBlending });
        globeGroup.add(new THREE.Mesh(glowGeo, glowMat));

        // Highlighted Hotspots
        const hotspots = [];
        for(let i = 0; i < 11; i++) {
            const dotMat = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
            const dot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), dotMat);
            const r = globeSize;
            const phi = Math.random() * Math.PI * 2, theta = Math.random() * Math.PI;
            dot.position.set(r*Math.sin(theta)*Math.cos(phi), r*Math.sin(theta)*Math.sin(phi), r*Math.cos(theta));
            globe.add(dot);
            hotspots.push(dot);
        }

        // --- 3. ORBITAL RING (Highlighted) ---
        const ringGeo = new THREE.TorusGeometry(13.5, 0.05, 16, 120);
        const ringMat = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.4, wireframe: true, blending: THREE.AdditiveBlending });
        const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
        orbitalRing.rotation.x = Math.PI / 2.2 + 0.35;
        orbitalRing.position.copy(globeGroup.position);
        scene.add(orbitalRing);

        // --- 4. HUMAN NETWORK CLUSTERS ---
        let clusters = [];
        if (!isMobile) {
            const createFigure = () => {
                const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.4 }));
                const body = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.0, 4), new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.3 }));
                const group = new THREE.Group(); body.position.y = -0.6;
                group.add(head, body); return group;
            };
            const createCluster = (x) => {
                const group = new THREE.Group(); const figs = [];
                for(let i = 0; i < 6; i++){
                    const fig = createFigure(); fig.position.set((Math.random()-0.5)*5, (Math.random()-0.5)*8, (Math.random()-0.5)*3);
                    group.add(fig); figs.push(fig);
                }
                for(let i = 0; i < figs.length; i++){
                    for(let j = i + 1; j < figs.length; j++){
                        if (Math.random() > 0.4) {
                            const lineGeo = new THREE.BufferGeometry().setFromPoints([figs[i].position, figs[j].position]);
                            group.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.15 })));
                        }
                    }
                }
                group.position.x = x; scene.add(group); return group;
            };
            clusters.push(createCluster(-17), createCluster(17));
        }

        // --- 5. LIGHT RAYS (Highlighted) ---
        const rayGroup = new THREE.Group(); rayGroup.position.copy(globeGroup.position); scene.add(rayGroup);
        const rays = [];
        for(let i = 0; i < 4; i++){
            const ray = new THREE.Mesh(new THREE.ConeGeometry(6, 45, 32), new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
            ray.position.y = 15; const pivot = new THREE.Group(); pivot.rotation.z = (Math.PI/2)*i + 0.5; pivot.add(ray);
            rayGroup.add(pivot); rays.push(ray);
        }

        // --- 6. PARTICLE SYSTEM ---
        const particleCount = 400; const pGeo = new THREE.BufferGeometry(); const pPos = new Float32Array(particleCount*3);
        for(let i=0; i<particleCount; i++){ pPos[i*3]=(Math.random()-0.5)*50; pPos[i*3+1]=(Math.random()-0.5)*40; pPos[i*3+2]=(Math.random()-0.5)*10; }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.12, map: circleTex, color: gold, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
        scene.add(new THREE.Points(pGeo, pMat));

        // --- 7. MISSION WORDS (Highlighted) ---
        const wordSprites = [];
        ["HOPE", "CHANGE", "LIVES", "UNITY"].forEach((w, i) => {
            const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); canvas.width=1024; canvas.height=256;
            ctx.font='900 180px DM Sans'; ctx.fillStyle='rgba(201, 168, 76, 0.1)'; ctx.textAlign='center'; ctx.fillText(w, 512, 180);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
            sprite.scale.set(18, 4.5, 1); sprite.position.set((Math.random()-0.5)*35, (Math.random()-0.5)*25, -6);
            scene.add(sprite); wordSprites.push({ sprite, dir: i%2===0 ? 1 : -1 });
        });

        // --- HANDLERS ---
        const clock = new THREE.Clock();
        const animate = () => {
            const t = clock.getElapsedTime();
            globe.rotation.y = t * 0.18; rayGroup.rotation.y = globe.rotation.y; orbitalRing.rotation.z = -t * 0.12;
            hotspots.forEach((h, i) => h.material.opacity = 0.6 + Math.sin(t*3 + i)*0.4);
            clusters.forEach((c, i) => c.position.y = Math.sin(t*0.8 + i)*0.6);
            wordSprites.forEach(ws => { ws.sprite.position.x += ws.dir * 0.003; if(Math.abs(ws.sprite.position.x) > 30) ws.dir *= -1; });
            rays.forEach(r => r.material.opacity = (isButtonHovered ? 0.2 : 0.08) + Math.sin(t)*0.01);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }; animate();

        const handleResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
        window.addEventListener('resize', handleResize);
        const handleMouseMove = (e) => {
            const x = (e.clientX/window.innerWidth-0.5)*2; const y = -(e.clientY/window.innerHeight-0.5)*2;
            gsap.to(camera.position, { x: 0+x, y: 0+y, duration: 2 });
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => { window.removeEventListener('resize', handleResize); window.removeEventListener('mousemove', handleMouseMove); renderer.dispose(); };
    }, [isInputFocused, isButtonHovered]);

    return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden" />;
};

export default Admin3D;
