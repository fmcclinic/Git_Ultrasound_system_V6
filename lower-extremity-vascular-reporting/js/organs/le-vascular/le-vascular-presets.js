// js/organs/le-vascular/le-vascular-presets.js
// Defines preset data templates for common Lower Extremity Vascular findings.
// Data structure MUST match the object structure returned by collectLEVascularData in le-vascular-module.js

const defaultArterialSegment = { psv: '', edv: '', waveform: '', desc: '' };
const defaultVenousSegment = { compress: '', doppler: '', thrombus: '' };
const normalArterialWaveform = 'Triphasic / 3 pha';
const normalVenousCompress = 'Complete / Hoàn toàn';
const normalVenousDoppler = 'Spontaneous/Phasic/Augmentable / Tự nhiên/Theo nhịp thở/Tăng khi làm NP';
const normalCalfVenousDoppler = 'Phasic/Augmentable / Theo nhịp thở/Tăng khi làm NP'; // Calf veins might not be spontaneous
const normalSuperficialDoppler = 'Present / Có'; // For GSV/SSV

const createEmptyLegArterial = () => ({
    cfa: { ...defaultArterialSegment }, pfa: { ...defaultArterialSegment }, sfaprox: { ...defaultArterialSegment },
    sfamid: { ...defaultArterialSegment }, sfadist: { ...defaultArterialSegment }, popa: { ...defaultArterialSegment },
    ata: { ...defaultArterialSegment }, pta: { ...defaultArterialSegment }, peroa: { ...defaultArterialSegment },
    dpa: { ...defaultArterialSegment }
});

const createEmptyLegVenous = () => ({
    cfv: { ...defaultVenousSegment }, fvprox: { ...defaultVenousSegment }, fvmid: { ...defaultVenousSegment },
    fvdist: { ...defaultVenousSegment }, pfv: { ...defaultVenousSegment, compress: 'Not Assessed / Không đánh giá', doppler: 'Not Assessed / Không đánh giá' }, // Default PFV state
    popv: { ...defaultVenousSegment }, ptv: { ...defaultVenousSegment }, perov: { ...defaultVenousSegment },
    gastroc: { ...defaultVenousSegment, compress: 'Not Assessed / Không đánh giá', doppler: '' }, // Default Gastroc state
    soleal: { ...defaultVenousSegment, compress: 'Not Assessed / Không đánh giá', doppler: '' }, // Default Soleal state
    gsvak: { ...defaultVenousSegment }, gsvbk: { ...defaultVenousSegment }, ssv: { ...defaultVenousSegment }
});

