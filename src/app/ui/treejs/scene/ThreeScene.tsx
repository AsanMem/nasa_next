"use client"
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer, OrbitControls, OutputPass, RenderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';



interface ThreeSceneProps {
    asteroid: any;
    asteroidIndex: number
    diameterSphere: number;
    speedSphere: number
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ asteroid, asteroidIndex, diameterSphere, speedSphere }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
    diameterSphere = isMobile && diameterSphere > 5.922 ? 5.922 : diameterSphere
    useEffect(() => {


        if (mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            // Создание сцены, камеры и рендерера
            const scene = new THREE.Scene();

            scene.background = new THREE.CubeTextureLoader()
                .load([]);




            const texture = new THREE.TextureLoader().load(`/media/asteroid/textures/stone-${asteroidIndex}.jpg`);
            // immediately use the texture for material creation 

            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8,  // Чем выше значение, тем более матовый материал
                metalness: 0.2,
            })



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



            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(width, height);
            mountRef.current.appendChild(renderer.domElement);












            // Настройка смены камеры позиции
            // Добавление элементов управления камерой, позволяющие автоматически вращать камеру вокруг сцены.
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableZoom = false;
            controls.enablePan = false;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.2;
            camera.position.z = 50;


            // Создаем систему пост-обработки с использованием эффектов Bloom для улучшения визуального качества.
            const composer = new EffectComposer(renderer);
            const renderPass = new RenderPass(scene, camera);
            composer.addPass(renderPass);

            const bloomPass = new UnrealBloomPass();
            bloomPass.threshold = 0;
            bloomPass.strength = 0.2;
            bloomPass.radius = 0.5;
            composer.addPass(bloomPass);

            const outputPass = new OutputPass();
            composer.addPass(outputPass);




            // Добавление осей для отладки
            // const axesHelper = new THREE.AxesHelper(5);
            // scene.add(axesHelper);



            // Логика создания cферы
            const planetDedecahedron = new THREE.DodecahedronGeometry(diameterSphere, 2)
            const planetTetrahedron = new THREE.TetrahedronGeometry(diameterSphere, 2);
            const planetGeometry = new THREE.IcosahedronGeometry(diameterSphere, 2);


            const planet = new THREE.Mesh(planetGeometry, material); //
            scene.add(planet);

            // Логика создания света
            // Включаем тени в рендерере
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Настраиваем свет для отбрасывания теней
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5, 5, 5);
            light.castShadow = true; // Этот свет будет отбрасывать тени

            // Настраиваем тени для света
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 500;
            scene.add(light);

            // Добавляем окружающий свет
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            camera.position.z = 15 // 7 ;






            // Анимация
            // Функция animate анимирует вращение сферы и движение звезд, а также обновляет рендер сцены на каждом кадре.
            const animate = () => {
                requestAnimationFrame(animate);

                //    uniforms.time.value += 0.05;
                planet.rotation.x += 0.01;
                planet.rotation.z += 0.007
                planet.rotation.y += 0.01;
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

            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', handleResize);


            // Очистка при размонтировании компонента
            return () => {
                mountRef.current?.removeChild(renderer.domElement);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [asteroid]);

    return <div ref={mountRef} style={{ width: '100%', height: '80vh' }} />;
};

export default ThreeScene;