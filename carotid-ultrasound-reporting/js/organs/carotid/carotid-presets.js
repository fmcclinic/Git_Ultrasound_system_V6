// js/organs/carotid/carotid-presets.js
// Defines preset data templates for common carotid ultrasound findings.
// Data structure MUST match the object structure returned by collectCarotidData in carotid-module.js

export const carotidPresets = [
    {
        name: "Normal Carotid Exam / Siêu âm Cảnh Bình Thường",
        data: {
            carotid: {
                left: {
                    cca: {
                        psv: '80', edv: '20', imtMean: '0.6', imtMax: '0.7',
                        plaque: 'No significant plaque identified. / Không thấy mảng xơ vữa đáng kể.',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    ica: {
                        psv: '75', edv: '25', ratio: '0.9', stenosisPct: '0',
                        plaque: 'No significant plaque identified. / Không thấy mảng xơ vữa đáng kể.',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    eca: {
                        psv: '90', edv: '15',
                        plaque: 'No significant plaque identified. / Không thấy mảng xơ vữa đáng kể.',
                        waveform: 'Normal high-resistance waveform with dicrotic notch / Dạng sóng trở kháng cao bình thường có khuyết tiền tâm trương'
                    },
                    va: {
                        psv: '50', edv: '15', flowDirection: 'Antegrade / Thuận dòng',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    sca: {
                        psv: '100', edv: '10',
                        waveform: 'Normal high-resistance triphasic waveform / Dạng sóng 3 pha trở kháng cao bình thường'
                    }
                },
                right: {
                     cca: {
                        psv: '85', edv: '22', imtMean: '0.6', imtMax: '0.7',
                        plaque: 'No significant plaque identified. / Không thấy mảng xơ vữa đáng kể.',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    ica: {
                        psv: '80', edv: '26', ratio: '0.9', stenosisPct: '0',
                        plaque: 'No significant plaque identified. / Không thấy mảng xơ vữa đáng kể.',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    eca: {
                        psv: '95', edv: '16',
                        plaque: 'No significant plaque identified. / Không thấy mảng xơ vữa đáng kể.',
                        waveform: 'Normal high-resistance waveform with dicrotic notch / Dạng sóng trở kháng cao bình thường có khuyết tiền tâm trương'
                    },
                    va: {
                        psv: '55', edv: '16', flowDirection: 'Antegrade / Thuận dòng',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    sca: {
                        psv: '105', edv: '12',
                        waveform: 'Normal high-resistance triphasic waveform / Dạng sóng 3 pha trở kháng cao bình thường'
                    }
                },
                impression: "Normal bilateral carotid and vertebral artery ultrasound examination. Normal intima-media thickness. No hemodynamically significant stenosis or flow abnormalities identified. / Siêu âm động mạch cảnh và động mạch đốt sống hai bên bình thường. Độ dày lớp nội trung mạc bình thường. Không thấy hẹp có ý nghĩa huyết động hay bất thường dòng chảy.",
                recommendation: "Clinical correlation. Routine follow-up as clinically indicated. / Tương quan lâm sàng. Theo dõi định kỳ theo chỉ định lâm sàng."
            }
        }
    },
    {
        name: "IMT Thickening / Dày Lớp Nội Trung Mạc",
        data: {
             carotid: {
                left: {
                    cca: {
                        psv: '82', edv: '21', imtMean: '0.9', imtMax: '1.1', // Increased IMT
                        plaque: 'Mild diffuse intimal-medial thickening observed. No discrete plaque. / Quan sát thấy dày lan tỏa nhẹ lớp nội trung mạc. Không có mảng xơ vữa rời rạc.',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    ica: {
                        psv: '78', edv: '24', ratio: '1.0', stenosisPct: '0',
                        plaque: 'No significant plaque identified. / Không thấy mảng xơ vữa đáng kể.',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    eca: { psv: '92', edv: '14', plaque: '', waveform: 'Normal high-resistance waveform / Dạng sóng trở kháng cao bình thường' },
                    va: { psv: '52', edv: '15', flowDirection: 'Antegrade / Thuận dòng', waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường' },
                    sca: { psv: '100', edv: '11', waveform: 'Normal high-resistance triphasic waveform / Dạng sóng 3 pha trở kháng cao bình thường' }
                },
                right: {
                     cca: {
                        psv: '88', edv: '23', imtMean: '0.9', imtMax: '1.2', // Increased IMT
                        plaque: 'Mild diffuse intimal-medial thickening observed. No discrete plaque. / Quan sát thấy dày lan tỏa nhẹ lớp nội trung mạc. Không có mảng xơ vữa rời rạc.',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    ica: {
                        psv: '83', edv: '27', ratio: '0.9', stenosisPct: '0',
                        plaque: 'No significant plaque identified. / Không thấy mảng xơ vữa đáng kể.',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                     eca: { psv: '98', edv: '17', plaque: '', waveform: 'Normal high-resistance waveform / Dạng sóng trở kháng cao bình thường' },
                    va: { psv: '58', edv: '17', flowDirection: 'Antegrade / Thuận dòng', waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường' },
                    sca: { psv: '108', edv: '13', waveform: 'Normal high-resistance triphasic waveform / Dạng sóng 3 pha trở kháng cao bình thường' }
                },
                impression: "Mild diffuse bilateral carotid intimal-medial thickening. No discrete plaque or hemodynamically significant stenosis identified. Vertebral artery flow is antegrade bilaterally. / Dày lan tỏa nhẹ lớp nội trung mạc động mạch cảnh hai bên. Không thấy mảng xơ vữa rời rạc hay hẹp có ý nghĩa huyết động. Dòng chảy động mạch đốt sống hai bên thuận dòng.",
                recommendation: "Clinical correlation. Management of cardiovascular risk factors recommended. / Tương quan lâm sàng. Đề nghị kiểm soát các yếu tố nguy cơ tim mạch."
            }
        }
    },
    {
        name: "Non-stenotic Plaque / Mảng Xơ Vữa Không Gây Hẹp",
        data: {
             carotid: {
                left: { // Assume left side is normal for this example
                    cca: { psv: '80', edv: '20', imtMean: '0.6', imtMax: '0.7', plaque: 'No significant plaque.', waveform: 'Normal low-resistance' },
                    ica: { psv: '75', edv: '25', ratio: '0.9', stenosisPct: '0', plaque: 'No significant plaque.', waveform: 'Normal low-resistance' },
                    eca: { psv: '90', edv: '15', plaque: '', waveform: 'Normal high-resistance' },
                    va: { psv: '50', edv: '15', flowDirection: 'Antegrade', waveform: 'Normal low-resistance' },
                    sca: { psv: '100', edv: '10', waveform: 'Normal triphasic' }
                },
                right: { // Right side has non-stenotic plaque
                     cca: {
                        psv: '85', edv: '22', imtMean: '0.7', imtMax: '0.8',
                        plaque: 'Small calcified plaque noted at the distal CCA near the bifurcation, causing minimal (<20%) luminal narrowing. / Ghi nhận mảng xơ vữa nhỏ, vôi hóa tại đoạn xa CCA gần chỗ chia đôi, gây hẹp lòng mạch tối thiểu (<20%).',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    ica: {
                        psv: '80', edv: '26', ratio: '0.9', stenosisPct: '0', // Ensure stenosis reflects description
                        plaque: 'Mild plaque extension into the carotid bulb, predominantly hypoechoic with smooth surface. Estimated stenosis <30%. / Mảng xơ vữa lan nhẹ vào hành cảnh, chủ yếu hồi âm kém, bề mặt trơn láng. Ước tính hẹp <30%.',
                        waveform: 'Normal low-resistance waveform / Dạng sóng trở kháng thấp bình thường'
                    },
                    eca: { psv: '95', edv: '16', plaque: '', waveform: 'Normal high-resistance' },
                    va: { psv: '55', edv: '16', flowDirection: 'Antegrade', waveform: 'Normal low-resistance' },
                    sca: { psv: '105', edv: '12', waveform: 'Normal triphasic' }
                },
                impression: "Non-stenotic atherosclerotic plaque identified in the right distal CCA and carotid bulb, causing less than 50% stenosis. Left carotid system is unremarkable. Vertebral arteries demonstrate antegrade flow bilaterally. / Ghi nhận mảng xơ vữa không gây hẹp tại đoạn xa CCA phải và hành cảnh phải, gây hẹp dưới 50%. Hệ cảnh trái không ghi nhận bất thường. Động mạch đốt sống hai bên có dòng chảy thuận dòng.",
                recommendation: "Clinical correlation. Management of cardiovascular risk factors. Follow-up ultrasound may be considered in 1-2 years or as clinically indicated. / Tương quan lâm sàng. Kiểm soát các yếu tố nguy cơ tim mạch. Cân nhắc siêu âm theo dõi sau 1-2 năm hoặc theo chỉ định lâm sàng."
            }
        }
    },
    {
        name: "ICA Stenosis (50-69% NASCET) / Hẹp ĐMC Trong (50-69% NASCET)",
        data: {
            carotid: {
                left: { // Assume Left ICA stenosis
                    cca: { psv: '90', edv: '25', imtMean: '0.8', imtMax: '1.0', plaque: 'Mild diffuse thickening.', waveform: 'Normal low-resistance' },
                    ica: {
                        psv: '180', edv: '70', ratio: '2.0', stenosisPct: '60', // Values typical for 50-69% stenosis
                        plaque: 'Heterogeneous plaque noted at the origin and proximal ICA, causing significant luminal narrowing. Moderate spectral broadening observed. / Ghi nhận mảng xơ vữa không đồng nhất tại nguyên ủy và đoạn gần ICA, gây hẹp lòng mạch đáng kể. Quan sát thấy phổ rộng mức độ vừa.',
                        waveform: 'Increased velocities with post-stenotic turbulence / Tăng vận tốc kèm rối loạn dòng chảy sau hẹp'
                    },
                    eca: { psv: '100', edv: '20', plaque: '', waveform: 'Normal high-resistance' },
                    va: { psv: '55', edv: '18', flowDirection: 'Antegrade', waveform: 'Normal low-resistance' },
                    sca: { psv: '110', edv: '15', waveform: 'Normal triphasic' }
                },
                right: { // Assume Right side normal
                     cca: { psv: '85', edv: '22', imtMean: '0.7', imtMax: '0.8', plaque: 'No significant plaque.', waveform: 'Normal low-resistance' },
                    ica: { psv: '80', edv: '26', ratio: '0.9', stenosisPct: '0', plaque: 'No significant plaque.', waveform: 'Normal low-resistance' },
                    eca: { psv: '95', edv: '16', plaque: '', waveform: 'Normal high-resistance' },
                    va: { psv: '55', edv: '16', flowDirection: 'Antegrade', waveform: 'Normal low-resistance' },
                    sca: { psv: '105', edv: '12', waveform: 'Normal triphasic' }
                },
                impression: "Moderate stenosis (estimated 50-69% NASCET) of the left internal carotid artery origin due to atherosclerotic plaque. Right carotid system is unremarkable. Vertebral arteries demonstrate antegrade flow bilaterally. / Hẹp mức độ vừa (ước tính 50-69% NASCET) tại nguyên ủy động mạch cảnh trong trái do mảng xơ vữa. Hệ cảnh phải không ghi nhận bất thường. Động mạch đốt sống hai bên có dòng chảy thuận dòng.",
                recommendation: "Clinical correlation. Medical management of risk factors. Follow-up ultrasound in 6-12 months recommended to assess stability. Consider CTA/MRA for further characterization if clinically warranted. / Tương quan lâm sàng. Điều trị nội khoa các yếu tố nguy cơ. Đề nghị siêu âm theo dõi sau 6-12 tháng để đánh giá ổn định. Cân nhắc CTA/MRA để đánh giá rõ hơn nếu có chỉ định lâm sàng."
            }
        }
    },
     {
        name: "ICA Stenosis (Severe, 70-99% NASCET) / Hẹp Nặng ĐMC Trong (>70% NASCET)",
        data: {
            carotid: {
                left: { // Assume Left side normal
                    cca: { psv: '80', edv: '20', imtMean: '0.6', imtMax: '0.7', plaque: 'No significant plaque.', waveform: 'Normal low-resistance' },
                    ica: { psv: '75', edv: '25', ratio: '0.9', stenosisPct: '0', plaque: 'No significant plaque.', waveform: 'Normal low-resistance' },
                    eca: { psv: '90', edv: '15', plaque: '', waveform: 'Normal high-resistance' },
                    va: { psv: '50', edv: '15', flowDirection: 'Antegrade', waveform: 'Normal low-resistance' },
                    sca: { psv: '100', edv: '10', waveform: 'Normal triphasic' }
                },
                right: { // Assume Right ICA severe stenosis
                     cca: { psv: '95', edv: '28', imtMean: '0.9', imtMax: '1.2', plaque: 'Diffuse thickening and plaque.', waveform: 'Normal low-resistance, slightly elevated velocity possible' },
                    ica: {
                        psv: '350', edv: '130', ratio: '3.7', stenosisPct: '80', // Values typical for >70% stenosis
                        plaque: 'Large, complex, heterogeneous plaque with possible surface irregularity at the proximal ICA, causing severe luminal narrowing. Marked spectral broadening and high-pitched Doppler signal noted. / Mảng xơ vữa lớn, phức tạp, không đồng nhất, nghi ngờ bề mặt không đều tại đoạn gần ICA, gây hẹp nặng lòng mạch. Ghi nhận phổ rộng rõ và tín hiệu Doppler tần số cao.',
                        waveform: 'Markedly increased velocities, significant turbulence / Vận tốc tăng rõ rệt, rối loạn dòng chảy đáng kể'
                    },
                    eca: { psv: '110', edv: '25', plaque: '', waveform: 'Normal high-resistance' },
                    va: { psv: '60', edv: '20', flowDirection: 'Antegrade', waveform: 'Normal low-resistance' },
                    sca: { psv: '115', edv: '18', waveform: 'Normal triphasic' }
                },
                impression: "Severe stenosis (estimated 70-99% NASCET) of the right internal carotid artery origin/proximal segment due to complex atherosclerotic plaque. Left carotid system is unremarkable. Vertebral arteries demonstrate antegrade flow bilaterally. / Hẹp nặng (ước tính 70-99% NASCET) tại nguyên ủy/đoạn gần động mạch cảnh trong phải do mảng xơ vữa phức tạp. Hệ cảnh trái không ghi nhận bất thường. Động mạch đốt sống hai bên có dòng chảy thuận dòng.",
                recommendation: "Urgent clinical correlation and consideration for further evaluation (CTA/MRA) and vascular surgery consultation recommended due to severe stenosis. / Đề nghị tương quan lâm sàng khẩn, cân nhắc khảo sát thêm (CTA/MRA) và hội chẩn ngoại mạch máu do hẹp nặng."
            }
        }
    },
     {
        name: "ICA Occlusion / Tắc ĐMC Trong",
        data: {
            carotid: {
                left: { // Assume Left ICA occlusion
                    cca: { psv: '70', edv: '10', imtMean: '0.8', imtMax: '1.1', plaque: 'Diffuse plaque noted.', waveform: 'High resistance waveform (thump-like) / Dạng sóng trở kháng cao (kiểu đập mạnh)' },
                    ica: {
                        psv: '', edv: '', ratio: '', stenosisPct: '100',
                        plaque: 'Occluded segment. No flow detected in the visualized portions of the left ICA. Calcified plaque noted at the origin. / Đoạn mạch bị tắc. Không phát hiện dòng chảy trong các phần quan sát được của ICA trái. Ghi nhận mảng xơ vữa vôi hóa tại nguyên ủy.',
                        waveform: 'No flow detected / Không phát hiện dòng chảy'
                    },
                    eca: { psv: '120', edv: '25', plaque: '', waveform: 'May show increased flow or low resistance pattern (externalization) / Có thể tăng dòng chảy hoặc dạng trở kháng thấp (ngoại cảnh hóa)' }, // ECA might compensate
                    va: { psv: '60', edv: '20', flowDirection: 'Antegrade', waveform: 'Normal low-resistance' },
                    sca: { psv: '105', edv: '14', waveform: 'Normal triphasic' }
                },
                right: { // Assume Right side normal
                     cca: { psv: '85', edv: '22', imtMean: '0.7', imtMax: '0.8', plaque: 'No significant plaque.', waveform: 'Normal low-resistance' },
                    ica: { psv: '80', edv: '26', ratio: '0.9', stenosisPct: '0', plaque: 'No significant plaque.', waveform: 'Normal low-resistance (may be slightly elevated due to compensation)' }, // Contralateral ICA might compensate
                    eca: { psv: '95', edv: '16', plaque: '', waveform: 'Normal high-resistance' },
                    va: { psv: '55', edv: '16', flowDirection: 'Antegrade', waveform: 'Normal low-resistance' },
                    sca: { psv: '105', edv: '12', waveform: 'Normal triphasic' }
                },
                impression: "Occlusion of the left internal carotid artery. High resistance flow noted in the left CCA. Possible compensatory flow in the left ECA and right ICA. Right carotid system unremarkable. Vertebral arteries demonstrate antegrade flow bilaterally. / Tắc động mạch cảnh trong trái. Ghi nhận dòng chảy trở kháng cao ở CCA trái. Có thể có dòng chảy bù trừ ở ECA trái và ICA phải. Hệ cảnh phải không ghi nhận bất thường. Động mạch đốt sống hai bên có dòng chảy thuận dòng.",
                recommendation: "Clinical correlation. Confirmation with CTA or MRA may be considered. Management of cardiovascular risk factors. / Tương quan lâm sàng. Có thể cân nhắc xác nhận bằng CTA hoặc MRA. Kiểm soát các yếu tố nguy cơ tim mạch."
            }
        }
    },
     {
        name: "Subclavian Steal (Partial/Latent Example) / HC Cướp máu dưới đòn (Ví dụ: Không hoàn toàn)",
        data: {
             carotid: {
                left: { // Assume left subclavian steal
                    cca: { psv: '80', edv: '20', imtMean: '0.7', imtMax: '0.9', plaque: 'Mild plaque.', waveform: 'Normal low-resistance' },
                    ica: { psv: '75', edv: '25', ratio: '0.9', stenosisPct: '0', plaque: '', waveform: 'Normal low-resistance' },
                    eca: { psv: '90', edv: '15', plaque: '', waveform: 'Normal high-resistance' },
                    va: {
                        psv: '40', edv: '10', flowDirection: 'Bidirectional / Hai chiều', // Or To-and-fro
                        waveform: 'To-and-fro (bidirectional) waveform pattern, suggestive of subclavian steal phenomenon. / Dạng sóng hai chiều (qua lại), gợi ý hiện tượng cướp máu dưới đòn.'
                    },
                    sca: {
                        psv: '60', edv: '5', // Dampened velocity
                        waveform: 'Monophasic waveform (dampened), suggestive of significant proximal stenosis or occlusion. / Dạng sóng 1 pha (yếu), gợi ý hẹp nặng hoặc tắc đoạn gần.'
                    }
                },
                right: { // Assume Right side normal
                     cca: { psv: '85', edv: '22', imtMean: '0.7', imtMax: '0.8', plaque: 'No significant plaque.', waveform: 'Normal low-resistance' },
                    ica: { psv: '80', edv: '26', ratio: '0.9', stenosisPct: '0', plaque: 'No significant plaque.', waveform: 'Normal low-resistance' },
                    eca: { psv: '95', edv: '16', plaque: '', waveform: 'Normal high-resistance' },
                    va: { psv: '55', edv: '16', flowDirection: 'Antegrade', waveform: 'Normal low-resistance' },
                    sca: { psv: '105', edv: '12', waveform: 'Normal triphasic' }
                },
                impression: "Findings consistent with left subclavian steal phenomenon, characterized by bidirectional/to-and-fro flow in the left vertebral artery and a dampened, monophasic waveform in the visualized left subclavian artery (suggesting significant proximal stenosis/occlusion). Right carotid and vertebral systems appear normal. / Hình ảnh phù hợp với hiện tượng cướp máu dưới đòn trái, đặc trưng bởi dòng chảy hai chiều/qua lại ở động mạch đốt sống trái và dạng sóng 1 pha yếu ở động mạch dưới đòn trái quan sát được (gợi ý hẹp nặng/tắc đoạn gần). Hệ cảnh và đốt sống phải bình thường.",
                recommendation: "Clinical correlation, particularly regarding arm claudication or vertebrobasilar symptoms. Evaluation of the proximal left subclavian artery (e.g., CTA/MRA) is recommended to confirm and grade the underlying stenosis/occlusion. / Tương quan lâm sàng, đặc biệt về triệu chứng đau cách hồi ở tay hoặc triệu chứng của hệ sống nền. Đề nghị khảo sát động mạch dưới đòn trái đoạn gần (ví dụ: CTA/MRA) để xác nhận và phân độ hẹp/tắc."
            }
        }
    },

]; // End of carotidPresets array

console.log("carotid-presets.js loaded.");