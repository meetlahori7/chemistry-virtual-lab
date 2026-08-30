import React, { useState } from 'react'
import { EXPERIMENTS } from '../experiments/experimentList'
import {
  Flame,
  RotateCcw,
  Sparkles,
  Droplet,
  Thermometer,
  Activity,
  Beaker as BeakerIcon,
  HelpCircle,
  Play,
  RotateCw,
  Camera,
  Layers
} from 'lucide-react'

export default function LabHUD({
  labState,
  onAddReagent,
  onToggleHeat,
  onToggleStir,
  onTriggerDropper,
  onReset,
  currentExperimentId,
  onSelectExperiment,
  onSetCameraView,
}) {
  const [showGuide, setShowGuide] = useState(true)
  const currentExp = EXPERIMENTS.find((e) => e.id === currentExperimentId) || EXPERIMENTS[0]

  // Dynamic pH badge color
  const getPHColor = (pH) => {
    if (pH <= 3) return '#ef4444' // Red
    if (pH <= 6) return '#eab308' // Yellow
    if (pH <= 8) return '#22c55e' // Green
    if (pH <= 11) return '#06b6d4' // Cyan
    return '#a855f7' // Purple
  }

  // Dynamic Temperature badge color
  const getTempColor = (temp) => {
    if (temp < 40) return '#38bdf8'
    if (temp < 75) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="lab-hud-overlay">
      {/* Top Header Bar */}
      <header className="lab-topbar">
        <div className="lab-branding">
          <div className="lab-logo-icon">
            <BeakerIcon size={22} color="#38bdf8" />
          </div>
          <div>
            <h1 className="lab-title">3D VIRTUAL CHEMISTRY LABORATORY</h1>
            <p className="lab-subtitle">Interactive WebGL & React Three Fiber Simulation</p>
          </div>
        </div>

        {/* Experiment Selector Tabs */}
        <div className="lab-exp-tabs">
          {EXPERIMENTS.map((exp) => (
            <button
              key={exp.id}
              className={`exp-tab-btn ${currentExperimentId === exp.id ? 'active' : ''}`}
              onClick={() => onSelectExperiment(exp.id)}
            >
              {exp.title.split('(')[0].trim()}
            </button>
          ))}
        </div>

        {/* Camera Views & Help Toggle */}
        <div className="lab-header-actions">
          <div className="cam-btn-group">
            <button
              className="hud-icon-btn"
              title="Overview Camera"
              onClick={() => onSetCameraView('overview')}
            >
              <Camera size={16} /> Overview
            </button>
            <button
              className="hud-icon-btn"
              title="Close-Up Reaction Focus"
              onClick={() => onSetCameraView('focus')}
            >
              <Layers size={16} /> Focus
            </button>
          </div>
          <button
            className={`hud-icon-btn ${showGuide ? 'active' : ''}`}
            onClick={() => setShowGuide(!showGuide)}
            title="Toggle Experiment Guide"
          >
            <HelpCircle size={16} /> Guide
          </button>
        </div>
      </header>

      {/* Main Working HUD Body */}
      <div className="lab-hud-body">
        {/* Left Side: Real-Time Digital Telemetry & Reaction Monitor */}
        <aside className="telemetry-panel glassmorphic-card">
          <div className="card-header">
            <Activity size={18} className="text-cyan" />
            <h2>CHEMICAL TELEMETRY</h2>
          </div>

          <div className="telemetry-grid">
            {/* pH Meter */}
            <div className="telemetry-item">
              <span className="telemetry-label">pH Level</span>
              <div className="telemetry-value-row">
                <span
                  className="telemetry-number"
                  style={{ color: getPHColor(labState.pH) }}
                >
                  {Number(labState.pH).toFixed(2)}
                </span>
                <span
                  className="telemetry-badge"
                  style={{ backgroundColor: `${getPHColor(labState.pH)}22`, color: getPHColor(labState.pH) }}
                >
                  {labState.pH < 6.8 ? 'Acidic' : labState.pH > 7.2 ? 'Alkaline' : 'Neutral'}
                </span>
              </div>
              {/* pH Visual Gradient Bar */}
              <div className="ph-bar-container">
                <div
                  className="ph-indicator-needle"
                  style={{ left: `${(Math.min(14, Math.max(0, labState.pH)) / 14) * 100}%` }}
                />
              </div>
            </div>

            {/* Temperature Meter */}
            <div className="telemetry-item">
              <span className="telemetry-label">Temperature</span>
              <div className="telemetry-value-row">
                <span
                  className="telemetry-number"
                  style={{ color: getTempColor(labState.temperature) }}
                >
                  {Number(labState.temperature).toFixed(1)}°C
                </span>
                <span
                  className="telemetry-badge"
                  style={{ backgroundColor: `${getTempColor(labState.temperature)}22`, color: getTempColor(labState.temperature) }}
                >
                  {labState.temperature > 85 ? 'Boiling' : labState.isHeating ? 'Heating' : 'Ambient'}
                </span>
              </div>
              {/* Temp progress bar */}
              <div className="temp-bar-bg">
                <div
                  className="temp-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(10, labState.temperature))}%`,
                    backgroundColor: getTempColor(labState.temperature),
                  }}
                />
              </div>
            </div>

            {/* Volume in Beaker */}
            <div className="telemetry-item">
              <span className="telemetry-label">Solution Volume</span>
              <div className="telemetry-value-row">
                <span className="telemetry-number text-sky">
                  {Math.round(labState.volume)} mL
                </span>
                <span className="telemetry-badge bg-sky">
                  Max 300 mL
                </span>
              </div>
            </div>
          </div>

          {/* Chemical Reaction & Equation Display */}
          <div className="reaction-display-box">
            <span className="reaction-title">ACTIVE REACTION EQUATION</span>
            <code className="reaction-equation">{labState.equation}</code>
            <p className="reaction-notice">{labState.reactionNotice}</p>
          </div>

          {/* Last Performed Action Notification */}
          <div className="last-action-box">
            <span className="action-tag">LAST ACTION:</span>
            <span className="action-desc">{labState.lastAction}</span>
          </div>
        </aside>

        {/* Right Side: Step-by-Step Interactive Laboratory Guide */}
        {showGuide && (
          <aside className="guide-panel glassmorphic-card">
            <div className="card-header">
              <Sparkles size={18} className="text-amber" />
              <h2>{currentExp.title}</h2>
            </div>
            <p className="exp-description">{currentExp.description}</p>

            <div className="exp-steps-list">
              <h3>LABORATORY PROTOCOL:</h3>
              {currentExp.steps.map((step, idx) => (
                <div key={idx} className="step-item">
                  <div className="step-bullet">{idx + 1}</div>
                  <p className="step-text">{step.replace(/^\d+\.\s*/, '')}</p>
                </div>
              ))}
            </div>

            <div className="guide-tip">
              💡 <strong>Tip:</strong> You can also click and drag with your mouse to orbit the 3D scene, scroll to zoom, and right-click to pan!
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Floating Interactive Chemical Action Bench */}
      <footer className="lab-action-dock glassmorphic-card">
        <div className="dock-section reagents-section">
          <span className="dock-section-title">ADD REAGENTS</span>
          <div className="dock-btn-row">
            <button
              className="lab-btn reagent-btn acid-btn"
              onClick={() => onAddReagent('HCL', 20)}
            >
              <Droplet size={15} /> +20mL 0.1M HCl
            </button>

            <button
              className="lab-btn reagent-btn base-btn"
              onClick={() => onAddReagent('NAOH', 20)}
            >
              <Droplet size={15} /> +20mL 0.1M NaOH
            </button>

            <button
              className="lab-btn reagent-btn phenol-btn"
              onClick={() => onTriggerDropper('PHENOL')}
            >
              <Droplet size={15} /> Phenolphthalein
            </button>

            <button
              className="lab-btn reagent-btn univ-btn"
              onClick={() => onAddReagent('UNIV_IND', 10)}
            >
              <Sparkles size={15} /> Universal Indicator
            </button>

            <button
              className="lab-btn reagent-btn cuso4-btn"
              onClick={() => onAddReagent('CUSO4', 25)}
            >
              <Droplet size={15} /> +25mL CuSO₄
            </button>

            <button
              className="lab-btn reagent-btn water-btn"
              onClick={() => onAddReagent('H2O', 30)}
            >
              <Droplet size={15} /> +30mL H₂O
            </button>
          </div>
        </div>

        {/* Thermal & Physical Controls */}
        <div className="dock-section apparatus-section">
          <span className="dock-section-title">APPARATUS CONTROLS</span>
          <div className="dock-btn-row">
            <button
              className={`lab-btn apparatus-btn ${labState.isHeating ? 'burner-active' : ''}`}
              onClick={onToggleHeat}
            >
              <Flame size={16} />
              {labState.isHeating ? 'Extinguish Burner' : 'Ignite Bunsen Burner'}
            </button>

            <button
              className={`lab-btn apparatus-btn ${labState.isStirring ? 'stir-active' : ''}`}
              onClick={onToggleStir}
            >
              <RotateCw size={16} className={labState.isStirring ? 'animate-spin' : ''} />
              {labState.isStirring ? 'Stop Magnetic Stirrer' : 'Magnetic Stirrer'}
            </button>

            <button
              className="lab-btn reset-btn"
              onClick={onReset}
              title="Reset Beaker & Chemicals"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
