import React from 'react'
import { Text } from '@react-three/drei'

export default function LabEnvironment() {
  return (
    <group position={[0, -1.2, 0]}>
      {/* --- Laboratory Workbench (Main Table) --- */}
      <group position={[0, 0, 0]}>
        {/* Countertop: Durable black/dark epoxy chemical-resistant resin */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[10, 0.25, 4.5]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>

        {/* Countertop Front Beveled Lip */}
        <mesh position={[0, 0.05, 2.27]} receiveShadow>
          <boxGeometry args={[10.04, 0.15, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Wooden Cabinetry Under the Bench */}
        <mesh position={[0, -1.15, 0]} receiveShadow>
          <boxGeometry args={[9.6, 2.05, 4.1]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.6}
            metalness={0.15}
          />
        </mesh>

        {/* Cabinet Door Dividers / Drawers */}
        {[-3.2, -1.6, 0, 1.6, 3.2].map((x, i) => (
          <group key={i} position={[x, -0.6, 2.07]}>
            {/* Top drawer */}
            <mesh position={[0, 0, 0]} receiveShadow>
              <boxGeometry args={[1.45, 0.45, 0.04]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            {/* Metal handle */}
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[0.4, 0.04, 0.04]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Bottom double cabinet doors */}
            <mesh position={[0, -0.7, 0]} receiveShadow>
              <boxGeometry args={[1.45, 0.8, 0.04]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.7, 0.04]}>
              <boxGeometry args={[0.04, 0.4, 0.04]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Chrome Gas / Water Valves on table back */}
        {[-2.5, 2.5].map((x, i) => (
          <group key={i} position={[x, 0.15, -1.5]}>
            {/* Base mount */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.08, 0.09, 0.1, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Vertical tube */}
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.5, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Curved spout */}
            <mesh position={[0, 0.58, 0.1]} rotation={[Math.PI / 4, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.25, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Blue and Yellow valve handles */}
            <mesh position={[-0.08, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
              <meshStandardMaterial color={i === 0 ? '#0284c7' : '#eab308'} roughness={0.3} />
            </mesh>
            <mesh position={[0.08, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Stainless Steel Lab Sink Basin */}
        <group position={[3.8, 0.12, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[1.5, 0.02, 1.8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          {/* Inner sink cavity */}
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[1.3, 0.3, 1.6]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Faucet */}
          <mesh position={[0, 0.35, -0.6]}>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* --- Laboratory Room Architecture --- */}
      {/* Floor: Anti-static Cleanroom Laboratory Tiles */}
      <mesh position={[0, -2.18, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 26]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Back Wall with Modern Lab Paneling */}
      <mesh position={[0, 4, -4.5]} receiveShadow>
        <planeGeometry args={[30, 14]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.7}
        />
      </mesh>

      {/* Wall Safety & Periodic Table Backdrop Board */}
      <group position={[0, 3.2, -4.45]}>
        {/* Frame */}
        <mesh receiveShadow>
          <boxGeometry args={[6.4, 3.2, 0.08]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        {/* Inner Whiteboard / Chart area */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[6.1, 2.9]} />
          <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Periodic Table & Lab Header 3D Text */}
        <Text
          position={[0, 1.1, 0.06]}
          fontSize={0.2}
          maxWidth={5.8}
          textAlign="center"
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          PERIODIC TABLE OF THE ELEMENTS & LAB SAFETY
        </Text>
        <Text
          position={[0, 0.7, 0.06]}
          fontSize={0.1}
          maxWidth={5.8}
          textAlign="center"
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          [H] 1.008  |  [He] 4.002  |  [Li] 6.94  |  [C] 12.011  |  [N] 14.007  |  [O] 15.999  |  [Na] 22.990  |  [Cl] 35.45
        </Text>
        <Text
          position={[0, 0.2, 0.06]}
          fontSize={0.1}
          maxWidth={5.8}
          textAlign="center"
          color="#34d399"
          anchorX="center"
          anchorY="middle"
        >
          ACID-BASE NEUTRALIZATION: HCl + NaOH → NaCl + H2O  (DeltaH = -57.1 kJ/mol)
        </Text>
        <Text
          position={[0, -0.3, 0.06]}
          fontSize={0.09}
          maxWidth={5.8}
          textAlign="center"
          color="#f59e0b"
          anchorX="center"
          anchorY="middle"
        >
          SAFETY PROTOCOL: Wear Goggles • Handle Concentrated Acids with Pipettes • Never Inhale Vapors
        </Text>
        <Text
          position={[0, -0.8, 0.06]}
          fontSize={0.09}
          maxWidth={5.8}
          textAlign="center"
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          VIRTUAL CHEMISTRY SIMULATION ENGINE v2.4 • R3F HIGH-PRECISION GRAPHICS
        </Text>
      </group>

      {/* Glassware Equipment Shelf on the Back Wall */}
      <group position={[0, 1.2, -3.8]}>
        {/* Wooden / Steel Shelf Rack */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[7.2, 0.08, 0.7]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Support brackets */}
        {[-3, -1, 1, 3].map((bx, bi) => (
          <mesh key={bi} position={[bx, -0.2, -0.25]}>
            <boxGeometry args={[0.06, 0.4, 0.45]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        ))}

        {/* Decorative Background Glassware on Shelf */}
        {/* Amber bottles */}
        {[-2.8, -2.4, -2.0].map((bx, bi) => (
          <group key={bi} position={[bx, 0.28, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.45, 16]} />
              <meshPhysicalMaterial
                color="#b45309"
                transmission={0.8}
                roughness={0.15}
                thickness={0.3}
                ior={1.5}
              />
            </mesh>
            {/* Cap */}
            <mesh position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        ))}

        {/* Volumetric Flasks */}
        {[-0.8, 0, 0.8].map((fx, fi) => (
          <group key={fi} position={[fx, 0.32, 0]}>
            {/* Spherical bottom */}
            <mesh position={[0, 0, 0]} castShadow>
              <sphereGeometry args={[0.22, 24, 24]} />
              <meshPhysicalMaterial
                color={fi === 0 ? '#38bdf8' : fi === 1 ? '#a855f7' : '#ec4899'}
                transmission={0.9}
                roughness={0.05}
                thickness={0.2}
                ior={1.5}
              />
            </mesh>
            {/* Neck */}
            <mesh position={[0, 0.26, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.35, 16]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transmission={0.95}
                roughness={0.05}
                thickness={0.2}
                ior={1.5}
              />
            </mesh>
            {/* Stopper */}
            <mesh position={[0, 0.46, 0]}>
              <cylinderGeometry args={[0.06, 0.04, 0.08, 12]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>
        ))}

        {/* Graduated measuring cylinders */}
        {[2.0, 2.6].map((cx, ci) => (
          <group key={ci} position={[cx, 0.4, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.72, 16]} />
              <meshPhysicalMaterial
                color={ci === 0 ? '#10b981' : '#f59e0b'}
                transmission={0.88}
                roughness={0.05}
                thickness={0.3}
                ior={1.5}
              />
            </mesh>
            <mesh position={[0, -0.38, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Overhead Fluorescent Light Bar Fixture */}
      <group position={[0, 7.5, 0]}>
        <mesh>
          <boxGeometry args={[8, 0.2, 1.2]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[7.6, 0.05, 0.9]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  )
}
