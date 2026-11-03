import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface BuddhaModelProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function BuddhaModel({ className, style }: BuddhaModelProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171717);

    const camera = new THREE.PerspectiveCamera(
      45,
      (container.clientWidth || 800) / (container.clientHeight || 600),
      0.1,
      2000
    );

    camera.position.set(5, 4, 8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    renderer.setSize(
      container.clientWidth || 800,
      container.clientHeight || 600
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(5, 10, 7);
    scene.add(light);

    // Controls
    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;

    // Load GLTF / GLB
    const loader = new GLTFLoader();

    loader.load(
      "/models/buddha/scene.gltf",
      (gltf) => {
        const model = gltf.scene;

        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);
        scene.add(model);

        // Automatically fit camera
        const maxSize = Math.max(size.x, size.y, size.z);
        const distance =
          maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(45) / 2));

        camera.position.set(
          distance * 1.2,
          distance * 0.7,
          distance * 1.5
        );

        camera.near = Math.max(maxSize / 1000, 0.01);
        camera.far = Math.max(maxSize * 100, 1000);
        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);
        controls.update();
      },
      undefined,
      (error) => {
        console.error("Cannot load Buddha model:", error);
      }
    );

    // Animation
    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Responsive
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => material.dispose());
        }
      });

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "600px",
        overflow: "hidden",
        borderRadius: "12px",
        ...style,
      }}
    />
  );
}

