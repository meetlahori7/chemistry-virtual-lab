import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function BunsenBurner({
  position = [0, 0, 0],
  isHeating = false,
  onToggle,
  ...props
}) {
  const flameRef = useRef()
  const innerFlameRef = useRef()
  const lightRef = useRef()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (flameRef.current && isHeating) {
      // Dynamic flame flicker & flutter
      const flicker = Math.sin(time * 18) * 0.05 + Math.cos(time * 26) * 0.03
      flameRef.current.scale.set(1 + flicker * 0.5, 1 + flicker * 1.5, 1 + flicker * 0.5)
      flameRef.current.position.y = 1.35 + flicker * 0.08
    }

    if (innerFlameRef.current && isHeating) {
      const innerFlicker = Math.cos(time * 22) * 0.04
      innerFlameRef.current.scale.set(1 + innerFlicker, 1 + innerFlicker * 1.2, 1 + innerFlicker)
    }

    if (lightRef.current && isHeating) {
      lightRef.current.intensity = 2.5 + Math.sin(time * 20) * 0.5
    }
  })

  return (
    <group position={position} {...props}>
      {/* Heavy Cast Iron Base */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow onClick={onToggle}>
        <cylinderGeometry args={[0.7, 0.78, 0.16, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Gas intake nozzle attachment */}
      <mesh position={[-0.45, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
        <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Gas rubber tube */}
      <mesh position={[-1.1, 0.05, -0.4]} rotation={[0, 0.4, 0.1]}>
        <cylinderGeometry args={[0.045, 0.045, 1.2, 16]} />
        <meshStandardMaterial color="#ea580c" roughness={0.8} />
      </mesh>

      {/* Air Collar (Adjustable ring with holes) */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.22, 16]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Stainless Steel Vertical Barrel Tube */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.9, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Burner Top Orifice Crown */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.11, 0.1, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* --- Tripod Stand with Wire Gauze & Ceramic Center --- */}
      <group position={[0, 0, 0]}>
        {/* 3 Tripod Steel Legs */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
          <group key={idx} rotation={[0, angle, 0]}>
            <mesh position={[0.75, 1.1, 0]} rotation={[0, 0, -0.15]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 2.25, 12]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Circular Top Support Ring */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <torusGeometry args={[0.85, 0.04, 16, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>

        {/* Wire Gauze Mesh Platform */}
        <mesh position={[0, 2.22, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.5, 0.02, 1.5]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.7}
            roughness={0.5}
            wireframe={false}
          />
        </mesh>

        {/* Ceramic Heat Center Disc (Prevents thermal shock) */}
        <mesh position={[0, 2.235, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.015, 32]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>
      </group>

      {/* --- Procedural 3D Glowing Burner Flame --- */}
      {isHeating && (
        <group position={[0, 0, 0]}>
          {/* Outer Roaring Flame */}
          <mesh ref={flameRef} position={[0, 1.5, 0]}>
            <coneGeometry args={[0.18, 0.7, 24]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent={true}
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Inner High-Heat Reducing Cone (Intense Deep Blue) */}
          <mesh ref={innerFlameRef} position={[0, 1.42, 0]}>
            <coneGeometry args={[0.1, 0.4, 24]} />
            <meshBasicMaterial
              color="#2563eb"
              transparent={true}
              opacity={0.95}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Flame Point Light casting realistic lab illumination */}
          <pointLight
            ref={lightRef}
            position={[0, 1.6, 0]}
            color="#38bdf8"
            intensity={3.0}
            distance={5}
            decay={2}
          />
        </group>
      )}
    </group>
  )
}
