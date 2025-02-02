"use client"

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer, OrbitControls, OutputPass, RenderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { Noise } from 'noisejs'; // Библиотека для генерации шума

interface ThreeSceneProps {
    asteroid: any;
    asteroidIndex: string;
    diameterSphere: number;
    speedSphere: number;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ asteroid, asteroidIndex, diameterSphere, speedSphere }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
    diameterSphere = isMobile && diameterSphere > 5.922 ? 5.922 : diameterSphere;

    useEffect(() => {
        if (mountRef.current) {
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
            const texture = new THREE.TextureLoader().load(`/media/asteroid/textures/stone-${asteroidIndex}.jpg`);
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8,
                metalness: 0.2,
            });




            // Создание звезд
            // Создание множество звезд, используя геометрию BufferGeometry и материал PointsMaterial.
            // Каждая звезда добавляется в массив вершин, который потом передается в BufferGeometry
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
            const geometry = new THREE.IcosahedronGeometry(diameterSphere, 4);
            const noise = new Noise(Math.random());

            const vertices = geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < vertices.length; i += 3) {
                const x = vertices[i];
                const y = vertices[i + 1];
                const z = vertices[i + 2];

                // Применение шума для создания рельефа
                const scale = 0.1; // Масштаб шума
                const amplitude = diameterSphere * 1.2 > 3.8 ? diameterSphere * 0.2 : diameterSphere * 1.2;  // Амплитуда рельефа
                //     console.log(amplitude, "amplitude")
                const noiseValue = noise.simplex3(x * scale, y * scale, z * scale) * amplitude;

                vertices[i] += noiseValue;
                vertices[i + 1] += noiseValue;
                vertices[i + 2] += noiseValue;
            }
            geometry.computeVertexNormals(); // Пересчет нормалей для корректного освещения

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

            // Обработка изменения размера окна
            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', handleResize);

            // Очистка
            return () => {
                mountRef.current?.removeChild(renderer.domElement);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [asteroid, diameterSphere, speedSphere, asteroidIndex]);

    return <div ref={mountRef} style={{ width: '100%', height: '80vh' }} />;
};

export default ThreeScene;