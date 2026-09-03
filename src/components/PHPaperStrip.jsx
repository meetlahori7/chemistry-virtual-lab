import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { soundManager } from '../core/SoundEngine'

const PHPaperStrip = React.forwardRef(({
  position = [1.1, -1.04, 0.9],
  beakerPos = [0, -1.05, 0],
  currentPH = 7.0,
  onDip,
  ...props
}, ref) => {
  const [isDipping, setIsDipping] = useState(false)
  const [dippedColor, setDippedColor] = useState('#fde047') // initial dry yellow
  const [isTested, setIsTested] = useState(false)
  const [hovered, setHovered] = useState(false)
  const stripGroup = useRef()
  const dipProgress = useRef(0)

  // Universal Indicator Color Scale for paper strip
  const getPHStripColor = (pH) => {
    if (pH <= 2) return '#dc2626' // Strong Red (pH 1-2)
    if (pH <= 4) return '#ea580c' // Orange (pH 3-4)
    if (pH <= 6) return '#ca8a04' // Yellow-Orange (pH 5-6)
    if (pH <= 7.5) return '#16a34a' // Green (pH 7)
    if (pH <= 9) return '#0891b2' // Cyan/Blue-Green (pH 8-9)
    if (pH <= 11) return '#2563eb' // Blue (pH 10-11)
    return '#7e22ce' // Violet/Purple (pH 12-14)
  }

  const triggerDip = () => {
    if (isDipping) return
    soundManager.playDroplet()
    setIsDipping(true)
    dipProgress.current = 0
    onDip && onDip()
  }

  React.useImperativeHandle(ref, () => ({ triggerDip }));

  useFrame((state, delta) => {
    if (isDipping && stripGroup.current) {
      dipProgress.current += delta * 1.5

      if (dipProgress.current < 1) {
        // Move towards beaker and dip down
        const t = dipProgress.current
        stripGroup.current.position.set(
          THREE.MathUtils.lerp(position[0], beakerPos[0], t),
          THREE.MathUtils.lerp(position[1], beakerPos[1] + 1.2 - Math.sin(t * Math.PI) * 0.8, t),
          THREE.MathUtils.lerp(position[2], beakerPos[2] + 0.3, t)
        )
        stripGroup.current.rotation.z = THREE.MathUtils.lerp(0, 0.4, t)
      } else if (dipProgress.current < 2) {
        // Pull back up to bench
        const t = dipProgress.current - 1
        if (!isTested) {
          setDippedColor(getPHStripColor(currentPH))
          setIsTested(true)
          soundManager.playSuccessChime()
        }
        stripGroup.current.position.set(
          THREE.MathUtils.lerp(beakerPos[0], position[0], t),
          THREE.MathUtils.lerp(beakerPos[1] + 0.4, position[1], t),
          THREE.MathUtils.lerp(beakerPos[2] + 0.3, position[2], t)
        )
        stripGroup.current.rotation.z = THREE.MathUtils.lerp(0.4, 0, t)
      } else {
        setIsDipping(false)
        stripGroup.current.position.set(...position)
        stripGroup.current.rotation.set(0, 0, 0)
      }
    }
  })

  return (
    <group
      ref={stripGroup}
      position={position}
      scale={hovered ? 1.1 : 1.0}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        soundManager.playGlassClink()
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        triggerDip()
      }}
      {...props}
    >
      {/* Generous touch hitbox */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.9]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Dry Paper Strip Upper Portion */}
      <mesh position={[0, 0.01, -0.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.18, 0.4]} />
        <meshStandardMaterial color="#fef08a" roughness={0.9} />
      </mesh>

      {/* Reactive Indicator Tip (Changes color when dipped) */}
      <mesh position={[0, 0.012, 0.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.18, 0.2]} />
        <meshStandardMaterial color={dippedColor} roughness={0.9} />
      </mesh>

      {/* 3D In-World Tooltip Label */}
      <group position={[0, 0.15, 0]}>
        <mesh>
          <planeGeometry args={[0.6, 0.16]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.055}
          color={isTested ? dippedColor : '#38bdf8'}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {isTested ? `pH STRIP: ${Number(currentPH).toFixed(1)}` : 'DIP pH PAPER'}
        </Text>
      </group>
    </group>
  )
})

export default PHPaperStrip;
