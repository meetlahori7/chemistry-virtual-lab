import React from 'react'
import * as THREE from 'three'

export default function TestTubeRack({
  position = [0, 0, 0],
  tubes = [
    { color: '#ef4444', label: 'Acid (pH 1)' },
    { color: '#eab308', label: 'Indicator' },
    { color: '#22c55e', label: 'Neutral (pH 7)' },
    { color: '#3b82f6', label: 'Base (pH 13)' },
    { color: '#a855f7', label: 'Salt Solution' },
  ],
  onSelectTube,
  ...props
}) {
  return (
    <group position={position} {...props}>
      {/* Acrylic Rack Base */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.08, 0.6]} />
        <meshStandardMaterial color="#475569" metalness={0.2} roughness={0.3} />
      </mesh>

      {/* Rack Middle Support Tier with Holes */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.06, 0.6]} />
        <meshStandardMaterial color="#64748b" metalness={0.2} roughness={0.3} />
      </mesh>

      {/* Rack Top Support Tier */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.06, 0.6]} />
        <meshStandardMaterial color="#475569" metalness={0.2} roughness={0.3} />
      </mesh>

      {/* Side Support Pillars */}
      {[-1.02, 1.02].map((sx, idx) => (
        <mesh key={idx} position={[sx, 0.55, 0]} castShadow>
          <boxGeometry args={[0.08, 1.05, 0.56]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}

      {/* 5 Test Tubes inserted into Rack */}
      {tubes.map((tube, idx) => {
        const xPos = -0.8 + idx * 0.4
        return (
          <group
            key={idx}
            position={[xPos, 0.75, 0]}
            onClick={(e) => {
              e.stopPropagation()
              onSelectTube && onSelectTube(tube, idx)
            }}
          >
            {/* Outer Glass Test Tube Body */}
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.1, 1.4, 24, 1, true]} />
              <meshPhysicalMaterial
                transmission={0.94}
                roughness={0.04}
                thickness={0.25}
                ior={1.5}
                transparent={true}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Test Tube Rounded Bottom Hemispherical Cap */}
            <mesh position={[0, -0.7, 0]}>
              <sphereGeometry args={[0.1, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
              <meshPhysicalMaterial
                transmission={0.94}
                roughness={0.04}
                thickness={0.25}
                ior={1.5}
                transparent={true}
              />
            </mesh>

            {/* Glass Rim Top Collar */}
            <mesh position={[0, 0.7, 0]}>
              <torusGeometry args={[0.1, 0.015, 12, 24]} />
              <meshPhysicalMaterial
                transmission={0.95}
                roughness={0.05}
                thickness={0.2}
                ior={1.5}
                transparent={true}
              />
            </mesh>

            {/* Liquid Solution Inside */}
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.9, 16]} />
              <meshPhysicalMaterial
                color={tube.color}
                transmission={0.7}
                roughness={0.1}
                ior={1.33}
                transparent={true}
                opacity={0.85}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
