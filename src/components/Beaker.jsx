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
  isHeating = false,
  isStirring = false,
  isMobile = false,
  onClick,
  ...props
}) {
  const liquidRef = useRef()
  const meniscusRef = useRef()
  const stirBarRef = useRef()
  const bubblesRef = useRef()
  const steamRef = useRef()
  const thermalGlowRef = useRef()

  // Griffin low-form 250mL beaker proportions (realistic 1.35 : 1 height-to-diameter ratio)
  const beakerHeight = 1.65
  const outerRadius = 0.62
  const innerRadius = 0.585
  const baseThickness = 0.04

  // Liquid level calculation
  const fillFraction = Math.min(1.0, Math.max(0.08, volume / maxVolume))
  const maxLiquidHeight = beakerHeight - 0.22
  const liquidHeight = maxLiquidHeight * fillFraction

  // Procedural boiling bubbles
  const bubbleCount = isMobile ? 12 : 28
  const bubbleData = useMemo(() => {
    const arr = []
    for (let i = 0; i < bubbleCount; i++) {
      arr.push({
        x: (Math.random() - 0.5) * (innerRadius * 1.6),
        y: Math.random() * 1.2,
        z: (Math.random() - 0.5) * (innerRadius * 1.6),
        speed: 0.9 + Math.random() * 1.6,
        size: 0.016 + Math.random() * 0.03,
      })
    }
    return arr
  }, [bubbleCount, innerRadius])

  // Real-time animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()

    // Magnetic stir bar spinning & liquid vortex
    if (stirBarRef.current) {
      if (isStirring) {
        stirBarRef.current.rotation.y += delta * 24.0
      } else {
        stirBarRef.current.rotation.y = 0.35
      }
    }

    if (liquidRef.current && isStirring) {
      liquidRef.current.rotation.y += delta * 4.0
    }

    // Thermal heating ring gentle pulse
    if (thermalGlowRef.current && isHeating) {
      const pulse = Math.sin(time * 6) * 0.15 + 0.85
      thermalGlowRef.current.material.opacity = 0.75 * pulse
    }

    // Boiling bubble ascent
    if (bubblesRef.current && (temperature > 55 || isHeating)) {
      const heatFactor = Math.min(1.0, Math.max(0.1, (temperature - 50) / 50))
      bubblesRef.current.children.forEach((mesh, i) => {
        const b = bubbleData[i]
        b.y += delta * b.speed * (0.8 + heatFactor * 2.2)
        if (b.y > liquidHeight) {
          b.y = 0.03
          b.x = (Math.random() - 0.5) * (innerRadius * 1.5)
          b.z = (Math.random() - 0.5) * (innerRadius * 1.5)
        }
        mesh.position.set(b.x, baseThickness + b.y, b.z)
        mesh.scale.setScalar(b.size * (0.7 + heatFactor * 0.8))
        mesh.visible = true
      })
    } else if (bubblesRef.current) {
      bubblesRef.current.children.forEach((mesh) => {
        mesh.visible = false
      })
    }

    // Steam vapor plumes
    if (steamRef.current && temperature > 72) {
      steamRef.current.visible = true
      steamRef.current.children.forEach((puff, idx) => {
        puff.position.y += delta * (0.35 + idx * 0.08)
        puff.position.x += Math.sin(time * 2.5 + idx) * 0.006
        if (puff.position.y > 1.6) {
          puff.position.y = 0.1
        }
      })
    } else if (steamRef.current) {
      steamRef.current.visible = false
    }
  })

  // Graduation measurement marks
  const marks = [
    { ml: '50', y: 0.32 },
    { ml: '100', y: 0.64 },
    { ml: '150', y: 0.96 },
    { ml: '200', y: 1.28 },
  ]

  return (
    <group position={position} onClick={onClick} {...props}>
      {/* ------------------------------------------------------------- */}
      {/* 1. LABORATORY CERAMIC HOTPLATE & MAGNETIC STIRRER PLATFORM   */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, -0.09, 0]}>
        {/* Main Instrument Housing */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.54, 0.18, 1.54]} />
          <meshStandardMaterial
            color="#f1f5f9"
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>

        {/* Brushed Metal Side Chassis Trim */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[1.56, 0.08, 1.56]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Circular Ceramic Heating Plate Top Surface */}
        <mesh position={[0, 0.095, 0]} receiveShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.02, 48]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.15}
            metalness={0.05}
          />
        </mesh>

        {/* Ceramic Top Plate Outer Bezel Ring */}
        <mesh position={[0, 0.095, 0]}>
          <torusGeometry args={[0.72, 0.015, 16, 48]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Thermal Heating Ring (Glows when isHeating is active) */}
        {isHeating && (
          <group position={[0, 0.106, 0]}>
            <mesh ref={thermalGlowRef} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.18, 0.58, 48]} />
              <meshBasicMaterial
                color="#f97316"
                transparent={true}
                opacity={0.85}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Soft upward thermal point light illuminating the solution */}
            <pointLight
              color="#ffedd5"
              intensity={1.4}
              distance={2.5}
              position={[0, 0.2, 0]}
            />
          </group>
        )}

        {/* Front Instrument Control Panel */}
        <group position={[0, 0, 0.78]}>
          {/* Beveled angled front plate */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.48, 0.16, 0.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>

          {/* Digital Temperature LED Display */}
          <mesh position={[-0.42, 0.02, 0.022]}>
            <planeGeometry args={[0.38, 0.09]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          <Text
            position={[-0.42, 0.02, 0.025]}
            fontSize={0.045}
            color={isHeating ? '#f87171' : '#38bdf8'}
            fontFamily="monospace"
            anchorX="center"
            anchorY="middle"
          >
            {temperature.toFixed(0)}°C
          </Text>

          {/* Digital Stir RPM Display */}
          <mesh position={[0.42, 0.02, 0.022]}>
            <planeGeometry args={[0.38, 0.09]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          <Text
            position={[0.42, 0.02, 0.025]}
            fontSize={0.042}
            color={isStirring ? '#34d399' : '#64748b'}
            fontFamily="monospace"
            anchorX="center"
            anchorY="middle"
          >
            {isStirring ? '450 RPM' : '0 RPM'}
          </Text>

          {/* Rotary Control Dials (HEAT and STIR) */}
          {[-0.12, 0.12].map((x, i) => (
            <group key={i} position={[x, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.04, 0.04, 0.03, 24]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
              </mesh>
              {/* Dial notch */}
              <mesh position={[0, 0.016, 0.025]}>
                <boxGeometry args={[0.01, 0.01, 0.02]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>
          ))}

          {/* Status Indicator LEDs */}
          {/* Heat Active LED (Red) */}
          <mesh position={[-0.12, 0.055, 0.022]}>
            <circleGeometry args={[0.012, 16]} />
            <meshBasicMaterial color={isHeating ? '#ef4444' : '#450a0a'} />
          </mesh>
          {/* Stir Active LED (Green) */}
          <mesh position={[0.12, 0.055, 0.022]}>
            <circleGeometry args={[0.012, 16]} />
            <meshBasicMaterial color={isStirring ? '#10b981' : '#022c22'} />
          </mesh>

          {/* Manufacturer Logo */}
          <Text
            position={[0, -0.045, 0.025]}
            fontSize={0.035}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            PRECISION CERAMIC-MAG 420
          </Text>
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN 250mL BOROSILICATE GLASS REACTION BEAKER              */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 0]}>
        {/* Invisible Touch Hitbox for Effortless Tap on Mobile & Mouse */}
        <mesh
          position={[0, beakerHeight / 2, 0]}
          onClick={(e) => {
            e.stopPropagation()
            onClick && onClick(e)
          }}
        >
          <cylinderGeometry args={[outerRadius + 0.25, outerRadius + 0.25, beakerHeight + 0.3, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Outer Borosilicate Glass Cylinder */}
        <mesh position={[0, beakerHeight / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[outerRadius, outerRadius - 0.015, beakerHeight, 48, 1, true]} />
          <meshPhysicalMaterial
            transmission={0.98}
            roughness={0.015}
            ior={1.517}
            thickness={0.08}
            transparent={true}
            opacity={1}
            reflectivity={0.8}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Heavy Glass Bottom Base Disc */}
        <mesh position={[0, baseThickness / 2, 0]} receiveShadow>
          <cylinderGeometry args={[outerRadius - 0.015, outerRadius - 0.015, baseThickness, 48]} />
          <meshPhysicalMaterial
            transmission={0.97}
            roughness={0.02}
            ior={1.517}
            thickness={0.12}
            transparent={true}
            depthWrite={false}
          />
        </mesh>

        {/* Curved Glass Heel Chamfer at Base Perimeter */}
        <mesh position={[0, 0.02, 0]}>
          <torusGeometry args={[outerRadius - 0.02, 0.02, 16, 48]} />
          <meshPhysicalMaterial
            transmission={0.96}
            roughness={0.02}
            ior={1.517}
            transparent={true}
            depthWrite={false}
          />
        </mesh>

        {/* Fire-Polished Glass Rim Bead at Top */}
        <mesh position={[0, beakerHeight, 0]}>
          <torusGeometry args={[outerRadius, 0.022, 16, 48]} />
          <meshPhysicalMaterial
            transmission={0.97}
            roughness={0.015}
            ior={1.517}
            thickness={0.08}
            transparent={true}
            depthWrite={false}
          />
        </mesh>

        {/* Formed Glass Pouring Spout Projection */}
        <group position={[0, beakerHeight, outerRadius - 0.02]}>
          <mesh rotation={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.04, 0.08, 16, 1, true]} />
            <meshPhysicalMaterial
              transmission={0.96}
              roughness={0.02}
              ior={1.517}
              transparent={true}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* ----------------------------------------------------------- */}
        {/* 3. AUTHENTIC PYREX ENAMELED MARKINGS & GRADUATIONS          */}
        {/* ----------------------------------------------------------- */}
        <group position={[0, 0, outerRadius + 0.005]}>
          {/* Frosted White Pencil Marking Spot (Authentic laboratory detail) */}
          <mesh position={[-0.22, 0.96, 0]}>
            <planeGeometry args={[0.22, 0.32]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.9}
              transparent={true}
              opacity={0.88}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Classic PYREX Inscription */}
          <Text
            position={[-0.22, 1.25, 0.002]}
            fontSize={0.065}
            color="#0284c7"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            PYREX®
          </Text>
          <Text
            position={[-0.22, 1.17, 0.002]}
            fontSize={0.045}
            color="#0284c7"
            anchorX="center"
            anchorY="middle"
          >
            250 mL
          </Text>
          <Text
            position={[-0.22, 0.74, 0.002]}
            fontSize={0.035}
            color="#64748b"
            anchorX="center"
            anchorY="middle"
          >
            No. 1000
          </Text>

          {/* White Enameled Graduation Marks */}
          {marks.map((m) => (
            <group key={m.ml} position={[0.18, m.y, 0.002]}>
              {/* Major graduation tick line */}
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[0.14, 0.015]} />
                <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
              </mesh>
              {/* Numeric label */}
              <Text
                position={[0.12, 0, 0]}
                fontSize={0.055}
                color="#ffffff"
                anchorX="left"
                anchorY="middle"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {m.ml}
              </Text>
            </group>
          ))}

          {/* Intermediate 25mL Tick Marks */}
          {[0.16, 0.48, 0.80, 1.12, 1.44].map((y, idx) => (
            <mesh key={idx} position={[0.21, y, 0.002]}>
              <planeGeometry args={[0.08, 0.01]} />
              <meshBasicMaterial color="rgba(255,255,255,0.7)" side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>

        {/* ----------------------------------------------------------- */}
        {/* 4. DYNAMIC CHEMICAL SOLUTION (LIQUID BODY & MENISCUS)       */}
        {/* ----------------------------------------------------------- */}
        {volume > 0 && (
          <group position={[0, 0, 0]} ref={liquidRef}>
            {/* Liquid Solution Cylinder */}
            <mesh
              position={[0, baseThickness + liquidHeight / 2, 0]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry
                args={[innerRadius, innerRadius - 0.01, liquidHeight, 48]}
              />
              <meshPhysicalMaterial
                color={liquidColor}
                transmission={0.68}
                roughness={0.04}
                ior={1.333}
                transparent={true}
                opacity={0.88}
                depthWrite={false}
              />
            </mesh>

            {/* Top Liquid Surface (Flat Center Disc) */}
            <mesh
              position={[0, baseThickness + liquidHeight, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[innerRadius - 0.01, 48]} />
              <meshPhysicalMaterial
                color={liquidColor}
                transmission={0.72}
                roughness={0.02}
                ior={1.333}
                transparent={true}
                opacity={0.92}
                depthWrite={false}
              />
            </mesh>

            {/* Concave Meniscus Ring along Glass Wall Perimeter */}
            <mesh
              ref={meniscusRef}
              position={[0, baseThickness + liquidHeight, 0]}
            >
              <torusGeometry args={[innerRadius - 0.01, 0.014, 16, 48]} />
              <meshPhysicalMaterial
                color={liquidColor}
                transmission={0.75}
                roughness={0.03}
                ior={1.333}
                transparent={true}
                opacity={0.95}
                depthWrite={false}
              />
            </mesh>

            {/* PTFE Magnetic Stir Bar ("Flea") at Beaker Bottom */}
            <group
              ref={stirBarRef}
              position={[0, baseThickness + 0.028, 0]}
              rotation={[0, 0.35, 0]}
            >
              <mesh castShadow>
                <cylinderGeometry args={[0.032, 0.032, 0.22, 16]} rotation={[0, 0, Math.PI / 2]} />
                <meshStandardMaterial
                  color="#ffffff"
                  roughness={0.2}
                  metalness={0.05}
                />
              </mesh>
              {/* Central pivot ring on stir bar */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.034, 0.005, 12, 16]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
              </mesh>
            </group>
          </group>
        )}

        {/* ----------------------------------------------------------- */}
        {/* 5. PROCEDURAL CONVECTIVE BOILING BUBBLES                     */}
        {/* ----------------------------------------------------------- */}
        <group ref={bubblesRef}>
          {bubbleData.map((b, idx) => (
            <mesh key={idx} position={[b.x, baseThickness + b.y, b.z]}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transmission={0.92}
                roughness={0.05}
                ior={1.0}
                transparent={true}
                opacity={0.8}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>

        {/* ----------------------------------------------------------- */}
        {/* 6. STEAM / VAPOR PARTICLES                                  */}
        {/* ----------------------------------------------------------- */}
        <group ref={steamRef} position={[0, beakerHeight, 0]}>
          {[0, 1, 2, 3].map((s) => (
            <mesh key={s} position={[(s - 1.5) * 0.12, 0.2 + s * 0.25, 0]}>
              <sphereGeometry args={[0.12 + s * 0.06, 16, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent={true}
                opacity={0.22}
                roughness={1}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}
