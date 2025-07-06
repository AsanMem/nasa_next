"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import gsap from "gsap";

const STAGE_POSITIONS = [
    { x: 0, y: 0.2, z: 0 },
    { x: 0, y: 0.7, z: 0 },
    { x: 0, y: -0.7, z: 0 },
    { x: 0, y: -2, z: 0 },
];


const RocketScene = ({ activeStage }) => {
    const mountRef = useRef(null);
    const modelRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        let renderer, scene, camera;
        let animationId;

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

            rendererRef.current = renderer;

            scene.add(new THREE.AmbientLight(0xffffff, 1.2));
            const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
            dirLight.position.set(5, 10, 7);
            scene.add(dirLight);
            scene.add(new THREE.AxesHelper(1));
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
                    //    modelRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.07;
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

    useEffect(() => {
        const model = modelRef.current;
        if (model && typeof activeStage === "number") {
            const NUM_STAGES = 4;
            const CIRCLE_Y_RANGE = 2.4;
            const STAGE_POSITIONS = Array(NUM_STAGES).fill(0).map((_, i) => ({
                x: 0,
                y: ((NUM_STAGES - 1) / 2 - i) * (CIRCLE_Y_RANGE / (NUM_STAGES - 1)), // y: 1.2, 0.4, -0.4, -1.2 (например)
                z: 0
            }));
            const pos = STAGE_POSITIONS[activeStage] || { x: 0, y: 0, z: 0 };
            gsap.to(model.position, {
                duration: 1.1,
                x: pos.x,
                y: pos.y,
                z: pos.z,
                ease: "power4.inOut"
            });
        }
    }, [activeStage]);

    return <div ref={mountRef} style={{ width: 240, height: 240 }} />;
};

export default RocketScene;