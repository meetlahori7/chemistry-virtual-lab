import React, { useState } from 'react'
import { X, Atom, BookOpen, ChevronRight, Zap } from 'lucide-react'

export default function IonVisualizerModal({
  isOpen,
  onClose,
  labState,
}) {
  const [activeTab, setActiveTab] = useState('ions')

  if (!isOpen) return null

  const { contents, pH, temperature } = labState
  const hasH = contents.hMoles > contents.ohMoles
  const hasOH = contents.ohMoles > contents.hMoles

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glassmorphic-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Atom size={22} className="text-cyan" />
            <h2 className="modal-title">MICROSCOPIC ION VISUALIZER & THEORY</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'ions' ? 'active' : ''}`}
            onClick={() => setActiveTab('ions')}
          >
            <Atom size={14} /> Active Ions in Solution
          </button>
          <button
            className={`modal-tab ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            <BookOpen size={14} /> Chemical Concepts Explained
          </button>
        </div>

        {/* Modal Content */}
        {activeTab === 'ions' ? (
          <div className="modal-body">
            <p className="section-intro">
              Here is what is happening at the microscopic subatomic level in your beaker:
            </p>

            {/* Particle Chamber Canvas Simulation (CSS animated floating ions) */}
            <div className="ion-chamber">
              {/* Water background matrix */}
              <div className="ion-water-label">Liquid Medium: Aqueous Solution (H2O)</div>

              {/* Hydrogen / Hydronium Ions */}
              {hasH && (
                <div className="ion-group">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={`h-${i}`}
                      className="ion-particle ion-h"
                      style={{
                        top: `${20 + (i * 13) % 65}%`,
                        left: `${15 + (i * 17) % 70}%`,
                        animationDelay: `${i * 0.4}s`,
                      }}
                    >
                      H+
                    </div>
                  ))}
                </div>
              )}

              {/* Hydroxide Ions */}
              {hasOH && (
                <div className="ion-group">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={`oh-${i}`}
                      className="ion-particle ion-oh"
                      style={{
                        top: `${25 + (i * 15) % 60}%`,
                        left: `${20 + (i * 19) % 65}%`,
                        animationDelay: `${i * 0.35}s`,
                      }}
                    >
                      OH-
                    </div>
                  ))}
                </div>
              )}

              {/* Sodium & Chloride Spectator Ions */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={`na-${i}`}
                  className="ion-particle ion-na"
                  style={{
                    top: `${15 + (i * 18) % 70}%`,
                    left: `${45 + (i * 14) % 45}%`,
                    animationDelay: `${i * 0.6}s`,
                  }}
                >
                  Na+
                </div>
              ))}

              {[...Array(4)].map((_, i) => (
                <div
                  key={`cl-${i}`}
                  className="ion-particle ion-cl"
                  style={{
                    top: `${40 + (i * 16) % 50}%`,
                    left: `${10 + (i * 22) % 60}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  Cl-
                </div>
              ))}

              {/* Copper Ions if present */}
              {contents.cuMoles > 0 &&
                [...Array(5)].map((_, i) => (
                  <div
                    key={`cu-${i}`}
                    className="ion-particle ion-cu"
                    style={{
                      top: `${30 + (i * 14) % 55}%`,
                      left: `${35 + (i * 15) % 55}%`,
                      animationDelay: `${i * 0.45}s`,
                    }}
                  >
                    Cu2+
                  </div>
                ))}
            </div>

            {/* Ionic Species Inventory Grid */}
            <div className="species-grid">
              <div className="species-card">
                <span className="species-name text-red">Hydronium [H+]</span>
                <span className="species-val">{hasH ? 'Excess (Acidic)' : '1.0 × 10^-7 M'}</span>
              </div>
              <div className="species-card">
                <span className="species-name text-cyan">Hydroxide [OH-]</span>
                <span className="species-val">{hasOH ? 'Excess (Basic)' : '1.0 × 10^-7 M'}</span>
              </div>
              <div className="species-card">
                <span className="species-name text-amber">Temperature</span>
                <span className="species-val">{Number(temperature).toFixed(1)} °C</span>
              </div>
              <div className="species-card">
                <span className="species-name text-sky">Calculated pH</span>
                <span className="species-val">{Number(pH).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="modal-body modal-theory-list">
            <div className="theory-item">
              <div className="theory-header">
                <Zap size={16} className="text-amber" />
                <h3>What is Neutralization?</h3>
              </div>
              <p>
                When an acid ($HCl$) and a base ($NaOH$) are combined, the hydrogen ions ($H^+$) and
                hydroxide ions ($OH^-$) immediately react to form neutral water ($H_2O$):
              </p>
              <code>H+(aq) + OH-(aq) → H2O(l) + Heat (ΔH = -57.1 kJ/mol)</code>
            </div>

            <div className="theory-item">
              <div className="theory-header">
                <Zap size={16} className="text-cyan" />
                <h3>How does Phenolphthalein work?</h3>
              </div>
              <p>
                Phenolphthalein is a weak acid indicator. In acidic conditions ($\text{pH} &lt; 8.2$),
                it remains in its protonated colorless form. Above $\text{pH } 8.2$, it loses protons,
                altering its conjugated double bond system to absorb green wavelengths and transmit
                intense <strong>magenta pink light</strong>.
              </p>
            </div>

            <div className="theory-item">
              <div className="theory-header">
                <Zap size={16} className="text-emerald" />
                <h3>The Universal pH Scale (1 to 14)</h3>
              </div>
              <p>
                pH measures the molar concentration of hydrogen ions: $\text{pH} = -\log_{10}[H^+]$.
                Each step on the pH scale represents a <strong>10-fold</strong> difference in acidity!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
