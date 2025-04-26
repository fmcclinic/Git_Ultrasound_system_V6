// js/organs/echo/echo-presets.js
// Defines preset data templates for common echocardiogram findings.
// Data structure MUST match the object structure returned by collectEchoData in echo-module.js
// IMPORTANT: Preset data is nested under the 'echo' key. Calculated fields should generally be left blank ('') as they will be computed upon loading.

export const echoPresets = [
    // 1. Normal Study (Existing)
    {
        name: "Normal Study / Siêu âm tim bình thường",
        data: { // ... (data same as previous version) ... 
            echo: {
                clinicalInfo: { ptHeight: '1.70', ptWeight: '70', bsa: '', heartRate: '70', bloodPressure: '120/80', studyQuality: 'Good / Tốt', indications: '', },
                measurements2D: { lvidD: '48', lvidS: '30', ivsD: '9', lvpwD: '9', lvMass: '', lvMassIndex: '', rwt: '', laDiamPS: '35', laVolIndex: '28', aoRootDiam: '30', aoAnnulusDiam: '22', ascAoDiam: '32', raArea: '16', rvDiam: '35', rvFac: '45', tapse: '20', ivcDiam: '18', ivcCollapse: '60', paDiam: '24', ef: '', },
                measurementsMMode: { epss: '5' },
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '0.8', mvPeakA: '0.6', eaRatio: '', decelTime: '180', ivrt: '80' },
                    tdi: { tdiSeptalE: '9', tdiLateralE: '12', tdiAvgE: '', e_ePrimeAvg: '', tdiSeptalS: '8', tdiLateralS: '10', tdiRvS: '12' },
                    pulmonaryVein: { pvS: '', pvD: '', pvArMinusMvA: '' },
                    lvotCalculations: { lvotDiam: '2.0', lvotVTI: '20', sv: '', co: '', ci: '' },
                    aorticValve: { avPeakVel: '1.2', avPeakGrad: '', avMeanGrad: '', avVTI: '19', avaContinuity: '', avDI: '' },
                    mitralValve: { mvPeakVel: '', mvPeakGrad: '', mvMeanGrad: '', mvPHT: '', mvaPHT: '' },
                    tricuspidValve: { peakTRVel: '2.0', estRVSP: '' },
                    pulmonicValve: { pvPeakVel: '', pvPeakGrad: '', padpFromPR: '' },
                    mrQuant: { mrPisaRadius: '', mrEROA: '', mrRegVol: '', mrVenaContracta: '' },
                    arQuant: { arPHT: '', arVenaContracta: '' }
                },
                leftVentricle: { lvSize: 'Normal / Bình thường', lvWallThickness: 'Normal / Bình thường', lvSystolicFuncQual: 'Normal / Bình thường', gls: '-20', rwma: 'No regional wall motion abnormalities identified. / Không ghi nhận rối loạn vận động vùng.' },
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
    // 2. Concentric LVH, Normal EF, Diastolic Dysfunction Gr I (Existing)
    {
        name: "Concentric LVH, Normal EF, Diastolic Dysfunction Gr I / Phì đại TT đồng tâm, EF BT, RLCNTT Độ I",
        data: { // ... (data same as previous version) ... 
            echo: {
                clinicalInfo: { heartRate: '65', bloodPressure: '145/90', studyQuality: 'Adequate / Đủ tốt' },
                measurements2D: { lvidD: '45', lvidS: '28', ivsD: '13', lvpwD: '13', lvMass: '', lvMassIndex: '', rwt: '', laDiamPS: '38', laVolIndex: '32', tapse: '19', rvFac: '48', ivcDiam: '17', ivcCollapse: '70', ef: '', },
                measurementsMMode: { epss: '4' },
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '0.6', mvPeakA: '0.8', eaRatio: '', decelTime: '240', ivrt: '110' },
                    tdi: { tdiSeptalE: '6', tdiLateralE: '8', tdiAvgE: '', e_ePrimeAvg: '', tdiSeptalS: '7', tdiLateralS: '9', tdiRvS: '11' },
                    lvotCalculations: { lvotDiam: '2.1', lvotVTI: '21', sv: '', co: '', ci: '' },
                    tricuspidValve: { peakTRVel: '2.2', estRVSP: '' },
                },
                leftVentricle: { lvSize: 'Normal / Bình thường', lvWallThickness: 'Concentric hypertrophy / Phì đại đồng tâm', lvSystolicFuncQual: 'Normal / Bình thường', gls: '-19', rwma: 'None. / Không.' },
                lvDiastolicFunction: { diastolicGrade: 'Grade I (Impaired Relaxation) / Độ I (RL Thư giãn)', laPressureEst: 'Normal / Bình thường' },
                rightVentricle: { rvSize: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Normal / Bình thường', raSizeVolume: 'Normal / Bình thường' },
                aorticValve: { asGrade: 'Aortic Sclerosis / Xơ van ĐMC', arGrade: 'Trivial / Không đáng kể' },
                mitralValve: { mrGrade: 'Mild (1+) / Nhẹ (1+)' },
                tricuspidValve: { trGrade: 'Mild (1+) / Nhẹ (1+)' },
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Mild concentric left ventricular hypertrophy with normal LV systolic function (EF estimated [X]%). Grade I diastolic dysfunction (impaired relaxation pattern). Mild aortic sclerosis. Trace to mild mitral and tricuspid regurgitation. / Phì đại thất trái đồng tâm độ nhẹ với chức năng tâm thu thất trái bình thường (EF ước tính [X]%). Rối loạn chức năng tâm trương độ I (kiểu rối loạn thư giãn). Xơ van động mạch chủ nhẹ. Hở hai lá và ba lá mức độ nhẹ.',
                recommendation: 'Clinical correlation recommended, particularly regarding blood pressure management. / Đề nghị tương quan lâm sàng, đặc biệt về quản lý huyết áp.'
            }
        }
    },
    // 3. Dilated LV, Severely Reduced EF (Existing)
    {
        name: "Dilated LV, Severely Reduced EF / Giãn TT, EF giảm nặng",
        data: { // ... (data same as previous version) ... 
            echo: {
                clinicalInfo: { heartRate: '85', bloodPressure: '110/70', studyQuality: 'Adequate / Đủ tốt' },
                measurements2D: { lvidD: '65', lvidS: '55', ivsD: '8', lvpwD: '8', lvMass: '', lvMassIndex: '', rwt: '', laDiamPS: '45', laVolIndex: '42', rvDiam: '40', rvFac: '30', tapse: '14', ivcDiam: '22', ivcCollapse: '40', ef: '', },
                measurementsMMode: { epss: '15' },
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '0.9', mvPeakA: '0.5', eaRatio: '', decelTime: '140', ivrt: '60' },
                    tdi: { tdiSeptalE: '4', tdiLateralE: '5', tdiAvgE: '', e_ePrimeAvg: '', tdiSeptalS: '5', tdiLateralS: '6', tdiRvS: '8' },
                    lvotCalculations: { lvotDiam: '2.0', lvotVTI: '12', sv: '', co: '', ci: '' },
                    tricuspidValve: { peakTRVel: '3.0', estRVSP: '' },
                },
                leftVentricle: { lvSize: 'Severely dilated / Giãn nặng', lvWallThickness: 'Eccentric hypertrophy / Phì đại lệch tâm', lvSystolicFuncQual: 'Severely reduced / Giảm nặng', gls: '-8', rwma: 'Global hypokinesis. / Giảm động toàn bộ.' },
                lvDiastolicFunction: { diastolicGrade: 'Grade III (Restrictive) / Độ III (Hạn chế)', laPressureEst: 'Elevated / Tăng' },
                rightVentricle: { rvSize: 'Moderately dilated / Giãn vừa', rvSystolicFuncQual: 'Mildly reduced / Giảm nhẹ' },
                atria: { laSizeVolume: 'Severely dilated / Giãn nặng', raSizeVolume: 'Moderately dilated / Giãn vừa' },
                aorticValve: { arGrade: 'Mild (1+) / Nhẹ (1+)' },
                mitralValve: { mrGrade: 'Moderate (2+) / Vừa (2+)', mrDescription: 'Functional MR due to LV dilatation and annular dilatation. / Hở hai lá cơ năng do giãn thất trái và giãn vòng van.' },
                tricuspidValve: { trGrade: 'Moderate (2+) / Vừa (2+)' },
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Severe left ventricular dilatation with severely reduced systolic function (EF estimated [X]%). Global hypokinesis. Likely Grade [II/III] diastolic dysfunction with elevated left atrial pressure. Moderate secondary mitral and tricuspid regurgitation. Moderate right ventricular and bi-atrial enlargement. Moderate pulmonary hypertension (estimated PASP [Y] mmHg). / Giãn thất trái nặng, chức năng tâm thu giảm nặng (EF ước tính [X]%). Giảm động toàn bộ. Nhiều khả năng rối loạn chức năng tâm trương độ [II/III] với tăng áp lực nhĩ trái. Hở hai lá và ba lá thứ phát mức độ vừa. Giãn thất phải và hai buồng nhĩ mức độ vừa. Tăng áp động mạch phổi mức độ vừa (PASP ước tính [Y] mmHg).',
                recommendation: 'Clinical correlation and optimization of heart failure management recommended. / Đề nghị tương quan lâm sàng và tối ưu hóa điều trị suy tim.'
            }
        }
    },
    // 4. Moderate Aortic Stenosis (Existing)
    {
        name: "Moderate Aortic Stenosis / Hẹp van ĐMC vừa",
        data: { // ... (data same as previous version) ... 
            echo: {
                clinicalInfo: { heartRate: '72', bloodPressure: '130/80', studyQuality: 'Good / Tốt' },
                measurements2D: { lvidD: '50', lvidS: '32', ivsD: '12', lvpwD: '12', lvMass: '', lvMassIndex: '', rwt: '', laDiamPS: '39', laVolIndex: '33', aoRootDiam: '33', ascAoDiam: '34', ef: '', },
                measurementsMMode: { epss: '6' },
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '0.7', mvPeakA: '0.7', eaRatio: '', decelTime: '200', ivrt: '95' },
                    tdi: { tdiSeptalE: '7', tdiLateralE: '9', tdiAvgE: '', e_ePrimeAvg: ''},
                    lvotCalculations: { lvotDiam: '2.1', lvotVTI: '18', sv: '', co: '', ci: '' },
                    aorticValve: { avPeakVel: '3.5', avPeakGrad: '', avMeanGrad: '30', avVTI: '55', avaContinuity: '', avDI: '' },
                    mitralValve: { mrGrade: 'Mild (1+) / Nhẹ (1+)' },
                    tricuspidValve: { peakTRVel: '2.4', estRVSP: '' },
                },
                leftVentricle: { lvSize: 'Normal / Bình thường', lvWallThickness: 'Mild concentric hypertrophy / Phì đại đồng tâm nhẹ', lvSystolicFuncQual: 'Normal / Bình thường', gls: '-18', rwma: 'None. / Không.' },
                lvDiastolicFunction: { diastolicGrade: 'Grade I (Impaired Relaxation) / Độ I (RL Thư giãn)', laPressureEst: 'Normal / Bình thường' },
                rightVentricle: { rvSize: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Mildly dilated / Giãn nhẹ', raSizeVolume: 'Normal / Bình thường' },
                aorticValve: { avMorphology: 'Thickened and calcified tricuspid aortic valve leaflets with reduced mobility. / Lá van ĐMC ba lá dày, vôi hóa, di động giảm.', asGrade: 'Moderate / Vừa', arGrade: 'Mild (1+) / Nhẹ (1+)', arDescription: 'Central jet. / Dòng hở trung tâm.' },
                mitralValve: { mvMorphology: 'Normal mitral valve leaflets and mobility. / Lá van hai lá và di động bình thường.', mrGrade: 'Mild (1+) / Nhẹ (1+)' },
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Moderate aortic stenosis (Peak Vel: 3.5 m/s, Mean Grad: 30 mmHg, AVA calculated: [X] cm², DI: [Y]). Mild concentric left ventricular hypertrophy with preserved systolic function. Grade I diastolic dysfunction. Mild aortic regurgitation. / Hẹp van động mạch chủ mức độ vừa (Vận tốc đỉnh: 3.5 m/s, Chênh áp TB: 30 mmHg, AVA tính toán: [X] cm², DI: [Y]). Phì đại thất trái đồng tâm nhẹ, chức năng tâm thu bảo tồn. Rối loạn chức năng tâm trương độ I. Hở van động mạch chủ nhẹ.',
                recommendation: 'Clinical correlation. Follow-up echocardiogram in 12-18 months or sooner if symptoms develop/worsen. Cardiology consultation recommended. / Đề nghị tương quan lâm sàng. Siêu âm tim kiểm tra sau 12-18 tháng hoặc sớm hơn nếu triệu chứng xuất hiện/nặng lên. Đề nghị hội chẩn Tim mạch.'
            }
        }
    },
    // 5. Severe Mitral Regurgitation (MVP) (Existing)
    {
        name: "Severe Mitral Regurgitation (MVP) / Hở van Hai lá nặng (Sa van)",
        data: { // ... (data same as previous version) ... 
            echo: {
                clinicalInfo: { heartRate: '78', bloodPressure: '115/75', studyQuality: 'Good / Tốt' },
                measurements2D: { lvidD: '58', lvidS: '36', ivsD: '10', lvpwD: '10', lvMass: '', lvMassIndex: '', rwt: '', laDiamPS: '48', laVolIndex: '45', ef: '', },
                measurementsMMode: {},
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '1.2', mvPeakA: '0.5', eaRatio: '', decelTime: '160', ivrt: '70' },
                    tdi: { tdiSeptalE: '10', tdiLateralE: '13'},
                    pulmonaryVein: { pvS: '0.4', pvD: '0.6', pvArMinusMvA: '40'},
                    lvotCalculations: { lvotDiam: '2.0', lvotVTI: '19'},
                    aorticValve: { avPeakVel: '1.1' },
                    mitralValve: {},
                    tricuspidValve: { peakTRVel: '2.9', estRVSP: '' },
                    mrQuant: { mrPisaRadius: '1.1', mrEROA: '0.5', mrRegVol: '65', mrVenaContracta: '0.8' },
                },
                leftVentricle: { lvSize: 'Moderately dilated / Giãn vừa', lvWallThickness: 'Normal / Bình thường', lvSystolicFuncQual: 'Normal / Bình thường', gls: '-17', rwma: 'None. / Không.' },
                lvDiastolicFunction: { diastolicGrade: 'Indeterminate / Không xác định', laPressureEst: 'Elevated / Tăng' },
                rightVentricle: { rvSize: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Severely dilated / Giãn nặng', raSizeVolume: 'Mildly dilated / Giãn nhẹ' },
                aorticValve: { asGrade: 'None / Không', arGrade: 'None/Trivial / Không/Không đáng kể' },
                mitralValve: { mvMorphology: 'Mitral Valve Prolapse (MVP) of the posterior leaflet (P2 segment). / Sa van hai lá (MVP) lá sau (mảnh P2).', msGrade: 'None / Không', mrGrade: 'Severe (4+) / Nặng (4+)', mrDescription: 'Eccentric jet directed anteriorly, swirling in the left atrium. Vena contracta 0.8 cm. EROA 0.5 cm². Regurgitant Volume 65 ml. Systolic flow reversal in pulmonary veins. / Dòng hở lệch tâm hướng ra trước, xoáy trong nhĩ trái. Vena contracta 0.8 cm. EROA 0.5 cm². Thể tích dòng hở 65 ml. Đảo ngược dòng tâm thu ở tĩnh mạch phổi.' },
                tricuspidValve: { trGrade: 'Mild (1+) / Nhẹ (1+)' },
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Severe mitral regurgitation due to posterior mitral valve leaflet prolapse (P2 segment flail suspected). Severe left atrial enlargement. Moderate left ventricular enlargement with preserved systolic function. Evidence of elevated left atrial pressure and moderate pulmonary hypertension (estimated PASP [X] mmHg). Quantitative assessment confirms severe MR (EROA 0.5 cm², RV 65 ml). / Hở van hai lá nặng do sa lá sau van hai lá (nghi ngờ sa lật mảnh P2). Giãn nhĩ trái nặng. Giãn thất trái vừa, chức năng tâm thu bảo tồn. Bằng chứng tăng áp lực nhĩ trái và tăng áp động mạch phổi mức độ vừa (PASP ước tính [X] mmHg). Đánh giá định lượng xác nhận hở hai lá nặng (EROA 0.5 cm², RV 65 ml).',
                recommendation: 'Clinical correlation. Cardiology consultation recommended. Consider surgical evaluation for mitral valve repair/replacement. / Đề nghị tương quan lâm sàng. Đề nghị hội chẩn Tim mạch. Cân nhắc đánh giá phẫu thuật sửa/thay van hai lá.'
            }
        }
    },
    // 6. Moderate Pericardial Effusion (Existing)
    {
        name: "Moderate Pericardial Effusion / Tràn dịch màng ngoài tim vừa",
        data: { // ... (data same as previous version) ... 
            echo: {
                clinicalInfo: { heartRate: '90', bloodPressure: '100/70', studyQuality: 'Adequate / Đủ tốt' },
                measurements2D: { lvidD: '47', lvidS: '31', ivsD: '8', lvpwD: '8', laVolIndex: '25', rvFac: '40', tapse: '18', ivcDiam: '15', ivcCollapse: '75', ef: '' },
                measurementsMMode: {},
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '0.7', mvPeakA: '0.5', eaRatio: '', decelTime: '170', ivrt: '75' },
                    tdi: { tdiSeptalE: '8', tdiLateralE: '10' },
                    tricuspidValve: { peakTRVel: '2.1', estRVSP: '' },
                },
                leftVentricle: { lvSize: 'Normal / Bình thường', lvWallThickness: 'Normal / Bình thường', lvSystolicFuncQual: 'Normal / Bình thường', rwma: 'None. / Không.' },
                lvDiastolicFunction: { diastolicGrade: 'Normal / Bình thường', laPressureEst: 'Normal / Bình thường' },
                rightVentricle: { rvSize: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Normal / Bình thường', raSizeVolume: 'Normal / Bình thường' },
                aorticValve: { asGrade: 'None / Không', arGrade: 'None/Trivial / Không/Không đáng kể' },
                mitralValve: { msGrade: 'None / Không', mrGrade: 'None/Trivial / Không/Không đáng kể' },
                tricuspidValve: { tsGrade: 'None / Không', trGrade: 'None/Trivial / Không/Không đáng kể' },
                pericardium: { pericardiumAppearance: 'Normal / Bình thường', pericardialEffusion: 'Moderate / Vừa', effusionDescription: 'Circumferential pericardial effusion, measuring up to 15 mm posteriorly. No definite echocardiographic signs of tamponade physiology (no significant chamber collapse, normal respiratory variation). / Tràn dịch màng ngoài tim lượng vừa, lan tỏa, lớp dịch lớn nhất 15 mm ở phía sau. Không có dấu hiệu siêu âm rõ ràng của chèn ép tim (không đè sụp buồng tim đáng kể, biến thiên dòng chảy qua van theo hô hấp bình thường).' },
                impression: 'Moderate circumferential pericardial effusion. No echocardiographic evidence of cardiac tamponade. Normal chamber sizes and function. / Tràn dịch màng ngoài tim lượng vừa, lan tỏa. Không có bằng chứng siêu âm về chèn ép tim. Kích thước và chức năng các buồng tim bình thường.',
                recommendation: 'Clinical correlation to determine etiology of effusion. Follow-up echocardiogram recommended to assess stability. / Đề nghị tương quan lâm sàng để xác định nguyên nhân tràn dịch. Đề nghị siêu âm tim kiểm tra để đánh giá sự ổn định.'
            }
        }
    },
    // 7. RV Strain Pattern (Suggestive of PE) (Existing)
    {
        name: "RV Strain Pattern (Suggestive of PE) / Dấu hiệu căng giãn TP (Gợi ý thuyên tắc phổi)",
        data: { // ... (data same as previous version) ... 
            echo: {
                clinicalInfo: { heartRate: '110', bloodPressure: '105/65', studyQuality: 'Adequate / Đủ tốt', indications: 'Acute shortness of breath / Khó thở cấp' },
                measurements2D: { lvidD: '46', lvidS: '30', ivsD: '9', lvpwD: '9', laVolIndex: '26', rvDiam: '48', rvFac: '25', tapse: '12', ivcDiam: '23', ivcCollapse: '30', ef: '', },
                measurementsMMode: {},
                measurementsDoppler: {
                    mitralInflow: {},
                    tdi: { tdiRvS: '7' },
                    tricuspidValve: { peakTRVel: '3.5', estRVSP: '' },
                },
                leftVentricle: { lvSize: 'Normal / Bình thường', lvWallThickness: 'Normal / Bình thường', lvSystolicFuncQual: 'Normal / Bình thường', rwma: 'Paradoxical septal motion noted. / Ghi nhận VLT di động nghịch thường.' },
                lvDiastolicFunction: { diastolicGrade: 'Normal / Bình thường', laPressureEst: 'Normal / Bình thường' },
                rightVentricle: { rvSize: 'Severely dilated / Giãn nặng', rvWallThickness: 'Normal / Bình thường', rvSystolicFuncQual: 'Moderately reduced / Giảm vừa' },
                atria: { laSizeVolume: 'Normal / Bình thường', raSizeVolume: 'Severely dilated / Giãn nặng' },
                aorticValve: {}, mitralValve: {},
                tricuspidValve: { trGrade: 'Moderate (2+) / Vừa (2+)' },
                pulmonicValve: { prGrade: 'Mild (1+) / Nhẹ (1+)' },
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Severe right ventricular dilatation and moderately reduced systolic function (TAPSE 12 mm, RV FAC 25%). Severe right atrial enlargement. Flattening of the interventricular septum suggestive of RV pressure overload. Estimated PASP is significantly elevated at [X] mmHg. Findings are concerning for acute right heart strain, potentially due to pulmonary embolism. McConnell\'s sign (apical sparing of RV free wall) may be present [confirm visually]. / Giãn thất phải nặng và chức năng tâm thu giảm vừa (TAPSE 12 mm, RV FAC 25%). Giãn nhĩ phải nặng. Vách liên thất phẳng gợi ý quá tải áp lực thất phải. PASP ước tính tăng đáng kể [X] mmHg. Các dấu hiệu đáng lo ngại về căng giãn tim phải cấp, có thể do thuyên tắc phổi. Có thể có dấu hiệu McConnell (vận động thành tự do vùng mỏm thất phải bình thường) [xác nhận bằng mắt].',
                recommendation: 'Urgent clinical correlation. Recommend CT pulmonary angiography (CTPA) to evaluate for pulmonary embolism based on these findings. / Tương quan lâm sàng khẩn cấp. Đề nghị chụp CT mạch máu phổi (CTPA) để đánh giá thuyên tắc phổi dựa trên các dấu hiệu này.'
            }
        }
    },
    // 8. Hypertrophic Cardiomyopathy (HCM) (Existing)
    {
        name: "Hypertrophic Cardiomyopathy (ASH, no obstruction) / Bệnh cơ tim phì đại (VLT không đối xứng, không tắc nghẽn)",
        data: { // ... (data same as previous version) ... 
             echo: {
                clinicalInfo: { heartRate: '60', bloodPressure: '125/85', studyQuality: 'Good / Tốt' },
                measurements2D: { lvidD: '44', lvidS: '26', ivsD: '20', lvpwD: '10', lvMass: '', lvMassIndex: '', rwt: '', laVolIndex: '38', ef: '', },
                measurementsMMode: { epss: '3' },
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '0.5', mvPeakA: '0.8', eaRatio: '', decelTime: '260', ivrt: '120' },
                    tdi: { tdiSeptalE: '4', tdiLateralE: '6', tdiAvgE: '', e_ePrimeAvg: ''},
                    lvotCalculations: { lvotDiam: '2.0', lvotVTI: '22' },
                    aorticValve: { avPeakVel: '1.0' },
                    mitralValve: {},
                    tricuspidValve: { peakTRVel: '2.3', estRVSP: '' },
                },
                leftVentricle: { lvSize: 'Normal / Bình thường', lvWallThickness: 'Severe asymmetric septal hypertrophy / Phì đại vách liên thất không đối xứng nặng', lvSystolicFuncQual: 'Hyperdynamic / Tăng động', gls: '-14', rwma: 'None. / Không.' },
                lvDiastolicFunction: { diastolicGrade: 'Grade I (Impaired Relaxation) / Độ I (RL Thư giãn)', laPressureEst: 'Normal / Bình thường' },
                rightVentricle: { rvSize: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Moderately dilated / Giãn vừa', raSizeVolume: 'Normal / Bình thường' },
                aorticValve: {},
                mitralValve: { mvMorphology: 'Anterior mitral leaflet appears elongated. No significant systolic anterior motion (SAM) at rest. / Lá trước van hai lá có vẻ dài. Không có di động ra trước thì tâm thu (SAM) đáng kể lúc nghỉ.', mrGrade: 'Mild (1+) / Nhẹ (1+)' },
                tricuspidValve: {},
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Severe asymmetric septal hypertrophy (maximal wall thickness 20 mm) consistent with hypertrophic cardiomyopathy (HCM). Normal left ventricular cavity size. Hyperdynamic LV systolic function (EF estimated [X]%). Mild mitral regurgitation. Moderate left atrial enlargement. Evidence of diastolic dysfunction. No significant LV outflow tract obstruction at rest. / Phì đại vách liên thất không đối xứng nặng (bề dày thành tối đa 20 mm) phù hợp với bệnh cơ tim phì đại (HCM). Kích thước buồng thất trái bình thường. Chức năng tâm thu thất trái tăng động (EF ước tính [X]%). Hở hai lá nhẹ. Giãn nhĩ trái vừa. Bằng chứng rối loạn chức năng tâm trương. Không có tắc nghẽn đường ra thất trái đáng kể lúc nghỉ.',
                recommendation: 'Clinical correlation and cardiology consultation recommended. Consider provocative maneuvers (Valsalva) if obstruction suspected clinically. Family screening may be indicated. / Đề nghị tương quan lâm sàng và hội chẩn Tim mạch. Cân nhắc nghiệm pháp gắng sức (Valsalva) nếu nghi ngờ tắc nghẽn trên lâm sàng. Có thể cần tầm soát gia đình.'
            }
        }
    },
    // 9. Rheumatic Mitral Stenosis (Severe) (Existing)
    {
        name: "Severe Rheumatic Mitral Stenosis / Hẹp van Hai lá nặng do thấp",
        data: { // ... (data same as previous version) ... 
            echo: {
                clinicalInfo: { heartRate: '80', bloodPressure: '110/80', studyQuality: 'Adequate / Đủ tốt' },
                measurements2D: { lvidD: '45', lvidS: '28', laDiamPS: '55', laVolIndex: '55', rvDiam: '42', rvFac: '35', tapse: '15', ivcDiam: '21', ivcCollapse: '40', ef: '', },
                measurementsMMode: {},
                measurementsDoppler: {
                    mitralInflow: { mvPeakE: '1.8', mvPeakA: '0.4', eaRatio: '', decelTime: '300', ivrt: '90' },
                    tdi: { tdiSeptalE: '5', tdiLateralE: '7' },
                    lvotCalculations: { lvotDiam: '2.0', lvotVTI: '18' },
                    aorticValve: {},
                    mitralValve: { mvPeakVel: '2.2', mvPeakGrad: '', mvMeanGrad: '12', mvPHT: '250', mvaPHT: '' },
                    tricuspidValve: { peakTRVel: '3.4', estRVSP: '' },
                },
                leftVentricle: { lvSize: 'Normal / Bình thường', lvWallThickness: 'Normal / Bình thường', lvSystolicFuncQual: 'Normal / Bình thường', rwma: 'None. / Không.' },
                lvDiastolicFunction: {},
                rightVentricle: { rvSize: 'Moderately dilated / Giãn vừa', rvSystolicFuncQual: 'Mildly reduced / Giảm nhẹ' },
                atria: { laSizeVolume: 'Severely dilated / Giãn nặng', raSizeVolume: 'Moderately dilated / Giãn vừa' },
                aorticValve: {},
                mitralValve: { mvMorphology: 'Thickened, calcified, and restricted mitral valve leaflets with diastolic doming of the anterior leaflet. Reduced mobility of the posterior leaflet. Subvalvular apparatus appears thickened. (Typical rheumatic changes) / Lá van hai lá dày, vôi hóa, hạn chế di động với lá trước hình vòm thì tâm trương. Lá sau di động giảm. Bộ máy dưới van có vẻ dày. (Thay đổi điển hình dạng thấp).', msGrade: 'Severe / Nặng', mrGrade: 'Mild (1+) / Nhẹ (1+)' },
                tricuspidValve: { trGrade: 'Moderate (2+) / Vừa (2+)' },
                pulmonicValve: {},
                pericardium: { pericardialEffusion: 'None / Không' },
                impression: 'Severe rheumatic mitral stenosis (Mean gradient 12 mmHg, MVA by PHT calculated: [X] cm²). Severe left atrial enlargement. Moderate right ventricular and right atrial enlargement. Moderate pulmonary hypertension (estimated PASP [Y] mmHg). Normal LV size and systolic function. / Hẹp van hai lá nặng do thấp (Chênh áp trung bình 12 mmHg, MVA qua PHT tính toán: [X] cm²). Giãn nhĩ trái nặng. Giãn thất phải và nhĩ phải vừa. Tăng áp động mạch phổi mức độ vừa (PASP ước tính [Y] mmHg). Kích thước và chức năng tâm thu thất trái bình thường.',
                recommendation: 'Cardiology consultation recommended. Evaluation for potential intervention (balloon valvuloplasty or valve replacement) is indicated. / Đề nghị hội chẩn Tim mạch. Chỉ định đánh giá khả năng can thiệp (nong van bằng bóng hoặc thay van).'
            }
        }
    },
    // --- NEW CONGENITAL PRESETS ---
    // 10. ASD (Secundum, Moderate Size) (NEW)
    {
        name: "ASD (Secundum, Moderate Size) / Thông liên nhĩ (Lỗ thứ phát, Kích thước vừa)",
        data: {
            echo: {
                clinicalInfo: { heartRate: '75', bloodPressure: '115/70', studyQuality: 'Good / Tốt' },
                measurements2D: {
                    lvidD: '47', lvidS: '30', // LV usually normal
                    rvDiam: '45', // RV Dilated
                    rvFac: '42', tapse: '22', // RV function often normal initially
                    ivcDiam: '16', ivcCollapse: '80', // Normal IVC/RAP usually
                    ef: '',
                },
                measurementsMMode: {},
                measurementsDoppler: {
                    mitralInflow: {}, tdi: { tdiRvS: '13' },
                    tricuspidValve: { peakTRVel: '2.8', estRVSP: '' }, // Mild elevation PASP possible
                    // Qp/Qs calculation would typically be done but not a direct form input
                },
                leftVentricle: { lvSize: 'Normal / Bình thường', lvSystolicFuncQual: 'Normal / Bình thường', rwma: 'Paradoxical septal motion noted, consistent with RV volume overload. / Ghi nhận VLT di động nghịch thường, phù hợp với quá tải thể tích thất phải.' },
                lvDiastolicFunction: {},
                rightVentricle: {
                    rvSize: 'Moderately dilated / Giãn vừa', // Key finding
                    rvWallThickness: 'Normal / Bình thường',
                    rvSystolicFuncQual: 'Normal / Bình thường' // Key finding
                },
                atria: { laSizeVolume: 'Normal / Bình thường', raSizeVolume: 'Severely dilated / Giãn nặng' }, // Key finding
                aorticValve: {}, mitralValve: {}, tricuspidValve: { trGrade: 'Mild (1+) / Nhẹ (1+)' }, pulmonicValve: {},
                pericardium: { pericardialEffusion: 'None / Không' },
                congenitalFindings: {
                    congenitalDesc: 'Secundum Atrial Septal Defect (ASD) identified, measuring approximately 15 mm by color Doppler. Evidence of left-to-right shunting across the defect. No sinus venosus or primum defect seen. / Ghi nhận Thông liên nhĩ (ASD) lỗ thứ phát, kích thước khoảng 15 mm trên Doppler màu. Bằng chứng shunt Trái-Phải qua lỗ thông. Không thấy TLN thể xoang tĩnh mạch hay lỗ nguyên phát.' // Key finding
                },
                impression: 'Moderate sized secundum atrial septal defect (approx. 15 mm) with left-to-right shunt causing significant right atrial and right ventricular dilatation. Normal LV size and function. Paradoxical septal motion noted. Mild pulmonary hypertension (estimated PASP [X] mmHg). / Thông liên nhĩ lỗ thứ phát kích thước vừa (khoảng 15 mm) với shunt Trái-Phải gây giãn nhĩ phải và thất phải đáng kể. Kích thước và chức năng thất trái bình thường. Ghi nhận VLT di động nghịch thường. Tăng áp động mạch phổi nhẹ (PASP ước tính [X] mmHg).',
                recommendation: 'Cardiology consultation recommended for consideration of ASD closure. / Đề nghị hội chẩn Tim mạch để cân nhắc đóng lỗ thông liên nhĩ.'
            }
        }
    },
    // 11. VSD (Small Restrictive Membranous) (NEW)
    {
        name: "VSD (Small Restrictive Membranous) / Thông liên thất (Màng, Nhỏ, Hạn chế)",
        data: {
            echo: {
                clinicalInfo: { heartRate: '80', bloodPressure: '120/75', studyQuality: 'Good / Tốt' },
                measurements2D: { // Chambers usually normal size with small restrictive VSD
                    lvidD: '49', lvidS: '31', ivsD: '9', lvpwD: '9', laVolIndex: '27', rvDiam: '34', rvFac: '46', tapse: '21', ef: ''
                },
                measurementsMMode: {},
                measurementsDoppler: { // Doppler focused on VSD jet
                    mitralInflow: {}, tdi: {}, lvotCalculations: {}, aorticValve: {}, mitralValve: {},
                    tricuspidValve: { peakTRVel: '2.0', estRVSP: '' }, // Usually normal PASP
                    // VSD jet velocity would be high but isn't a standard field here
                },
                leftVentricle: { lvSize: 'Normal / Bình thường', lvSystolicFuncQual: 'Normal / Bình thường', rwma: 'None. / Không.' },
                lvDiastolicFunction: {},
                rightVentricle: { rvSize: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Normal / Bình thường', raSizeVolume: 'Normal / Bình thường' },
                aorticValve: {}, mitralValve: {}, tricuspidValve: {}, pulmonicValve: {},
                pericardium: { pericardialEffusion: 'None / Không' },
                congenitalFindings: {
                    congenitalDesc: 'Small membranous Ventricular Septal Defect (VSD) identified just below the aortic valve. High-velocity, turbulent left-to-right shunt demonstrated by color and spectral Doppler (estimated gradient suggests restrictive defect). Estimated size ~3-4 mm. / Ghi nhận Thông liên thất (VSD) phần màng kích thước nhỏ ngay dưới van ĐMC. Doppler màu và phổ thấy shunt Trái-Phải vận tốc cao, dòng rối (chênh áp ước tính gợi ý lỗ thông hạn chế). Kích thước ước tính ~3-4 mm.' // Key finding
                },
                impression: 'Small restrictive membranous ventricular septal defect (~3-4 mm) with high-velocity left-to-right shunt. Normal chamber sizes and function. No significant pulmonary hypertension. / Thông liên thất phần màng nhỏ, hạn chế (~3-4 mm) với shunt Trái-Phải vận tốc cao. Kích thước và chức năng các buồng tim bình thường. Không có tăng áp động mạch phổi đáng kể.',
                recommendation: 'Clinical correlation. Recommend periodic follow-up echocardiography. Endocarditis prophylaxis discussion may be warranted. / Đề nghị tương quan lâm sàng. Đề nghị siêu âm tim theo dõi định kỳ. Có thể cần thảo luận về dự phòng viêm nội tâm mạc.'
            }
        }
    },
    // 12. Bicuspid Aortic Valve (No Sig. AS/AR) (NEW)
    {
        name: "Bicuspid Aortic Valve (No AS/AR) / Van ĐMC Hai lá van (Không hẹp/hở đáng kể)",
        data: {
            echo: {
                clinicalInfo: { heartRate: '68', bloodPressure: '122/78', studyQuality: 'Good / Tốt' },
                measurements2D: {
                    lvidD: '50', lvidS: '31', ivsD: '10', lvpwD: '10', // LV usually normal unless aortopathy/other issues
                    aoRootDiam: '36', // Check for dilatation
                    ascAoDiam: '38', // Check for dilatation
                    ef: '',
                },
                measurementsMMode: {},
                measurementsDoppler: {
                    mitralInflow: {}, tdi: {}, lvotCalculations: {},
                    aorticValve: { avPeakVel: '1.5', avMeanGrad: '5' }, // Velocities often slightly higher but not stenotic
                    mitralValve: {}, tricuspidValve: { peakTRVel: '2.1', estRVSP: '' },
                },
                leftVentricle: { lvSize: 'Normal / Bình thường', lvSystolicFuncQual: 'Normal / Bình thường', rwma: 'None. / Không.' },
                lvDiastolicFunction: {},
                rightVentricle: { rvSize: 'Normal / Bình thường', rvSystolicFuncQual: 'Normal / Bình thường' },
                atria: { laSizeVolume: 'Normal / Bình thường', raSizeVolume: 'Normal / Bình thường' },
                aorticValve: {
                    avMorphology: 'Bicuspid aortic valve identified (fusion of right and left coronary cusps - Type 1). Mild leaflet thickening without significant restriction. No significant stenosis or regurgitation. / Ghi nhận van ĐMC hai lá van (dính mép van Vành Phải và Vành Trái - Type 1). Dày nhẹ lá van, không hạn chế đáng kể. Không hẹp hay hở van đáng kể.', // Key finding
                    asGrade: 'None / Không',
                    arGrade: 'Trivial / Không đáng kể' // Mild AR is common
                },
                mitralValve: {}, tricuspidValve: {}, pulmonicValve: {},
                pericardium: { pericardialEffusion: 'None / Không' },
                congenitalFindings: { congenitalDesc: 'Bicuspid aortic valve noted (see valve description). / Ghi nhận van ĐMC hai lá van (xem mô tả van).' },
                aortaGreatVessels: { aorticArchDesc: 'Aortic root (36 mm) and ascending aorta (38 mm) are mildly dilated. / Gốc ĐMC (36 mm) và ĐMC lên (38 mm) giãn nhẹ.' }, // Important association
                impression: 'Bicuspid aortic valve (Type 1) without hemodynamically significant stenosis or regurgitation. Mild dilatation of the aortic root and ascending aorta. Normal LV size and function. / Van động mạch chủ hai lá van (Type 1) không có hẹp hay hở van đáng kể về mặt huyết động. Giãn nhẹ gốc động mạch chủ và động mạch chủ lên. Kích thước và chức năng thất trái bình thường.',
                recommendation: 'Recommend periodic echocardiographic follow-up (e.g., every 1-2 years) to monitor valve function and aortic dimensions. Cardiology consultation recommended. / Đề nghị theo dõi bằng siêu âm tim định kỳ (ví dụ: mỗi 1-2 năm) để theo dõi chức năng van và kích thước động mạch chủ. Đề nghị hội chẩn Tim mạch.'
            }
        }
    },

]; // End of echoPresets array

console.log("echo-presets.js loaded with expanded presets including congenital.");