export const leVascularPresets = [
    // 1. Normal Arterial Study
    {
        name: "Normal Arterial / Động mạch Bình thường",
        data: {
            leVascular: {
                arterial: {
                    abi: { rightDpPressure: '140', rightPtPressure: '145', rightBrachialPressure: '130', rightAbiValue: '1.12', leftDpPressure: '142', leftPtPressure: '140', leftBrachialPressure: '130', leftAbiValue: '1.09' },
                    right: {
                        cfa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        pfa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        sfaprox: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        sfamid: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        sfadist: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        popa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        ata: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Patent vessel with triphasic flow. / Mạch máu thông thoáng, dòng chảy 3 pha.' },
                        pta: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Patent vessel with triphasic flow. / Mạch máu thông thoáng, dòng chảy 3 pha.' },
                        peroa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Patent vessel with triphasic flow. / Mạch máu thông thoáng, dòng chảy 3 pha.' },
                        dpa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Patent vessel with triphasic flow. / Mạch máu thông thoáng, dòng chảy 3 pha.' }
                    },
                    left: { // Symmetric normal findings
                        cfa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        pfa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        sfaprox: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        sfamid: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        sfadist: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        popa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'No significant plaque or stenosis. / Không có mảng xơ vữa hay hẹp đáng kể.' },
                        ata: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Patent vessel with triphasic flow. / Mạch máu thông thoáng, dòng chảy 3 pha.' },
                        pta: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Patent vessel with triphasic flow. / Mạch máu thông thoáng, dòng chảy 3 pha.' },
                        peroa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Patent vessel with triphasic flow. / Mạch máu thông thoáng, dòng chảy 3 pha.' },
                        dpa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Patent vessel with triphasic flow. / Mạch máu thông thoáng, dòng chảy 3 pha.' }
                    }
                },
                venous: { // Empty venous section
                    reflux: [],
                    right: createEmptyLegVenous(),
                    left: createEmptyLegVenous()
                },
                impression: 'Normal lower extremity arterial duplex examination bilaterally. ABIs are within normal limits. / Siêu âm Doppler động mạch chi dưới hai bên bình thường. Chỉ số ABI trong giới hạn bình thường.',
                recommendation: 'Clinical correlation recommended. / Đề nghị tương quan lâm sàng.'
            }
        }
    },
    // 2. Normal Venous Study (No DVT / No Reflux)
    {
        name: "Normal Venous / Tĩnh mạch Bình thường (No DVT/Reflux)",
        data: {
            leVascular: {
                arterial: { // Empty arterial section
                    abi: {},
                    right: createEmptyLegArterial(),
                    left: createEmptyLegArterial()
                },
                venous: {
                    reflux: [], // No reflux entries
                    right: {
                        cfv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        fvprox: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        fvmid: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        fvdist: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        pfv: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn', doppler: 'Present / Có', thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' }, // Assuming assessed normal
                        popv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        ptv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        perov: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        gastroc: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn', thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        soleal: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn', thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        gsvak: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler, thrombus: 'Patent vein. No thrombus. / Tĩnh mạch thông thoáng. Không huyết khối.' },
                        gsvbk: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler, thrombus: 'Patent vein. No thrombus. / Tĩnh mạch thông thoáng. Không huyết khối.' },
                        ssv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler, thrombus: 'Patent vein. No thrombus. / Tĩnh mạch thông thoáng. Không huyết khối.' }
                    },
                    left: { // Symmetric normal findings
                        cfv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        fvprox: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        fvmid: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        fvdist: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        pfv: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn', doppler: 'Present / Có', thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        popv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        ptv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        perov: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler, thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        gastroc: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn', thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        soleal: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn', thrombus: 'No evidence of thrombus. / Không có bằng chứng huyết khối.' },
                        gsvak: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler, thrombus: 'Patent vein. No thrombus. / Tĩnh mạch thông thoáng. Không huyết khối.' },
                        gsvbk: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler, thrombus: 'Patent vein. No thrombus. / Tĩnh mạch thông thoáng. Không huyết khối.' },
                        ssv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler, thrombus: 'Patent vein. No thrombus. / Tĩnh mạch thông thoáng. Không huyết khối.' }
                    }
                },
                impression: 'Normal lower extremity venous duplex examination bilaterally. No evidence of deep or superficial vein thrombosis. No significant venous reflux detected. / Siêu âm Doppler tĩnh mạch chi dưới hai bên bình thường. Không có bằng chứng huyết khối tĩnh mạch sâu hoặc nông. Không phát hiện trào ngược tĩnh mạch đáng kể.',
                recommendation: 'Clinical correlation recommended. / Đề nghị tương quan lâm sàng.'
            }
        }
    },
    // 3. Mild PAD
     {
        name: "Mild PAD / BĐMNB Nhẹ",
        data: {
            leVascular: {
                arterial: {
                    abi: { rightDpPressure: '130', rightPtPressure: '125', rightBrachialPressure: '135', rightAbiValue: '0.96', leftDpPressure: '128', leftPtPressure: '132', leftBrachialPressure: '135', leftAbiValue: '0.98' },
                    right: {
                        cfa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Minimal intimal thickening. / Dày nhẹ lớp nội mạc.' },
                        pfa: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                        sfaprox: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Minimal calcified plaque <30% stenosis. / Ít mảng xơ vữa vôi hóa <30% hẹp.' },
                        sfamid: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                        sfadist: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' }, // Changed waveform
                        popa: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' },
                        ata: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' },
                        pta: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' },
                        peroa: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' },
                        dpa: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' }
                    },
                    left: { // Similar mild findings left
                         cfa: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Minimal intimal thickening. / Dày nhẹ lớp nội mạc.' },
                         pfa: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                         sfaprox: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                         sfamid: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Minimal plaque <30% stenosis. / Ít mảng xơ vữa <30% hẹp.' },
                         sfadist: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                         popa: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' },
                         ata: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' },
                         pta: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' },
                         peroa: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' },
                         dpa: { ...defaultArterialSegment, waveform: 'Biphasic / 2 pha' }
                    }
                },
                venous: { reflux: [], right: createEmptyLegVenous(), left: createEmptyLegVenous() },
                impression: 'Mild peripheral artery disease (PAD) bilaterally. Findings include minimal plaque disease and biphasic waveforms in the distal arteries. ABIs are borderline/low normal. / Bệnh động mạch ngoại biên (BĐMNB) độ nhẹ hai bên. Ghi nhận bệnh lý mảng xơ vữa tối thiểu và dạng sóng 2 pha ở các động mạch xa. Chỉ số ABI giới hạn/bình thường thấp.',
                recommendation: 'Clinical correlation recommended. Risk factor modification for PAD. / Đề nghị tương quan lâm sàng. Điều chỉnh yếu tố nguy cơ BĐMNB.'
            }
        }
    },
    // 4. Moderate PAD (Example: Right SFA stenosis)
     {
        name: "Moderate PAD (R SFA Stenosis) / BĐMNB Vừa (Hẹp ĐMĐN P)",
        data: {
            leVascular: {
                arterial: {
                    abi: { rightDpPressure: '90', rightPtPressure: '85', rightBrachialPressure: '140', rightAbiValue: '0.64', leftDpPressure: '135', leftPtPressure: '140', leftBrachialPressure: '140', leftAbiValue: '1.00' }, // Right ABI reduced
                    right: {
                        cfa: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                        pfa: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                        sfaprox: { ...defaultArterialSegment, waveform: normalArterialWaveform, desc: 'Calcified plaque <50%. / MXV vôi hóa <50%.' },
                        sfamid: { psv: '250', edv: '50', waveform: 'Monophasic (High Resistance) / 1 pha (Trở kháng cao)', desc: 'Heterogeneous plaque causing significant stenosis (estimated 50-69%). PSV ratio approx 2.5. / Mảng xơ vữa không đồng nhất gây hẹp đáng kể (ước lượng 50-69%). Tỷ lệ PSV khoảng 2.5.' }, // Stenosis here
                        sfadist: { ...defaultArterialSegment, waveform: 'Monophasic (Dampened) / 1 pha (Tù)' }, // Post-stenotic change
                        popa: { ...defaultArterialSegment, waveform: 'Monophasic (Dampened) / 1 pha (Tù)' },
                        ata: { ...defaultArterialSegment, waveform: 'Monophasic (Dampened) / 1 pha (Tù)' },
                        pta: { ...defaultArterialSegment, waveform: 'Monophasic (Dampened) / 1 pha (Tù)' },
                        peroa: { ...defaultArterialSegment, waveform: 'Monophasic (Dampened) / 1 pha (Tù)' },
                        dpa: { ...defaultArterialSegment, waveform: 'Monophasic (Dampened) / 1 pha (Tù)' }
                    },
                    left: { // Normal Left Leg
                         cfa: { ...defaultArterialSegment, waveform: normalArterialWaveform }, pfa: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                         sfaprox: { ...defaultArterialSegment, waveform: normalArterialWaveform }, sfamid: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                         sfadist: { ...defaultArterialSegment, waveform: normalArterialWaveform }, popa: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                         ata: { ...defaultArterialSegment, waveform: normalArterialWaveform }, pta: { ...defaultArterialSegment, waveform: normalArterialWaveform },
                         peroa: { ...defaultArterialSegment, waveform: normalArterialWaveform }, dpa: { ...defaultArterialSegment, waveform: normalArterialWaveform }
                    }
                },
                venous: { reflux: [], right: createEmptyLegVenous(), left: createEmptyLegVenous() },
                impression: 'Moderate peripheral artery disease (PAD) in the right lower extremity, characterized by a hemodynamically significant stenosis (50-69%) in the mid superficial femoral artery (SFA). Post-stenotic monophasic waveforms noted distally. Right ABI is moderately reduced. Left lower extremity arterial study is within normal limits. / Bệnh động mạch ngoại biên (BĐMNB) độ vừa ở chi dưới phải, đặc trưng bởi hẹp có ý nghĩa huyết động (50-69%) tại đoạn giữa động mạch đùi nông (SFA). Ghi nhận dạng sóng 1 pha sau hẹp ở đoạn xa. ABI phải giảm mức độ vừa. Khảo sát động mạch chi dưới trái trong giới hạn bình thường.',
                recommendation: 'Clinical correlation recommended. Consider further evaluation (CTA/MRA) or vascular consultation based on symptoms. Risk factor modification. / Đề nghị tương quan lâm sàng. Cân nhắc khảo sát thêm (CTA/MRA) hoặc hội chẩn mạch máu dựa trên triệu chứng. Điều chỉnh yếu tố nguy cơ.'
            }
        }
    },
    // 5. Acute DVT (Example: Right Fem-Pop)
     {
        name: "Acute DVT (R Fem-Pop) / HKTMS Cấp (TM Đùi-Khoeo P)",
        data: {
            leVascular: {
                arterial: { abi: {}, right: createEmptyLegArterial(), left: createEmptyLegArterial() }, // Empty arterial
                venous: {
                    reflux: [],
                    right: { // Affected leg
                        cfv: { compress: 'Non-compressible / Không xẹp', doppler: 'No signal / Không tín hiệu', thrombus: 'Acute, occlusive thrombus. Vessel may be distended. / Huyết khối cấp, gây tắc hoàn toàn. Lòng mạch có thể giãn.' },
                        fvprox: { compress: 'Non-compressible / Không xẹp', doppler: 'No signal / Không tín hiệu', thrombus: 'Acute, occlusive thrombus. / Huyết khối cấp, gây tắc hoàn toàn.' },
                        fvmid: { compress: 'Non-compressible / Không xẹp', doppler: 'No signal / Không tín hiệu', thrombus: 'Acute, occlusive thrombus. / Huyết khối cấp, gây tắc hoàn toàn.' },
                        fvdist: { compress: 'Non-compressible / Không xẹp', doppler: 'No signal / Không tín hiệu', thrombus: 'Acute, occlusive thrombus. / Huyết khối cấp, gây tắc hoàn toàn.' },
                        pfv: { ...defaultVenousSegment, compress: 'Not Assessed / Không đánh giá'}, // Often not assessed in acute DVT study unless specifically needed
                        popv: { compress: 'Non-compressible / Không xẹp', doppler: 'No signal / Không tín hiệu', thrombus: 'Acute, occlusive thrombus extending from FV. / Huyết khối cấp, gây tắc hoàn toàn lan từ TM đùi.' },
                        ptv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler }, // Assume calf veins patent
                        perov: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler },
                        gastroc: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' },
                        soleal: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' },
                        gsvak: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler },
                        gsvbk: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler },
                        ssv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler }
                    },
                    left: { // Normal Left Leg
                        cfv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler }, fvprox: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                        fvmid: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler }, fvdist: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                        pfv: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn', doppler: 'Present / Có' }, popv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                        ptv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler }, perov: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler },
                        gastroc: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' }, soleal: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' },
                        gsvak: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler }, gsvbk: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler },
                        ssv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler }
                    }
                },
                impression: 'Acute deep vein thrombosis (DVT) involving the right common femoral, femoral, and popliteal veins. These segments are non-compressible and demonstrate occlusive thrombus with absent Doppler signal. Visualized calf veins and superficial veins are patent bilaterally. Left lower extremity venous system is patent. / Huyết khối tĩnh mạch sâu (HKTMS) cấp tính tại tĩnh mạch đùi chung, đùi, và khoeo bên phải. Các đoạn này không đè xẹp và chứa huyết khối gây tắc hoàn toàn, không có tín hiệu Doppler. Các tĩnh mạch cẳng chân và tĩnh mạch nông khảo sát được thông thoáng hai bên. Hệ tĩnh mạch chi dưới trái thông thoáng.',
                recommendation: 'Recommend anticoagulation therapy. Clinical correlation. / Đề nghị điều trị kháng đông. Tương quan lâm sàng.'
            }
        }
    },
    // 6. Chronic DVT (Example: Left Fem-Pop)
     {
        name: "Chronic DVT (L Fem-Pop) / HKTMS Mạn (TM Đùi-Khoeo T)",
        data: {
            leVascular: {
                arterial: { abi: {}, right: createEmptyLegArterial(), left: createEmptyLegArterial() }, // Empty arterial
                venous: {
                    reflux: [],
                    right: { // Normal Right Leg
                         cfv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler }, fvprox: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                         fvmid: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler }, fvdist: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                         pfv: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn', doppler: 'Present / Có' }, popv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                         ptv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler }, perov: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler },
                         gastroc: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' }, soleal: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' },
                         gsvak: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler }, gsvbk: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler },
                         ssv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler }
                     },
                     left: { // Affected leg
                         cfv: { compress: 'Partial / Một phần', doppler: 'Continuous / Liên tục', thrombus: 'Chronic changes including wall thickening and partially occlusive echogenic thrombus. / Thay đổi mạn tính bao gồm dày thành và huyết khối hồi âm dày gây tắc một phần.' },
                         fvprox: { compress: 'Partial / Một phần', doppler: 'Continuous / Liên tục', thrombus: 'Chronic changes. / Thay đổi mạn tính.' },
                         fvmid: { compress: 'Non-compressible / Không xẹp', doppler: 'Continuous / Liên tục', thrombus: 'Chronic occlusive changes. Some collateral flow noted. / Thay đổi tắc nghẽn mạn tính. Ghi nhận dòng chảy bàng hệ.' },
                         fvdist: { compress: 'Partial / Một phần', doppler: 'Phasic/Augmentable / Theo nhịp thở/Tăng khi làm NP', thrombus: 'Chronic changes, partial recanalization. / Thay đổi mạn tính, tái thông một phần.' },
                         pfv: { ...defaultVenousSegment, compress: 'Not Assessed / Không đánh giá' },
                         popv: { compress: 'Partial / Một phần', doppler: 'Phasic/Augmentable / Theo nhịp thở/Tăng khi làm NP', thrombus: 'Chronic wall thickening. / Dày thành mạn tính.' },
                         ptv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler }, // Assume calf veins patent
                         perov: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler },
                         gastroc: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' },
                         soleal: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' },
                         gsvak: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler },
                         gsvbk: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler },
                         ssv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler }
                    }
                },
                impression: 'Chronic post-thrombotic changes involving the left common femoral, femoral, and popliteal veins, characterized by wall thickening, echogenic thrombus (partially occlusive in CFV/FV prox, occlusive in mid FV, partially recanalized in distal FV), and abnormal Doppler signals (continuous flow proximally). Right lower extremity venous system is patent. / Thay đổi sau huyết khối mạn tính tại tĩnh mạch đùi chung, đùi, và khoeo bên trái, đặc trưng bởi dày thành, huyết khối hồi âm dày (gây tắc một phần ở TMC/TMĐ gần, tắc hoàn toàn ở TMĐ giữa, tái thông một phần ở TMĐ xa), và tín hiệu Doppler bất thường (dòng chảy liên tục ở đoạn gần). Hệ tĩnh mạch chi dưới phải thông thoáng.',
                recommendation: 'Clinical correlation. Findings represent chronic DVT. / Tương quan lâm sàng. Các dấu hiệu thể hiện HKTMS mạn tính.'
            }
        }
    },
    // 7. Venous Insufficiency (Example: Right GSV Reflux)
     {
        name: "Venous Insufficiency (R GSV Reflux) / Suy tĩnh mạch (Trào ngược TMHL P)",
        data: {
            leVascular: {
                 arterial: { abi: {}, right: createEmptyLegArterial(), left: createEmptyLegArterial() }, // Empty arterial
                 venous: {
                     reflux: [ // Reflux entry
                         { veinName: 'Right GSV Below Knee / TMHL dưới gối phải', duration: '1.8', maneuver: 'Distal Compression / Ép xa' }
                     ],
                     right: { // Deep veins normal, GSV findings described here + reflux entry
                         cfv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler }, fvprox: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                         fvmid: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler }, fvdist: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                         pfv: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn', doppler: 'Present / Có' }, popv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                         ptv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler }, perov: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler },
                         gastroc: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' }, soleal: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' },
                         gsvak: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler, thrombus:'Patent. Diameter [X] mm. / Thông thoáng. ĐK [X] mm.' },
                         gsvbk: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler, thrombus:'Patent, dilated ([Y] mm). Significant reflux noted (see reflux section). / Thông thoáng, giãn ([Y] mm). Ghi nhận trào ngược đáng kể (xem phần trào ngược).' },
                         ssv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler }
                     },
                     left: { // Normal Left Leg
                         cfv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler }, fvprox: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                         fvmid: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler }, fvdist: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                         pfv: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn', doppler: 'Present / Có' }, popv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalVenousDoppler },
                         ptv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler }, perov: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalCalfVenousDoppler },
                         gastroc: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' }, soleal: { ...defaultVenousSegment, compress: 'Complete / Hoàn toàn' },
                         gsvak: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler }, gsvbk: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler },
                         ssv: { ...defaultVenousSegment, compress: normalVenousCompress, doppler: normalSuperficialDoppler }
                     }
                },
                impression: 'Significant venous reflux identified in the right great saphenous vein (GSV) below the knee (reflux duration 1.8 seconds). Deep venous system is patent bilaterally without evidence of DVT. Findings are consistent with superficial venous insufficiency on the right. / Ghi nhận trào ngược tĩnh mạch đáng kể tại tĩnh mạch hiển lớn (TMHL) dưới gối phải (thời gian trào ngược 1.8 giây). Hệ tĩnh mạch sâu thông thoáng hai bên, không có bằng chứng HKTMS. Các dấu hiệu phù hợp với suy tĩnh mạch nông bên phải.',
                recommendation: 'Clinical correlation. Consider treatment for venous insufficiency (e.g., compression stockings, further evaluation for ablation). / Tương quan lâm sàng. Cân nhắc điều trị suy tĩnh mạch (ví dụ: vớ áp lực, đánh giá thêm cho can thiệp nhiệt/đốt sóng).'
            }
        }
    },


]; // End of leVascularPresets array

console.log("le-vascular-presets.js loaded.");