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
  RotateCw,
  Camera,
  Layers,
  Atom,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sliders,
  TestTube,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Zap,
  Gauge,
  FlaskConical,
  FileText,
  Eye,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import IonVisualizerModal from './IonVisualizerModal'

export default function LabHUD({
  labState,
  isMobile = false,
  cameraMode = 'overview',
  onAddReagent,
  onToggleHeat,
  onToggleStir,
  onTriggerDropper,
  onDipPHPaper,
  onReset,
  currentExperimentId,
  onSelectExperiment,
  onSetCameraView,
  soundMuted,
  onToggleSound,
  perfMode = 'auto',
  onTogglePerfMode,
}) {
  // Mobile drawer state: 'none' (3D view) | 'reagents' | 'telemetry' | 'protocol'
  const [mobileDrawer, setMobileDrawer] = useState('none')
  
  // Desktop sidebar collapse states
  const [telemetryCollapsed, setTelemetryCollapsed] = useState(false)
  const [guideCollapsed, setGuideCollapsed] = useState(false)
  
  const [showIonModal, setShowIonModal] = useState(false)
  const [reagentAmount, setReagentAmount] = useState(20) // mL selector
  const [completedSteps, setCompletedSteps] = useState({})
  const [showCamMenu, setShowCamMenu] = useState(false)

  const currentExp = EXPERIMENTS.find((e) => e.id === currentExperimentId) || EXPERIMENTS[0]

  // Dynamic pH badge color calculation
  const getPHColor = (pH) => {
    if (pH <= 3) return '#ef4444' // Red (Strong Acid)
    if (pH <= 6) return '#f59e0b' // Yellow-Orange (Weak Acid)
    if (pH <= 8) return '#10b981' // Green (Neutral)
    if (pH <= 11) return '#06b6d4' // Cyan / Blue (Weak Base)
    return '#a855f7' // Purple / Violet (Strong Base)
  }

  // Dynamic Temperature badge color
  const getTempColor = (temp) => {
    if (temp < 40) return '#38bdf8'
    if (temp < 75) return '#f59e0b'
    return '#ef4444'
  }

  // Toggle step completion manually
  const toggleStep = (idx) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [`${currentExperimentId}-${idx}`]: !prev[`${currentExperimentId}-${idx}`],
    }))
  }

  const cameraPresets = [
    { id: 'overview', label: 'Overview', icon: Camera },
    { id: 'focus', label: 'Beaker Focus', icon: Layers },
    { id: 'shelf', label: 'Shelf View', icon: Eye },
    { id: 'topdown', label: 'Top-Down', icon: Maximize2 },
  ]

  // Renders the reagent buttons group
  const renderReagentButtons = (isMobileLayout = false) => (
    <div className={`reagent-btn-grid ${isMobileLayout ? 'mobile-reagents-grid' : ''}`}>
      <button
        type="button"
        className="lab-btn reagent-btn acid-btn"
        onClick={() => onAddReagent('HCL', reagentAmount)}
      >
        <span className="reagent-formula">HCl</span>
        <span className="reagent-label">+{reagentAmount}mL 0.1M Acid</span>
      </button>

      <button
        type="button"
        className="lab-btn reagent-btn base-btn"
        onClick={() => onAddReagent('NAOH', reagentAmount)}
      >
        <span className="reagent-formula">NaOH</span>
        <span className="reagent-label">+{reagentAmount}mL 0.1M Base</span>
      </button>

      <button
        type="button"
        className="lab-btn reagent-btn phenol-btn"
        onClick={() => onTriggerDropper('PHENOL')}
      >
        <Droplet size={15} className="reagent-icon-accent" />
        <span className="reagent-label">Phenolphthalein Drops</span>
      </button>

      <button
        type="button"
        className="lab-btn reagent-btn univ-btn"
        onClick={() => onAddReagent('UNIV_IND', 10)}
      >
        <Sparkles size={15} className="reagent-icon-accent" />
        <span className="reagent-label">Universal Indicator</span>
      </button>

      <button
        type="button"
        className="lab-btn reagent-btn cuso4-btn"
        onClick={() => onAddReagent('CUSO4', reagentAmount)}
      >
        <span className="reagent-formula">CuSO4</span>
        <span className="reagent-label">+{reagentAmount}mL Salt</span>
      </button>

      <button
        type="button"
        className="lab-btn reagent-btn water-btn"
        onClick={() => onAddReagent('H2O', reagentAmount + 10)}
      >
        <Droplet size={15} className="reagent-icon-accent" />
        <span className="reagent-label">+{reagentAmount + 10}mL H2O</span>
      </button>
    </div>
  )

  // Renders the physical apparatus controls
  const renderApparatusControls = (isMobileLayout = false) => (
    <div className={`apparatus-btn-grid ${isMobileLayout ? 'mobile-apparatus-grid' : ''}`}>
      <button
        type="button"
        className={`lab-btn apparatus-btn ${labState.isHeating ? 'burner-active' : ''}`}
        onClick={onToggleHeat}
      >
        <Flame size={17} className={labState.isHeating ? 'flame-animated' : ''} />
        <span>{labState.isHeating ? 'Turn Off Burner' : 'Ignite Burner'}</span>
      </button>

      <button
        type="button"
        className={`lab-btn apparatus-btn ${labState.isStirring ? 'stir-active' : ''}`}
        onClick={onToggleStir}
      >
        <RotateCw size={17} className={labState.isStirring ? 'animate-spin' : ''} />
        <span>{labState.isStirring ? 'Stop Stirring' : 'Stir Solution'}</span>
      </button>

      <button
        type="button"
        className="lab-btn ph-strip-btn"
        onClick={onDipPHPaper}
      >
        <TestTestStripIcon />
        <span>Dip pH Strip</span>
      </button>

      <button
        type="button"
        className="lab-btn reset-btn"
        onClick={onReset}
      >
        <RotateCcw size={16} />
        <span>Reset Beaker</span>
      </button>
    </div>
  )

  // Helper icon for pH paper
  function TestTestStripIcon() {
    return (
      <div className="ph-strip-icon-indicator" style={{ backgroundColor: getPHColor(labState.pH) }} />
    )
  }

  // Renders Telemetry content (used in desktop sidebar & mobile drawer)
  const renderTelemetryContent = () => (
    <div className="telemetry-content-wrapper">
      <div className="telemetry-grid">
        {/* pH Meter Card */}
        <div className="telemetry-card">
          <div className="telemetry-card-top">
            <span className="telemetry-title">pH Level</span>
            <span
              className="telemetry-badge"
              style={{
                backgroundColor: `${getPHColor(labState.pH)}24`,
                color: getPHColor(labState.pH),
                border: `1px solid ${getPHColor(labState.pH)}44`,
              }}
            >
              {labState.pH < 6.8 ? 'Acidic' : labState.pH > 7.2 ? 'Alkaline' : 'Neutral'}
            </span>
          </div>

          <div className="telemetry-value-display">
            <span className="telemetry-number" style={{ color: getPHColor(labState.pH) }}>
              {Number(labState.pH).toFixed(2)}
            </span>
            <span className="telemetry-unit">pH</span>
          </div>

          {/* pH Visual Gradient Bar */}
          <div className="ph-bar-container">
            <div
              className="ph-indicator-needle"
              style={{
                left: `${(Math.min(14, Math.max(0, labState.pH)) / 14) * 100}%`,
              }}
            />
          </div>
          <div className="ph-scale-labels">
            <span>0</span>
            <span>7</span>
            <span>14</span>
          </div>
        </div>

        {/* Temperature Meter Card */}
        <div className="telemetry-card">
          <div className="telemetry-card-top">
            <span className="telemetry-title">Temperature</span>
            <span
              className="telemetry-badge"
              style={{
                backgroundColor: `${getTempColor(labState.temperature)}24`,
                color: getTempColor(labState.temperature),
                border: `1px solid ${getTempColor(labState.temperature)}44`,
              }}
            >
              {labState.temperature >= 95
                ? '🔥 Boiling'
                : labState.isHeating
                ? 'Heating'
                : 'Ambient'}
            </span>
          </div>

          <div className="telemetry-value-display">
            <span className="telemetry-number" style={{ color: getTempColor(labState.temperature) }}>
              {Number(labState.temperature).toFixed(1)}
            </span>
            <span className="telemetry-unit">°C</span>
          </div>

          {/* Temperature Bar */}
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
        <div className="telemetry-card">
          <div className="telemetry-card-top">
            <span className="telemetry-title">Solution Volume</span>
            <span className="telemetry-badge volume-badge">
              Cap: {labState.maxVolume} mL
            </span>
          </div>

          <div className="telemetry-value-display">
            <span className="telemetry-number text-sky">
              {Math.round(labState.volume)}
            </span>
            <span className="telemetry-unit">mL</span>
          </div>

          <div className="volume-bar-bg">
            <div
              className="volume-bar-fill"
              style={{
                width: `${Math.min(100, (labState.volume / labState.maxVolume) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Active Chemical Equation */}
      <div className="reaction-display-box">
        <div className="reaction-header">
          <Zap size={14} className="text-sky" />
          <span className="reaction-title">ACTIVE REACTION EQUATION</span>
        </div>
        <code className="reaction-equation">{labState.equation}</code>
        <p className="reaction-notice">{labState.reactionNotice}</p>
      </div>

      {/* Last Performed Action */}
      <div className="last-action-box">
        <span className="action-tag">EVENT:</span>
        <span className="action-desc">{labState.lastAction}</span>
      </div>
    </div>
  )

  // Renders Guide & Protocol content (used in desktop sidebar & mobile drawer)
  const renderProtocolContent = () => (
    <div className="protocol-content-wrapper">
      <div className="protocol-header-info">
        <h3 className="exp-active-title">{currentExp.title}</h3>
        <p className="exp-description">{currentExp.description}</p>
      </div>

      <div className="exp-steps-list">
        <h4 className="protocol-section-title">LABORATORY PROTOCOL:</h4>
        {currentExp.steps.map((step, idx) => {
          const isDone = !!completedSteps[`${currentExperimentId}-${idx}`]
          return (
            <div
              key={idx}
              className={`step-item-interactive ${isDone ? 'step-completed' : ''}`}
              onClick={() => toggleStep(idx)}
              role="button"
              tabIndex={0}
            >
              <div className="step-checkbox-indicator">
                {isDone ? (
                  <CheckCircle2 size={18} className="text-emerald" />
                ) : (
                  <div className="step-bullet">{idx + 1}</div>
                )}
              </div>
              <p className="step-text">{step.replace(/^\d+\.\s*/, '')}</p>
            </div>
          )
        })}
      </div>

      <div className="guide-tip">
        <span className="guide-tip-icon">💡</span>
        <div>
          <strong>Lab Tip:</strong> Tap or click directly on 3D bottles and apparatus on the bench to pour and interact!
        </div>
      </div>
    </div>
  )

  return (
    <div className="lab-hud-root">
      {/* --- TOP HEADER NAVIGATION BAR --- */}
      <header className="lab-topbar">
        {/* Left: Brand Identity */}
        <div className="lab-branding">
          <div className="lab-logo-icon">
            <BeakerIcon size={20} color="#38bdf8" />
          </div>
          <div className="lab-brand-text">
            <h1 className="lab-title">CHEMLAB 3D</h1>
            <span className="lab-badge-live">VIRTUAL LAB</span>
          </div>
        </div>

        {/* Center: Experiment Selector (Dropdown on mobile, Tabs on desktop) */}
        {isMobile ? (
          <div className="mobile-exp-select-wrapper">
            <select
              className="mobile-exp-dropdown"
              value={currentExperimentId}
              onChange={(e) => {
                setCompletedSteps({})
                onSelectExperiment(e.target.value)
              }}
            >
              {EXPERIMENTS.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.title.split('(')[0].trim()}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="dropdown-arrow-icon" />
          </div>
        ) : (
          <div className="lab-exp-tabs">
            {EXPERIMENTS.map((exp) => (
              <button
                key={exp.id}
                type="button"
                className={`exp-tab-btn ${currentExperimentId === exp.id ? 'active' : ''}`}
                onClick={() => {
                  setCompletedSteps({})
                  onSelectExperiment(exp.id)
                }}
              >
                {exp.title.split('(')[0].trim()}
              </button>
            ))}
          </div>
        )}

        {/* Right Header Action Buttons */}
        <div className="lab-header-actions">
          {/* Microscopic Ion Visualizer */}
          <button
            type="button"
            className="hud-icon-btn ion-btn-highlight"
            onClick={() => setShowIonModal(true)}
            title="Inspect Molecular Ions"
          >
            <Atom size={16} className="text-cyan animate-pulse" />
            <span className="btn-label-desktop">Ions</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            className={`hud-icon-btn ${soundMuted ? 'muted' : ''}`}
            onClick={onToggleSound}
            title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-sky" />}
          </button>

          {/* Camera View Switcher */}
          <div className="cam-dropdown-container">
            <button
              type="button"
              className="hud-icon-btn cam-picker-btn"
              onClick={() => setShowCamMenu(!showCamMenu)}
              title="Change Camera View"
            >
              <Camera size={15} />
              <span className="btn-label-desktop">View</span>
              <ChevronDown size={12} />
            </button>

            {showCamMenu && (
              <div className="cam-menu-dropdown glassmorphic-card">
                {cameraPresets.map((preset) => {
                  const Icon = preset.icon
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`cam-menu-item ${cameraMode === preset.id ? 'active' : ''}`}
                      onClick={() => {
                        onSetCameraView(preset.id)
                        setShowCamMenu(false)
                      }}
                    >
                      <Icon size={14} />
                      <span>{preset.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- MOBILE TOP MINI-TELEMETRY PILL BAR --- */}
      {isMobile && (
        <div
          className="mobile-mini-telemetry-bar glassmorphic-card"
          onClick={() => setMobileDrawer('telemetry')}
          role="button"
          tabIndex={0}
        >
          <div className="mini-pill" style={{ borderColor: getPHColor(labState.pH) }}>
            <span className="mini-pill-label">pH</span>
            <span className="mini-pill-val" style={{ color: getPHColor(labState.pH) }}>
              {Number(labState.pH).toFixed(2)}
            </span>
          </div>

          <div className="mini-pill" style={{ borderColor: getTempColor(labState.temperature) }}>
            <Thermometer size={12} style={{ color: getTempColor(labState.temperature) }} />
            <span className="mini-pill-val" style={{ color: getTempColor(labState.temperature) }}>
              {Number(labState.temperature).toFixed(0)}°C
            </span>
          </div>

          <div className="mini-pill">
            <span className="mini-pill-label">Vol</span>
            <span className="mini-pill-val text-sky">
              {Math.round(labState.volume)}mL
            </span>
          </div>

          <div className="mini-telemetry-expand-hint">
            <Gauge size={13} className="text-slate-400" />
          </div>
        </div>
      )}

      {/* --- DESKTOP FLOATING SIDEBARS & DOCK (Hidden on mobile) --- */}
      {!isMobile && (
        <div className="desktop-hud-body">
          {/* Left: Telemetry Panel */}
          <aside
            className={`telemetry-panel glassmorphic-card ${telemetryCollapsed ? 'collapsed' : ''}`}
          >
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Activity size={17} className="text-cyan" />
                <h2>CHEMICAL TELEMETRY</h2>
              </div>
              <button
                type="button"
                className="panel-collapse-btn"
                onClick={() => setTelemetryCollapsed(!telemetryCollapsed)}
                title={telemetryCollapsed ? 'Expand Telemetry' : 'Collapse Telemetry'}
              >
                {telemetryCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            {!telemetryCollapsed && renderTelemetryContent()}
          </aside>

          {/* Right: Guide & Protocol Panel */}
          <aside
            className={`guide-panel glassmorphic-card ${guideCollapsed ? 'collapsed' : ''}`}
          >
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-amber" />
                <h2>EXPERIMENT GUIDE</h2>
              </div>
              <button
                type="button"
                className="panel-collapse-btn"
                onClick={() => setGuideCollapsed(!guideCollapsed)}
                title={guideCollapsed ? 'Expand Guide' : 'Collapse Guide'}
              >
                {guideCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>

            {!guideCollapsed && renderProtocolContent()}
          </aside>

          {/* Bottom Interactive Chemical Action Dock */}
          <footer className="lab-action-dock glassmorphic-card">
            {/* Reagents Section */}
            <div className="dock-section reagents-section">
              <div className="dock-section-header">
                <span className="dock-section-title">REAGENTS BENCH</span>
                {/* Dosage Selector */}
                <div className="dosage-selector">
                  <Sliders size={12} className="text-slate-400" />
                  <span className="dosage-label">Dose:</span>
                  {[10, 20, 30].map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      className={`dosage-pill ${reagentAmount === vol ? 'active' : ''}`}
                      onClick={() => setReagentAmount(vol)}
                    >
                      {vol}mL
                    </button>
                  ))}
                </div>
              </div>
              {renderReagentButtons(false)}
            </div>

            {/* Apparatus & Thermal Section */}
            <div className="dock-section apparatus-section">
              <div className="dock-section-header">
                <span className="dock-section-title">APPARATUS CONTROLS</span>
              </div>
              {renderApparatusControls(false)}
            </div>
          </footer>
        </div>
      )}

      {/* --- MOBILE FLOATING QUICK ACTIONS IN 3D SCENE (Only when drawers are closed) --- */}
      {isMobile && mobileDrawer === 'none' && (
        <div className="mobile-floating-quick-actions">
          {/* Quick Heat Toggle */}
          <button
            type="button"
            className={`quick-action-fab ${labState.isHeating ? 'active-flame' : ''}`}
            onClick={onToggleHeat}
            title="Toggle Burner"
          >
            <Flame size={20} />
          </button>

          {/* Quick Stir Toggle */}
          <button
            type="button"
            className={`quick-action-fab ${labState.isStirring ? 'active-stir' : ''}`}
            onClick={onToggleStir}
            title="Toggle Stirring"
          >
            <RotateCw size={19} className={labState.isStirring ? 'animate-spin' : ''} />
          </button>

          {/* Quick Dip pH Strip */}
          <button
            type="button"
            className="quick-action-fab ph-fab"
            onClick={onDipPHPaper}
            title="Dip pH Strip"
          >
            <div className="ph-fab-indicator" style={{ backgroundColor: getPHColor(labState.pH) }} />
          </button>
        </div>
      )}

      {/* --- MOBILE SLIDE-UP BOTTOM SHEETS --- */}
      {isMobile && mobileDrawer !== 'none' && (
        <div className="mobile-bottom-sheet-backdrop" onClick={() => setMobileDrawer('none')}>
          <div
            className="mobile-bottom-sheet glassmorphic-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle and Header */}
            <div className="sheet-handle-bar" />
            <div className="sheet-header">
              <div className="sheet-title-row">
                {mobileDrawer === 'reagents' && (
                  <div className="flex items-center gap-2">
                    <FlaskConical size={18} className="text-sky" />
                    <h3 className="sheet-title">Chemical Reagents & Tools</h3>
                  </div>
                )}
                {mobileDrawer === 'telemetry' && (
                  <div className="flex items-center gap-2">
                    <Gauge size={18} className="text-cyan" />
                    <h3 className="sheet-title">Live Telemetry & Sensors</h3>
                  </div>
                )}
                {mobileDrawer === 'protocol' && (
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-amber" />
                    <h3 className="sheet-title">Protocol Checklist</h3>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setMobileDrawer('none')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sheet Scrollable Content */}
            <div className="sheet-scroll-body">
              {mobileDrawer === 'reagents' && (
                <div className="sheet-reagents-container">
                  {/* Dosage Selector */}
                  <div className="mobile-dosage-row">
                    <span className="dosage-title">Dispense Dose:</span>
                    <div className="mobile-dosage-pills">
                      {[10, 20, 30].map((vol) => (
                        <button
                          key={vol}
                          type="button"
                          className={`dosage-pill ${reagentAmount === vol ? 'active' : ''}`}
                          onClick={() => setReagentAmount(vol)}
                        >
                          {vol}mL
                        </button>
                      ))}
                    </div>
                  </div>

                  <h4 className="sheet-section-heading">Chemical Solutions:</h4>
                  {renderReagentButtons(true)}

                  <h4 className="sheet-section-heading mt-4">Lab Apparatus:</h4>
                  {renderApparatusControls(true)}
                </div>
              )}

              {mobileDrawer === 'telemetry' && renderTelemetryContent()}

              {mobileDrawer === 'protocol' && renderProtocolContent()}
            </div>
          </div>
        </div>
      )}

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      {isMobile && (
        <nav className="mobile-bottom-nav glassmorphic-card">
          <button
            type="button"
            className={`nav-tab-btn ${mobileDrawer === 'none' ? 'active' : ''}`}
            onClick={() => setMobileDrawer('none')}
          >
            <Eye size={18} />
            <span>3D Scene</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${mobileDrawer === 'reagents' ? 'active' : ''}`}
            onClick={() => setMobileDrawer(mobileDrawer === 'reagents' ? 'none' : 'reagents')}
          >
            <FlaskConical size={18} />
            <span>Chemicals</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${mobileDrawer === 'telemetry' ? 'active' : ''}`}
            onClick={() => setMobileDrawer(mobileDrawer === 'telemetry' ? 'none' : 'telemetry')}
          >
            <Gauge size={18} />
            <span>Telemetry</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${mobileDrawer === 'protocol' ? 'active' : ''}`}
            onClick={() => setMobileDrawer(mobileDrawer === 'protocol' ? 'none' : 'protocol')}
          >
            <FileText size={18} />
            <span>Protocol</span>
          </button>

          <button
            type="button"
            className="nav-tab-btn ion-tab-btn"
            onClick={() => setShowIonModal(true)}
          >
            <Atom size={18} className="text-cyan" />
            <span>Ions</span>
          </button>
        </nav>
      )}

      {/* Microscopic Ion Visualizer Modal */}
      <IonVisualizerModal
        isOpen={showIonModal}
        onClose={() => setShowIonModal(false)}
        labState={labState}
      />
    </div>
  )
}
