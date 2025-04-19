// js/organs/chestxray/chestxray-presets.js
// Defines preset data templates for common Chest X-ray findings.
// Data structure MUST match the object structure returned by collectChestXrayData in chestxray-module.js

// Helper function to create a default 'normal' findings structure
const createNormalFindings = () => ({
    airways: { desc: 'Trachea is midline. Mainstem bronchi appear clear. / Khí quản nằm ở đường giữa. Phế quản gốc hai bên có vẻ thông thoáng.' },
    bones: { status: 'Normal / Bình thường', desc: '' },
    cardiacMediastinum: { size: 'Normal / Bình thường', mediastinumWidth: 'Normal / Bình thường', desc: 'Cardiac silhouette and mediastinal contours are normal. / Bóng tim và các đường bờ trung thất bình thường.' },
    diaphragmPleura: { cpAngles: 'Sharp bilaterally / Nhọn hai bên', pleuralEffusion: 'None / Không', pneumothorax: 'None / Không', desc: 'Hemidiaphragms are normal in position and contour. Costophrenic angles are sharp. / Vòm hoành hai bên vị trí và hình dạng bình thường. Góc sườn hoành hai bên nhọn.' },
    lungs: { status: 'Clear bilaterally / Phổi hai bên trong', desc: '' },
    hila: { desc: 'Hila appear normal. / Rốn phổi hai bên bình thường.' }
});

// Helper function for empty comparison
const createEmptyComparison = () => ({
    date: '', desc: 'No prior studies available for comparison. / Không có phim cũ để so sánh.'
});


