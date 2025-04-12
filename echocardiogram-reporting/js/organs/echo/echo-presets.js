// js/organs/echo/echo-presets.js
// Defines preset data templates for common echocardiogram findings.
// Data structure MUST match the object structure returned by collectEchoData in echo-module.js
// IMPORTANT: Preset data is nested under the 'echo' key. Calculated fields should generally be left blank ('') as they will be computed upon loading.

export const echoPresets = [
    // 1. Normal Study
    {
        name: "Normal Study / Siêu âm tim bình thường",
        data: {
            echo: {
                clinicalInfo: {
                    ptHeight: '1.70', ptWeight: '70', bsa: '', // Calculated
                    heartRate: '70', bloodPressure: '120/80', studyQuality: 'Good / Tốt', indications: '',
                },
                measurements2D: {
                    lvidD: '48', lvidS: '30', ivsD: '9', lvpwD: '9',
                    lvMass: '', lvMassIndex: '', rwt: '', // Calculated
                    laDiamPS: '35', laVolIndex: '28', aoRootDiam: '30', aoAnnulusDiam: '22', ascAoDiam: '32',
                    raArea: '16', rvDiam: '35', rvFac: '45', tapse: '20',
                    ivcDiam: '18', ivcCollapse: '60', paDiam: '24', ef: '', // Calculated
                },
                measurementsMMode: { epss: '5' },
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '0.8', mvPeakA: '0.6', eaRatio: '', decelTime: '180', ivrt: '80' }, // eaRatio Calculated
                    tdi: { tdiSeptalE: '9', tdiLateralE: '12', tdiAvgE: '', e_ePrimeAvg: '', tdiSeptalS: '8', tdiLateralS: '10', tdiRvS: '12' }, // Avg E, E/e' Calculated
                    pulmonaryVein: { pvS: '', pvD: '', pvArMinusMvA: '' },
                    lvotCalculations: { lvotDiam: '2.0', lvotVTI: '20', sv: '', co: '', ci: '' }, // SV, CO, CI Calculated
                    aorticValve: { avPeakVel: '1.2', avPeakGrad: '', avMeanGrad: '', avVTI: '19', avaContinuity: '', avDI: '' }, // Grads, AVA, DI Calculated (Grads aren't auto-calc here)
                    mitralValve: { mvPeakVel: '', mvPeakGrad: '', mvMeanGrad: '', mvPHT: '', mvaPHT: '' }, // MVA Calculated
                    tricuspidValve: { peakTRVel: '2.0', estRVSP: '' }, // RVSP Calculated
                    pulmonicValve: { pvPeakVel: '', pvPeakGrad: '', padpFromPR: '' },
                    mrQuant: { mrPisaRadius: '', mrEROA: '', mrRegVol: '', mrVenaContracta: '' },
                    arQuant: { arPHT: '', arVenaContracta: '' }
                },
                leftVentricle: {
                    lvSize: 'Normal / Bình thường', lvWallThickness: 'Normal / Bình thường', lvSystolicFuncQual: 'Normal / Bình thường',
                    gls: '-20', rwma: 'No regional wall motion abnormalities identified. / Không ghi nhận rối loạn vận động vùng.'
                },
                lvDiastolicFunction: { diastolicGrade: 'Normal / Bình thường', laPressureEst: 'Normal / Bình thường' },
                rightVentricle: { rvSize: 'Normal / Bình thường', rvWallThickness: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Normal / Bình thường', raSizeVolume: 'Normal / Bình thường' },
                aorticValve: { avMorphology: 'Tricuspid aortic valve with normal leaflet morphology and mobility. / Van ĐMC ba lá van, hình thái và di động lá van bình thường.', asGrade: 'None / Không', arGrade: 'None/Trivial / Không/Không đáng kể', arDescription: '' },
                mitralValve: { mvMorphology: 'Normal mitral valve leaflets and mobility. / Lá van hai lá và di động bình thường.', msGrade: 'None / Không', mrGrade: 'None/Trivial / Không/Không đáng kể', mrDescription: '' },
                tricuspidValve: { tvMorphology: 'Normal tricuspid valve leaflets and mobility. / Lá van ba lá và di động bình thường.', tsGrade: 'None / Không', trGrade: 'None/Trivial / Không/Không đáng kể' },
                pulmonicValve: { pvMorphology: 'Normal pulmonic valve morphology and mobility. / Hình thái và di động van ĐMP bình thường.', psGrade: 'None / Không', prGrade: 'None/Trivial / Không/Không đáng kể' },
                prostheticValves: { prostheticValveTypePos: '', prostheticValveAssess: '' },
                pericardium: { pericardiumAppearance: 'Normal / Bình thường', pericardialEffusion: 'None / Không', effusionDescription: '' },
                congenitalFindings: { congenitalDesc: 'No gross congenital abnormalities identified. / Không thấy bất thường bẩm sinh đại thể.' },
                aortaGreatVessels: { aorticArchDesc: 'Normal appearance. / Hình ảnh bình thường.', paDesc: 'Normal size. / Kích thước bình thường.' },
                impression: 'Normal echocardiogram. Normal chamber sizes, wall thickness, and systolic function. No significant valvular abnormalities or pericardial effusion. / Siêu âm tim bình thường. Kích thước buồng tim, bề dày thành tim và chức năng tâm thu bình thường. Không có bất thường van tim đáng kể hay tràn dịch màng ngoài tim.',
                recommendation: 'Clinical correlation recommended. / Đề nghị tương quan lâm sàng.'
            }
        }
    },
    // 2. Concentric LVH, Normal EF, Grade I Diastolic Dysfunction
    {
        name: "Concentric LVH, Normal EF, Diastolic Dysfunction Gr I / Phì đại TT đồng tâm, EF BT, RLCNTT Độ I",
        data: {
            echo: {
                clinicalInfo: { heartRate: '65', bloodPressure: '145/90', studyQuality: 'Adequate / Đủ tốt' },
                measurements2D: {
                    lvidD: '45', lvidS: '28', ivsD: '13', lvpwD: '13', // Increased thickness
                    lvMass: '', lvMassIndex: '', rwt: '', // Calculated
                    laDiamPS: '38', laVolIndex: '32', // LA normal or borderline
                    // Other 2D normal
                    tapse: '19', rvFac: '48', ivcDiam: '17', ivcCollapse: '70',
                    ef: '', // Calculated (should be normal)
                },
                measurementsMMode: { epss: '4' },
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '0.6', mvPeakA: '0.8', eaRatio: '', decelTime: '240', ivrt: '110' }, // E<A, DT/IVRT prolonged
                    tdi: { tdiSeptalE: '6', tdiLateralE: '8', tdiAvgE: '', e_ePrimeAvg: '', tdiSeptalS: '7', tdiLateralS: '9', tdiRvS: '11' }, // Reduced e'
                    lvotCalculations: { lvotDiam: '2.1', lvotVTI: '21', sv: '', co: '', ci: '' },
                    tricuspidValve: { peakTRVel: '2.2', estRVSP: '' }, // Normal PASP
                },
                leftVentricle: {
                    lvSize: 'Normal / Bình thường', lvWallThickness: 'Concentric hypertrophy / Phì đại đồng tâm', // Key finding
                    lvSystolicFuncQual: 'Normal / Bình thường', gls: '-19', rwma: 'None. / Không.'
                },
                lvDiastolicFunction: { diastolicGrade: 'Grade I (Impaired Relaxation) / Độ I (RL Thư giãn)', laPressureEst: 'Normal / Bình thường' }, // Key finding
                rightVentricle: { rvSize: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Normal / Bình thường', raSizeVolume: 'Normal / Bình thường' },
                aorticValve: { asGrade: 'Aortic Sclerosis / Xơ van ĐMC', arGrade: 'Trivial / Không đáng kể' }, // Common finding
                mitralValve: { mrGrade: 'Mild (1+) / Nhẹ (1+)' }, // Common finding
                tricuspidValve: { trGrade: 'Mild (1+) / Nhẹ (1+)' },
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Mild concentric left ventricular hypertrophy with normal LV systolic function (EF estimated [X]%). Grade I diastolic dysfunction (impaired relaxation pattern). Mild aortic sclerosis. Trace to mild mitral and tricuspid regurgitation. / Phì đại thất trái đồng tâm độ nhẹ với chức năng tâm thu thất trái bình thường (EF ước tính [X]%). Rối loạn chức năng tâm trương độ I (kiểu rối loạn thư giãn). Xơ van động mạch chủ nhẹ. Hở hai lá và ba lá mức độ nhẹ.',
                recommendation: 'Clinical correlation recommended, particularly regarding blood pressure management. / Đề nghị tương quan lâm sàng, đặc biệt về quản lý huyết áp.'
            }
        }
    },
    // 3. Dilated LV, Severely Reduced EF
    {
        name: "Dilated LV, Severely Reduced EF / Giãn TT, EF giảm nặng",
        data: {
            echo: {
                clinicalInfo: { heartRate: '85', bloodPressure: '110/70', studyQuality: 'Adequate / Đủ tốt' },
                measurements2D: {
                    lvidD: '65', lvidS: '55', // Dilated, poor contraction
                    ivsD: '8', lvpwD: '8', // Walls may be thin or normal
                    lvMass: '', lvMassIndex: '', rwt: '', // Calculated (likely eccentric hypertrophy or normal mass index if very dilated)
                    laDiamPS: '45', laVolIndex: '42', // LA likely dilated
                    rvDiam: '40', rvFac: '30', tapse: '14', // RV function may be affected
                    ivcDiam: '22', ivcCollapse: '40', // Suggests elevated RA pressure
                    ef: '', // Calculated (will be low)
                },
                measurementsMMode: { epss: '15' }, // Increased EPSS
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '0.9', mvPeakA: '0.5', eaRatio: '', decelTime: '140', ivrt: '60' }, // Restrictive or pseudonormal pattern likely
                    tdi: { tdiSeptalE: '4', tdiLateralE: '5', tdiAvgE: '', e_ePrimeAvg: '', tdiSeptalS: '5', tdiLateralS: '6', tdiRvS: '8' }, // Reduced velocities
                    lvotCalculations: { lvotDiam: '2.0', lvotVTI: '12', sv: '', co: '', ci: '' }, // Low VTI -> low SV/CO/CI
                    tricuspidValve: { peakTRVel: '3.0', estRVSP: '' }, // Often elevated PASP
                },
                leftVentricle: {
                    lvSize: 'Severely dilated / Giãn nặng', lvWallThickness: 'Eccentric hypertrophy / Phì đại lệch tâm', // Or Thin walls
                    lvSystolicFuncQual: 'Severely reduced / Giảm nặng', gls: '-8', // Example low GLS
                    rwma: 'Global hypokinesis. / Giảm động toàn bộ.' // Common finding
                },
                lvDiastolicFunction: { diastolicGrade: 'Grade III (Restrictive) / Độ III (Hạn chế)', laPressureEst: 'Elevated / Tăng' }, // Or Grade II / Indeterminate
                rightVentricle: { rvSize: 'Moderately dilated / Giãn vừa', rvSystolicFuncQual: 'Mildly reduced / Giảm nhẹ' }, // Often affected
                atria: { laSizeVolume: 'Severely dilated / Giãn nặng', raSizeVolume: 'Moderately dilated / Giãn vừa' },
                aorticValve: { arGrade: 'Mild (1+) / Nhẹ (1+)' },
                mitralValve: { mrGrade: 'Moderate (2+) / Vừa (2+)', mrDescription: 'Functional MR due to LV dilatation and annular dilatation. / Hở hai lá cơ năng do giãn thất trái và giãn vòng van.' }, // Functional MR common
                tricuspidValve: { trGrade: 'Moderate (2+) / Vừa (2+)' }, // Often functional TR
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Severe left ventricular dilatation with severely reduced systolic function (EF estimated [X]%). Global hypokinesis. Likely Grade [II/III] diastolic dysfunction with elevated left atrial pressure. Moderate secondary mitral and tricuspid regurgitation. Moderate right ventricular and bi-atrial enlargement. Moderate pulmonary hypertension (estimated PASP [Y] mmHg). / Giãn thất trái nặng, chức năng tâm thu giảm nặng (EF ước tính [X]%). Giảm động toàn bộ. Nhiều khả năng rối loạn chức năng tâm trương độ [II/III] với tăng áp lực nhĩ trái. Hở hai lá và ba lá thứ phát mức độ vừa. Giãn thất phải và hai buồng nhĩ mức độ vừa. Tăng áp động mạch phổi mức độ vừa (PASP ước tính [Y] mmHg).',
                recommendation: 'Clinical correlation and optimization of heart failure management recommended. / Đề nghị tương quan lâm sàng và tối ưu hóa điều trị suy tim.'
            }
        }
    },
     // 4. Moderate Aortic Stenosis
    {
        name: "Moderate Aortic Stenosis / Hẹp van ĐMC vừa",
        data: {
            echo: {
                clinicalInfo: { heartRate: '72', bloodPressure: '130/80', studyQuality: 'Good / Tốt' },
                measurements2D: {
                    lvidD: '50', lvidS: '32', ivsD: '12', lvpwD: '12', // Often LVH present
                    lvMass: '', lvMassIndex: '', rwt: '', // Calculated
                    laDiamPS: '39', laVolIndex: '33', // LA may be borderline/mildly dilated
                    aoRootDiam: '33', ascAoDiam: '34', // Check aorta size
                    ef: '', // Calculated (often preserved initially)
                },
                measurementsMMode: { epss: '6' },
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '0.7', mvPeakA: '0.7', eaRatio: '', decelTime: '200', ivrt: '95' }, // May show impaired relaxation
                    tdi: { tdiSeptalE: '7', tdiLateralE: '9', tdiAvgE: '', e_ePrimeAvg: ''}, // May be slightly reduced
                    lvotCalculations: { lvotDiam: '2.1', lvotVTI: '18', sv: '', co: '', ci: '' },
                    aorticValve: {
                        avPeakVel: '3.5', // Moderate AS range (3.0-3.9 m/s)
                        avPeakGrad: '', // Auto-calculated if desired, or input
                        avMeanGrad: '30', // Moderate AS range (20-39 mmHg)
                        avVTI: '55', // Example - typically higher VTI across valve
                        avaContinuity: '', // Calculated (Expected moderate range, e.g., 1.0-1.5 cm²)
                        avDI: '' // Calculated (Expected moderate range, e.g., 0.25-0.5)
                    },
                    mitralValve: { mrGrade: 'Mild (1+) / Nhẹ (1+)' },
                    tricuspidValve: { peakTRVel: '2.4', estRVSP: '' }, // Usually normal PASP unless late stage
                },
                leftVentricle: {
                    lvSize: 'Normal / Bình thường', lvWallThickness: 'Mild concentric hypertrophy / Phì đại đồng tâm nhẹ', // Common
                    lvSystolicFuncQual: 'Normal / Bình thường', gls: '-18', rwma: 'None. / Không.'
                },
                lvDiastolicFunction: { diastolicGrade: 'Grade I (Impaired Relaxation) / Độ I (RL Thư giãn)', laPressureEst: 'Normal / Bình thường' }, // Common
                rightVentricle: { rvSize: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Mildly dilated / Giãn nhẹ', raSizeVolume: 'Normal / Bình thường' },
                aorticValve: {
                    avMorphology: 'Thickened and calcified tricuspid aortic valve leaflets with reduced mobility. / Lá van ĐMC ba lá dày, vôi hóa, di động giảm.', // Typical morphology
                    asGrade: 'Moderate / Vừa', // Key finding
                    arGrade: 'Mild (1+) / Nhẹ (1+)', // Often associated
                    arDescription: 'Central jet. / Dòng hở trung tâm.'
                },
                mitralValve: { mvMorphology: 'Normal mitral valve leaflets and mobility. / Lá van hai lá và di động bình thường.', mrGrade: 'Mild (1+) / Nhẹ (1+)' },
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Moderate aortic stenosis (Peak Vel: 3.5 m/s, Mean Grad: 30 mmHg, AVA calculated: [X] cm², DI: [Y]). Mild concentric left ventricular hypertrophy with preserved systolic function. Grade I diastolic dysfunction. Mild aortic regurgitation. / Hẹp van động mạch chủ mức độ vừa (Vận tốc đỉnh: 3.5 m/s, Chênh áp TB: 30 mmHg, AVA tính toán: [X] cm², DI: [Y]). Phì đại thất trái đồng tâm nhẹ, chức năng tâm thu bảo tồn. Rối loạn chức năng tâm trương độ I. Hở van động mạch chủ nhẹ.',
                recommendation: 'Clinical correlation. Follow-up echocardiogram in 12-18 months or sooner if symptoms develop/worsen. Cardiology consultation recommended. / Đề nghị tương quan lâm sàng. Siêu âm tim kiểm tra sau 12-18 tháng hoặc sớm hơn nếu triệu chứng xuất hiện/nặng lên. Đề nghị hội chẩn Tim mạch.'
            }
        }
    },
    // 5. Severe Mitral Regurgitation (MVP)
    {
        name: "Severe Mitral Regurgitation (MVP) / Hở van Hai lá nặng (Sa van)",
        data: {
            echo: {
                clinicalInfo: { heartRate: '78', bloodPressure: '115/75', studyQuality: 'Good / Tốt' },
                measurements2D: {
                    lvidD: '58', lvidS: '36', // LV often dilated
                    ivsD: '10', lvpwD: '10', // Often normal thickness or eccentric hypertrophy
                    lvMass: '', lvMassIndex: '', rwt: '', // Calculated
                    laDiamPS: '48', laVolIndex: '45', // LA dilated
                    ef: '', // Calculated (can be normal or reduced depending on chronicity/compensation)
                },
                measurementsMMode: {},
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '1.2', mvPeakA: '0.5', eaRatio: '', decelTime: '160', ivrt: '70' }, // High E velocity common
                    tdi: { tdiSeptalE: '10', tdiLateralE: '13'}, // Often normal TDI velocities if EF preserved
                    pulmonaryVein: { pvS: '0.4', pvD: '0.6', pvArMinusMvA: '40'}, // Systolic flow reversal may occur (S < D)
                    lvotCalculations: { lvotDiam: '2.0', lvotVTI: '19'}, // Normal or slightly low SV through LVOT
                    aorticValve: { avPeakVel: '1.1' },
                    mitralValve: {}, // Gradients usually low unless MS present
                    tricuspidValve: { peakTRVel: '2.9', estRVSP: '' }, // PASP may be elevated
                    mrQuant: { mrPisaRadius: '1.1', mrEROA: '0.5', mrRegVol: '65', mrVenaContracta: '0.8' }, // Example severe quantitative values
                },
                leftVentricle: {
                    lvSize: 'Moderately dilated / Giãn vừa', lvWallThickness: 'Normal / Bình thường', // Or eccentric hypertrophy
                    lvSystolicFuncQual: 'Normal / Bình thường', // Or mildly reduced
                    gls: '-17', rwma: 'None. / Không.'
                },
                lvDiastolicFunction: { diastolicGrade: 'Indeterminate / Không xác định', laPressureEst: 'Elevated / Tăng' }, // Often elevated LA pressure
                rightVentricle: { rvSize: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Severely dilated / Giãn nặng', raSizeVolume: 'Mildly dilated / Giãn nhẹ' },
                aorticValve: { asGrade: 'None / Không', arGrade: 'None/Trivial / Không/Không đáng kể' },
                mitralValve: {
                    mvMorphology: 'Mitral Valve Prolapse (MVP) of the posterior leaflet (P2 segment). / Sa van hai lá (MVP) lá sau (mảnh P2).', // Key finding
                    msGrade: 'None / Không',
                    mrGrade: 'Severe (4+) / Nặng (4+)', // Key finding
                    mrDescription: 'Eccentric jet directed anteriorly, swirling in the left atrium. Vena contracta 0.8 cm. EROA 0.5 cm². Regurgitant Volume 65 ml. Systolic flow reversal in pulmonary veins. / Dòng hở lệch tâm hướng ra trước, xoáy trong nhĩ trái. Vena contracta 0.8 cm. EROA 0.5 cm². Thể tích dòng hở 65 ml. Đảo ngược dòng tâm thu ở tĩnh mạch phổi.' // Detailed description
                },
                tricuspidValve: { trGrade: 'Mild (1+) / Nhẹ (1+)' },
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Severe mitral regurgitation due to posterior mitral valve leaflet prolapse (P2 segment flail suspected). Severe left atrial enlargement. Moderate left ventricular enlargement with preserved systolic function. Evidence of elevated left atrial pressure and moderate pulmonary hypertension (estimated PASP [X] mmHg). Quantitative assessment confirms severe MR (EROA 0.5 cm², RV 65 ml). / Hở van hai lá nặng do sa lá sau van hai lá (nghi ngờ sa lật mảnh P2). Giãn nhĩ trái nặng. Giãn thất trái vừa, chức năng tâm thu bảo tồn. Bằng chứng tăng áp lực nhĩ trái và tăng áp động mạch phổi mức độ vừa (PASP ước tính [X] mmHg). Đánh giá định lượng xác nhận hở hai lá nặng (EROA 0.5 cm², RV 65 ml).',
                recommendation: 'Clinical correlation. Cardiology consultation recommended. Consider surgical evaluation for mitral valve repair/replacement. / Đề nghị tương quan lâm sàng. Đề nghị hội chẩn Tim mạch. Cân nhắc đánh giá phẫu thuật sửa/thay van hai lá.'
            }
        }
    },


]; // End of echoPresets array

console.log("echo-presets.js loaded.");