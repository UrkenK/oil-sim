import { SEISMIC_PACKAGES } from '../constants/seismic';
import { GEOLOGICAL_CHARACTERISTICS } from '../constants/geology';

// Seismic interpretation results that will be shown to team
export const generateSeismicInterpretation = (packageType, geologicalType) => {
  const pkg = SEISMIC_PACKAGES[packageType];
  const geo = GEOLOGICAL_CHARACTERISTICS[geologicalType];

  // Generate realistic interpretation metrics
  const baseProspectQuality = geo.probability;
  const dataQuality = pkg.interpretation;

  // Simulate what the seismic shows
  const interpretation = {
    // Structural elements
    closureIdentified: Math.random() < dataQuality.structuralClarity,
    closureArea: Math.floor(Math.random() * 2000 + 500), // acres
    structuralType: ['anticline', 'fault trap', 'stratigraphic trap'][Math.floor(Math.random() * 3)],
    fourWayDipClosure: Math.random() < (dataQuality.structuralClarity * 0.8),

    // Reservoir indicators
    amplitudeAnomaly: Math.random() < (baseProspectQuality * dataQuality.amplitudeConfidence),
    amplitudeStrength: Math.random() < 0.5 ? 'strong' : Math.random() < 0.5 ? 'moderate' : 'weak',
    flatSpot: Math.random() < (baseProspectQuality * dataQuality.amplitudeConfidence * 0.6),
    brightSpot: Math.random() < (baseProspectQuality * dataQuality.amplitudeConfidence * 0.5),

    // Depth and thickness
    reservoirDepth: Math.floor(Math.random() * 3000 + 1000),
    reservoirThickness: Math.floor(Math.random() * 100 + 20),
    depthUncertainty: Math.floor((1 - dataQuality.depthAccuracy) * 200),

    // Fault risk
    faultsIdentified: Math.floor(Math.random() * 10),
    faultSealing: dataQuality.faultResolution > 0.7 ? 'likely' : 'uncertain',
    compartmentalization: dataQuality.faultResolution > 0.6 ? (Math.random() < 0.3 ? 'yes' : 'no') : 'unknown',

    // Hydrocarbon indicators (DHI)
    dhiPresent: pkg.dataProducts.includes('Direct hydrocarbon indicators (DHI)') && Math.random() < baseProspectQuality,
    dhiTypes: [],

    // Confidence levels
    structuralConfidence: dataQuality.structuralClarity,
    volumetricConfidence: (dataQuality.structuralClarity + dataQuality.depthAccuracy) / 2,
    fluidConfidence: dataQuality.amplitudeConfidence,

    // Risk factors
    risks: []
  };

  // Add DHI types if present
  if (interpretation.dhiPresent) {
    if (interpretation.flatSpot) interpretation.dhiTypes.push('Flat spot (fluid contact)');
    if (interpretation.brightSpot) interpretation.dhiTypes.push('Bright spot (gas accumulation)');
    if (interpretation.amplitudeAnomaly) interpretation.dhiTypes.push('Amplitude anomaly');
  }

  // Identify risks
  if (interpretation.depthUncertainty > 100) {
    interpretation.risks.push(`High depth uncertainty (±${interpretation.depthUncertainty}m)`);
  }
  if (!interpretation.fourWayDipClosure) {
    interpretation.risks.push('Incomplete closure mapping');
  }
  if (interpretation.faultSealing === 'uncertain') {
    interpretation.risks.push('Fault seal uncertainty');
  }
  if (!interpretation.amplitudeAnomaly && pkg.quality !== 'poor') {
    interpretation.risks.push('No amplitude support');
  }
  if (interpretation.compartmentalization === 'yes') {
    interpretation.risks.push('Reservoir compartmentalization possible');
  }

  return interpretation;
};

export const generateRawSeismicData = (packageType, geologicalType) => {
  const pkg = SEISMIC_PACKAGES[packageType];
  const geo = GEOLOGICAL_CHARACTERISTICS[geologicalType];
  const quality = pkg.interpretation;

  const noiseLevel = 1.0 - (quality.structuralClarity * 0.7);

  const numTraces = 30;
  const numSamples = 50;
  const traces = [];

  const layers = [
    { depth: 0.15, thickness: 0.02, amplitude: 0.6, name: 'Shallow horizon' },
    { depth: 0.35, thickness: 0.03, amplitude: 0.8, name: 'Mid horizon' },
    { depth: 0.55, thickness: 0.04, amplitude: 0.9, name: 'Target reservoir top' },
    { depth: 0.65, thickness: 0.03, amplitude: 0.7, name: 'Target reservoir base' },
    { depth: 0.80, thickness: 0.02, amplitude: 0.5, name: 'Deep reflector' },
  ];

  const anticlineCenter = 15;
  const anticlineAmplitude = geologicalType === 'proven_basin' ? 0.08 :
                              geologicalType === 'deepwater' ? 0.06 :
                              geologicalType === 'frontier_basin' ? 0.04 : 0.02;

  const hasAmplitudeAnomaly = Math.random() < (geo.probability * quality.amplitudeConfidence);

  const faultTrace = Math.random() < 0.6 ? Math.floor(Math.random() * 8 + 18) : null;
  const faultOffset = faultTrace ? (0.03 + Math.random() * 0.05) : 0;

  for (let t = 0; t < numTraces; t++) {
    const trace = [];
    for (let s = 0; s < numSamples; s++) {
      const depth = s / numSamples;
      let amplitude = 0;

      const distFromCenter = Math.abs(t - anticlineCenter) / numTraces;
      const structuralShift = anticlineAmplitude * Math.cos(distFromCenter * Math.PI);
      const faultShift = (faultTrace && t >= faultTrace) ? faultOffset : 0;

      for (const layer of layers) {
        const adjustedDepth = layer.depth - structuralShift + faultShift;
        const distFromLayer = Math.abs(depth - adjustedDepth);
        if (distFromLayer < layer.thickness) {
          let layerAmp = layer.amplitude * (1 - distFromLayer / layer.thickness);
          if (layer.name.includes('Target reservoir top') && hasAmplitudeAnomaly && distFromCenter < 0.3) {
            layerAmp *= 1.5;
          }
          amplitude += layerAmp;
        }
      }

      amplitude += (Math.random() - 0.5) * noiseLevel * 0.6;
      trace.push(Math.max(-1, Math.min(1, amplitude)));
    }
    traces.push(trace);
  }

  return {
    traces,
    numTraces,
    numSamples,
    noiseLevel,
    layers,
    hasAmplitudeAnomaly,
    faultTrace,
    faultOffset,
    anticlineAmplitude,
    anticlineCenter,
    packageQuality: quality
  };
};