export const chestXrayPresets = [
    // 1. Normal PA/Lateral CXR
    {
        name: "Normal PA/Lat CXR / X quang Ngực Thẳng/Nghiêng Bình thường",
        data: {
            chestXray: {
                technical: {
                    projection: 'PA/Lateral / Thẳng/Nghiêng',
                    rotation: 'None / Không xoay',
                    inspiration: 'Adequate / Đủ sâu',
                    penetration: 'Adequate / Đạt'
                },
                linesTubes: '', // Empty
                findings: createNormalFindings(),
                comparison: createEmptyComparison(),
                impression: 'No acute cardiopulmonary process. / Không thấy bệnh lý tim phổi cấp tính.',
                recommendation: '' // Often no recommendation needed for normal
            }
        }
    },

    // 2. Normal Portable AP CXR
    {
        name: "Normal Portable AP CXR / X quang Ngực Tại giường Bình thường",
        data: {
            chestXray: {
                technical: {
                    projection: 'Portable / Tại giường',
                    rotation: 'Mild / Nhẹ', // Often some rotation on portables
                    inspiration: 'Limited / Hạn chế', // Often limited inspiration
                    penetration: 'Adequate / Đạt'
                },
                linesTubes: '', // Check specific preset for lines if needed
                findings: { // May need slight modifications for AP view assessment limitations
                    ...createNormalFindings(),
                    cardiacMediastinum: { size: 'Cannot assess / Không đánh giá được', mediastinumWidth: 'Normal / Bình thường', desc: 'Cardiac silhouette size is difficult to assess accurately on AP view. Mediastinal contours are normal. / Khó đánh giá chính xác kích thước bóng tim trên phim AP. Đường bờ trung thất bình thường.' },
                    diaphragmPleura: { cpAngles: 'Sharp bilaterally / Nhọn hai bên', pleuralEffusion: 'None / Không', pneumothorax: 'None / Không', desc: 'Hemidiaphragms are normal in position. Costophrenic angles are sharp bilaterally. / Vòm hoành vị trí bình thường. Góc sườn hoành hai bên nhọn.' }, // Angles might be blunted slightly sometimes
                },
                comparison: createEmptyComparison(),
                impression: 'No acute cardiopulmonary process identified, limited by portable technique. / Không thấy bệnh lý tim phổi cấp tính, hạn chế do kỹ thuật chụp tại giường.',
                recommendation: 'Clinical correlation is recommended. / Đề nghị tương quan lâm sàng.'
            }
        }
    },

    // 3. Right Lower Lobe (RLL) Pneumonia
    {
        name: "RLL Pneumonia / Viêm phổi Thùy dưới Phải",
        data: {
            chestXray: {
                technical: {
                    projection: 'PA/Lateral / Thẳng/Nghiêng',
                    rotation: 'None / Không xoay',
                    inspiration: 'Adequate / Đủ sâu',
                    penetration: 'Adequate / Đạt'
                },
                linesTubes: '',
                findings: {
                    ...createNormalFindings(), // Start with normal, then modify
                    lungs: {
                        status: 'Abnormal / Bất thường',
                        desc: 'Airspace consolidation in the right lower lobe, silhouetting the right hemidiaphragm. Air bronchograms may be present. No significant pleural effusion. Remainder of the lungs are clear. / Đông đặc khoảng khí ở thùy dưới phổi phải, xóa bờ vòm hoành phải. Có thể có dấu hiệu khí phế quản đồ. Không thấy tràn dịch màng phổi đáng kể. Phần còn lại của phổi trong.'
                    },
                     diaphragmPleura: { // Modify CP angle if obscured
                        cpAngles: 'Blunted (Right) / Tù (Phải)',
                        pleuralEffusion: 'None / Không', // Or small reactive effusion
                        pneumothorax: 'None / Không',
                        desc: 'Right hemidiaphragm obscured by RLL consolidation. Left hemidiaphragm is normal. Left CP angle is sharp. / Vòm hoành phải bị xóa bờ bởi đông đặc TDD P. Vòm hoành trái bình thường. Góc sườn hoành trái nhọn.'
                    },
                },
                comparison: createEmptyComparison(),
                impression: 'Right lower lobe airspace consolidation, consistent with pneumonia. / Đông đặc khoảng khí thùy dưới phổi phải, phù hợp với viêm phổi.',
                recommendation: 'Clinical correlation is recommended. Follow-up chest x-ray in 6-8 weeks to ensure resolution is recommended. / Đề nghị tương quan lâm sàng. Đề nghị chụp X quang ngực kiểm tra sau 6-8 tuần để đảm bảo tổn thương sạch.'
            }
        }
    },

    // 4. Congestive Heart Failure (CHF)
    {
        name: "Congestive Heart Failure (CHF) / Suy tim Sung huyết",
        data: {
            chestXray: {
                technical: {
                    projection: 'AP', // Often AP or portable
                    rotation: 'None / Không xoay',
                    inspiration: 'Adequate / Đủ sâu',
                    penetration: 'Adequate / Đạt'
                },
                linesTubes: '',
                findings: {
                    airways: { desc: 'Trachea is midline. / Khí quản đường giữa.' },
                    bones: { status: 'Normal / Bình thường', desc: '' },
                    cardiacMediastinum: {
                        size: 'Moderate cardiomegaly / Tim to vừa', // Or severe
                        mediastinumWidth: 'Normal / Bình thường',
                        desc: 'Moderate cardiomegaly. Aorta appears normal. Mediastinal contours are normal. / Tim to vừa. Động mạch chủ bình thường. Đường bờ trung thất bình thường.'
                    },
                    diaphragmPleura: {
                        cpAngles: 'Blunted (Bilateral) / Tù (Hai bên)',
                        pleuralEffusion: 'Small (Bilateral) / Ít (Hai bên)',
                        pneumothorax: 'None / Không',
                        desc: 'Bilateral pleural effusions causing blunting of the costophrenic angles. Hemidiaphragms otherwise unremarkable. / Tràn dịch màng phổi hai bên gây tù góc sườn hoành. Các phần khác của vòm hoành không ghi nhận bất thường.'
                    },
                    lungs: {
                        status: 'Abnormal / Bất thường',
                        desc: 'Findings suggestive of pulmonary edema including interstitial thickening, Kerley B lines, peribronchial cuffing, and vascular redistribution towards the upper lobes. Bilateral small pleural effusions. / Các dấu hiệu gợi ý phù phổi bao gồm dày tổ chức kẽ, đường Kerley B, dày thành phế quản, và tái phân bố mạch máu lên thùy trên. Tràn dịch màng phổi lượng ít hai bên.'
                    },
                    hila: { desc: 'Hila are prominent bilaterally, consistent with vascular congestion. / Rốn phổi hai bên đậm, phù hợp với ứ huyết mạch máu.' }
                },
                comparison: createEmptyComparison(),
                impression: 'Cardiomegaly with findings of pulmonary edema and bilateral pleural effusions, consistent with congestive heart failure. / Tim to với các dấu hiệu phù phổi và tràn dịch màng phổi hai bên, phù hợp với suy tim sung huyết.',
                recommendation: 'Clinical correlation is recommended. / Đề nghị tương quan lâm sàng.'
            }
        }
    },

    // 5. Small Pneumothorax (PTX)
    {
        name: "Small Pneumothorax / Tràn khí Màng phổi Lượng ít",
        data: {
            chestXray: {
                technical: {
                    projection: 'PA',
                    rotation: 'None / Không xoay',
                    inspiration: 'Adequate / Đủ sâu',
                    penetration: 'Adequate / Đạt'
                },
                linesTubes: '',
                findings: {
                    ...createNormalFindings(), // Start normal
                    diaphragmPleura: {
                        cpAngles: 'Sharp bilaterally / Nhọn hai bên',
                        pleuralEffusion: 'None / Không',
                        pneumothorax: 'Small (Right) / Ít (Phải)', // Specify side
                        desc: 'Small right pneumothorax with visible visceral pleural line in the apex. Estimated size <[1-2] cm from chest wall. No mediastinal shift. Lungs otherwise clear. Hemidiaphragms normal. CP angles sharp. / Tràn khí màng phổi phải lượng ít với đường màng phổi tạng thấy rõ ở đỉnh. Ước lượng <[1-2] cm từ thành ngực. Không di lệch trung thất. Phổi còn lại trong. Vòm hoành bình thường. Góc sườn hoành nhọn.'
                    },
                     lungs: { // Modify lung status
                        status: 'Abnormal / Bất thường',
                        desc: 'Small right pneumothorax noted. The underlying right lung appears expanded. Left lung is clear. / Ghi nhận tràn khí màng phổi phải lượng ít. Nhu mô phổi phải bên dưới có vẻ nở. Phổi trái trong.'
                    },
                },
                comparison: createEmptyComparison(),
                impression: 'Small right pneumothorax. / Tràn khí màng phổi phải lượng ít.',
                recommendation: 'Follow-up chest x-ray in [e.g., 6-24 hours] to assess stability or resolution is recommended. Clinical correlation advised. / Đề nghị chụp X quang ngực kiểm tra sau [vd: 6-24 giờ] để đánh giá sự ổn định hoặc hồi phục. Tư vấn tương quan lâm sàng.'
            }
        }
    },

    // 6. Lung Nodule
    {
        name: "Lung Nodule / Nốt Phổi",
        data: {
            chestXray: {
                technical: {
                    projection: 'PA/Lateral / Thẳng/Nghiêng',
                    rotation: 'None / Không xoay',
                    inspiration: 'Adequate / Đủ sâu',
                    penetration: 'Adequate / Đạt'
                },
                linesTubes: '',
                findings: {
                    ...createNormalFindings(), // Start normal
                    lungs: {
                        status: 'Abnormal / Bất thường',
                        desc: '[Well-defined/Ill-defined] nodule measuring approximately [size] mm is identified in the [location, e.g., right upper lobe]. Margins appear [smooth/lobulated/spiculated]. No definite calcification or cavitation seen within the nodule. Remainder of the lungs are clear. / Ghi nhận nốt mờ giới hạn [rõ/không rõ] kích thước khoảng [size] mm ở [vị trí, vd: thùy trên phổi phải]. Bờ có vẻ [nhẵn/đa cung/tua gai]. Không thấy vôi hóa hay tạo hang rõ trong nốt. Phần còn lại của phổi trong.'
                    },
                },
                comparison: { // Crucial for nodules
                    date: '',
                    desc: 'Comparison with prior studies is recommended to assess stability or change. / Đề nghị so sánh với phim cũ để đánh giá sự ổn định hoặc thay đổi.'
                },
                impression: '[Size] mm pulmonary nodule in the [location]. / Nốt phổi [size] mm ở [vị trí].',
                recommendation: 'Recommend comparison with prior imaging studies, if available. If new or changed, recommend CT chest for further characterization. Fleischner Society guidelines may apply based on stability and patient risk factors. / Đề nghị so sánh với các phim cũ, nếu có. Nếu nốt mới hoặc thay đổi, đề nghị chụp CT ngực để đánh giá rõ hơn. Có thể áp dụng hướng dẫn của Hội Fleischner dựa trên tính ổn định và yếu tố nguy cơ của bệnh nhân.'
            }
        }
    },

]; // End of chestXrayPresets array

console.log("chestxray-presets.js loaded.");