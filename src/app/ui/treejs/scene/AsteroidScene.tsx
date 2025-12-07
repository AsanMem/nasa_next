"use client"

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';


interface ThreeSceneProps {
    asteroid: any;
    asteroidIndex: number;
    diameterSphere: number;
    speedSphere: number;
    urlTexture: string
}


const AsteroidScene: React.FC<ThreeSceneProps> = ({ asteroid, asteroidIndex, diameterSphere, speedSphere, urlTexture }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const noiseRef = useRef(null);
    console.log(diameterSphere, "diameterSphere before")
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
    diameterSphere = isMobile && diameterSphere > 5.922 ? 5.922 : diameterSphere;
    console.log(diameterSphere, "diameterSphere after")
    let noiseInstance: any;
    useEffect(() => {

        if (typeof window !== "undefined") {
            const { Noise } = require("noisejs");
            noiseInstance = noiseRef.current = new Noise(Math.random());
        }
    }, []);


    useEffect(() => {
        if (mountRef.current && noiseRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            // Создание сцены, камеры и рендерера
            const scene = new THREE.Scene();
            scene.background = new THREE.CubeTextureLoader()
                .load([]);

            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(width, height);
            mountRef.current.appendChild(renderer.domElement);

            // Настройка освещения
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5, 5, 5);
            light.castShadow = true;
            scene.add(light);

            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            // Загрузка текстуры
            const loadAndSetupScene = async () => {
                try {
                    const loadAsteroidTexture = async () => {
                        try {
                            console.log("Loading texture from:", urlTexture);
                            //  Promise для обработки загрузки
                            const texture = await new Promise<THREE.Texture>((resolve, reject) => {
                                new THREE.TextureLoader().load(
                                    urlTexture, // Используем URL с токеном напрямую
                                    (loadedTexture) => {
                                        console.log("Texture successfully loaded");
                                        resolve(loadedTexture);
                                    },
                                    undefined,
                                    (err) => {
                                        console.error('Texture loading error:', err);

                                        // Fallback:через прокси если прямая загрузка не работает
                                        console.log("Trying proxy fallback...");
                                        const proxyUrl = `/api/texture?url=${encodeURIComponent(urlTexture)}`;

                                        new THREE.TextureLoader().load(
                                            proxyUrl,
                                            (proxyTexture) => {
                                                console.log("Texture loaded via proxy");
                                                resolve(proxyTexture);
                                            },
                                            undefined,
                                            (proxyErr) => {
                                                console.error('Proxy texture loading failed:', proxyErr);
                                                reject(proxyErr);
                                            }
                                        );
                                    }
                                );
                            });

                            return texture;
                        } catch (error) {
                            console.error('Error in texture loading process:', error);
                            return null;
                        }
                    };


                    // Использование
                    const texture = await loadAsteroidTexture();
                    console.log(texture, "texture");

                    const material = new THREE.MeshStandardMaterial({
                        map: texture,
                        roughness: 0.8,
                        metalness: 0.2,
                    });



                    // Создание звезд
                    const starGeometry = new THREE.BufferGeometry();
                    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

                    const starVertices = [];
                    for (let i = 0; i < 10000; i++) {
                        const x = THREE.MathUtils.randFloatSpread(2000);
                        const y = THREE.MathUtils.randFloatSpread(2000);
                        const z = THREE.MathUtils.randFloatSpread(2000);
                        starVertices.push(x, y, z);
                    }
                    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
                    const stars = new THREE.Points(starGeometry, starMaterial);
                    scene.add(stars);



                    // Создание геометрии астероида с использованием шума
                    const geometry = new THREE.IcosahedronGeometry(diameterSphere, 48);
                    const vertices = geometry.attributes.position.array as Float32Array;

                    if (noiseInstance) {
                        // Порог, после которого астероид "крупным"
                        const LARGE_THRESHOLD = 4;

                        if (diameterSphere >= LARGE_THRESHOLD) {
                            // --- КРУПНЫЕ АСТЕРОИДЫ: 
                            const scale = 0.1;        // Масштаб шума
                            const amplitude = 2;      // Сила рельефа

                            for (let i = 0; i < vertices.length; i += 3) {
                                const x = vertices[i];
                                const y = vertices[i + 1];
                                const z = vertices[i + 2];

                                const noiseValue =
                                    noiseInstance.simplex3(x * scale, y * scale, z * scale) * amplitude;

                                vertices[i] += noiseValue;
                                vertices[i + 1] += noiseValue;
                                vertices[i + 2] += noiseValue;
                            }
                        } else {

                            // чуть разная "шероховатость" для каждого астероида
                            const roughness = 0.5 + Math.random() * 0.5; // 0.5–1

                            // небольшое неравномерное растяжение по осям, чтобы силуэт был не шар
                            const stretchX = 1 + (Math.random() - 0.5) * 0.5; // 0.75–1.25
                            const stretchY = 1 + (Math.random() - 0.5) * 0.5;
                            const stretchZ = 1 + (Math.random() - 0.5) * 0.5;

                            for (let i = 0; i < vertices.length; i += 3) {
                                const x = vertices[i];
                                const y = vertices[i + 1];
                                const z = vertices[i + 2];

                                const len = Math.sqrt(x * x + y * y + z * z) || 1;
                                const nx = x / len;
                                const ny = y / len;
                                const nz = z / len;

                                // крупный шум — основные "сколы"
                                const scale1 = 0.25;
                                const amplitude1 = diameterSphere * 0.18 * roughness;
                                const n1 = noiseInstance.simplex3(
                                    x * scale1,
                                    y * scale1,
                                    z * scale1
                                );

                                // мелкий шум — небольшие неровности
                                const scale2 = 0.9;
                                const amplitude2 = diameterSphere * 0.05 * roughness;
                                const n2 = noiseInstance.simplex3(
                                    x * scale2,
                                    y * scale2,
                                    z * scale2
                                );

                                const displacement = n1 * amplitude1 + n2 * amplitude2;

                                const baseRadius = len;
                                const newRadius = baseRadius + displacement;

                                //  неравномерный scale → форма уже не идеальный шар
                                const finalX = nx * newRadius * stretchX;
                                const finalY = ny * newRadius * stretchY;
                                const finalZ = nz * newRadius * stretchZ;

                                vertices[i] = finalX;
                                vertices[i + 1] = finalY;
                                vertices[i + 2] = finalZ;
                            }
                        }
                    }

                    geometry.attributes.position.needsUpdate = true;
                    geometry.computeVertexNormals();// Пересчет нормалей 

                    const asteroidMesh = new THREE.Mesh(geometry, material);
                    scene.add(asteroidMesh);

                    // Настройка камеры и элементов управления
                    camera.position.z = 15;
                    const controls = new OrbitControls(camera, renderer.domElement);
                    controls.enableZoom = false;
                    controls.enablePan = false;
                    controls.autoRotate = true;
                    controls.autoRotateSpeed = 0.2;

                    // Анимация
                    const animate = () => {
                        requestAnimationFrame(animate);
                        asteroidMesh.rotation.x += 0.01;
                        asteroidMesh.rotation.y += 0.01;
                        renderer.render(scene, camera);
                        // Движение звезд
                        const positions = starGeometry.attributes.position.array as Float32Array;
                        for (let i = 0; i < positions.length; i += 3) {
                            positions[i] += speedSphere // 0.1 //  // Движение по оси x
                            positions[i + 2] += speedSphere + 0.005  // 0.1 ; // Движение по оси z
                            // Возврат звезд на начальные позиции, чтобы они не исчезали
                            if (positions[i] > 1000) positions[i] = -1000;
                            if (positions[i + 2] > 1000) positions[i + 2] = -1000;
                        }
                        starGeometry.attributes.position.needsUpdate = true;
                        renderer.render(scene, camera);
                    };
                    animate();
                } catch (error) {
                    console.error('Error setting up scene:', error);
                }
            };

            loadAndSetupScene();

            // Обработка изменения размера окна
            const handleResize = () => {
                if (!mountRef.current) return;

                const newWidth = mountRef.current.clientWidth;
                const newHeight = mountRef.current.clientHeight;

                camera.aspect = newWidth / newHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(newWidth, newHeight);
            };
            window.addEventListener('resize', handleResize);


            return () => {
                mountRef.current?.removeChild(renderer.domElement);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [asteroid, diameterSphere, speedSphere, asteroidIndex]);

    return <div ref={mountRef} className="w-full h-full" />;
};

export default AsteroidScene;