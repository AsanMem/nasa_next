"use client"
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
    asteroid: any; // Уточните тип данных
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ asteroid }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;











            // Создание сцены, камеры и рендерера
            const scene = new THREE.Scene();
            //    https://opengameart.org/content/night-sky-skybox-generator
            scene.background = new THREE.CubeTextureLoader()
                .load([
                    // '/media/asteroid/xpos.png',
                    // '/media/asteroid/xneg.png',
                    // '/media/asteroid/ypos.png',
                    // '/media/asteroid/yneg.png',
                    // '/media/asteroid/zpos.png',
                    // '/media/asteroid/zneg.png'
                ]);



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



            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(width, height);
            mountRef.current.appendChild(renderer.domElement);


            // Добавление осей для отладки
            const axesHelper = new THREE.AxesHelper(5);
            scene.add(axesHelper);

            // Добавление объекта (например, куба)
            const geometryCube = new THREE.BoxGeometry();

            // Для построения сферы используется класс SphereGeometry, который принимает на себя:
            // радиус (значение по умолчанию равно 1)
            // widthSegments — количество горизонтальных сегментов (треугольников). Минимальное значение равно 3, значение по умолчанию 8
            // heightSegments — количество вертикальных сегментов. Минимальное значение равно 2, значение по умолчанию 6
            // К слову, чем больше вы укажете количество треугольников, тем более гладкой будет поверхность сферы.
            // Создание материала и геометрии для сферы
            const geometrySphere = new THREE.SphereGeometry(1.5, 32, 32);
            const material = new THREE.MeshNormalMaterial();
            const sphere = new THREE.Mesh(geometrySphere, material);
            scene.add(sphere);

            // Настройка света
            const ambientLight = new THREE.AmbientLight(0x404040); // мягкий белый свет
            scene.add(ambientLight);

            const spotLight1 = new THREE.SpotLight(0xeeeece);
            spotLight1.position.set(1000, 1000, 1000);
            scene.add(spotLight1);

            const spotLight2 = new THREE.SpotLight(0xffffff);
            spotLight2.position.set(-200, -200, -200);
            scene.add(spotLight2);




            //  scene.add(cube);

            camera.position.z = 5;

            // Анимация
            const animate = () => {
                requestAnimationFrame(animate);
                // sphere.rotation.x += 0.01;
                // sphere.rotation.y += 0.01;

                // Движение звезд
                // stars.rotation.x += 0.001;
                // stars.rotation.y += 0.001;

                // stars.rotation.x += 0.0001;
                // stars.rotation.y += 0.0001;
                // stars.rotation.z += 0.005

                // Движение звезд
                const positions = starGeometry.attributes.position.array as Float32Array;

                //   console.log(positions, "<<<<<<<<< ===")
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