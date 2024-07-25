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
            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);

            camera.position.z = 5;

            // Анимация
            const animate = () => {
                requestAnimationFrame(animate);
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
                renderer.render(scene, camera);
            };
            animate();

            // Очистка при размонтировании компонента
            return () => {
                mountRef.current?.removeChild(renderer.domElement);
            };
        }
    }, [asteroid]);

    return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ThreeScene;