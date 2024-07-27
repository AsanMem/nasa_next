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

            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(width, height);
            mountRef.current.appendChild(renderer.domElement);

            // Добавление объекта (например, куба)
            const geometryCube = new THREE.BoxGeometry();

            // Для построения сферы используется класс SphereGeometry, который принимает на себя:
            // радиус (значение по умолчанию равно 1)
            // widthSegments — количество горизонтальных сегментов (треугольников). Минимальное значение равно 3, значение по умолчанию 8
            // heightSegments — количество вертикальных сегментов. Минимальное значение равно 2, значение по умолчанию 6
            // К слову, чем больше вы укажете количество треугольников, тем более гладкой будет поверхность сферы.
            const geometrySphere = new THREE.SphereGeometry(1.5, 32, 32);



            // const material = new THREE.MeshNormalMaterial();
            // const cube = new THREE.Mesh(geometrySphere, material);

            const spotLight = new THREE.SpotLight(0xeeeece);
            spotLight.position.set(1000, 1000, 1000);
            scene.add(spotLight);
            const spotLight2 = new THREE.SpotLight(0xffffff);
            spotLight2.position.set(-200, -200, -200);
            scene.add(spotLight2);





            //  scene.add(cube);

            camera.position.z = 5;

            // Анимация
            const animate = () => {
                requestAnimationFrame(animate);
                //   cube.rotation.x += 0.01;
                //  cube.rotation.y += 0.01;
                renderer.render(scene, camera);
            };
            animate();

            // Очистка при размонтировании компонента
            return () => {
                mountRef.current?.removeChild(renderer.domElement);
            };
        }
    }, [asteroid]);

    return <div ref={mountRef} style={{ width: '100%', height: '70vh' }} />;
};

export default ThreeScene;