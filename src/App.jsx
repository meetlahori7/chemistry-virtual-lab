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

// Camera controller component to handle smooth animated presets
function CameraRig({ cameraMode }) {
  const controlsRef = useRef()

  useEffect(() => {
    if (!controlsRef.current) return
    if (cameraMode === 'focus') {
      controlsRef.current.target.set(0, 0.4, 0)
      controlsRef.current.object.position.set(0, 1.2, 3.4)
    } else {
      controlsRef.current.target.set(0, 0.3, 0)
      controlsRef.current.object.position.set(0, 2.5, 6.2)
    }
    controlsRef.current.update()
  }, [cameraMode])

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0.3, 0]}
      maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going beneath table
      minDistance={2.0}
      maxDistance={9.0}
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
  const phStripRef = useRef()

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
      lastAction: `Loaded experiment: ${exp.title}`,
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
          particleCount: 75,
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
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#0284c7', '#f59e0b'],
        })
      } catch (e) {}
    }
  }, [labState.pH, labState.temperature, currentExpId, celebrated, labState.contents.hasPhenol])

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

  return (
    <div className="lab-viewport-container">
      {/* 3D WebGL Canvas Viewport */}
      <Canvas
        shadows
        camera={{ position: [0, 2.5, 6.2], fov: 46 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100vw', height: '100vh', background: '#090d16' }}
      >
        {/* Laboratory Illumination */}
        <ambientLight intensity={0.65} color="#e2e8f0" />
        <directionalLight
          position={[5, 9, 6]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
          color="#f8fafc"
        />
        <directionalLight position={[-6, 6, 2]} intensity={0.4} color="#38bdf8" />
        <directionalLight position={[0, 4, -4]} intensity={0.3} color="#94a3b8" />

        {/* --- 3D Scene Objects --- */}
        <LabEnvironment />

        {/* Bunsen Burner with Heating Stand */}
        <BunsenBurner
          position={[-1.8, -1.05, -0.4]}
          isHeating={labState.isHeating}
          onToggle={handleToggleHeat}
        />

        {/* Main Interactive Glass Reaction Beaker */}
        <Beaker
          position={[0, -1.05 + (labState.isHeating ? 1.25 : 0), 0]}
          volume={labState.volume}
          maxVolume={labState.maxVolume}
          temperature={labState.temperature}
          liquidColor={labState.color}
          isStirring={labState.isStirring}
        />

        {/* Glass Stirring Rod in Beaker */}
        <StirringRod
          position={[0, -1.05 + (labState.isHeating ? 1.25 : 0), 0]}
          isStirring={labState.isStirring}
        />

        {/* Retort Stand with Digital pH/Temperature Probe dipped in beaker */}
        <DigitalProbe
          position={[0.9, -1.05, -0.2]}
          pH={labState.pH}
          temperature={labState.temperature}
        />

        {/* Litmus / Universal pH Paper Test Strip on table */}
        <PHPaperStrip
          ref={phStripRef}
          position={[1.2, -1.04, 0.9]}
          beakerPos={[0, -1.05 + (labState.isHeating ? 1.25 : 0), 0]}
          currentPH={labState.pH}
        />

        {/* Dropper Pipette hovered above beaker */}
        <PipetteDropper
          position={[0.8, 0.0, 0.6]}
          liquidColor={labState.color}
          isActive={dropperActive}
        />

        {/* Animated Pouring Stream during addition */}
        <AnimatedPourStream
          startPos={pourStart}
          endPos={[0, -0.6 + (labState.isHeating ? 1.25 : 0), 0]}
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
          opacity={0.7}
          scale={10}
          blur={1.8}
          far={3.0}
        />

        {/* Camera Controls & Presets */}
        <CameraRig cameraMode={cameraMode} />
      </Canvas>

      {/* Modern High-Tech Glassmorphic Laboratory HUD */}
      <div className="lab-hud-overlay">
        <LabHUD

        labState={labState}
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
        />
      </div>
    </div>
  )
}
