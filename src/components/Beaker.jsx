import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export default function Beaker({
  position = [0, 0, 0],
  volume = 100,
  maxVolume = 300,
  temperature = 22,
  liquidColor = 'rgba(224, 242, 254, 0.45)',
  isStirring = false,
  onClick,
  ...props
}) {
  const liquidRef = useRef()
  const bubblesRef = useRef()
  const steamRef = useRef()

  // Calculate liquid fill percentage (0 to 1) based on volume
  const fillFraction = Math.min(1.0, Math.max(0.1, volume / maxVolume))
  const beakerHeight = 2.4
  const liquidHeight = (beakerHeight - 0.2) * fillFraction
  const liquidPosY = -beakerHeight / 2 + 0.1 + liquidHeight / 2

  // Generate procedural boiling bubble particles
  const bubbleCount = 35
  const bubbleData = useMemo(() => {
    const arr = []
    for (let i = 0; i < bubbleCount; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 1.3,
        y: Math.random() * 2,
        z: (Math.random() - 0.5) * 1.3,
        speed: 0.8 + Math.random() * 1.5,
        size: 0.02 + Math.random() * 0.04,
      })
    }
    return arr
  }, [])

  // Animation frame: stir vortex, boiling bubble ascent, steam rising
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()

    // Stirring rotation and slight wave deformation
    if (liquidRef.current) {
      if (isStirring) {
        liquidRef.current.rotation.y += delta * 6.0
      }
    }

    // Boiling bubbles animation when temperature is elevated
    if (bubblesRef.current && temperature > 60) {
      const heatFactor = (temperature - 60) / 40 // 0 to 1
      bubblesRef.current.children.forEach((mesh, i) => {
        const b = bubbleData[i]
        b.y += delta * b.speed * (1 + heatFactor * 2)
        if (b.y > liquidHeight) {
          b.y = 0.05
          b.x = (Math.random() - 0.5) * 1.2
          b.z = (Math.random() - 0.5) * 1.2
        }
        mesh.position.set(b.x, -beakerHeight / 2 + 0.1 + b.y, b.z)
        mesh.scale.setScalar(b.size * (0.8 + heatFactor * 0.8))
        mesh.visible = true
      })
    } else if (bubblesRef.current) {
      bubblesRef.current.children.forEach((mesh) => {
        mesh.visible = false
      })
    }

    // Steam / vapor animation above beaker when boiling
    if (steamRef.current && temperature > 75) {
      steamRef.current.visible = true
      steamRef.current.children.forEach((puff, idx) => {
        puff.position.y += delta * (0.4 + idx * 0.1)
        puff.position.x += Math.sin(time * 2 + idx) * 0.005
        if (puff.position.y > 2.8) {
          puff.position.y = beakerHeight / 2 + 0.2
        }
      })
    } else if (steamRef.current) {
      steamRef.current.visible = false
    }
  })

  // Measurement marks data
  const marks = [
    { ml: '50', y: -0.8 },
    { ml: '100', y: -0.4 },
    { ml: '150', y: 0.0 },
    { ml: '200', y: 0.4 },
    { ml: '250', y: 0.8 },
  ]

  return (
    <group position={position} onClick={onClick} {...props}>
      {/* --- Main Glass Beaker Outer Cylinder --- */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.88, beakerHeight, 48, 1, true]} />
        <meshPhysicalMaterial
          transmission={0.96}
          roughness={0.03}
          thickness={0.6}
          ior={1.52}
          transparent={true}
          opacity={1}
          reflectivity={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glass Base Bottom Disc */}
      <mesh position={[0, -beakerHeight / 2 + 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.88, 0.88, 0.08, 48]} />
        <meshPhysicalMaterial
          transmission={0.95}
          roughness={0.05}
          thickness={0.8}
          ior={1.52}
          transparent={true}
        />
      </mesh>

      {/* Glass Top Bevel Rim / Spout Lip */}
      <mesh position={[0, beakerHeight / 2, 0]}>
        <torusGeometry args={[0.9, 0.035, 16, 48]} />
        <meshPhysicalMaterial
          transmission={0.95}
          roughness={0.05}
          thickness={0.4}
          ior={1.52}
          transparent={true}
        />
      </mesh>

      {/* Spout projection notch */}
      <mesh position={[0.92, beakerHeight / 2 + 0.02, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.08, 0.06, 0.16]} />
        <meshPhysicalMaterial
          transmission={0.9}
          roughness={0.05}
          thickness={0.4}
          ior={1.52}
          transparent={true}
        />
      </mesh>

      {/* --- Measurement Graduations & Logo --- */}
      <group position={[0, 0, 0.89]}>
        <Text
          position={[-0.25, 0.95, 0.02]}
          fontSize={0.1}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          PYREX 250mL
        </Text>
        {marks.map((m) => (
          <group key={m.ml} position={[0, m.y, 0.01]}>
            {/* White graduation tick line */}
            <mesh position={[-0.25, 0, 0]}>
              <planeGeometry args={[0.25, 0.02]} />
              <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
            </mesh>
            {/* Volume label */}
            <Text
              position={[-0.5, 0, 0.01]}
              fontSize={0.08}
              color="#ffffff"
              anchorX="right"
              anchorY="middle"
            >
              {m.ml}
            </Text>
          </group>
        ))}
      </group>

      {/* --- Dynamic Chemical Solution (Liquid Body) --- */}
      {volume > 0 && (
        <group position={[0, liquidPosY, 0]} ref={liquidRef}>
          {/* Inner Liquid Cylinder */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.85, 0.84, liquidHeight, 36]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transmission={0.65}
              roughness={0.1}
              ior={1.33}
              transparent={true}
              opacity={0.88}
              depthWrite={false}
            />
          </mesh>

          {/* Meniscus / Top Liquid Surface Disc */}
          <mesh position={[0, liquidHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.85, 36]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transmission={0.7}
              roughness={0.05}
              ior={1.33}
              transparent={true}
              opacity={0.92}
            />
          </mesh>
        </group>
      )}

      {/* --- Procedural Boiling / Reaction Bubbles --- */}
      <group ref={bubblesRef}>
        {bubbleData.map((b, idx) => (
          <mesh key={idx} position={[b.x, 0, b.z]}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.9}
              roughness={0.1}
              ior={1.0}
              transparent={true}
              opacity={0.75}
            />
          </mesh>
        ))}
      </group>

      {/* --- Steam / Vapor Particles when Boiling --- */}
      <group ref={steamRef} position={[0, beakerHeight / 2, 0]}>
        {[0, 1, 2, 3].map((s) => (
          <mesh key={s} position={[(s - 1.5) * 0.15, 0.3 + s * 0.3, 0]}>
            <sphereGeometry args={[0.15 + s * 0.08, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent={true}
              opacity={0.25}
              roughness={1}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
