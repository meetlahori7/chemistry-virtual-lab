import React from 'react'
import { Text } from '@react-three/drei'

export default function DigitalProbe({
  position = [0, 0, 0],
  pH = 7.0,
  temperature = 22.0,
  ...props
}) {
  return (
    <group position={position} {...props}>
      {/* Heavy Steel Stand Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Vertical Retort Stand Rod */}
      <mesh position={[0.2, 1.3, 0.2]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 2.5, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Clamp Bosshead on Rod */}
      <mesh position={[0.2, 1.8, 0.2]}>
        <boxGeometry args={[0.1, 0.12, 0.1]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* Horizontal Extension Arm */}
      <mesh position={[0, 1.8, 0.1]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.4, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Glass Electrode Probe Body extending down into the beaker */}
      <group position={[-0.2, 1.0, 0.1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.035, 1.6, 16]} />
          <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.2} />
        </mesh>
        {/* Sensitive Glass Sensor Bulb at Tip */}
        <mesh position={[0, -0.82, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.9}
            roughness={0.1}
            ior={1.5}
            transparent={true}
          />
        </mesh>
      </group>

      {/* Digital Meter Console Housing */}
      <group position={[-0.6, 0.5, -0.3]} rotation={[0, 0.3, 0]}>
        {/* Main Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.65, 0.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>

        {/* Slanted LCD Display Bezel */}
        <mesh position={[0, 0.12, 0.26]} rotation={[-0.25, 0, 0]}>
          <planeGeometry args={[0.75, 0.32]} />
          <meshBasicMaterial color="#022c22" />
        </mesh>

        {/* Digital LCD Readouts */}
        <Text
          position={[-0.2, 0.15, 0.27]}
          rotation={[-0.25, 0, 0]}
          fontSize={0.065}
          color="#34d399"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {`pH ${Number(pH).toFixed(2)}`}
        </Text>
        <Text
          position={[0.2, 0.15, 0.27]}
          rotation={[-0.25, 0, 0]}
          fontSize={0.065}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {`${Number(temperature).toFixed(1)}°C`}
        </Text>
        <Text
          position={[0, 0.04, 0.27]}
          rotation={[-0.25, 0, 0]}
          fontSize={0.035}
          color="#6ee7b7"
          anchorX="center"
          anchorY="middle"
        >
          LAB-PROBE CALIBRATED
        </Text>
      </group>
    </group>
  )
}
