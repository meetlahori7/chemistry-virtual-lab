// Chemical Simulation Engine & State Machine
// Handles pH calculation, thermal dynamics, chemical reactions, and optical color mixing.

export const CHEMICALS = {
  H2O: { id: 'H2O', name: 'Distilled Water', formula: 'H2O', color: '#e0f2fe', pH: 7.0, isAcid: false, isBase: false },
  HCL: { id: 'HCL', name: 'Hydrochloric Acid (0.1M)', formula: 'HCl', color: '#f8fafc', pH: 1.0, isAcid: true, isBase: false },
  NAOH: { id: 'NAOH', name: 'Sodium Hydroxide (0.1M)', formula: 'NaOH', color: '#f8fafc', pH: 13.0, isAcid: false, isBase: true },
  PHENOL: { id: 'PHENOL', name: 'Phenolphthalein Indicator', formula: 'C20H14O4', color: '#ffffff', isIndicator: true },
  UNIV_IND: { id: 'UNIV_IND', name: 'Universal Indicator', formula: 'UI Mix', color: '#22c55e', isIndicator: true },
  CUSO4: { id: 'CUSO4', name: 'Copper(II) Sulfate (0.2M)', formula: 'CuSO4', color: '#0284c7', pH: 4.5, isSalt: true }
};

export const INITIAL_LAB_STATE = {
  volume: 100, // mL
  maxVolume: 300,
  temperature: 22.0, // °C (room temp)
  targetTemperature: 22.0,
  isHeating: false,
  isStirring: false,
  dropperActive: false,
  lastAction: 'Initialized distilled water in main beaker.',
  
  // Moles / contents in beaker (approximate for 100mL initial water)
  contents: {
    H2O: 100, // mL
    hMoles: 0.0,
    ohMoles: 0.0,
    hasPhenol: false,
    hasUnivInd: false,
    cuMoles: 0.0,
    saltMoles: 0.0,
  },
  
  pH: 7.0,
  color: 'rgba(224, 242, 254, 0.45)', // subtle clean water
  reactionNotice: 'Solution is neutral distilled water.',
  equation: 'H2O <=> H+ + OH-'
};

// Calculate pH based on current contents
export function calculatepH(contents, volumeL) {
  if (volumeL <= 0) return 7.0;
  
  const netH = contents.hMoles - contents.ohMoles;
  if (Math.abs(netH) < 1e-7) {
    return 7.0;
  } else if (netH > 0) {
    const concH = netH / volumeL;
    const pH = -Math.log10(concH);
    return Math.max(0.1, Math.min(6.99, Number(pH.toFixed(2))));
  } else {
    const concOH = -netH / volumeL;
    const pOH = -Math.log10(concOH);
    const pH = 14.0 - pOH;
    return Math.max(7.01, Math.min(13.99, Number(pH.toFixed(2))));
  }
}

// Compute accurate solution color based on indicators, salts, and pH
export function calculateSolutionColor(state) {
  const { contents, pH } = state;
  
  // Copper sulfate deep blue override / blend
  if (contents.cuMoles > 0.001) {
    const intensity = Math.min(1, contents.cuMoles / 0.01);
    return `rgba(14, 165, 233, ${0.4 + intensity * 0.45})`;
  }

  // Phenolphthalein indicator logic (colorless below 8.2, intense magenta above 8.2)
  if (contents.hasPhenol) {
    if (pH >= 8.2) {
      const alpha = Math.min(0.85, 0.35 + (pH - 8.2) * 0.3);
      return `rgba(236, 72, 153, ${alpha})`;
    } else {
      return 'rgba(224, 242, 254, 0.4)';
    }
  }

  // Universal Indicator RGB spectrum logic
  if (contents.hasUnivInd) {
    if (pH <= 3) return 'rgba(239, 68, 68, 0.75)'; // Red (Strong Acid)
    if (pH <= 5) return 'rgba(249, 115, 22, 0.75)'; // Orange (Weak Acid)
    if (pH <= 6.5) return 'rgba(234, 179, 8, 0.75)'; // Yellow (Slight Acid)
    if (pH <= 7.5) return 'rgba(34, 197, 94, 0.75)'; // Green (Neutral)
    if (pH <= 9) return 'rgba(6, 182, 212, 0.75)'; // Cyan/Blue-Green
    if (pH <= 11) return 'rgba(59, 130, 246, 0.75)'; // Blue (Base)
    return 'rgba(147, 51, 234, 0.8)'; // Violet (Strong Base)
  }

  // Default water/clear solution
  return 'rgba(224, 242, 254, 0.45)';
}

