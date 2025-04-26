// js/organs/obstetric/obstetric-presets.js
// Defines preset data templates for common Obstetric Ultrasound findings.
// Data structure MUST match the object structure returned by collectObstetricData in obstetric-module.js

// Helper function to create a default 'empty' anatomy structure
const createEmptyAnatomy = () => ({
    head: { status: '', desc: '' },
    face: { status: '', desc: '' },
    neck: { status: '', desc: '' },
    chest: { status: '', desc: '' },
    abdomen: { status: '', desc: '' },
    spine: { status: '', desc: '' },
    limbs: { status: '', desc: '' },
    genitalia: { status: '', desc: '' },
});

// Helper function to create a default 'normal' anatomy structure
const createNormalAnatomy = () => ({
    head: { status: 'Normal / Bình thường', desc: '' },
    face: { status: 'Normal / Bình thường', desc: '' },
    neck: { status: 'Normal / Bình thường', desc: '' },
    chest: { status: 'Normal / Bình thường', desc: '' },
    abdomen: { status: 'Normal / Bình thường', desc: '' },
    spine: { status: 'Normal / Bình thường', desc: '' },
    limbs: { status: 'Normal / Bình thường', desc: '' },
    // Genitalia status depends on visualization and determination
    genitalia: { status: 'Not Visualized / Không thấy rõ', desc: '' }, // Default to not seen clearly unless specified
});

// Helper function to create an empty biometry structure (for singleton)
const createEmptyBiometry = () => ({
    crl: '', bpd: '', hc: '', ac: '', fl: '', hl: '',
    efwMethod: '', efw: '', efwPercentile: '',
});

// Helper function for empty fetal wellbeing
const createEmptyWellbeing = () => ({
    bppTone: '', bppMovement: '', bppBreathing: '', bppFluid: '', bppScore: '',
    uaPi: '', uaRi: '', uaSd: '', uaEdf: '',
    mcaPi: '', mcaRi: '', mcaPsv: '', cpr: '',
});


