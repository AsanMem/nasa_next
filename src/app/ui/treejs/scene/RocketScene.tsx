"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";

const RocketScene = () => {
    const mountRef = useRef(null);
    const modelRef = useRef(null);

    useEffect(() => {
        let renderer, scene, camera, animationId;
        if (mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 300);
            camera.position.set(0.2, 2.0, 3.7);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setClearAlpha(0);
            renderer.setSize(width, height);
            mountRef.current.appendChild(renderer.domElement);

            scene.add(new THREE.AmbientLight(0xffffff, 1.2));
            const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
            dirLight.position.set(5, 10, 7);
            scene.add(dirLight);

            const loader = new GLTFLoader();
            loader.load(
                "/models/apollo_10_capsule.glb",
                (gltf) => {
                    const model = gltf.scene;
                    model.scale.set(0.08, 0.08, 0.08);
                    model.position.set(0, 0, 0);
                    scene.add(model);
                    modelRef.current = model;
                },
                undefined,
                (error) => {
                    console.error("Ошибка загрузки модели", error);
                }
            );

            function animate() {
                animationId = requestAnimationFrame(animate);
                if (modelRef.current) {
                    modelRef.current.rotation.y += 0.04;
                }
                renderer.render(scene, camera);
            }
            animate();

            return () => {
                cancelAnimationFrame(animationId);
                renderer.dispose();
                mountRef.current?.removeChild(renderer.domElement);
            };
        }
    }, []);

    return <div ref={mountRef} style={{ width: 240, height: 240 }} />;
};

export default RocketScene;