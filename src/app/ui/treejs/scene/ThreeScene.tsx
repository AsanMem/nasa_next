"use client"
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer, OrbitControls, OutputPass, RenderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';

interface ThreeSceneProps {
    asteroid: any;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ asteroid }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            // Создание сцены, камеры и рендерера
            const scene = new THREE.Scene();

            scene.background = new THREE.CubeTextureLoader()
                .load([]);



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
            const axesHelper = new THREE.AxesHelper(5);
            scene.add(axesHelper);



            // Для построения сферы используется класс SphereGeometry, который принимает на себя:
            // радиус (значение по умолчанию равно 1)
            // widthSegments — количество горизонтальных сегментов (треугольников). Минимальное значение равно 3, значение по умолчанию 8
            // heightSegments — количество вертикальных сегментов. Минимальное значение равно 2, значение по умолчанию 6
            // К слову, чем больше вы укажете количество треугольников, тем более гладкой будет поверхность сферы.
            // Создание материала и геометрии для сферы
            const geometrySphere = new THREE.SphereGeometry(1.5, 32, 32);
            const material = new THREE.MeshNormalMaterial();
            //     const material = new THREE.Mes;
            const sphere = new THREE.Mesh(geometrySphere, material);
            scene.add(sphere);

            camera.position.z = 7;

            // Анимация
            // Функция animate анимирует вращение сферы и движение звезд, а также обновляет рендер сцены на каждом кадре.
            const animate = () => {
                requestAnimationFrame(animate);
                sphere.rotation.x += 0.01;
                sphere.rotation.y += 0.01;

                // Движение звезд
                const positions = starGeometry.attributes.position.array as Float32Array;


                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += 0.7; // Движение по оси x
                    //  positions[i + 1] += 0.1 // 0.01; // Движение по оси y
                    positions[i + 2] += 0.5 // 0.01; // Движение по оси z
                    // Возврат звезд на начальные позиции, чтобы они не исчезали
                    if (positions[i] > 1000) positions[i] = -1000;
                    // if (positions[i + 1] < -1000) positions[i + 1] = 1000;
                    if (positions[i + 2] > 1000) positions[i + 2] = -1000;
                }
                starGeometry.attributes.position.needsUpdate = true;
                renderer.render(scene, camera);
            };
            animate();

            // Очистка при размонтировании компонента
            return () => {
                mountRef.current?.removeChild(renderer.domElement);
            };
        }
    }, [asteroid]);

    return <div ref={mountRef} style={{ width: '100%', height: 'calc(70vh)' }} />;
};

export default ThreeScene;