import React, { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import confetti from 'canvas-confetti'
import * as THREE from 'three'

import LabEnvironment from './components/LabEnvironment'
import Beaker from './components/Beaker'
import BunsenBurner from './components/BunsenBurner'
import ReagentBottle from './components/ReagentBottle'
import TestTubeRack from './components/TestTubeRack'
import ErlenmeyerFlask from './components/ErlenmeyerFlask'
import DigitalProbe from './components/DigitalProbe'
import PipetteDropper from './components/PipetteDropper'
import StirringRod from './components/StirringRod'
import PHPaperStrip from './components/PHPaperStrip'
import AnimatedPourStream from './components/AnimatedPourStream'
import LabHUD from './components/LabHUD'

import {
  INITIAL_LAB_STATE,
  addReagentToState,
  calculateSolutionColor,
} from './core/ChemicalEngine'
import { EXPERIMENTS } from './experiments/experimentList'
import { soundManager } from './core/SoundEngine'

// Camera controller component to handle smooth animated presets & touch navigation
function CameraRig({ cameraMode, isMobile }) {
  const controlsRef = useRef()

  useEffect(() => {
    if (!controlsRef.current) return
    if (cameraMode === 'focus') {
      controlsRef.current.target.set(0, 0.4, 0)
      controlsRef.current.object.position.set(0, 1.2, isMobile ? 3.8 : 3.2)
    } else if (cameraMode === 'shelf') {
      controlsRef.current.target.set(0, 0.2, -1.2)
      controlsRef.current.object.position.set(0, 2.2, isMobile ? 5.6 : 4.8)
    } else if (cameraMode === 'topdown') {
      controlsRef.current.target.set(0, -0.2, 0)
      controlsRef.current.object.position.set(0, 5.5, isMobile ? 2.8 : 2.2)
    } else {
      // overview
      controlsRef.current.target.set(0, 0.3, 0)
      controlsRef.current.object.position.set(0, isMobile ? 3.0 : 2.5, isMobile ? 7.6 : 6.2)
    }
    controlsRef.current.update()
  }, [cameraMode, isMobile])

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0.3, 0]}
      maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from dipping below bench
      minDistance={1.8}
      maxDistance={9.5}
      enableDamping={true}
      dampingFactor={0.06}
      rotateSpeed={0.7}
      zoomSpeed={0.8}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      makeDefault
    />
  )
}