// Add a reagent to the current state
export function addReagentToState(prevState, reagentKey, addedVolMl = 25) {
  const newContents = { ...prevState.contents };
  let newVol = prevState.volume + addedVolMl;
  if (newVol > prevState.maxVolume) newVol = prevState.maxVolume;
  
  const volL = newVol / 1000.0;
  let actionText = '';
  let equationText = prevState.equation;
  let tempDelta = 0;

  switch (reagentKey) {
    case 'HCL': {
      const addedMoles = (addedVolMl / 1000.0) * 0.1;
      newContents.hMoles += addedMoles;
      actionText = `Added ${addedVolMl}mL 0.1M HCl. Increased [H+] concentration.`;
      
      // Exothermic neutralization if base was present
      if (prevState.contents.ohMoles > 0) {
        tempDelta += 3.5;
        equationText = 'HCl (aq) + NaOH (aq) -> NaCl (aq) + H2O (l) + DeltaH';
      } else {
        equationText = 'HCl (aq) -> H+ (aq) + Cl- (aq)';
      }
      break;
    }
    case 'NAOH': {
      const addedMoles = (addedVolMl / 1000.0) * 0.1;
      newContents.ohMoles += addedMoles;
      actionText = `Added ${addedVolMl}mL 0.1M NaOH. Increased [OH-] concentration.`;
      
      // Exothermic neutralization if acid was present
      if (prevState.contents.hMoles > 0) {
        tempDelta += 3.5;
        equationText = 'NaOH (aq) + HCl (aq) -> NaCl (aq) + H2O (l) + DeltaH';
      } else {
        equationText = 'NaOH (aq) -> Na+ (aq) + OH- (aq)';
      }
      break;
    }
    case 'PHENOL': {
      newContents.hasPhenol = true;
      actionText = 'Added 5 drops of Phenolphthalein pH indicator.';
      break;
    }
    case 'UNIV_IND': {
      newContents.hasUnivInd = true;
      actionText = 'Added Universal pH Indicator.';
      break;
    }
    case 'CUSO4': {
      const addedMoles = (addedVolMl / 1000.0) * 0.2;
      newContents.cuMoles += addedMoles;
      actionText = `Added ${addedVolMl}mL Copper(II) Sulfate solution.`;
      equationText = 'CuSO4 (s) + H2O (l) -> [Cu(H2O)6](2+) + SO4(2-)';
      break;
    }
    case 'H2O': {
      actionText = `Added ${addedVolMl}mL Distilled Water. Diluting solution.`;
      break;
    }
    default:
      break;
  }

  const newPH = calculatepH(newContents, volL);
  const newTemp = Math.min(100, prevState.temperature + tempDelta);

  let notice = 'Solution stabilized.';
  if (newPH < 3) notice = 'Strongly Acidic environment (pH < 3).';
  else if (newPH > 11) notice = 'Strongly Basic/Alkaline environment (pH > 11).';
  else if (newPH >= 6.8 && newPH <= 7.2) notice = 'Neutral Solution (pH ≈ 7.0). Equivalence Point reached!';

  const updatedState = {
    ...prevState,
    volume: newVol,
    temperature: newTemp,
    contents: newContents,
    pH: newPH,
    lastAction: actionText,
    reactionNotice: notice,
    equation: equationText,
  };

  updatedState.color = calculateSolutionColor(updatedState);
  return updatedState;
}