export const obstetricPresets = [
    // 1. Normal 1st Trimester Dating Scan (~8 weeks)
    {
        name: "Normal 1st Trimester Dating Scan / SA Quý 1 Xác định tuổi thai Bình thường",
        data: {
            obstetric: {
                gestationalInfo: {
                    lmp: '', // User might fill this
                    gaLmp: '', // User might fill this
                    eddLmp: '', // User might fill this
                    // Example calculated values
                    gaUs: '8w2d',
                    eddUs: '', // JS should calculate based on CRL/GA
                    ultrasoundMethod: 'Transvaginal / Ngã âm đạo'
                },
                fetalBiometry: {
                    ...createEmptyBiometry(),
                    crl: '18', // Example CRL for 8w2d in mm
                },
                fetalAnatomy: { // Anatomy usually limited in early 1st tri
                    head: { status: 'Appears Normal / Có vẻ Bình thường', desc: '' },
                    face: { status: 'Not Assessed / Chưa đánh giá', desc: '' },
                    neck: { status: 'Normal NT / NT bình thường', desc: '' }, // Or Not Assessed if too early
                    chest: { status: 'Cardiac Activity Present / Có hoạt động tim', desc: '' },
                    abdomen: { status: 'Not Assessed / Chưa đánh giá', desc: '' },
                    spine: { status: 'Not Assessed / Chưa đánh giá', desc: '' },
                    limbs: { status: 'Limb buds present / Thấy mầm chi', desc: '' },
                    genitalia: { status: 'Not Assessed / Chưa đánh giá', desc: '' },
                },
                amnioticFluid: {
                    afi: '', sdp: '',
                    fluidAssessment: 'Normal / Bình thường'
                },
                placenta: {
                    location: '', // Often described generally, e.g., developing chorion frondosum
                    distanceOs: '', grade: '',
                    appearance: 'Developing placenta seen / Thấy bánh nhau đang phát triển.'
                },
                cervix: {
                    length: '', method: '',
                    appearance: 'Closed / Đóng' // Assumed unless TV done for this purpose
                },
                maternalStructures: {
                    uterus: 'Normal appearance / Hình dạng bình thường',
                    adnexa: 'Ovaries appear normal bilaterally. / Hai buồng trứng hình dạng bình thường.'
                },
                fetalWellbeing: createEmptyWellbeing(), // Not applicable
                impression: 'Single live intrauterine pregnancy at 8w2d by CRL measurement. / Một thai sống trong tử cung, tuổi thai 8 tuần 2 ngày theo số đo CRL.',
                recommendation: 'Routine obstetric follow-up. Recommend first trimester screening if desired. / Tái khám sản định kỳ. Đề nghị sàng lọc quý 1 nếu muốn.'
            }
        }
    },

    // 2. Normal 2nd Trimester Anatomy Scan (~20 weeks)
    {
        name: "Normal 2nd Trimester Anatomy Scan / Khảo sát Hình thái Quý 2 Bình thường",
        data: {
            obstetric: {
                gestationalInfo: {
                    lmp: '', // User might fill this
                    gaLmp: '20w1d', // Example
                    eddLmp: '', // User might fill this
                    gaUs: '20w0d', // Biometry might match closely or slightly differ
                    eddUs: '', // JS calculate
                    ultrasoundMethod: 'Transabdominal / Ngã bụng'
                },
                fetalBiometry: { // Example values for 20w0d
                    crl: '', // Not measured in 2nd tri
                    bpd: '47', hc: '175', ac: '150', fl: '33', hl: '31',
                    efwMethod: 'Hadlock (BPD,HC,AC,FL)',
                    efw: '330', // Example calculated EFW in g
                    efwPercentile: '55', // Example percentile
                },
                fetalAnatomy: createNormalAnatomy(), // Use helper for normal anatomy
                amnioticFluid: {
                    afi: '14.5', // Example AFI in cm
                    sdp: '',
                    fluidAssessment: 'Normal / Bình thường'
                },
                placenta: {
                    location: 'Posterior / Mặt sau',
                    distanceOs: '', // Empty if not low/previa
                    grade: 'I',
                    appearance: 'Homogeneous appearance. No retroplacental collection. / Cấu trúc đồng nhất. Không thấy tụ dịch sau nhau.'
                },
                cervix: {
                    length: '35', // Example length in mm
                    method: 'Transabdominal / Ngã bụng', // Assume TA unless TV indicated
                    appearance: 'Closed / Đóng'
                },
                maternalStructures: {
                    uterus: 'Normal gravid appearance. / Tử cung mang thai hình dạng bình thường.',
                    adnexa: 'Ovaries not well visualized due to uterine size. / Khó thấy rõ buồng trứng do tử cung to.'
                },
                fetalWellbeing: createEmptyWellbeing(), // BPP/Doppler usually not routine at anatomy scan
                impression: 'Single live intrauterine pregnancy at 20w0d by ultrasound biometry. Anatomy survey appears grossly normal for gestational age. Estimated fetal weight is appropriate for gestational age. / Một thai sống trong tử cung, tuổi thai 20 tuần 0 ngày theo sinh trắc học siêu âm. Khảo sát hình thái thai đại thể bình thường theo tuổi thai. Trọng lượng thai ước tính phù hợp tuổi thai.',
                recommendation: 'Routine obstetric follow-up. / Tái khám sản định kỳ.'
            }
        }
    },

    // 3. Normal 3rd Trimester Growth Scan (~32 weeks)
    {
        name: "Normal 3rd Trimester Growth Scan / SA Tăng trưởng Quý 3 Bình thường",
        data: {
            obstetric: {
                gestationalInfo: {
                    lmp: '',
                    gaLmp: '32w0d',
                    eddLmp: '',
                    gaUs: '31w6d', // Example US GA
                    eddUs: '', // JS calculate
                    ultrasoundMethod: 'Transabdominal / Ngã bụng'
                },
                fetalBiometry: { // Example values for ~32w
                    crl: '',
                    bpd: '81', hc: '295', ac: '280', fl: '61', hl: '55',
                    efwMethod: 'Hadlock (BPD,HC,AC,FL)',
                    efw: '1850', // Example EFW in g
                    efwPercentile: '50', // Example percentile
                },
                fetalAnatomy: { // Assume anatomy normal from prior scan, status may be empty or normal
                     ...createNormalAnatomy(), // Or createEmptyAnatomy() if assuming prior normal
                     genitalia: { status: 'Normal Male / Nam bình thường', desc: '' } // Example
                },
                amnioticFluid: {
                    afi: '13.0', // Example AFI in cm
                    sdp: '',
                    fluidAssessment: 'Normal / Bình thường'
                },
                placenta: {
                    location: 'Anterior / Mặt trước',
                    distanceOs: '',
                    grade: 'II',
                    appearance: 'Grade II maturity. No evidence of abruption. / Độ trưởng thành II. Không có bằng chứng nhau bong non.'
                },
                cervix: {
                    length: '', // Often not measured unless indicated
                    method: '',
                    appearance: 'Appears closed on transabdominal view. / Có vẻ đóng kín trên siêu âm ngã bụng.'
                },
                maternalStructures: {
                    uterus: 'Normal gravid appearance. / Tử cung mang thai hình dạng bình thường.',
                    adnexa: 'Not visualized. / Không thấy.'
                },
                fetalWellbeing: createEmptyWellbeing(), // Add BPP/Doppler if performed
                impression: 'Single live intrauterine pregnancy at 31w6d by ultrasound biometry. Estimated fetal weight is appropriate for gestational age (1850g, 50th percentile). Amniotic fluid volume is normal. / Một thai sống trong tử cung, tuổi thai 31 tuần 6 ngày theo sinh trắc học siêu âm. Trọng lượng thai ước tính phù hợp tuổi thai (1850g, BPV thứ 50). Lượng nước ối bình thường.',
                recommendation: 'Routine obstetric follow-up. Monitor fetal movements. / Tái khám sản định kỳ. Theo dõi cử động thai.'
            }
        }
    },

     // 4. IUGR Example (3rd Trimester ~34 weeks)
     {
        name: "Suspected IUGR Example / Ví dụ nghi ngờ Thai chậm tăng trưởng",
        data: {
            obstetric: {
                gestationalInfo: {
                    lmp: '',
                    gaLmp: '34w0d',
                    eddLmp: '',
                    gaUs: '33w5d', // Example US GA
                    eddUs: '', // JS calculate
                    ultrasoundMethod: 'Transabdominal / Ngã bụng'
                },
                fetalBiometry: { // Example values for ~34w but small AC
                    crl: '',
                    bpd: '84', hc: '305', ac: '285', fl: '64', hl: '57', // Note smaller AC relative to HC/FL
                    efwMethod: 'Hadlock (BPD,HC,AC,FL)',
                    efw: '1950', // Example EFW in g - low for 34w
                    efwPercentile: '8', // Example low percentile
                },
                fetalAnatomy: createNormalAnatomy(), // Assume anatomy normal
                amnioticFluid: {
                    afi: '7.5', // Example borderline/low AFI in cm
                    sdp: '',
                    fluidAssessment: 'Oligohydramnios / Thiểu ối' // Or Borderline
                },
                placenta: {
                    location: 'Posterior / Mặt sau',
                    distanceOs: '',
                    grade: 'II-III', // May show advanced grade
                    appearance: 'Grade II-III maturity with some calcifications. / Độ trưởng thành II-III với vài nốt vôi hóa.'
                },
                cervix: { length: '', method: '', appearance: '' },
                maternalStructures: { uterus: '', adnexa: '' },
                fetalWellbeing: { // Doppler often abnormal in IUGR
                    bppTone: '2', bppMovement: '2', bppBreathing: '0', bppFluid: '0', bppScore: '4', // Example low BPP
                    uaPi: '1.45', uaRi: '0.80', uaSd: '5.0', uaEdf: 'Present / Có', // Example high impedance UA
                    mcaPi: '1.0', mcaRi: '0.65', mcaPsv: '55', // Example low impedance MCA (brain sparing)
                    cpr: '0.69', // Example low CPR (<1)
                },
                impression: 'Single live intrauterine pregnancy at 33w5d by ultrasound biometry. Estimated fetal weight is low for gestational age (1950g, 8th percentile), suggestive of Fetal Growth Restriction (FGR). Oligohydramnios noted (AFI 7.5 cm). Doppler indices show increased umbilical artery resistance and evidence of cerebral redistribution (CPR 0.69). Biophysical profile score is 4/8 (absent breathing, low fluid). / Một thai sống trong tử cung, tuổi thai 33 tuần 5 ngày theo sinh trắc học siêu âm. Trọng lượng thai ước tính thấp so với tuổi thai (1950g, BPV thứ 8), gợi ý Thai chậm tăng trưởng trong tử cung (FGR). Ghi nhận thiểu ối (AFI 7,5 cm). Chỉ số Doppler cho thấy tăng kháng trở động mạch rốn và bằng chứng tái phân phối tuần hoàn não (CPR 0,69). Điểm trắc đồ sinh vật lý là 4/8 (không có cử động thở, giảm ối).',
                recommendation: 'Findings concerning for FGR with fetal compromise. Recommend immediate clinical correlation and consideration for inpatient management/delivery. / Kết quả đáng lo ngại về FGR kèm suy thai. Đề nghị tương quan lâm sàng ngay lập tức và cân nhắc quản lý nội trú/chấm dứt thai kỳ.'
            }
        }
    },

    // 5. Placenta Previa Example (~30 weeks)
    {
        name: "Placenta Previa Example / Ví dụ Nhau tiền đạo",
        data: {
            obstetric: {
                gestationalInfo: {
                    lmp: '',
                    gaLmp: '30w0d',
                    eddLmp: '',
                    gaUs: '30w1d',
                    eddUs: '',
                    ultrasoundMethod: 'Combined / Kết hợp' // Often requires TV scan
                },
                fetalBiometry: { // Example values for ~30w
                    crl: '',
                    bpd: '77', hc: '280', ac: '260', fl: '57', hl: '51',
                    efwMethod: 'Hadlock (BPD,HC,AC,FL)',
                    efw: '1450',
                    efwPercentile: '45',
                },
                fetalAnatomy: createNormalAnatomy(), // Assume normal
                amnioticFluid: {
                    afi: '15.0',
                    sdp: '',
                    fluidAssessment: 'Normal / Bình thường'
                },
                placenta: {
                    location: 'Previa - Complete / Nhau tiền đạo - Trung tâm hoàn toàn',
                    distanceOs: '0', // Covers os
                    grade: 'I-II',
                    appearance: 'Placenta completely covers the internal cervical os. / Bánh nhau che kín lỗ trong cổ tử cung.'
                },
                cervix: {
                    length: '32', // Example length
                    method: 'Transvaginal / Ngã âm đạo', // Required for accurate assessment
                    appearance: 'Closed / Đóng'
                },
                maternalStructures: { uterus: '', adnexa: '' },
                fetalWellbeing: createEmptyWellbeing(),
                impression: 'Single live intrauterine pregnancy at 30w1d by ultrasound biometry. Estimated fetal weight is appropriate. Complete placenta previa is identified, with placental tissue covering the internal cervical os. Amniotic fluid is normal. / Một thai sống trong tử cung, tuổi thai 30 tuần 1 ngày theo sinh trắc học siêu âm. Trọng lượng thai ước tính phù hợp. Xác định nhau tiền đạo trung tâm hoàn toàn, mô nhau che phủ lỗ trong cổ tử cung. Nước ối bình thường.',
                recommendation: 'Confirm findings with transvaginal ultrasound if not already performed. Counsel patient regarding risks of bleeding and need for pelvic rest. Recommend follow-up ultrasound for placental location in [4-6] weeks or sooner if bleeding occurs. Plan for Cesarean delivery. / Xác nhận chẩn đoán bằng siêu âm ngã âm đạo nếu chưa thực hiện. Tư vấn cho bệnh nhân về nguy cơ chảy máu và sự cần thiết nghỉ ngơi vùng chậu. Đề nghị siêu âm theo dõi vị trí bánh nhau sau [4-6] tuần hoặc sớm hơn nếu có ra huyết. Lên kế hoạch mổ lấy thai.'
            }
        }
    },


  // --- NEW PRESETS ---

    // 6. Early Pregnancy Assessment (~6-7 weeks)
    {
        name: "Early Pregnancy Assessment / Đánh giá Thai sớm (~6-7w)",
        data: {
            obstetric: {
                gestationalInfo: { lmp: '', gaLmp: '', eddLmp: '', gaUs: '6w3d', eddUs: '', ultrasoundMethod: 'Transvaginal / Ngã âm đạo' },
                fetalBiometry: { ...createEmptyBiometry(), crl: '6' }, // Example 6mm CRL
                fetalAnatomy: { // Minimal assessment
                    head: { status: 'Fetal pole seen / Thấy phôi thai', desc: '' }, face: { status: 'Not Assessed / Chưa đánh giá', desc: '' },
                    neck: { status: 'Not Assessed / Chưa đánh giá', desc: '' }, chest: { status: 'Cardiac Activity Present, FHR [125] bpm / Có hoạt động tim, FHR [125] lần/phút', desc: '' }, // Add FHR placeholder
                    abdomen: { status: 'Not Assessed / Chưa đánh giá', desc: '' }, spine: { status: 'Not Assessed / Chưa đánh giá', desc: '' },
                    limbs: { status: 'Not Assessed / Chưa đánh giá', desc: '' }, genitalia: { status: 'Not Assessed / Chưa đánh giá', desc: '' },
                },
                amnioticFluid: { afi: '', sdp: '', fluidAssessment: 'Gestational sac present / Có túi thai' },
                placenta: { location: '', distanceOs: '', grade: '', appearance: 'Yolk sac visualized. / Thấy túi noãn hoàng.' },
                cervix: { length: '', method: '', appearance: 'Closed / Đóng' },
                maternalStructures: {
                    uterus: 'No subchorionic hematoma. / Không có tụ dịch dưới màng đệm.',
                    adnexa: 'Ovaries appear normal. No adnexal mass or free fluid. / Buồng trứng bình thường. Không thấy khối phần phụ hay dịch tự do.'
                },
                fetalWellbeing: createEmptyWellbeing(),
                impression: 'Single live intrauterine pregnancy at 6w3d by CRL. Positive fetal cardiac activity (FHR 125 bpm). No evidence of ectopic pregnancy or subchorionic hematoma. / Một thai sống trong tử cung, tuổi thai 6 tuần 3 ngày theo CRL. Có hoạt động tim thai (FHR 125 l/p). Không có bằng chứng thai ngoài tử cung hay tụ dịch dưới màng đệm.',
                recommendation: 'Routine obstetric follow-up. / Tái khám sản định kỳ.'
            }
        }
    },

    // 7. First Trimester Screening (~12 weeks)
    {
        name: "1st Trimester Screening / Sàng lọc Quý 1 (~12w)",
        data: {
            obstetric: {
                gestationalInfo: { lmp: '', gaLmp: '12w1d', eddLmp: '', gaUs: '12w0d', eddUs: '', ultrasoundMethod: 'Combined / Kết hợp' },
                fetalBiometry: { ...createEmptyBiometry(), crl: '55' }, // Example CRL for 12w0d
                fetalAnatomy: { // Basic anatomy check + NT/Nasal Bone
                    head: { status: 'Normal / Bình thường', desc: 'Skull ossified / Hộp sọ cốt hóa.' },
                    face: { status: 'Normal / Bình thường', desc: 'Nasal bone visualized / Thấy xương mũi.' },
                    neck: { status: 'Normal / Bình thường', desc: 'Nuchal Translucency (NT) = 1.5 mm. / Độ mờ da gáy (NT) = 1,5 mm.' },
                    chest: { status: 'Normal / Bình thường', desc: 'Cardiac Activity Present / Có hoạt động tim' },
                    abdomen: { status: 'Normal / Bình thường', desc: 'Stomach bubble visualized. Cord insertion appears normal. / Thấy bóng dạ dày. Vị trí dây rốn cắm vào thành bụng có vẻ bình thường.' },
                    spine: { status: 'Normal / Bình thường', desc: '' },
                    limbs: { status: 'Four limbs visualized. / Thấy 4 chi.', desc: '' },
                    genitalia: { status: 'Not Assessed / Chưa đánh giá', desc: '' },
                },
                amnioticFluid: { afi: '', sdp: '', fluidAssessment: 'Normal / Bình thường' },
                placenta: { location: 'Posterior / Mặt sau', distanceOs: '', grade: '', appearance: 'Normal appearance. / Hình dạng bình thường.' },
                cervix: { length: '', method: '', appearance: 'Closed / Đóng' },
                maternalStructures: { uterus: '', adnexa: '' },
                fetalWellbeing: createEmptyWellbeing(),
                impression: 'Single live intrauterine pregnancy at 12w0d by CRL. Fetal anatomy appears appropriate for gestational age. Nuchal translucency within normal limits (1.5 mm). Nasal bone visualized. / Một thai sống trong tử cung, tuổi thai 12 tuần 0 ngày theo CRL. Hình thái thai phù hợp tuổi thai. Độ mờ da gáy trong giới hạn bình thường (1,5 mm). Thấy xương mũi.',
                recommendation: 'Correlate with biochemical screening results. Routine obstetric follow-up. / Tương quan với kết quả sàng lọc sinh hóa. Tái khám sản định kỳ.'
            }
        }
    },

    // 8. Normal Twin Di/Di Growth Scan (~28 weeks) - Simple A/B field naming
    {
        name: "Normal Twin Di/Di Growth Scan / SA Tăng trưởng Song thai Di/Di (~28w)",
        data: {
            obstetric: {
                gestationalInfo: { lmp: '', gaLmp: '28w0d', eddLmp: '', gaUs: '28w1d', eddUs: '', ultrasoundMethod: 'Transabdominal / Ngã bụng' },
                // NOTE: Using A/B suffixes here for simplicity. Full implementation needs array handling.
                fetalBiometry: {
                    bpd_A: '71', hc_A: '260', ac_A: '235', fl_A: '53', efwMethod_A: 'Hadlock (BPD,HC,AC,FL)', efw_A: '1150', efwPercentile_A: '55',
                    bpd_B: '70', hc_B: '258', ac_B: '230', fl_B: '52', efwMethod_B: 'Hadlock (BPD,HC,AC,FL)', efw_B: '1100', efwPercentile_B: '48',
                },
                fetalAnatomy: createNormalAnatomy(), // Assuming normal anatomy for both
                amnioticFluid: { afi: '', sdp: '', fluidAssessment: 'Normal amniotic fluid volume in both sacs. / Lượng nước ối bình thường trong cả hai túi ối.' }, // Need separate fluid assessment fields ideally
                placenta: { location: 'Two placentas seen (e.g., Anterior & Posterior) / Thấy 2 bánh nhau (vd: Mặt trước & Mặt sau)', distanceOs: '', grade: 'I-II', appearance: 'Thick dividing membrane, consistent with dichorionic diamniotic gestation. / Màng ối dày, phù hợp song thai 2 bánh nhau, 2 túi ối.' },
                cervix: { length: '36', method: 'Transabdominal / Ngã bụng', appearance: 'Closed / Đóng' },
                maternalStructures: { uterus: '', adnexa: '' },
                fetalWellbeing: createEmptyWellbeing(), // Can add Dopplers for A & B if needed
                impression: 'Dichorionic diamniotic twin live intrauterine pregnancy at 28w1d by average ultrasound biometry. Estimated fetal weights are concordant (Fetus A: 1150g, 55th percentile; Fetus B: 1100g, 48th percentile). Normal amniotic fluid volume bilaterally. / Song thai 2 bánh nhau, 2 túi ối sống trong tử cung, tuổi thai 28 tuần 1 ngày theo trung bình sinh trắc học siêu âm. Trọng lượng thai ước tính tương hợp (Thai A: 1150g, BPV 55; Thai B: 1100g, BPV 48). Lượng nước ối hai bên bình thường.',
                recommendation: 'Follow-up ultrasound for growth assessment in [3-4] weeks. / Siêu âm theo dõi tăng trưởng sau [3-4] tuần.'
            }
        }
    },

     // 9. Mild Ventriculomegaly Finding (~22 weeks)
    {
        name: "Mild Ventriculomegaly Finding / Giãn não thất nhẹ (~22w)",
        data: {
            obstetric: {
                 gestationalInfo: { lmp: '', gaLmp: '22w0d', eddLmp: '', gaUs: '22w1d', eddUs: '', ultrasoundMethod: 'Transabdominal / Ngã bụng' },
                 fetalBiometry: { crl: '', bpd: '53', hc: '195', ac: '175', fl: '38', hl: '35', efwMethod: 'Hadlock (BPD,HC,AC,FL)', efw: '480', efwPercentile: '50' },
                 fetalAnatomy: { // Start with normal, modify head
                     ...createNormalAnatomy(),
                     head: { status: 'Abnormal / Bất thường', desc: 'Mild lateral ventriculomegaly, measuring 11 mm bilaterally. Remainder of intracranial anatomy appears normal. / Giãn nhẹ não thất bên hai bên, đo được 11 mm. Các cấu trúc nội sọ còn lại có vẻ bình thường.' },
                 },
                 amnioticFluid: { afi: '16.0', sdp: '', fluidAssessment: 'Normal / Bình thường' },
                 placenta: { location: 'Anterior / Mặt trước', distanceOs: '', grade: 'I', appearance: 'Normal / Bình thường' },
                 cervix: { length: '38', method: 'Transabdominal / Ngã bụng', appearance: 'Closed / Đóng' },
                 maternalStructures: { uterus: '', adnexa: '' },
                 fetalWellbeing: createEmptyWellbeing(),
                 impression: 'Single live intrauterine pregnancy at 22w1d by ultrasound biometry. Findings consistent with mild bilateral lateral ventriculomegaly (11 mm). Remainder of the anatomy survey appears grossly normal. / Một thai sống trong tử cung, tuổi thai 22 tuần 1 ngày theo sinh trắc học siêu âm. Kết quả phù hợp với giãn não thất bên hai bên mức độ nhẹ (11 mm). Các phần còn lại của khảo sát hình thái đại thể bình thường.',
                 recommendation: 'Recommend detailed neurosonogram and/or fetal MRI for further evaluation. Genetic counseling recommended. Follow-up ultrasound in [2-4] weeks. / Đề nghị siêu âm hệ thần kinh chi tiết và/hoặc MRI thai để đánh giá thêm. Đề nghị tư vấn di truyền. Siêu âm kiểm tra lại sau [2-4] tuần.'
            }
        }
    },

     // 10. GDM Growth Scan with LGA (~36 weeks)
    {
        name: "GDM Growth Scan (LGA) / SA Tăng trưởng ở mẹ GDM (Thai to) (~36w)",
        data: {
            obstetric: {
                 gestationalInfo: { lmp: '', gaLmp: '36w0d', eddLmp: '', gaUs: '36w2d', eddUs: '', ultrasoundMethod: 'Transabdominal / Ngã bụng' },
                 fetalBiometry: { crl: '', bpd: '92', hc: '335', ac: '340', fl: '70', hl: '63', efwMethod: 'Hadlock (BPD,HC,AC,FL)', efw: '3300', efwPercentile: '92' }, // Large AC, high EFW/percentile
                 fetalAnatomy: createNormalAnatomy(), // Assume normal
                 amnioticFluid: { afi: '23.5', sdp: '', fluidAssessment: 'Polyhydramnios / Đa ối' }, // High normal or Polyhydramnios common in GDM
                 placenta: { location: 'Posterior / Mặt sau', distanceOs: '', grade: 'II', appearance: 'Appears normal. / Có vẻ bình thường.' },
                 cervix: { length: '', method: '', appearance: 'Appears closed. / Có vẻ đóng kín.' },
                 maternalStructures: { uterus: '', adnexa: '' },
                 fetalWellbeing: createEmptyWellbeing(),
                 impression: 'Single live intrauterine pregnancy at 36w2d by ultrasound biometry. Estimated fetal weight is large for gestational age (3300g, 92nd percentile), consistent with LGA. Polyhydramnios is present (AFI 23.5 cm). / Một thai sống trong tử cung, tuổi thai 36 tuần 2 ngày theo sinh trắc học siêu âm. Trọng lượng thai ước tính lớn so với tuổi thai (3300g, BPV 92), phù hợp với LGA. Hiện diện đa ối (AFI 23,5 cm).',
                 recommendation: 'Clinical correlation with maternal glycemic control. Monitor for signs of macrosomia. Consider delivery planning based on clinical picture. / Tương quan lâm sàng với kiểm soát đường huyết của mẹ. Theo dõi các dấu hiệu thai to. Cân nhắc kế hoạch sinh dựa trên tình hình lâm sàng.'
            }
        }
    },


// 11. Rule out Ectopic Pregnancy
{
    name: "Rule out Ectopic Pregnancy / Loại trừ Thai ngoài tử cung",
    data: {
        obstetric: {
            gestationalInfo: { lmp: '', gaLmp: '', eddLmp: '', gaUs: '', eddUs: '', ultrasoundMethod: 'Transvaginal / Ngã âm đạo' },
            fetalBiometry: createEmptyBiometry(),
            fetalAnatomy: createEmptyAnatomy(), // Not applicable
            amnioticFluid: { afi: '', sdp: '', fluidAssessment: '' }, // Not applicable
            placenta: { location: '', distanceOs: '', grade: '', appearance: '' }, // Not applicable
            cervix: { length: '', method: '', appearance: '' },
            maternalStructures: {
                uterus: 'Empty endometrial cavity. No intrauterine gestational sac identified. / Buồng tử cung trống. Không thấy túi thai trong lòng tử cung.',
                adnexa: 'Right adnexal complex cystic/solid mass measuring [X] mm, suspicious for ectopic pregnancy. Small amount of free fluid in the cul-de-sac. Left ovary normal. / Khối phần phụ phải dạng nang/đặc phức tạp kích thước [X] mm, nghi ngờ thai ngoài tử cung. Ít dịch tự do túi cùng Douglas. Buồng trứng trái bình thường.' // Example finding
            },
            fetalWellbeing: createEmptyWellbeing(),
            impression: 'No evidence of intrauterine pregnancy. Findings in the right adnexa are suspicious for ectopic pregnancy. / Không có bằng chứng thai trong tử cung. Hình ảnh phần phụ phải nghi ngờ thai ngoài tử cung.',
            recommendation: 'Urgent clinical correlation with serum beta-hCG level is required. / Cần tương quan lâm sàng khẩn với nồng độ beta-hCG huyết thanh.'
        }
    }
},

// 12. Early Pregnancy Loss (~7 weeks)
{
    name: "Early Pregnancy Loss / Sẩy thai sớm (~7w)",
    data: {
        obstetric: {
            gestationalInfo: { lmp: '', gaLmp: '', eddLmp: '', gaUs: 'Gestational Sac ~7w / Túi thai ~7t', eddUs: '', ultrasoundMethod: 'Transvaginal / Ngã âm đạo' },
            fetalBiometry: createEmptyBiometry(), // CRL might have been measured previously or not seen now
            fetalAnatomy: { // No fetal pole or heartbeat
                 head: { status: 'No fetal pole identified / Không thấy phôi thai', desc: '' }, face: { status: '', desc: '' }, neck: { status: '', desc: '' },
                 chest: { status: 'No cardiac activity detected / Không thấy hoạt động tim', desc: '' }, abdomen: { status: '', desc: '' }, spine: { status: '', desc: '' },
                 limbs: { status: '', desc: '' }, genitalia: { status: '', desc: '' }
             },
            amnioticFluid: { afi: '', sdp: '', fluidAssessment: 'Intrauterine gestational sac seen, mean sac diameter [X] mm. / Thấy túi thai trong tử cung, đường kính trung bình túi thai [X] mm.' },
            placenta: { location: '', distanceOs: '', grade: '', appearance: 'Yolk sac may be present or absent. Irregular gestational sac shape. / Có thể thấy hoặc không thấy túi noãn hoàng. Túi thai bờ không đều.' },
            cervix: { length: '', method: '', appearance: 'Closed / Đóng' },
            maternalStructures: { uterus: 'No significant subchorionic hematoma. / Không có tụ dịch dưới màng đệm đáng kể.', adnexa: 'Normal ovaries. / Buồng trứng bình thường.' },
            fetalWellbeing: createEmptyWellbeing(),
            impression: 'Intrauterine gestational sac consistent with approximately 7 weeks gestation. No fetal pole or cardiac activity identified. Findings consistent with early pregnancy loss (e.g., blighted ovum or missed abortion). / Túi thai trong tử cung phù hợp tuổi thai khoảng 7 tuần. Không thấy phôi thai hay hoạt động tim. Kết quả phù hợp với thai ngừng tiến triển sớm (ví dụ: trứng trống hoặc thai lưu).',
            recommendation: 'Clinical correlation and follow-up beta-hCG levels as indicated. Discuss management options with patient. / Tương quan lâm sàng và theo dõi nồng độ beta-hCG nếu cần. Thảo luận các lựa chọn xử trí với bệnh nhân.'
        }
    }
},

// 13. Short Cervix Finding (~24 weeks)
{
    name: "Short Cervix Finding / Phát hiện Cổ tử cung ngắn (~24w)",
    data: {
        obstetric: {
            gestationalInfo: { lmp: '', gaLmp: '24w0d', eddLmp: '', gaUs: '24w1d', eddUs: '', ultrasoundMethod: 'Transvaginal / Ngã âm đạo' }, // Needs TVS
            fetalBiometry: { crl: '', bpd: '60', hc: '220', ac: '195', fl: '44', hl: '40', efwMethod: 'Hadlock (BPD,HC,AC,FL)', efw: '680', efwPercentile: '50' },
            fetalAnatomy: createNormalAnatomy(), // Assume normal
            amnioticFluid: { afi: '15.5', sdp: '', fluidAssessment: 'Normal / Bình thường' },
            placenta: { location: 'Fundal / Đáy', distanceOs: '', grade: 'I', appearance: 'Normal / Bình thường' },
            cervix: { length: '22', method: 'Transvaginal / Ngã âm đạo', appearance: 'Closed, funneling noted (V-shape). / Đóng, ghi nhận hình phễu (dạng chữ V).' }, // Short length
            maternalStructures: { uterus: '', adnexa: '' },
            fetalWellbeing: createEmptyWellbeing(),
            impression: 'Single live intrauterine pregnancy at 24w1d. Fetal biometry and anatomy appear appropriate. Transvaginal ultrasound reveals a short cervical length of 22 mm with V-shaped funneling. / Một thai sống trong tử cung, tuổi thai 24 tuần 1 ngày. Sinh trắc học và hình thái thai phù hợp. Siêu âm ngã âm đạo cho thấy cổ tử cung ngắn 22 mm kèm dấu hiệu hình phễu dạng chữ V.',
            recommendation: 'Findings consistent with short cervix, increased risk for preterm birth. Recommend clinical correlation, consider vaginal progesterone and/or cerclage based on history and clinical assessment. Follow-up cervical length monitoring. / Kết quả phù hợp với cổ tử cung ngắn, tăng nguy cơ sinh non. Đề nghị tương quan lâm sàng, cân nhắc sử dụng progesterone đặt âm đạo và/hoặc khâu eo cổ tử cung dựa trên tiền sử và đánh giá lâm sàng. Theo dõi chiều dài cổ tử cung.'
        }
    }
},

 // 14. Nuchal Cord Finding (Term Growth Scan ~38w)
{
    name: "Nuchal Cord Finding / Ghi nhận Dây rốn quấn cổ (~38w)",
    data: {
        obstetric: {
             gestationalInfo: { lmp: '', gaLmp: '38w0d', eddLmp: '', gaUs: '38w1d', eddUs: '', ultrasoundMethod: 'Transabdominal / Ngã bụng' },
             fetalBiometry: { crl: '', bpd: '93', hc: '338', ac: '335', fl: '73', hl: '64', efwMethod: 'Hadlock (BPD,HC,AC,FL)', efw: '3450', efwPercentile: '60' },
             fetalAnatomy: { // Modify neck desc
                  ...createNormalAnatomy(),
                  neck: { status: 'Abnormal / Bất thường', desc: 'Nuchal cord visualized (single loop). No signs of constriction on color Doppler. / Thấy dây rốn quấn cổ (1 vòng). Không có dấu hiệu thắt nghẹt trên Doppler màu.' },
                  genitalia: { status: 'Normal Male / Nam bình thường', desc: '' }
             },
             amnioticFluid: { afi: '12.0', sdp: '', fluidAssessment: 'Normal / Bình thường' },
             placenta: { location: 'Posterior / Mặt sau', distanceOs: '', grade: 'II-III', appearance: 'Grade II-III maturity.' },
             cervix: { length: '', method: '', appearance: 'Appears closed.' },
             maternalStructures: { uterus: '', adnexa: '' },
             fetalWellbeing: { // Example Normal Doppler
                  bppTone: '', bppMovement: '', bppBreathing: '', bppFluid: '', bppScore: '8/8 (Informal assessment) / 8/8 (Đánh giá không chính thức)',
                  uaPi: '0.95', uaRi: '0.65', uaSd: '', uaEdf: 'Present / Có', mcaPi: '1.5', mcaRi: '0.80', mcaPsv: '', cpr: '1.58'
             },
             impression: 'Single live intrauterine pregnancy at 38w1d. EFW appropriate for GA (3450g, 60th percentile). Normal amniotic fluid and Doppler studies. A single loop of nuchal cord is noted. Fetal presentation: Cephalic. / Một thai sống trong tử cung, tuổi thai 38 tuần 1 ngày. ULCN phù hợp tuổi thai (3450g, BPV 60). Nước ối và Doppler bình thường. Ghi nhận một vòng dây rốn quấn cổ. Ngôi thai: Đầu.',
             recommendation: 'Presence of nuchal cord noted. Recommend routine monitoring during labor. / Ghi nhận có dây rốn quấn cổ. Đề nghị theo dõi thông thường trong chuyển dạ.'
        }
    }
},

 // 15. Breech Presentation (~37 weeks)
{
    name: "Breech Presentation / Ngôi Mông (~37w)",
    data: {
         obstetric: {
             gestationalInfo: { lmp: '', gaLmp: '37w0d', eddLmp: '', gaUs: '37w1d', eddUs: '', ultrasoundMethod: 'Transabdominal / Ngã bụng' },
             fetalBiometry: { crl: '', bpd: '91', hc: '330', ac: '330', fl: '71', hl: '62', efwMethod: 'Hadlock (BPD,HC,AC,FL)', efw: '3150', efwPercentile: '50' },
             fetalAnatomy: createNormalAnatomy(), // Assume normal
             amnioticFluid: { afi: '14.0', sdp: '', fluidAssessment: 'Normal / Bình thường' },
             placenta: { location: 'Anterior / Mặt trước', distanceOs: '', grade: 'II', appearance: 'Normal / Bình thường' },
             cervix: { length: '', method: '', appearance: 'Appears closed.' },
             maternalStructures: { uterus: '', adnexa: '' },
             fetalWellbeing: createEmptyWellbeing(),
             impression: 'Single live intrauterine pregnancy at 37w1d. EFW appropriate for GA (3150g, 50th percentile). Normal amniotic fluid. Fetal presentation is breech (Frank breech). / Một thai sống trong tử cung, tuổi thai 37 tuần 1 ngày. ULCN phù hợp tuổi thai (3150g, BPV 50). Nước ối bình thường. Ngôi thai là ngôi mông (Mông đủ).',
             recommendation: 'Breech presentation noted. Discuss management options with patient (e.g., External Cephalic Version (ECV), planned Cesarean delivery). / Ghi nhận ngôi mông. Thảo luận các lựa chọn xử trí với bệnh nhân (ví dụ: Xoay thai ngoài (ECV), mổ lấy thai chủ động).'
        }
    }
},

// 16. Previous C-Section Scar Assessment (~38w)
{
    name: "Previous C-Section Scar Assessment / Đánh giá Sẹo mổ cũ (~38w)",
    data: {
        obstetric: {
            gestationalInfo: { lmp: '', gaLmp: '38w2d', eddLmp: '', gaUs: '38w0d', eddUs: '', ultrasoundMethod: 'Transabdominal / Ngã bụng' }, // TVS may be added
            fetalBiometry: { crl: '', bpd: '93', hc: '340', ac: '345', fl: '74', hl: '65', efwMethod: 'Hadlock (BPD,HC,AC,FL)', efw: '3600', efwPercentile: '70' },
            fetalAnatomy: createNormalAnatomy(), // Assume normal
            amnioticFluid: { afi: '13.5', sdp: '', fluidAssessment: 'Normal / Bình thường' },
            placenta: { location: 'Posterior high / Mặt sau cao', distanceOs: '', grade: 'II-III', appearance: 'Normal / Bình thường' },
            cervix: { length: '', method: '', appearance: 'Appears closed.' },
            maternalStructures: {
                 uterus: 'Lower uterine segment visualized. Myometrial thickness at scar site appears adequate, measuring approximately [X] mm. No obvious defect noted. / Quan sát được đoạn dưới tử cung. Bề dày cơ tử cung tại vị trí sẹo mổ cũ có vẻ đủ, đo khoảng [X] mm. Không thấy khuyết sẹo rõ.', // Example normal scar
                 adnexa: ''
            },
            fetalWellbeing: createEmptyWellbeing(),
            impression: 'Single live intrauterine pregnancy at 38w0d. EFW appropriate for GA (3600g, 70th percentile). Cephalic presentation. Lower uterine segment scar appears intact with adequate myometrial thickness ([X] mm). / Một thai sống trong tử cung, tuổi thai 38 tuần 0 ngày. ULCN phù hợp tuổi thai (3600g, BPV 70). Ngôi đầu. Sẹo mổ cũ đoạn dưới tử cung có vẻ nguyên vẹn, bề dày cơ tử cung đủ ([X] mm).',
            recommendation: 'Clinical assessment for trial of labor after Cesarean (TOLAC) suitability if desired by patient. / Đánh giá lâm sàng về sự phù hợp thử thách chuyển dạ sau mổ lấy thai (TOLAC) nếu bệnh nhân mong muốn.'
        }
    }
},


]; // End of obstetricPresets array

console.log("obstetric-presets.js loaded (with additional presets v2).");