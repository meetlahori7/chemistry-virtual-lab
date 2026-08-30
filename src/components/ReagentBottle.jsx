import React, { useState } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export default function ReagentBottle({
  position = [0, 0, 0],
  formula = 'HCl',
  name = 'Hydrochloric Acid',
  concentration = '0.1 M',
  color = '#f8fafc',
  isAmber = false,
  onClick,
  ...props
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={position}
      scale={hovered ? 1.05 : 1.0}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick && onClick()
      }}
      {...props}
    >
      {/* Bottle Body */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.9, 32]} />
        <meshPhysicalMaterial
          color={isAmber ? '#92400e' : '#ffffff'}
          transmission={0.88}
          roughness={0.08}
          thickness={0.4}
          ior={1.5}
          transparent={true}
        />
      </mesh>

      {/* Shoulder Taper */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.3, 0.16, 32]} />
        <meshPhysicalMaterial
          color={isAmber ? '#92400e' : '#ffffff'}
          transmission={0.88}
          roughness={0.08}
          thickness={0.4}
          ior={1.5}
          transparent={true}
        />
      </mesh>

      {/* Bottle Neck */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.2, 32]} />
        <meshPhysicalMaterial
          color={isAmber ? '#92400e' : '#ffffff'}
          transmission={0.88}
          roughness={0.08}
          thickness={0.4}
          ior={1.5}
          transparent={true}
        />
      </mesh>

      {/* Plastic Screw Cap */}
      <mesh position={[0, 1.28, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.14, 24]} />
        <meshStandardMaterial
          color={hovered ? '#38bdf8' : '#0f172a'}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Internal Liquid Fill */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.75, 24]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.7}
          roughness={0.1}
          ior={1.33}
          transparent={true}
          opacity={0.85}
        />
      </mesh>

      {/* Chemical Label Sticker */}
      <group position={[0, 0.45, 0.305]}>
        <mesh receiveShadow>
          <planeGeometry args={[0.42, 0.52]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        {/* Label Header */}
        <mesh position={[0, 0.18, 0.005]}>
          <planeGeometry args={[0.38, 0.08]} />
          <meshBasicMaterial color={isAmber ? '#ea580c' : '#0284c7'} />
        </mesh>
        <Text
          position={[0, 0.18, 0.01]}
          fontSize={0.045}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          REAGENT
        </Text>
        {/* Chemical Formula */}
        <Text
          position={[0, 0.04, 0.01]}
          fontSize={0.08}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {formula}
        </Text>
        {/* Chemical Name */}
        <Text
          position={[0, -0.08, 0.01]}
          fontSize={0.035}
          color="#334155"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
        {/* Concentration */}
        <Text
          position={[0, -0.16, 0.01]}
          fontSize={0.038}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {concentration}
        </Text>
      </group>
    </group>
  )
}
