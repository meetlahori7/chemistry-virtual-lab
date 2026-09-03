import React, { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { soundManager } from '../core/SoundEngine'

export default function ReagentBottle({
  position = [0, 0, 0],
  targetPourPos = [0, 1.2, 0],
  formula = 'HCl',
  name = 'Hydrochloric Acid',
  concentration = '0.1 M',
  color = '#f8fafc',
  isAmber = false,
  isCurrentlyPouring = false,
  onClick,
  ...props
}) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  const currentPos = useRef(new THREE.Vector3(...position))
  const currentRot = useRef(new THREE.Euler(0, 0, 0))

  const [pressed, setPressed] = useState(false)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    if (isCurrentlyPouring) {
      // Lift up and tilt over beaker
      groupRef.current.position.lerp(new THREE.Vector3(targetPourPos[0] - 0.7, targetPourPos[1], targetPourPos[2]), delta * 6)
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -Math.PI / 3.2, delta * 6)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0.4, delta * 6)
    } else {
      // Return to original bench position
      groupRef.current.position.lerp(new THREE.Vector3(...position), delta * 6)
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 6)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 6)
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      scale={pressed ? 0.95 : hovered ? 1.08 : 1.0}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        soundManager.playGlassClink()
      }}
      onPointerOut={() => {
        setHovered(false)
        setPressed(false)
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        setPressed(true)
      }}
      onPointerUp={(e) => {
        e.stopPropagation()
        setPressed(false)
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick && onClick()
      }}
      {...props}
    >
      {/* Generous Touch Target Hitbox for Mobile & Mouse */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 1.4, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

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
        <Text
          position={[0, -0.08, 0.01]}
          fontSize={0.035}
          color="#334155"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
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

      {/* In-World 3D Hover Tooltip */}
      {hovered && (
        <group position={[0, 1.6, 0]}>
          <mesh>
            <planeGeometry args={[0.9, 0.22]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.9} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.065}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {`CLICK TO POUR ${formula}`}
          </Text>
        </group>
      )}
    </group>
  )
}
