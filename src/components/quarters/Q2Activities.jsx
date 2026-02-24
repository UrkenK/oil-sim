import React from 'react';
import { FileText, CheckCircle, Zap } from 'lucide-react';

import { SEISMIC_PACKAGES, PROCESSING_WORKFLOWS, SEISMIC_CONTRACTORS } from '../../constants/seismic';
import RawSeismicSection from '../visualizations/RawSeismicSection';

import { useGame } from '../../context/GameContext';
import { useRoleHelpers } from '../../hooks/useRoleHelpers';
import { useGameActions } from '../../hooks/useGameActions';
import { useAuthority } from '../../hooks/useAuthority';
import RoleSection from '../game/RoleSection';

const Q2Activities = () => {
  const {
    seismicStep,
    seismicInProgress,
    rawSeismicData,
    seismicObservations,
    selectedSeismicPkg,
    selectedContractor,
    projectData,
  } = useGame();

  const { hasRole } = useRoleHelpers();

  const {
    startSeismicAcquisition,
    startSeismicProcessing,
    advanceWithoutGate,
    applyGeoCost,
    dispatchSetSeismicObservation,
    dispatchSetSeismicStep,
  } = useGameActions();

  const { authProps } = useAuthority();

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 relative">
      <h3 className="text-xl font-bold mb-4">Q2 Activities: Seismic Acquisition & Processing</h3>

      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6 bg-slate-900/50 rounded-lg p-3">
        {['Package', 'Acquisition', 'Raw Review', 'Processing', 'Complete'].map((label, idx) => (
          <div key={idx} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
              seismicStep > idx ? 'bg-emerald-600 border-emerald-400 text-white' :
              seismicStep === idx ? 'bg-blue-600 border-blue-400 text-white' :
              'bg-slate-700 border-slate-500 text-slate-400'
            }`}>
              {seismicStep > idx ? '\u2713' : idx + 1}
            </div>
            <span className={`ml-1 text-xs hidden sm:inline ${seismicStep >= idx ? 'text-slate-200' : 'text-slate-500'}`}>
              {label}
            </span>
            {idx < 4 && <div className={`w-6 h-0.5 mx-1 ${seismicStep > idx ? 'bg-emerald-500' : 'bg-slate-600'}`} />}
          </div>
        ))}
      </div>

      {/* Seismic Animation Overlay */}
      {seismicInProgress && (
        <div className="absolute inset-0 bg-slate-900/90 rounded-xl flex items-center justify-center z-10">
          <div className="text-center p-8">
            <div className="animate-pulse mb-6">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-blue-300">{seismicInProgress.message}</h3>
            <div className="w-80 mx-auto bg-slate-700 rounded-full h-4 mt-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${seismicInProgress.progress}%`,
                  background: seismicInProgress.progress < 100 ? '#3b82f6' : '#22c55e'
                }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-2">{seismicInProgress.progress}% complete</p>
            <p className="text-xs text-slate-500 mt-1">
              {seismicInProgress.phase === 'acquisition' ? 'Field acquisition in progress...' : 'Data processing center...'}
            </p>
          </div>
        </div>
      )}

      {/* STEP 0: Package Selection / Execute */}
      {seismicStep === 0 && (
        <RoleSection roles="geologist">
          {selectedSeismicPkg ? (
            <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4 mb-4">
              <p className="text-sm text-emerald-300 mb-2">
                Seismic package <strong>{SEISMIC_PACKAGES[selectedSeismicPkg]?.name}</strong> was selected at FID 1.
                Contractor: <strong>{selectedContractor ? SEISMIC_CONTRACTORS[selectedContractor]?.name : 'N/A'}</strong>
              </p>
              <button onClick={() => startSeismicAcquisition(selectedSeismicPkg)}
                title={authProps('startSeismicAcquisition').title}
                disabled={authProps('startSeismicAcquisition').disabled}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-sm">
                Begin Seismic Acquisition
              </button>
            </div>
          ) : (
            <>
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-blue-400" />
                  <span className="font-bold">Investment Decision: Seismic Package Selection</span>
                </div>
                <p className="text-sm text-slate-300 mt-1">
                  Better seismic data costs more but provides higher confidence in drilling decisions.
                  This data will be presented to your team for analysis before drilling.
                </p>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold mb-2">
                  Select Seismic Package (Higher cost = Better data quality)
                </label>
                {Object.entries(SEISMIC_PACKAGES).map(([packageId, pkg]) => {
                  const totalCost = applyGeoCost(pkg.cost + pkg.processingCost, 'seismic');
                  return (
                    <button
                      key={packageId}
                      onClick={() => startSeismicAcquisition(packageId)}
                      title={authProps('startSeismicAcquisition').title}
                      disabled={authProps('startSeismicAcquisition').disabled}
                      className="w-full p-4 rounded-lg border-2 transition-all text-left border-slate-600 bg-slate-700 hover:border-blue-500"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-lg">{pkg.name}</div>
                          <div className="text-xs text-slate-400">{pkg.description}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${
                            totalCost > 10000000 ? 'text-red-400' :
                            totalCost > 6000000 ? 'text-orange-400' :
                            'text-emerald-400'
                          }`}>
                            ${(totalCost/1e6).toFixed(1)}M
                          </div>
                          <div className="text-xs text-slate-400">Total cost</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Structural Clarity:</span>
                          <span className="font-semibold text-blue-300">{(pkg.interpretation.structuralClarity * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Amplitude Confidence:</span>
                          <span className="font-semibold text-purple-300">{(pkg.interpretation.amplitudeConfidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Fault Resolution:</span>
                          <span className="font-semibold text-emerald-300">{(pkg.interpretation.faultResolution * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Depth Accuracy:</span>
                          <span className="font-semibold text-orange-300">{(pkg.interpretation.depthAccuracy * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        <span className="font-semibold">Deliverables:</span> {pkg.dataProducts.slice(0, 3).join(', ')}
                        {pkg.dataProducts.length > 3 && ` +${pkg.dataProducts.length - 3} more`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </RoleSection>
      )}

      {/* STEP 2: Raw Data Review & Observations */}
      {seismicStep === 2 && rawSeismicData && (
        <RoleSection roles="geologist" className="space-y-4">
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <FileText className="text-blue-400" />
              Raw Seismic Data — Your Interpretation
            </h4>
            <p className="text-sm text-slate-300">
              Below is the raw field data from your seismic survey. Before computer processing,
              examine the section and record your initial observations. In real exploration,
              geophysicists review raw data to check quality and form initial hypotheses.
            </p>
          </div>

          <RawSeismicSection data={rawSeismicData} processed={false} />

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <h4 className="font-bold text-sm mb-3 text-purple-400">Your Observations</h4>

            <div className="mb-4">
              <div className="text-xs text-slate-400 mb-2">
                1. Can you identify a structural closure (anticline/dome) in the reflectors?
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'yes', label: 'Yes, clearly' },
                  { id: 'maybe', label: 'Possibly' },
                  { id: 'no', label: 'No / Unclear' }
                ].map(opt => (
                  <button key={opt.id}
                    onClick={() => dispatchSetSeismicObservation('structureVisible', opt.id)}
                    title={authProps('setSeismicObservation').title}
                    disabled={authProps('setSeismicObservation').disabled}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                      seismicObservations.structureVisible === opt.id
                        ? 'border-blue-400 bg-blue-900/30 text-blue-300'
                        : 'border-slate-600 hover:border-slate-500 text-slate-400'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-slate-400 mb-2">
                2. Do you see any amplitude anomalies (bright spots) in the target zone?
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'yes', label: 'Yes, bright spot' },
                  { id: 'maybe', label: 'Possibly' },
                  { id: 'no', label: 'No anomaly' }
                ].map(opt => (
                  <button key={opt.id}
                    onClick={() => dispatchSetSeismicObservation('amplitudeAnomaly', opt.id)}
                    title={authProps('setSeismicObservation').title}
                    disabled={authProps('setSeismicObservation').disabled}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                      seismicObservations.amplitudeAnomaly === opt.id
                        ? 'border-blue-400 bg-blue-900/30 text-blue-300'
                        : 'border-slate-600 hover:border-slate-500 text-slate-400'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-slate-400 mb-2">
                3. Are there any visible discontinuities suggesting faults?
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'yes', label: 'Yes, faults visible' },
                  { id: 'maybe', label: 'Possibly' },
                  { id: 'no', label: 'No faults seen' }
                ].map(opt => (
                  <button key={opt.id}
                    onClick={() => dispatchSetSeismicObservation('faultsVisible', opt.id)}
                    title={authProps('setSeismicObservation').title}
                    disabled={authProps('setSeismicObservation').disabled}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                      seismicObservations.faultsVisible === opt.id
                        ? 'border-blue-400 bg-blue-900/30 text-blue-300'
                        : 'border-slate-600 hover:border-slate-500 text-slate-400'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-slate-400 mb-2">
                4. What is your estimate for the target reservoir depth?
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'shallow', label: '< 1500m' },
                  { id: 'medium', label: '1500 - 3000m' },
                  { id: 'deep', label: '> 3000m' }
                ].map(opt => (
                  <button key={opt.id}
                    onClick={() => dispatchSetSeismicObservation('estimatedDepth', opt.id)}
                    title={authProps('setSeismicObservation').title}
                    disabled={authProps('setSeismicObservation').disabled}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                      seismicObservations.estimatedDepth === opt.id
                        ? 'border-blue-400 bg-blue-900/30 text-blue-300'
                        : 'border-slate-600 hover:border-slate-500 text-slate-400'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-slate-400 mb-2">
                5. Overall, how promising does this prospect look based on the raw data?
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'promising', label: 'Promising' },
                  { id: 'uncertain', label: 'Uncertain' },
                  { id: 'poor', label: 'Poor' }
                ].map(opt => (
                  <button key={opt.id}
                    onClick={() => dispatchSetSeismicObservation('overallAssessment', opt.id)}
                    title={authProps('setSeismicObservation').title}
                    disabled={authProps('setSeismicObservation').disabled}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                      seismicObservations.overallAssessment === opt.id
                        ? 'border-blue-400 bg-blue-900/30 text-blue-300'
                        : 'border-slate-600 hover:border-slate-500 text-slate-400'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {hasRole('geologist') && (
              <div className="bg-emerald-900/20 border border-emerald-600/50 rounded-lg p-3 mb-3">
                <div className="text-xs font-bold text-emerald-400 mb-1">Geologist Tip:</div>
                <div className="text-xs text-slate-300">
                  Look at the continuity of reflectors around the center of the section. A structural high
                  could indicate an anticline trap. Also check for amplitude brightening at the reservoir level
                  compared to the flanks — this may suggest hydrocarbon presence.
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => dispatchSetSeismicStep(3)}
            disabled={Object.values(seismicObservations).filter(v => v !== null).length < 3 || authProps('setSeismicObservation').disabled}
            title={authProps('setSeismicObservation').title}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
          >
            Submit Observations & Proceed to Data Processing
          </button>
        </RoleSection>
      )}

      {/* STEP 3: Processing Workflow Selection */}
      {seismicStep === 3 && (
        <RoleSection roles="geologist" className="space-y-4">
          <div className="bg-indigo-900/30 border border-indigo-600 rounded-lg p-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Zap className="text-indigo-400" />
              Select Data Processing Workflow
            </h4>
            <p className="text-sm text-slate-300">
              Raw seismic data needs computer processing to produce interpretable images.
              More advanced processing takes longer but produces clearer results.
            </p>
          </div>

          <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
            <div className="text-xs font-bold text-slate-400 mb-2">Your Observations Summary:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Structure visible: <span className="text-blue-300 capitalize">{seismicObservations.structureVisible || '—'}</span></div>
              <div>Amplitude anomaly: <span className="text-blue-300 capitalize">{seismicObservations.amplitudeAnomaly || '—'}</span></div>
              <div>Faults visible: <span className="text-blue-300 capitalize">{seismicObservations.faultsVisible || '—'}</span></div>
              <div>Est. depth: <span className="text-blue-300 capitalize">{seismicObservations.estimatedDepth || '—'}</span></div>
              <div className="col-span-2">Overall: <span className="text-blue-300 capitalize">{seismicObservations.overallAssessment || '—'}</span></div>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(PROCESSING_WORKFLOWS).map(([wfId, wf]) => (
              <button key={wfId}
                onClick={() => startSeismicProcessing(wfId)}
                title={authProps('startSeismicProcessing').title}
                disabled={authProps('startSeismicProcessing').disabled}
                className="w-full p-4 rounded-lg border-2 border-slate-600 bg-slate-700 hover:border-indigo-500 transition-all text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-lg">{wf.name}</div>
                    <div className="text-xs text-slate-400">{wf.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-400">${(applyGeoCost(wf.cost || 0, 'seismic')/1e6).toFixed(1)}M</div>
                    <div className="text-xs text-indigo-400">{wf.timeCost}</div>
                    <div className="text-xs text-slate-400">
                      {wf.qualityMultiplier > 1 ? `+${((wf.qualityMultiplier - 1) * 100).toFixed(0)}% confidence` : 'Baseline'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </RoleSection>
      )}

      {/* STEP 5: Processing Complete — Results */}
      {seismicStep === 5 && (
        <div className="space-y-4">
          <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <CheckCircle className="text-emerald-400" />
              Seismic Processing Complete
            </h4>
            <p className="text-sm text-slate-300">
              Data processing is finished. Compare the processed section below with the raw data you reviewed earlier.
              The full interpretation report will be presented in Q3 for your detailed analysis.
            </p>
          </div>

          <RawSeismicSection data={rawSeismicData} processed={true} />

          <div className="bg-slate-900/50 rounded p-4 border border-slate-700">
            <div className="text-xs font-bold text-purple-400 mb-2">How did your observations compare?</div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Structure visible:</span>
                <span>
                  <span className="text-blue-300 capitalize">{seismicObservations.structureVisible}</span>
                  <span className="text-slate-500 mx-2">|</span>
                  <span className="text-emerald-300">
                    Actual: {projectData.seismicInterpretation?.closureIdentified ? 'Closure found' : 'No clear closure'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amplitude anomaly:</span>
                <span>
                  <span className="text-blue-300 capitalize">{seismicObservations.amplitudeAnomaly}</span>
                  <span className="text-slate-500 mx-2">|</span>
                  <span className="text-emerald-300">
                    Actual: {projectData.seismicInterpretation?.amplitudeAnomaly ? `Detected (${projectData.seismicInterpretation.amplitudeStrength})` : 'None'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Faults:</span>
                <span>
                  <span className="text-blue-300 capitalize">{seismicObservations.faultsVisible}</span>
                  <span className="text-slate-500 mx-2">|</span>
                  <span className="text-emerald-300">
                    Actual: {projectData.seismicInterpretation?.faultsIdentified > 0 ? `${projectData.seismicInterpretation.faultsIdentified} identified` : 'None'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Depth estimate:</span>
                <span>
                  <span className="text-blue-300 capitalize">{seismicObservations.estimatedDepth}</span>
                  <span className="text-slate-500 mx-2">|</span>
                  <span className="text-emerald-300">
                    Actual: {projectData.seismicInterpretation?.reservoirDepth}m
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={advanceWithoutGate}
            disabled={!projectData.seismicComplete || authProps('advanceWithoutGate').disabled}
            title={authProps('advanceWithoutGate').title}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
          >
            Complete Q2 → Advance to Q3 (Full Interpretation Report)
          </button>
        </div>
      )}
    </div>
  );
};

export default Q2Activities;
