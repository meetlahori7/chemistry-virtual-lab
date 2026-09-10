// Experiment definitions and guided walkthroughs

export const EXPERIMENTS = [
  {
    id: 'titration',
    title: 'Acid-Base Titration (HCl + NaOH)',
    subtitle: 'Quantitative Neutralization & Phenolphthalein Endpoint',
    description: 'Titrate 0.1M Hydrochloric Acid with 0.1M Sodium Hydroxide using Phenolphthalein. Observe the sharp color transition from colorless to vibrant magenta at pH ~8.2.',
    initialChemicals: {
      volume: 100,
      temperature: 22.0,
      contents: {
        H2O: 100,
        hMoles: 0.005, // 50mL equivalent HCl
        ohMoles: 0.0,
        hasPhenol: true,
        hasUnivInd: false,
        cuMoles: 0.0,
        saltMoles: 0.0,
      },
      pH: 1.3,
      color: 'rgba(56, 189, 248, 0.55)',
      equation: 'HCl (aq) + NaOH (aq) -> NaCl (aq) + H2O (l) + DeltaH',
      reactionNotice: 'Initial acidic solution with Phenolphthalein. Add NaOH dropwise to reach endpoint.',
    },
    steps: [
      '1. Observe the acidic solution (pH ≈ 1.3). It is currently colorless with Phenolphthalein present.',
      '2. Click "Add 0.1M NaOH" to dispense base.',
      '3. As pH crosses 8.2, notice the instantaneous transition to brilliant pink!',
      '4. Observe the slight temperature rise due to exothermic neutralization enthalpy (DeltaH = -57.1 kJ/mol).'
    ]
  },
  {
    id: 'boiling',
    title: 'Thermal Convection & Boiling (CuSO4)',
    subtitle: 'Endothermic Heat Transfer & Phase Change Simulation',
    description: 'Heat a brilliant blue Copper(II) Sulfate solution using the Bunsen burner. Watch procedural convective bubbles form and steam vapor evolve as temperature reaches 100°C.',
    initialChemicals: {
      volume: 120,
      temperature: 22.0,
      contents: {
        H2O: 120,
        hMoles: 0.0,
        ohMoles: 0.0,
        hasPhenol: false,
        hasUnivInd: false,
        cuMoles: 0.02,
        saltMoles: 0.02,
      },
      pH: 4.5,
      color: 'rgba(2, 132, 199, 0.85)',
      equation: 'CuSO4·5H2O (aq) + Heat -> Boiling Solution + H2O (g) ↑',
      reactionNotice: 'Copper(II) Sulfate solution prepared. Toggle Bunsen Burner to begin heating.',
    },
    steps: [
      '1. Click "Toggle Bunsen Burner" to ignite the 3D high-temperature blue roaring flame.',
      '2. Monitor the real-time digital LCD temperature probe climbing from 22°C to 100°C.',
      '3. At 60°C+, observe convective bubbles rising through the glass beaker.',
      '4. At 80°C–100°C, witness vigorous boiling and rising steam vapor.'
    ]
  },
  {
    id: 'rainbow',
    title: 'Universal pH Rainbow Spectrum',
    subtitle: 'Broad-Range Optical Spectrophotometry',
    description: 'Explore the full spectrum of the Universal Indicator. Shift the chemical equilibrium between strong acids (red), weak acids (orange/yellow), neutral (green), bases (blue), and strong bases (violet).',
    initialChemicals: {
      volume: 100,
      temperature: 22.0,
      contents: {
        H2O: 100,
        hMoles: 0.0,
        ohMoles: 0.0,
        hasPhenol: false,
        hasUnivInd: true,
        cuMoles: 0.0,
        saltMoles: 0.0,
      },
      pH: 7.0,
      color: 'rgba(34, 197, 94, 0.85)', // Green for neutral pH 7
      equation: 'HInd <=> H+ + Ind- (Multi-Indicator Equilibrium)',
      reactionNotice: 'Neutral solution with Universal Indicator (Green, pH 7.0).',
    },
    steps: [
      '1. Solution starts at pH 7.0 (Green - Neutral).',
      '2. Click "Add 0.1M HCl" to shift to pH 5 (Yellow), pH 3 (Orange), and pH 1 (Red).',
      '3. Click "Add 0.1M NaOH" to reverse and shift up to pH 9 (Cyan), pH 11 (Blue), and pH 13 (Violet).'
    ]
  },
  {
    id: 'sandbox',
    title: 'Interactive Free Sandbox Laboratory',
    subtitle: 'Open Chemical Simulation & Experimentation',
    description: 'Freely combine acids, bases, indicators, and metal salts. Control heating, stirring, and dilution while tracking real-time ionic concentrations, pH, and thermodynamics.',
    initialChemicals: {
      volume: 100,
      temperature: 22.0,
      contents: {
        H2O: 100,
        hMoles: 0.0,
        ohMoles: 0.0,
        hasPhenol: false,
        hasUnivInd: false,
        cuMoles: 0.0,
        saltMoles: 0.0,
      },
      pH: 7.0,
      color: 'rgba(56, 189, 248, 0.55)',
      equation: 'H2O <=> H+ + OH-',
      reactionNotice: 'Fresh distilled water ready. Select any reagents from the bench or shelf.',
    },
    steps: [
      '1. Click on the 3D reagent bottles or HUD buttons to add chemicals.',
      '2. Toggle the Bunsen Burner to heat the solution.',
      '3. Use the Stir tool to homogenize the mixture.',
      '4. Observe live telemetry in the digital readout panel.'
    ]
  }
]