export default function App() {
  const [labState, setLabState] = useState(INITIAL_LAB_STATE)
  const [currentExpId, setCurrentExpId] = useState('titration')
  const [cameraMode, setCameraMode] = useState('overview')
  const [dropperActive, setDropperActive] = useState(false)
  const [activePourReagent, setActivePourReagent] = useState(null)
  const [soundMuted, setSoundMuted] = useState(false)
  const [celebrated, setCelebrated] = useState({})
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )
  const [perfMode, setPerfMode] = useState('auto')
  const phStripRef = useRef()

  // Responsive mobile width detector
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Unlock Web Audio on first touch/click
  useEffect(() => {
    const unlockAudio = () => {
      soundManager.initContext()
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
    }
    window.addEventListener('pointerdown', unlockAudio)
    window.addEventListener('touchstart', unlockAudio)
    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
    }
  }, [])

  // Bottle initial coordinates map for pour animations
  const bottleCoords = {
    HCL: [-3.0, -1.05, 1.6],
    NAOH: [-2.2, -1.05, 1.6],
    PHENOL: [-1.4, -1.05, 1.6],
    UNIV_IND: [1.4, -1.05, 1.6],
    CUSO4: [2.2, -1.05, 1.6],
    H2O: [3.0, -1.05, 1.6],
  }

  // Initialize experiment setup
  const loadExperiment = (expId) => {
    setCurrentExpId(expId)
    const exp = EXPERIMENTS.find((e) => e.id === expId) || EXPERIMENTS[0]
    const baseState = {
      ...INITIAL_LAB_STATE,
      ...exp.initialChemicals,
      isHeating: false,
      isStirring: false,
      dropperActive: false,
      lastAction: `Loaded: ${exp.title.split('(')[0].trim()}`,
    }
    baseState.color = calculateSolutionColor(baseState)
    setLabState(baseState)
  }

  // Initial load
  useEffect(() => {
    loadExperiment('titration')
  }, [])

  // Milestone Celebration triggers
  useEffect(() => {
    // 1. Titration Equivalence Point Pink color milestone
    if (
      currentExpId === 'titration' &&
      labState.contents.hasPhenol &&
      labState.pH >= 8.2 &&
      !celebrated['titration-endpoint']
    ) {
      setCelebrated((prev) => ({ ...prev, 'titration-endpoint': true }))
      soundManager.playSuccessChime()
      try {
        confetti({
          particleCount: isMobile ? 40 : 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#f472b6', '#38bdf8', '#34d399'],
        })
      } catch (e) {}
    }

    // 2. Boiling reached milestone
    if (
      currentExpId === 'boiling' &&
      labState.temperature >= 95 &&
      !celebrated['boiling-reached']
    ) {
      setCelebrated((prev) => ({ ...prev, 'boiling-reached': true }))
      soundManager.playSuccessChime()
      try {
        confetti({
          particleCount: isMobile ? 35 : 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#0284c7', '#f59e0b'],
        })
      } catch (e) {}
    }
  }, [labState.pH, labState.temperature, currentExpId, celebrated, labState.contents.hasPhenol, isMobile])

  // Continuous thermal simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setLabState((prev) => {
        if (prev.isHeating && prev.temperature < 100) {
          const nextTemp = Math.min(100, prev.temperature + 1.8)
          if (nextTemp >= 70 && Math.random() > 0.6) {
            soundManager.playBubbles()
          }
          return {
            ...prev,
            temperature: nextTemp,
            reactionNotice:
              nextTemp >= 80
                ? '⚠️ Solution is vigorously boiling (100°C) with steam vaporization!'
                : 'Heating solution with Bunsen Burner...',
          }
        } else if (!prev.isHeating && prev.temperature > 22.0) {
          const nextTemp = Math.max(22.0, prev.temperature - 0.8)
          return {
            ...prev,
            temperature: nextTemp,
          }
        }
        return prev
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  // Action Handlers
  const handleAddReagent = (reagentKey, amount = 20) => {
    soundManager.playPourLiquid(0.9)
    setActivePourReagent(reagentKey)

    // Reset pour animation state after brief duration
    setTimeout(() => {
      setActivePourReagent(null)
      setLabState((prev) => addReagentToState(prev, reagentKey, amount))
    }, 600)
  }

  const handleToggleHeat = () => {
    soundManager.playBurnerIgnition()
    setLabState((prev) => ({
      ...prev,
      isHeating: !prev.isHeating,
      lastAction: prev.isHeating
        ? 'Extinguished Bunsen Burner flame.'
        : 'Ignited Bunsen Burner blue heating flame.',
    }))
  }

  const handleToggleStir = () => {
    soundManager.playGlassClink()
    setLabState((prev) => ({
      ...prev,
      isStirring: !prev.isStirring,
      lastAction: prev.isStirring
        ? 'Stopped magnetic stirrer.'
        : 'Started glass rod stirring vortex.',
    }))
  }

  const handleTriggerDropper = (reagentKey = 'PHENOL') => {
    soundManager.playDroplet()
    setDropperActive(true)
    setTimeout(() => {
      handleAddReagent(reagentKey, 5)
      setDropperActive(false)
    }, 700)
  }

  const handleDipPHPaper = () => {
    if (phStripRef.current) {
      phStripRef.current.triggerDip && phStripRef.current.triggerDip()
    }
  }

  const handleReset = () => {
    soundManager.playGlassClink()
    setCelebrated({})
    loadExperiment(currentExpId)
  }

  const handleToggleSound = () => {
    const next = !soundMuted
    setSoundMuted(next)
    soundManager.setMuted(next)
  }

  // Calculate pouring stream coordinates
  const pourStart = activePourReagent
    ? [-0.7, 0.4, 0]
    : [0, 0, 0]

  // Decide DPR based on mobile & perf setting
  const effectiveDpr = isMobile
    ? Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5)
    : [1, 2]

  return (
    <div className="lab-viewport-container">
      {/* 3D WebGL Canvas Viewport */}
      <Canvas
        shadows={!isMobile || perfMode !== 'eco'}
        dpr={effectiveDpr}
        camera={{
          position: isMobile ? [0, 3.0, 7.6] : [0, 2.5, 6.2],
          fov: isMobile ? 52 : 46,
        }}
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{
          width: '100vw',
          height: '100vh',
          background: '#151d2a',
          touchAction: 'none',
        }}
      >
        {/* Realistic Laboratory Illumination */}
        <ambientLight intensity={0.9} color="#ffffff" />
        <directionalLight
          position={[4, 10, 5]}
          intensity={1.35}
          castShadow={!isMobile}
          shadow-mapSize-width={isMobile ? 1024 : 2048}
          shadow-mapSize-height={isMobile ? 1024 : 2048}
          shadow-bias={-0.0001}
          color="#ffffff"
        />
        <directionalLight position={[-6, 7, 3]} intensity={0.5} color="#e0f2fe" />
        <directionalLight position={[0, 5, -4]} intensity={0.4} color="#f8fafc" />

        {/* --- 3D Scene Objects --- */}
        <LabEnvironment />

        {/* Bunsen Burner on Bench */}
        <BunsenBurner
          position={[-2.1, -1.075, -0.4]}
          isHeating={labState.isHeating}
          onToggle={handleToggleHeat}
        />

        {/* Main Interactive Glass Reaction Beaker & Digital Stirrer/Hotplate */}
        <Beaker
          position={[0, -0.895, 0]}
          volume={labState.volume}
          maxVolume={labState.maxVolume}
          temperature={labState.temperature}
          liquidColor={labState.color}
          isHeating={labState.isHeating}
          isStirring={labState.isStirring}
          isMobile={isMobile}
          onClick={handleToggleStir}
        />

        {/* Glass Stirring Rod in Beaker */}
        <StirringRod
          position={[0, -0.895, 0]}
          isStirring={labState.isStirring}
        />

        {/* Retort Stand with Digital pH/Temperature Probe dipped in beaker */}
        <DigitalProbe
          position={[0.68, -1.075, -0.12]}
          pH={labState.pH}
          temperature={labState.temperature}
        />

        {/* Litmus / Universal pH Paper Test Strip on table */}
        <PHPaperStrip
          ref={phStripRef}
          position={[1.2, -1.04, 0.9]}
          beakerPos={[0, -0.895, 0]}
          currentPH={labState.pH}
        />

        {/* Dropper Pipette hovered above beaker */}
        <PipetteDropper
          position={[0.8, 0.1, 0.6]}
          liquidColor={labState.color}
          isActive={dropperActive}
        />

        {/* Animated Pouring Stream during addition */}
        <AnimatedPourStream
          startPos={pourStart}
          endPos={[0, 0.35, 0]}
          color={labState.color}
          isPouring={!!activePourReagent}
        />

        {/* Chemical Reagent Bottles on the Laboratory Bench */}
        {/* 0.1M HCl (Acid) */}
        <ReagentBottle
          position={[-3.0, -1.05, -1.5]}
          targetPourPos={[0, 0.6, 0]}
          formula="HCl"
          name="Hydrochloric Acid"
          concentration="0.1 M"
          color="#f8fafc"
          isCurrentlyPouring={activePourReagent === 'HCL'}
          onClick={() => handleAddReagent('HCL', 20)}
        />

        {/* 0.1M NaOH (Base) */}
        <ReagentBottle
          position={[-2.2, -1.05, -1.5]}
          targetPourPos={[0, 0.6, 0]}
          formula="NaOH"
          name="Sodium Hydroxide"
          concentration="0.1 M"
          color="#f8fafc"
          isCurrentlyPouring={activePourReagent === 'NAOH'}
          onClick={() => handleAddReagent('NAOH', 20)}
        />

        {/* Phenolphthalein Indicator (Amber bottle) */}
        <ReagentBottle
          position={[-1.4, -1.05, -1.5]}
          targetPourPos={[0, 0.6, 0]}
          formula="C20H14O4"
          name="Phenolphthalein"
          concentration="1% in EtOH"
          color="#f43f5e"
          isAmber={true}
          isCurrentlyPouring={activePourReagent === 'PHENOL'}
          onClick={() => handleTriggerDropper('PHENOL')}
        />

        {/* Universal Indicator */}
        <ReagentBottle
          position={[1.4, -1.05, -1.5]}
          targetPourPos={[0, 0.6, 0]}
          formula="Univ. Ind."
          name="Universal Indicator"
          concentration="Broad Range"
          color="#22c55e"
          isAmber={true}
          isCurrentlyPouring={activePourReagent === 'UNIV_IND'}
          onClick={() => handleAddReagent('UNIV_IND', 10)}
        />

        {/* Copper(II) Sulfate */}
        <ReagentBottle
          position={[2.2, -1.05, -1.5]}
          targetPourPos={[0, 0.6, 0]}
          formula="CuSO4"
          name="Copper(II) Sulfate"
          concentration="0.2 M"
          color="#0284c7"
          isCurrentlyPouring={activePourReagent === 'CUSO4'}
          onClick={() => handleAddReagent('CUSO4', 25)}
        />

        {/* Distilled Water */}
        <ReagentBottle
          position={[3.0, -1.05, -1.5]}
          targetPourPos={[0, 0.6, 0]}
          formula="H2O"
          name="Distilled Water"
          concentration="Pure (pH 7)"
          color="#e0f2fe"
          isCurrentlyPouring={activePourReagent === 'H2O'}
          onClick={() => handleAddReagent('H2O', 30)}
        />

        {/* Test Tube Rack on the left side of the bench */}
        <TestTubeRack
          position={[-3.3, -1.05, -0.6]}
          rotation={[0, 0.2, 0]}
          onSelectTube={(tube) => {
            if (tube.label.includes('Acid')) handleAddReagent('HCL', 20)
            else if (tube.label.includes('Base')) handleAddReagent('NAOH', 20)
            else if (tube.label.includes('Indicator')) handleAddReagent('UNIV_IND', 10)
            else if (tube.label.includes('Salt')) handleAddReagent('CUSO4', 20)
            else handleAddReagent('H2O', 20)
          }}
        />

        {/* Conical Erlenmeyer Flask on the right side of the bench */}
        <ErlenmeyerFlask
          position={[2.6, -1.05, -0.5]}
          liquidColor="#a855f7"
          label="Buffer Solution"
          onClick={() => handleAddReagent('NAOH', 15)}
        />

        {/* Soft Contact Shadows on the Workbench */}
        <ContactShadows
          position={[0, -1.04, 0]}
          opacity={isMobile ? 0.5 : 0.7}
          scale={10}
          blur={isMobile ? 1.0 : 1.8}
          far={3.0}
        />

        {/* Camera Controls & Presets */}
        <CameraRig cameraMode={cameraMode} isMobile={isMobile} />
      </Canvas>

      {/* Modern High-Tech Glassmorphic Laboratory HUD */}
      <div className="lab-hud-overlay">
        <LabHUD
          labState={labState}
          isMobile={isMobile}
          cameraMode={cameraMode}
          onAddReagent={handleAddReagent}
          onToggleHeat={handleToggleHeat}
          onToggleStir={handleToggleStir}
          onTriggerDropper={handleTriggerDropper}
          onDipPHPaper={handleDipPHPaper}
          onReset={handleReset}
          currentExperimentId={currentExpId}
          onSelectExperiment={loadExperiment}
          onSetCameraView={setCameraMode}
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
          perfMode={perfMode}
          onTogglePerfMode={() => setPerfMode((prev) => (prev === 'high' ? 'eco' : 'high'))}
        />
      </div>
    </div>
  )
}
