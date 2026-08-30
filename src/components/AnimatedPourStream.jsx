import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function AnimatedPourStream({
  startPos = [-1.5, 0.8, 0],
  endPos = [0, -0.4, 0],
  color = '#38bdf8',
  isPouring = false,
}) {
  const streamRef = useRef()
  const splashRef = useRef()

  useFrame((state, delta) => {
    if (isPouring) {
      if (splashRef.current) {
        splashRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 25) * 0.3
        splashRef.current.scale.z = 1 + Math.cos(state.clock.elapsedTime * 25) * 0.3
      }
    }
  })

  if (!isPouring) return null

  // Calculate curve points for the natural parabolic pouring arc
  const midPoint = [
    (startPos[0] + endPos[0]) / 2 + 0.1,
    Math.max(startPos[1], endPos[1]) + 0.1,
    (startPos[2] + endPos[2]) / 2,
  ]

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...startPos),
    new THREE.Vector3(...midPoint),
    new THREE.Vector3(...endPos)
  )

  const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.035, 8, false)

  return (
    <group>
      {/* Dynamic Liquid Stream Arc */}
      <mesh geometry={tubeGeometry}>
        <meshPhysicalMaterial
          color={color}
          transmission={0.65}
          roughness={0.1}
          ior={1.33}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* Splash Ring on Liquid Meniscus */}
      <mesh ref={splashRef} position={endPos} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.16, 24]} />
        <meshBasicMaterial
          color={color}
          transparent={true}
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
