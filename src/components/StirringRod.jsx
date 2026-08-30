import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function StirringRod({
  position = [0, 0, 0],
  isStirring = false,
  ...props
}) {
  const rodRef = useRef()

  useFrame((state) => {
    if (rodRef.current) {
      if (isStirring) {
        const t = state.clock.elapsedTime * 6
        rodRef.current.position.x = Math.sin(t) * 0.25
        rodRef.current.position.z = Math.cos(t) * 0.25
        rodRef.current.rotation.z = 0.25 + Math.sin(t) * 0.08
        rodRef.current.rotation.x = Math.cos(t) * 0.08
      } else {
        rodRef.current.position.set(0.2, 0.3, 0.1)
        rodRef.current.rotation.set(0.1, 0, 0.35)
      }
    }
  })

  return (
    <group position={position} {...props}>
      <mesh ref={rodRef} position={[0.2, 0.3, 0.1]} rotation={[0.1, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 2.6, 16]} />
        <meshPhysicalMaterial
          transmission={0.96}
          roughness={0.05}
          thickness={0.3}
          ior={1.52}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
