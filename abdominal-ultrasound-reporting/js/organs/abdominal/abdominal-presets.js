// js/organs/abdominal/abdominal-presets.js
// Defines preset data templates for common abdominal ultrasound findings.
// Data structure MUST match the object structure returned by collectAbdominalData in abdominal-module.js

export const abdominalPresets = [
    // 1. Normal Abdomen (Existing)
    {
        name: "Normal Abdomen / Bụng bình thường",
        data: {
            abdominal: {
                liver: { span: '14', echotexture: 'Normal / Bình thường', margins: 'Smooth / Trơn láng', portalVeinDiameter: '10', hepaticVeinsPatent: 'Patent / Thông thoáng', hepaticArteryViz: 'Visualized, Normal flow / Thấy, dòng chảy BT', lesionsDesc: 'No focal liver lesions identified. / Không thấy tổn thương gan khu trú.' },
                gallbladder: { status: 'Present / Hiện diện', wallThickness: '3', stones: 'None / Không có', stoneSize: '', stoneShadow: '', sludge: 'None / Không có', polyps: 'None / Không có', polypSize: '', pericholecysticFluid: 'No / Không', sonographicMurphy: 'Negative / Âm tính', lesionsDesc: 'No other focal lesions identified. / Không có tổn thương khu trú khác.' },
                biliaryDucts: { cbdDiameter: '4', ihdDilatation: 'No / Không' },
                pancreas: { visualization: 'Adequate / Đầy đủ', headSize: '25', bodySize: '15', tailSize: '20', echotexture: 'Normal / Bình thường', pancreaticDuctDiameter: '2', lesionsDesc: 'No focal pancreatic lesions identified. / Không thấy tổn thương tụy khu trú.' },
                spleen: { size: '11', echotexture: 'Normal / Bình thường', lesionsDesc: 'No focal splenic lesions identified. / Không thấy tổn thương lách khu trú.' },
                rightKidney: { length: '10.5', parenchymaThickness: '15', parenchymaEchogenicity: 'Normal / Bình thường', cmd: 'Preserved / Còn', stones: 'None / Không có', stoneSize: '', stoneLocation: '', hydro: 'None / Không', lesionsDesc: 'No renal cysts or masses identified. / Không thấy nang hay khối u thận.' },
                leftKidney: { length: '10.8', parenchymaThickness: '16', parenchymaEchogenicity: 'Normal / Bình thường', cmd: 'Preserved / Còn', stones: 'None / Không có', stoneSize: '', stoneLocation: '', hydro: 'None / Không', lesionsDesc: 'No renal cysts or masses identified. / Không thấy nang hay khối u thận.' },
                bladder: { volume: '', wallThickness: '', lumen: 'Clear / Trong', lesionsDesc: 'No intraluminal lesions identified. / Không thấy tổn thương trong lòng.' },
                uterus: { present: 'Not Assessed / Không đánh giá', position: '', length: '', width: '', ap: '', endometrialThickness: '', myometriumEchotexture: '', cervixAppearance: '', lesionsDesc: '' },
                adnexa: { rightOvaryDesc: 'Not Assessed / Không đánh giá', leftOvaryDesc: 'Not Assessed / Không đánh giá', pelvicFreeFluid: 'None / Không' },
                ascites: { amount: 'None / Không', location: '' },
                otherFindings: 'None. / Không có.',
                impression: 'Normal ultrasound examination of the abdomen. / Siêu âm bụng tổng quát trong giới hạn bình thường.',
                recommendation: 'Clinical correlation recommended. / Đề nghị tương quan lâm sàng.'
            }
        }
    },
    // 2. Fatty Liver (Existing)
    {
        name: "Fatty Liver (Grade II) / Gan nhiễm mỡ (Độ II)",
        data: {
            abdominal: {
                liver: { span: '15.5', echotexture: 'Fatty Infiltration - Grade II / Gan nhiễm mỡ - Độ II', margins: 'Smooth / Trơn láng', portalVeinDiameter: '11', hepaticVeinsPatent: 'Patent / Thông thoáng', hepaticArteryViz: 'Visualized, Normal flow / Thấy, dòng chảy BT', lesionsDesc: 'No discrete focal lesions identified. / Không thấy tổn thương khu trú rời rạc.' },
                gallbladder: { status: 'Present / Hiện diện', wallThickness: '3', stones: 'None / Không có', sludge: 'None / Không có', polyps: 'None / Không có', pericholecysticFluid: 'No / Không', sonographicMurphy: 'Negative / Âm tính', lesionsDesc: '' },
                biliaryDucts: { cbdDiameter: '4', ihdDilatation: 'No / Không' },
                pancreas: { visualization: 'Adequate / Đầy đủ', echotexture: 'Normal / Bình thường', lesionsDesc: 'None.' },
                spleen: { size: '11', echotexture: 'Normal / Bình thường', lesionsDesc: 'None.' },
                rightKidney: { length: '10.5', parenchymaEchogenicity: 'Normal / Bình thường', cmd: 'Preserved / Còn', hydro: 'None / Không', lesionsDesc: 'None.' },
                leftKidney: { length: '10.8', parenchymaEchogenicity: 'Normal / Bình thường', cmd: 'Preserved / Còn', hydro: 'None / Không', lesionsDesc: 'None.' },
                bladder: { lumen: 'Clear / Trong', lesionsDesc: 'None.' },
                uterus: { present: 'Not Assessed / Không đánh giá' },
                adnexa: { rightOvaryDesc: 'Not Assessed / Không đánh giá', leftOvaryDesc: 'Not Assessed / Không đánh giá', pelvicFreeFluid: 'None / Không'},
                ascites: { amount: 'None / Không', location: '' },
                otherFindings: 'None. / Không có.',
                impression: 'Moderate diffuse hepatic steatosis (Grade II). Other visualized abdominal organs are unremarkable. / Gan nhiễm mỡ lan tỏa độ II. Các cơ quan khác trong ổ bụng khảo sát được không ghi nhận bất thường.',
                recommendation: 'Recommend lifestyle modification and correlation with liver function tests. / Đề nghị thay đổi lối sống và tương quan với xét nghiệm chức năng gan.'
            }
        }
    },
    // 3. Gallstones w/o Cholecystitis (Existing)
     {
        name: "Gallstones w/o Cholecystitis / Sỏi túi mật không viêm",
        data: {
            abdominal: {
                liver: { span: '14', echotexture: 'Normal / Bình thường', margins: 'Smooth / Trơn láng', lesionsDesc: 'None.' },
                gallbladder: { status: 'Present / Hiện diện', wallThickness: '3', stones: 'Multiple / Nhiều viên', stoneSize: '12', stoneShadow: 'Yes / Có', sludge: 'None / Không có', polyps: 'None / Không có', pericholecysticFluid: 'No / Không', sonographicMurphy: 'Negative / Âm tính', lesionsDesc: 'No other significant findings. / Không có phát hiện đáng kể khác.' },
                biliaryDucts: { cbdDiameter: '4', ihdDilatation: 'No / Không' },
                pancreas: { visualization: 'Adequate / Đầy đủ', echotexture: 'Normal / Bình thường', lesionsDesc: 'None.' },
                spleen: { size: '11', echotexture: 'Normal / Bình thường', lesionsDesc: 'None.' },
                rightKidney: { length: '10.5', lesionsDesc: 'None.' },
                leftKidney: { length: '10.8', lesionsDesc: 'None.' },
                 bladder: { lesionsDesc: 'None.' },
                 uterus: { present: 'Not Assessed / Không đánh giá' },
                 adnexa: { rightOvaryDesc: 'Not Assessed / Không đánh giá', leftOvaryDesc: 'Not Assessed / Không đánh giá', pelvicFreeFluid: 'None / Không'},
                ascites: { amount: 'None / Không', location: '' },
                otherFindings: 'None. / Không có.',
                impression: 'Cholelithiasis. Multiple shadowing gallstones are present within the gallbladder. No sonographic evidence of acute cholecystitis (normal wall thickness, no pericholecystic fluid, negative Murphy\'s sign). Common bile duct is normal caliber. / Sỏi túi mật. Ghi nhận nhiều sỏi có bóng lưng trong lòng túi mật. Không có dấu hiệu siêu âm của viêm túi mật cấp (thành không dày, không có dịch quanh túi mật, Murphy âm tính). Ống mật chủ không giãn.',
                recommendation: 'Clinical correlation. / Đề nghị tương quan lâm sàng.'
            }
        }
    },
    // 4. Acute Cholecystitis (NEW)
    {
        name: "Acute Cholecystitis Signs / Dấu hiệu Viêm túi mật cấp",
        data: {
            abdominal: {
                liver: { span: '14', echotexture: 'Normal / Bình thường', lesionsDesc: 'None.' },
                gallbladder: {
                    status: 'Present / Hiện diện',
                    wallThickness: '6', // Thickened wall
                    stones: 'Multiple / Nhiều viên', // Often present
                    stoneSize: '8',
                    stoneShadow: 'Yes / Có',
                    sludge: 'Present / Có', // Often present
                    polyps: 'None / Không có',
                    pericholecysticFluid: 'Yes / Có', // Key finding
                    sonographicMurphy: 'Positive / Dương tính', // Key finding
                    lesionsDesc: 'Gallbladder is distended. / Túi mật căng to.'
                },
                biliaryDucts: { cbdDiameter: '5', ihdDilatation: 'No / Không' }, // Check CBD
                pancreas: { visualization: 'Adequate / Đầy đủ', echotexture: 'Normal / Bình thường', lesionsDesc: 'None.' },
                spleen: { size: '11', echotexture: 'Normal / Bình thường', lesionsDesc: 'None.' },
                rightKidney: { length: '10.5', lesionsDesc: 'None.' },
                leftKidney: { length: '10.8', lesionsDesc: 'None.' },
                 bladder: { lesionsDesc: 'None.' },
                 uterus: { present: 'Not Assessed / Không đánh giá' },
                 adnexa: { rightOvaryDesc: 'Not Assessed / Không đánh giá', leftOvaryDesc: 'Not Assessed / Không đánh giá', pelvicFreeFluid: 'None / Không'}, // Look for fluid elsewhere too
                ascites: { amount: 'None / Không', location: '' },
                otherFindings: 'None. / Không có.',
                impression: 'Sonographic findings suggestive of acute cholecystitis, including gallbladder wall thickening, pericholecystic fluid, positive sonographic Murphy\'s sign, and cholelithiasis. / Các dấu hiệu siêu âm gợi ý viêm túi mật cấp, bao gồm dày thành túi mật, dịch quanh túi mật, dấu Murphy siêu âm dương tính, và sỏi túi mật.',
                recommendation: 'Urgent clinical correlation and surgical consultation recommended. / Đề nghị tương quan lâm sàng khẩn và hội chẩn ngoại khoa.'
            }
        }
    },
    // 5. Simple Renal Cyst (Existing)
     {
        name: "Simple Renal Cyst (Right) / Nang thận đơn giản (Phải)",
        data: {
            abdominal: {
                liver: { echotexture: 'Normal / Bình thường', lesionsDesc: 'None.' },
                gallbladder: { status: 'Present / Hiện diện', stones: 'None / Không có', lesionsDesc: '' },
                biliaryDucts: { cbdDiameter: '4' },
                pancreas: { visualization: 'Adequate / Đầy đủ', lesionsDesc: 'None.' },
                spleen: { size: '11', lesionsDesc: 'None.' },
                rightKidney: { length: '10.5', parenchymaEchogenicity: 'Normal / Bình thường', cmd: 'Preserved / Còn', hydro: 'None / Không', lesionsDesc: 'Simple cortical cyst measuring 2.5 cm in the mid pole. / Nang đơn giản ở vỏ thận vùng cực giữa, kích thước 2.5 cm.' },
                leftKidney: { length: '10.8', lesionsDesc: 'No renal cysts or masses identified. / Không thấy nang hay khối u thận.' },
                 bladder: { lesionsDesc: 'None.' },
                 uterus: { present: 'Not Assessed / Không đánh giá' },
                 adnexa: { rightOvaryDesc: 'Not Assessed / Không đánh giá', leftOvaryDesc: 'Not Assessed / Không đánh giá', pelvicFreeFluid: 'None / Không'},
                ascites: { amount: 'None / Không', location: '' },
                otherFindings: 'None. / Không có.',
                impression: 'Simple renal cyst (Bosniak I) in the right kidney, measuring 2.5 cm. Left kidney is unremarkable. Other visualized abdominal organs are normal. / Nang thận đơn giản (Bosniak I) ở thận phải, kích thước 2.5 cm. Thận trái không ghi nhận bất thường. Các cơ quan khác trong ổ bụng khảo sát được bình thường.',
                recommendation: 'Likely benign finding. No follow-up necessary based on imaging characteristics. / Hình ảnh nhiều khả năng lành tính. Không cần theo dõi dựa trên đặc điểm hình ảnh.'
            }
        }
    },
    // 6. Renal Stone with Mild Hydronephrosis (NEW)
     {
        name: "Renal Stone w/ Mild Hydro (Left) / Sỏi thận và Ứ nước nhẹ (Trái)",
        data: {
            abdominal: {
                liver: { echotexture: 'Normal / Bình thường', lesionsDesc: 'None.' },
                gallbladder: { status: 'Present / Hiện diện', stones: 'None / Không có', lesionsDesc: '' },
                biliaryDucts: { cbdDiameter: '4' },
                pancreas: { visualization: 'Adequate / Đầy đủ', lesionsDesc: 'None.' },
                spleen: { size: '11', lesionsDesc: 'None.' },
                rightKidney: { length: '10.5', hydro: 'None / Không', lesionsDesc: 'None.' },
                leftKidney: {
                    length: '11.2', parenchymaThickness: '15', parenchymaEchogenicity: 'Normal / Bình thường', cmd: 'Preserved / Còn',
                    stones: 'Yes / Có', // Key finding
                    stoneSize: '7', // Example size
                    stoneLocation: 'Lower pole calyx / Đài dưới', // Example location
                    hydro: 'Mild / Nhẹ', // Key finding
                    lesionsDesc: 'Shadowing calculus measuring 7 mm in a lower pole calyx. Mild dilatation of the renal pelvis and calyces noted. / Sỏi có bóng lưng kích thước 7 mm tại đài dưới. Ghi nhận giãn nhẹ bể thận và các đài thận.'
                },
                 bladder: { lesionsDesc: 'Normal. / Bình thường.' },
                 uterus: { present: 'Not Assessed / Không đánh giá' },
                 adnexa: { rightOvaryDesc: 'Not Assessed / Không đánh giá', leftOvaryDesc: 'Not Assessed / Không đánh giá', pelvicFreeFluid: 'None / Không'},
                ascites: { amount: 'None / Không', location: '' },
                otherFindings: 'None. / Không có.',
                impression: 'Left nephrolithiasis (7 mm lower pole calculus) with associated mild left hydronephrosis. Right kidney is normal. / Sỏi thận trái (sỏi 7 mm ở đài dưới) kèm ứ nước thận trái độ nhẹ. Thận phải bình thường.',
                recommendation: 'Clinical correlation. Consider urology consultation or CT KUB if clinically indicated. / Tương quan lâm sàng. Cân nhắc hội chẩn niệu khoa hoặc CT KUB nếu có chỉ định lâm sàng.'
            }
        }
    },
    // 7. Splenomegaly (NEW)
     {
        name: "Splenomegaly / Lách to",
        data: {
            abdominal: {
                liver: { span: '14', echotexture: 'Normal / Bình thường', lesionsDesc: 'None.' }, // Check liver size/texture for cause
                gallbladder: { status: 'Present / Hiện diện', stones: 'None / Không có', lesionsDesc: '' },
                biliaryDucts: { cbdDiameter: '4' },
                pancreas: { visualization: 'Adequate / Đầy đủ', lesionsDesc: 'None.' },
                spleen: {
                    size: '15', // Increased size
                    echotexture: 'Homogeneous / Đồng nhất', // Or describe texture
                    lesionsDesc: 'No focal lesions identified. / Không thấy tổn thương khu trú.'
                },
                rightKidney: { length: '10.5', lesionsDesc: 'None.' },
                leftKidney: { length: '10.8', lesionsDesc: 'None.' },
                 bladder: { lesionsDesc: 'None.' },
                 uterus: { present: 'Not Assessed / Không đánh giá' },
                 adnexa: { rightOvaryDesc: 'Not Assessed / Không đánh giá', leftOvaryDesc: 'Not Assessed / Không đánh giá', pelvicFreeFluid: 'None / Không'},
                ascites: { amount: 'None / Không', location: '' }, // Check for ascites
                otherFindings: 'Evaluate portal vein for flow direction and diameter. / Đánh giá tĩnh mạch cửa về chiều dòng chảy và đường kính.', // Prompt to check PV
                impression: 'Splenomegaly (longest dimension 15 cm). No focal splenic lesions. Other visualized organs unremarkable. / Lách to (kích thước trục dài nhất 15 cm). Không có tổn thương lách khu trú. Các cơ quan khác khảo sát được không ghi nhận bất thường.',
                recommendation: 'Clinical correlation is recommended to determine the etiology of splenomegaly (e.g., liver disease, hematologic disorders). / Đề nghị tương quan lâm sàng để xác định nguyên nhân lách to (ví dụ: bệnh gan, rối loạn huyết học).'
            }
        }
    },
     // 8. Mild Ascites (NEW)
     {
        name: "Mild Ascites / Dịch ổ bụng lượng ít",
        data: {
            abdominal: {
                liver: { span: '13', echotexture: 'Normal / Bình thường', margins: 'Smooth / Trơn láng', lesionsDesc: 'None.' }, // Check liver for cause
                gallbladder: { status: 'Present / Hiện diện', stones: 'None / Không có', lesionsDesc: '' },
                biliaryDucts: { cbdDiameter: '4' },
                pancreas: { visualization: 'Adequate / Đầy đủ', lesionsDesc: 'None.' },
                spleen: { size: '11', lesionsDesc: 'None.' },
                rightKidney: { length: '10.5', lesionsDesc: 'None.' },
                leftKidney: { length: '10.8', lesionsDesc: 'None.' },
                 bladder: { lesionsDesc: 'None.' },
                 uterus: { present: 'Present / Có' }, // Check pelvis
                 adnexa: { rightOvaryDesc: 'Normal / Bình thường', leftOvaryDesc: 'Normal / Bình thường', pelvicFreeFluid: 'Mild / Ít' }, // Fluid may be here
                ascites: {
                    amount: 'Mild / Ít', // Key finding
                    location: 'Pelvis and Morison\'s pouch. / Hố chậu và túi Morison.' // Example location
                },
                otherFindings: 'None. / Không có.',
                impression: 'Mild ascites, predominantly noted in the pelvis and Morison\'s pouch. No other significant abnormalities identified in the visualized organs. / Dịch ổ bụng lượng ít, ghi nhận chủ yếu ở hố chậu và túi Morison. Không thấy bất thường đáng kể khác ở các cơ quan khảo sát được.',
                recommendation: 'Clinical correlation is recommended to determine the etiology of ascites. / Đề nghị tương quan lâm sàng để xác định nguyên nhân dịch ổ bụng.'
            }
        }
    },
     // 9. Normal Pelvis (Female) (Existing) - Moved here for grouping
     {
         name: "Normal Pelvis (Female) / Phần phụ bình thường (Nữ)",
         data: {
             abdominal: {
                 liver: { lesionsDesc: 'None.' }, gallbladder: { status: 'Present / Hiện diện', lesionsDesc: '' }, biliaryDucts: {}, pancreas: { visualization: 'Adequate / Đầy đủ' }, spleen: {}, rightKidney: { lesionsDesc: 'None.' }, leftKidney: { lesionsDesc: 'None.' },
                 bladder: { volume: '', wallThickness: 'Normal / Bình thường', lumen: 'Clear / Trong', lesionsDesc: 'No intraluminal lesions. / Không có tổn thương trong lòng.' },
                 uterus: { present: 'Present / Có', position: 'Anteverted / Ngả trước', length: '70', width: '40', ap: '30', endometrialThickness: '8', myometriumEchotexture: 'Homogeneous / Đồng nhất', cervixAppearance: 'Normal / Bình thường', lesionsDesc: 'No fibroids or focal lesions noted. / Không ghi nhận u xơ hay tổn thương khu trú.' },
                 adnexa: { rightOvaryDesc: 'Normal size and appearance with follicles noted. Measures approx [X] x [Y] mm. / Kích thước và hình dạng bình thường, có nang noãn. KT khoảng [X] x [Y] mm.', leftOvaryDesc: 'Normal size and appearance with follicles noted. Measures approx [A] x [B] mm. / Kích thước và hình dạng bình thường, có nang noãn. KT khoảng [A] x [B] mm.', pelvicFreeFluid: 'Physiologic / Sinh lý' },
                 ascites: { amount: 'None / Không', location: '' }, otherFindings: 'None. / Không có.',
                 impression: 'Normal pelvic ultrasound examination. Normal appearance of the uterus and ovaries. / Siêu âm phần phụ bình thường. Tử cung và hai buồng trứng hình ảnh bình thường.',
                 recommendation: 'Routine follow-up as clinically indicated. / Theo dõi định kỳ theo chỉ định lâm sàng.'
             }
         }
     },
     // 10. Uterine Fibroid (NEW)
      {
         name: "Uterine Fibroid / U xơ tử cung",
         data: {
             abdominal: {
                 liver: { lesionsDesc: 'None.' }, gallbladder: { status: 'Present / Hiện diện', lesionsDesc: '' }, biliaryDucts: {}, pancreas: { visualization: 'Adequate / Đầy đủ' }, spleen: {}, rightKidney: { lesionsDesc: 'None.' }, leftKidney: { lesionsDesc: 'None.' },
                 bladder: { lesionsDesc: 'Normal. / Bình thường.' },
                 uterus: {
                     present: 'Present / Có', position: 'Anteverted / Ngả trước', length: '85', width: '50', ap: '45', // Enlarged uterus
                     endometrialThickness: '7',
                     myometriumEchotexture: 'Heterogeneous / Không đồng nhất', // Key finding
                     cervixAppearance: 'Normal / Bình thường',
                     lesionsDesc: 'Multiple hypoechoic myometrial masses consistent with fibroids. Largest is an intramural fibroid in the fundus measuring 3.5 x 3.0 cm. / Nhiều khối cơ tử cung giảm âm phù hợp u xơ. Lớn nhất là u xơ trong cơ tại đáy kích thước 3.5 x 3.0 cm.' // Key finding
                 },
                 adnexa: { rightOvaryDesc: 'Normal appearance. / Hình ảnh bình thường.', leftOvaryDesc: 'Normal appearance. / Hình ảnh bình thường.', pelvicFreeFluid: 'None / Không' },
                 ascites: { amount: 'None / Không', location: '' }, otherFindings: 'None. / Không có.',
                 impression: 'Enlarged uterus with multiple leiomyomas (fibroids), the largest measuring 3.5 cm. Endometrium is normal thickness. Ovaries appear normal. / Tử cung lớn có nhiều u cơ trơn (u xơ), lớn nhất 3.5 cm. Nội mạc tử cung dày bình thường. Hai buồng trứng hình ảnh bình thường.',
                 recommendation: 'Clinical correlation. Follow-up as clinically indicated. / Tương quan lâm sàng. Theo dõi theo chỉ định lâm sàng.'
             }
         }
     },


]; // End of abdominalPresets array

console.log("abdominal-presets.js loaded with expanded presets.");