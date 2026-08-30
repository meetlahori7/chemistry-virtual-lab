import React from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export default function ErlenmeyerFlask({
  position = [0, 0, 0],
  liquidColor = '#38bdf8',
  volume = 150,
  label = '250 mL',
  onClick,
  ...props
}) {
  return (
    <group position={position} onClick={onClick} {...props}>
      {/* Conical Flask Main Body */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.75, 1.0, 36, 1, true]} />
        <meshPhysicalMaterial
          transmission={0.96}
          roughness={0.04}
          thickness={0.45}
          ior={1.52}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Flat Bottom Base */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.04, 36]} />
        <meshPhysicalMaterial
          transmission={0.95}
          roughness={0.05}
          thickness={0.5}
          ior={1.52}
          transparent={true}
        />
      </mesh>

      {/* Cylindrical Neck */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.6, 36, 1, true]} />
        <meshPhysicalMaterial
          transmission={0.96}
          roughness={0.04}
          thickness={0.4}
          ior={1.52}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Top Rim Collar */}
      <mesh position={[0, 1.6, 0]}>
        <torusGeometry args={[0.25, 0.025, 16, 36]} />
        <meshPhysicalMaterial
          transmission={0.95}
          roughness={0.05}
          thickness={0.3}
          ior={1.52}
          transparent={true}
        />
      </mesh>

      {/* Internal Liquid Mesh */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.42, 0.72, 0.65, 32]} />
        <meshPhysicalMaterial
          color={liquidColor}
          transmission={0.7}
          roughness={0.1}
          ior={1.33}
          transparent={true}
          opacity={0.88}
        />
      </mesh>

      {/* Graduations & Pyrex Inscription */}
      <group position={[0, 0.5, 0.65]}>
        <Text
          position={[0, 0.2, 0.01]}
          fontSize={0.065}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ERLENMEYER
        </Text>
        <Text
          position={[0, 0.05, 0.01]}
          fontSize={0.055}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </group>
  )
}
