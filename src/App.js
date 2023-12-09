import logo from './logo.svg';
import './App.css';
import { MeshStandardMaterial } from 'three';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import { useFrame } from "react-three-fiber";

const Ring = ({ radius, tubeSize, radialSegments, tubularSegments, color, width, height, scaleZ }) => {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} scale={[width, height, scaleZ]}>
      <torusGeometry args={[radius, tubeSize, radialSegments, tubularSegments]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const MultipleRings = ({ numberOfRings, value }) => {
  const rings = [];

  let random = Math.random() * (0.07 - 0.03) + 0.03;

  for (let i = 0; i < numberOfRings; i++) {

    rings.push(
      <Ring
        key={i}
        radius={1}
        tubeSize={((value === i) || (value === (i + 10) % numberOfRings) || (value === (i + 20) % numberOfRings) || (value === (i + 30) % numberOfRings) || (value === (i + 40) % numberOfRings) || (value === (i + 50) % numberOfRings)) && i % 2 === 0 ? 0.03 : 0.05} // Grosor constante de los anillos
        radialSegments={30}
        tubularSegments={100}
        color={i % 2 === 0 ? "orange" : "black"}
        width={1 + i * 0.05}    // Ancho del anillo incrementándose
        height={1 + i * 0.05}   // Alto del anillo incrementándose
        scaleZ={0.1}           // Profundidad constante (haciendo el anillo plano) // Posicionando los anillos en el eje Z
      />
    );
  }

  return <>{rings}</>;
};

const SphereWithOutline = ({ numberOfRings, value, cameraRef }) => { // Debes recibir numberOfRings como una prop en un objeto
  const rings = [];

  const reduce = Math.abs(cameraRef.current?.getPolarAngle() - Math.PI / 2) * 0.9

  for (let i = 0; i < numberOfRings; i++) {
    let size = 0.05;

    if (i == value || (value === (i + 10) % numberOfRings) || (value === (i + 20) % numberOfRings || (value === (i + 30) % numberOfRings) || (value === (i + 40) % numberOfRings)) || (value === (i + 50) % numberOfRings)) {

      size = 0.03

    }

    rings.push(
      <group key={i}> {/* Agrega un key para cada anillo */}
        {/* Borde de la esfera */}

        <mesh scale={[(1.04) + i * size * 1 - reduce, 1.04 + i * size * 1 - reduce , 1.04 + i * size * 1 - reduce]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color={i % 2 === 0 ? "black" : "orange"} side={THREE.BackSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      {/* Esfera principal */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Bordes de la esfera */}
      {rings}
    </group>
  );
};

function App() {

  const cameraRef = useRef();

  const [value, setValue] = useState(0)
  useEffect(() => {
    // Función para incrementar el valor del estado
    const incrementValue = () => {
      setValue((prevValue) => (prevValue + 1) % 50);
    };

    // Establecer un intervalo para llamar a incrementValue cada 1000 ms (1 segundo)
    const interval = setInterval(incrementValue, 20);

    // Limpieza del intervalo cuando el componente se desmonta
    return () => {
      clearInterval(interval);
    };
  }, []); // El segundo argumento [] garantiza que este efecto se ejecute solo una vez al montar el componente

  const trackCameraAngle = () => {
    if (cameraRef.current) {
      // Obtenemos la instancia de OrbitControls
      const controls = cameraRef.current;

      // Obtenemos el ángulo de la cámara respecto a la esfera en el eje X
      const angleX = controls.getPolarAngle();
      console.log("Ángulo en el eje X:", angleX);
    }
  };



  return (
    <div className="App">
      <Canvas camera={{ position: [2, 2, 5], fov: 50 }} onClick={trackCameraAngle}>
        <ambientLight intensity={100} />
        <pointLight position={[100, 100, 100]} />
        <SphereWithOutline numberOfRings={50} value={value} cameraRef={cameraRef}></SphereWithOutline>
        <MultipleRings numberOfRings={50} value={value} />
        <OrbitControls autoRotate autoRotateSpeed={1.0} ref={cameraRef} />
      </Canvas>
    </div>
  );
}

export default App;
