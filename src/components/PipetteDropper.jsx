import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PipetteDropper({
  position = [0, 2.5, 0],
  liquidColor = '#ec4899',
  isActive = false,
  ...props
}) {
  const dropRef = useRef()

  useFrame((state, delta) => {
    if (dropRef.current) {
      if (isActive) {
        dropRef.current.visible = true
        dropRef.current.position.y -= delta * 3.5
        if (dropRef.current.position.y < -1.8) {
          dropRef.current.position.y = -0.5
        }
      } else {
        dropRef.current.visible = false
      }
    }
  })

  return (
    <group position={position} {...props}>
      {/* Rubber Squeeze Bulb (Top) */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} />
      </mesh>

      {/* Glass Dropper Body Tube */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.9, 16, 1, true]} />
        <meshPhysicalMaterial
          transmission={0.96}
          roughness={0.05}
          thickness={0.2}
          ior={1.5}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tapered Glass Tip */}
      <mesh position={[0, -0.45, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.015, 0.3, 16, 1, true]} />
        <meshPhysicalMaterial
          transmission={0.96}
          roughness={0.05}
          thickness={0.2}
          ior={1.5}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Internal Liquid inside Pipette */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.6, 16]} />
        <meshPhysicalMaterial
          color={liquidColor}
          transmission={0.7}
          roughness={0.1}
          ior={1.33}
          transparent={true}
        />
      </mesh>

      {/* Animated Falling Droplet */}
      <mesh ref={dropRef} position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshPhysicalMaterial
          color={liquidColor}
          transmission={0.7}
          roughness={0.05}
          ior={1.33}
          transparent={true}
        />
      </mesh>
    </group>
  )
}
