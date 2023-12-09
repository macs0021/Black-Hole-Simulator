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
  const colors = ["white", "#ffe808", "#ffce00", "#ff9a00", "#ff5a00", "#ff0000", "#650707", "#330303"];

  // Calcular cuántos anillos pares hay y cuántos anillos por color
  const totalEvenRings = Math.floor(numberOfRings / 2);
  const ringsPerColor = Math.floor(totalEvenRings / colors.length);
  let remainingRings = totalEvenRings % colors.length;

  let currentColorIndex = 0; // Índice para la lista de colores
  let ringsAssigned = 0; // Contador para asignar los anillos a cada color

  for (let i = 0; i < numberOfRings; i++) {
    // Determinar si el anillo es par o impar
    const isEvenRing = i % 2 === 0;

    // Asignar color: los anillos pares toman un color de la lista, los impares son negros
    let ringColor;
    if (isEvenRing) {
      ringColor = colors[currentColorIndex];
      ringsAssigned++;

      // Cambiar al siguiente color si se ha alcanzado el número asignado
      if (ringsAssigned === ringsPerColor + (remainingRings > 0 ? 1 : 0)) {
        ringsAssigned = 0; // Reiniciar el contador para el siguiente color
        currentColorIndex++; // Cambiar al siguiente color

        // Decrementar los anillos restantes si es que se asignó uno adicional
        if (remainingRings > 0) {
          remainingRings--;
        }
      }
    } else {
      ringColor = "black";
    }

    rings.push(
      <Ring
        key={i}
        radius={1}
        tubeSize={((value === i) || (value === (i + 10) % numberOfRings) || (value === (i + 20) % numberOfRings) || (value === (i + 30) % numberOfRings) || (value === (i + 40) % numberOfRings) || (value === (i + 50) % numberOfRings)) ? 0.03 : 0.05}
        radialSegments={30}
        tubularSegments={100}
        color={ringColor}
        width={1 + i * 0.05}
        height={1 + i * 0.05}
        scaleZ={0.1}
      />
    );
  }

  return <>{rings}</>;
};

const SphereWithOutline = ({ numberOfRings, value, cameraRef }) => {
  const rings = [];
  const colors = ["white", "#ffe808", "#ffce00", "#ff9a00", "#ff5a00", "#ff0000", "#650707", "#330303"];

  const angle = cameraRef.current?.getPolarAngle(); // Obtiene el valor actual del ángulo
  const differenceFromMidpoint = Math.abs(1.5 - angle); // Calcula la diferencia absoluta desde 1.5
  let normalizedDifference = differenceFromMidpoint / 1.5; // Normaliza esta diferencia en el rango de 0 a 1.5

  // Asegurarse de que normalizedDifference no sea negativo
  normalizedDifference = Math.max(0, normalizedDifference);

  // Escala el valor inicial basado en la diferencia normalizada
  const scaledNumberOfRings = Math.floor(numberOfRings * (1 - normalizedDifference));

  // Cálculos para la asignación de colores
  const totalEvenRings = Math.floor(scaledNumberOfRings / 2);
  const ringsPerColor = Math.floor(totalEvenRings / (colors.length - 1)); // Excluyendo el último color para el último anillo
  let remainingRings = totalEvenRings % (colors.length - 1);

  let currentColorIndex = 0;
  let ringsAssigned = 0;

  for (let i = 0; i < scaledNumberOfRings; i++) {
    let size = 0.05;

    if (i == value || (value === (i + 10) % 50) || (value === (i + 20) % 50 || (value === (i + 30) % 50) || (value === (i + 40) % 50)) || (value === (i + 50) % 50)) {
      size = 0.03;
    }

    const isEvenRing = i % 2 === 0;

    let borderColor;
    if (i === scaledNumberOfRings - 1 && isEvenRing) {
      borderColor = colors[colors.length - 1]; // Último color para el último anillo par
    } else if (isEvenRing) {
      borderColor = colors[currentColorIndex];
      ringsAssigned++;

      if (ringsAssigned === ringsPerColor + (remainingRings > 0 ? 1 : 0)) {
        ringsAssigned = 0;
        currentColorIndex++;

        if (remainingRings > 0) {
          remainingRings--;
        }
      }
    } else {
      borderColor = "black";
    }

    rings.push(
      <group key={i}>
        <mesh scale={[1.04 + i * size, 1.04 + i * size, 1.04 + i * size]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color={borderColor} side={THREE.BackSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
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
        <SphereWithOutline numberOfRings={25} value={value} cameraRef={cameraRef}></SphereWithOutline>
        <MultipleRings numberOfRings={50} value={value} />
        <OrbitControls autoRotate autoRotateSpeed={1.0} ref={cameraRef} />
      </Canvas>
    </div>
  );
}

export default App;
