"use client"
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer, OrbitControls, OutputPass, RenderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { fragmentShader, noiseFunctions, vertexShader } from '../PlanetShaders';

interface ThreeSceneProps {
    asteroid: any;
    diameterMin: number;
    diameterMax: number;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ asteroid, diameterMin, diameterMax }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            // Создание сцены, камеры и рендерера
            const scene = new THREE.Scene();

            scene.background = new THREE.CubeTextureLoader()
                .load([]);




            // const uniforms = {
            //     type: { value: 2 },
            //     radius: { value: 20.0 },
            //     amplitude: { value: 1.19 },
            //     sharpness: { value: 2.6 },
            //     offset: { value: -0.016 },
            //     period: { value: 0.6 },
            //     persistence: { value: 0.484 },
            //     lacunarity: { value: 1.8 },
            //     octaves: { value: 10 }
            // };

            // const shaderMaterial = new THREE.ShaderMaterial({
            //     uniforms: uniforms,
            //     vertexShader: noiseFunctions + vertexShader,
            //     fragmentShader: fragmentShader,
            //     lights: false,
            //     clipping: false
            // });

            const uniforms = {
                time: { value: 1.0 }
            };

            const vertexShader = `
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normal;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

            const fragmentShader = `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                float intensity = dot(vNormal, vec3(0.0, 0.0, 1.0));
                gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
            }
        `;

            const shaderMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: noiseFunctions + vertexShader,
                fragmentShader: fragmentShader
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
            //    const axesHelper = new THREE.AxesHelper(5);
            //    scene.add(axesHelper);




            const planetDedecahedron = new THREE.DodecahedronGeometry(3.2, 2)




            const averageDiameter = (diameterMin + diameterMax) / 2;


            const geometry = new THREE.SphereGeometry(averageDiameter / 2, 64, 64);
            const planetTetrahedron = new THREE.TetrahedronGeometry(9.999, 2);// 1.982 // new THREE.TetrahedronGeometry(2.282, 2);

            // 1 min  9 max
            const planet = new THREE.Mesh(planetTetrahedron, shaderMaterial);
            scene.add(planet);
            console.log(planet);

            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5, 5, 5);
            scene.add(light);

            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);



            camera.position.z = 15 // 7 ;

            // Логика создания планеты и атмосферы


            // const planetGeometry = new THREE.SphereGeometry(1.5, 2, 32);
            // const planetMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            // const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            // scene.add(planet);

            // const atmosphereGeometry = new THREE.SphereGeometry(1.6, 32, 32);
            // const atmosphereMaterial = new THREE.MeshBasicMaterial({
            //     color: 0x00ff00,
            //     side: THREE.BackSide,
            //     opacity: 0.4,
            //     transparent: true,
            // });
            // const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            // scene.add(atmosphere);

            //





            // Анимация
            // Функция animate анимирует вращение сферы и движение звезд, а также обновляет рендер сцены на каждом кадре.
            const animate = () => {
                requestAnimationFrame(animate);
                // rask
                // sphere.rotation.x += 0.010  // медленно 0.001; // быстро 0.021;
                // sphere.rotation.z += 0.007  // медленно 0.001; // быстро 0.031;
                // rask
                // planet.rotation.y += 0.002;
                // renderer.render(scene, camera);
                //  composer.render();
                uniforms.time.value += 0.05;
                planet.rotation.y += 0.01;
                renderer.render(scene, camera);
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