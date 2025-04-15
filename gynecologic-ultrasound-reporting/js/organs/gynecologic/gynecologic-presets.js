// js/organs/gynecologic/gynecologic-presets.js
// Defines preset data templates for common Gynecologic Ultrasound findings.
// Data structure MUST match the object structure returned by collectGynecologicData in gynecologic-module.js

// Helper to create an empty fibroid structure
const createEmptyFibroid = () => ({
    fibroidLocation: '', fibroidSize: '', fibroidEchogenicity: '', fibroidDescription: '', fibroidComments: ''
});

// Helper to create an empty adnexal finding structure
const createEmptyAdnexalFinding = () => ({
     findingLaterality: '', findingOrigin: '', findingSize: '', findingType: '', findingDescription: ''
});

// Helper to create default empty GYN structure
const createEmptyGynStructure = () => ({
    scanApproach: 'Transvaginal / Ngã âm đạo',
    uterus: { position: '', sizeL: '', sizeW: '', sizeAP: '', shape: '', contour: '', myometrium: '', comments: '' },
    endometrium: { thickness: '', echogenicity: '', appearance: '', iudStatus: 'Not Present / Không có' },
    cervix: { appearance: '', length: '' },
    adnexa: {
        right: { visibility: '', sizeL: '', sizeW: '', sizeAP: '', volume: '', appearance: '' },
        left: { visibility: '', sizeL: '', sizeW: '', sizeAP: '', volume: '', appearance: '' },
        comments: ''
    },
    culdesac: { fluid: '' },
    fibroids: [],
    adnexalFindings: [],
    impression: '',
    recommendation: ''
});


export const gynecologicPresets = [
    // 1. Normal Premenopausal Pelvic Scan
    {
        name: "Normal Premenopausal Pelvic Scan / SA Phụ khoa Bình thường (Trước mãn kinh)",
        data: {
            gynecologic: {
                 ...createEmptyGynStructure(), // Start with empty structure
                 scanApproach: 'Transvaginal / Ngã âm đạo',
                 uterus: {
                     position: 'Anteverted-anteflexed / Ngã trước - Gập trước',
                     sizeL: '75', sizeW: '45', sizeAP: '35',
                     shape: 'Normal / Bình thường',
                     contour: 'Smooth / Trơn láng',
                     myometrium: 'Homogeneous / Đồng nhất',
                     comments: ''
                 },
                 endometrium: {
                     thickness: '8', // Example proliferative phase thickness
                     echogenicity: 'Homogeneous / Đồng nhất',
                     appearance: 'Trilaminar pattern / Dạng 3 lá', // Example proliferative phase
                     iudStatus: 'Not Present / Không có'
                 },
                 cervix: {
                     appearance: 'Normal appearance / Hình dạng bình thường.',
                     length: ''
                 },
                 adnexa: {
                     right: {
                         visibility: 'Visualized / Thấy rõ',
                         sizeL: '32', sizeW: '20', sizeAP: '18',
                         volume: '', // Calculated by JS
                         appearance: 'Normal appearance with follicles. / Hình thái bình thường với các nang noãn.'
                     },
                     left: {
                         visibility: 'Visualized / Thấy rõ',
                         sizeL: '30', sizeW: '21', sizeAP: '19',
                         volume: '', // Calculated by JS
                         appearance: 'Normal appearance with follicles. / Hình thái bình thường với các nang noãn.'
                     },
                     comments: ''
                 },
                 culdesac: {
                     fluid: 'None / Không có.'
                 },
                 fibroids: [],
                 adnexalFindings: [],
                 impression: 'Normal pelvic ultrasound. / Siêu âm phụ khoa bình thường.',
                 recommendation: 'Routine gynecologic follow-up. / Tái khám phụ khoa định kỳ.'
            }
        }
    },

    // 2. Normal Postmenopausal Pelvic Scan
    {
        name: "Normal Postmenopausal Pelvic Scan / SA Phụ khoa Bình thường (Sau mãn kinh)",
        data: {
            gynecologic: {
                 ...createEmptyGynStructure(),
                 scanApproach: 'Transvaginal / Ngã âm đạo',
                 uterus: {
                     position: 'Anteverted / Ngã trước',
                     sizeL: '55', sizeW: '30', sizeAP: '25', // Smaller size
                     shape: 'Normal / Bình thường',
                     contour: 'Smooth / Trơn láng',
                     myometrium: 'Homogeneous / Đồng nhất',
                     comments: 'Atrophic changes consistent with postmenopausal status. / Thay đổi teo nhỏ phù hợp tình trạng sau mãn kinh.'
                 },
                 endometrium: {
                     thickness: '3', // Thin endometrium
                     echogenicity: 'Homogeneous / Đồng nhất',
                     appearance: 'Thin, echogenic line. / Đường nội mạc mỏng, echo dày.',
                     iudStatus: 'Not Present / Không có'
                 },
                 cervix: {
                     appearance: 'Normal appearance, may appear small. / Hình dạng bình thường, có thể thấy nhỏ.',
                     length: ''
                 },
                 adnexa: {
                     right: {
                         visibility: 'Visualized / Thấy rõ', // Or 'Not Visualized / Không thấy' if atrophic
                         sizeL: '15', sizeW: '10', sizeAP: '8', // Small, atrophic
                         volume: '', // Calculated by JS
                         appearance: 'Quiescent / Atrophic appearance. No follicles seen. / Hình thái im lặng / teo nhỏ. Không thấy nang noãn.'
                     },
                     left: {
                         visibility: 'Visualized / Thấy rõ', // Or 'Not Visualized / Không thấy'
                         sizeL: '16', sizeW: '9', sizeAP: '7', // Small, atrophic
                         volume: '', // Calculated by JS
                         appearance: 'Quiescent / Atrophic appearance. No follicles seen. / Hình thái im lặng / teo nhỏ. Không thấy nang noãn.'
                     },
                     comments: 'Ovaries demonstrate postmenopausal appearance. / Buồng trứng có hình thái sau mãn kinh.'
                 },
                 culdesac: {
                     fluid: 'None / Không có.'
                 },
                 fibroids: [],
                 adnexalFindings: [],
                 impression: 'Normal postmenopausal pelvic ultrasound. Atrophic changes noted. / Siêu âm phụ khoa sau mãn kinh bình thường. Ghi nhận các thay đổi teo nhỏ.',
                 recommendation: 'Routine gynecologic follow-up. / Tái khám phụ khoa định kỳ.'
            }
        }
    },

    // 3. Simple Ovarian Cyst Example
    {
        name: "Simple Ovarian Cyst Example / Ví dụ Nang buồng trứng đơn giản",
        data: {
            gynecologic: {
                 ...createEmptyGynStructure(),
                 // Keep other structures normal (e.g., from premenopausal preset)
                 uterus: { position: 'Anteverted / Ngã trước', sizeL: '70', sizeW: '40', sizeAP: '30', shape: 'Normal / Bình thường', contour: 'Smooth / Trơn láng', myometrium: 'Homogeneous / Đồng nhất', comments: '' },
                 endometrium: { thickness: '7', echogenicity: 'Homogeneous / Đồng nhất', appearance: 'Proliferative pattern / Dạng tăng sinh', iudStatus: 'Not Present / Không có' },
                 cervix: { appearance: 'Normal appearance / Hình dạng bình thường.', length: '' },
                 adnexa: {
                     right: { // Normal Left Ovary
                         visibility: 'Visualized / Thấy rõ', sizeL: '30', sizeW: '20', sizeAP: '18', volume: '',
                         appearance: 'Normal appearance with follicles. / Hình thái bình thường với các nang noãn.'
                     },
                     left: { // Ovary with cyst
                         visibility: 'Visualized / Thấy rõ', sizeL: '45', sizeW: '40', sizeAP: '38', volume: '', // Size reflects cyst
                         appearance: 'Contains cyst (described below). / Chứa nang (mô tả bên dưới).'
                     },
                     comments: ''
                 },
                 culdesac: { fluid: 'None / Không có.' },
                 fibroids: [],
                 adnexalFindings: [ // Array with one finding
                     {
                         findingLaterality: 'Left / Trái',
                         findingOrigin: 'Ovarian / Buồng trứng',
                         findingSize: '35x33x32 mm',
                         findingType: 'Simple Cyst / Nang đơn giản',
                         findingDescription: 'Anechoic content. Thin smooth wall. No septations. No papillary projections. Posterior acoustic enhancement. Color Doppler Score 1 (No flow). / Nội dung trống âm. Vách mỏng trơn láng. Không vách ngăn. Không chồi. Tăng âm phía sau. Điểm Doppler màu 1 (Không có dòng chảy).'
                     }
                 ],
                 impression: 'Simple left ovarian cyst measuring 3.5 cm, likely physiological (e.g., follicular cyst). Remainder of pelvic structures appear normal. / Nang đơn giản buồng trứng trái kích thước 3,5 cm, nghĩ nang chức năng (ví dụ: nang noãn). Các cấu trúc tiểu khung còn lại bình thường.',
                 recommendation: 'Follow-up ultrasound in [6-8] weeks to ensure resolution, preferably early in the next menstrual cycle. / Siêu âm kiểm tra lại sau [6-8] tuần để đảm bảo nang biến mất, tốt nhất là vào đầu chu kỳ kinh nguyệt tiếp theo.'
            }
        }
    },

    // 4. Hemorrhagic Cyst Example
    {
        name: "Hemorrhagic Cyst Example / Ví dụ Nang xuất huyết",
         data: {
            gynecologic: {
                ...createEmptyGynStructure(),
                // Assume normal uterus, endometrium, cervix, other ovary
                uterus: { position: 'Retroverted / Ngã sau', sizeL: '72', sizeW: '42', sizeAP: '33', shape: 'Normal / Bình thường', contour: 'Smooth / Trơn láng', myometrium: 'Homogeneous / Đồng nhất', comments: '' },
                endometrium: { thickness: '10', echogenicity: 'Homogeneous / Đồng nhất', appearance: 'Secretory pattern / Dạng chế tiết', iudStatus: 'Not Present / Không có' },
                 cervix: { appearance: 'Normal appearance / Hình dạng bình thường.', length: '' },
                adnexa: {
                    right: { // Cyst location
                        visibility: 'Visualized / Thấy rõ', sizeL: '50', sizeW: '48', sizeAP: '45', volume: '',
                        appearance: 'Contains complex cyst (described below). / Chứa nang phức tạp (mô tả bên dưới).'
                    },
                    left: { // Normal other ovary
                        visibility: 'Visualized / Thấy rõ', sizeL: '28', sizeW: '19', sizeAP: '17', volume: '',
                        appearance: 'Normal appearance with follicles. / Hình thái bình thường với các nang noãn.'
                    },
                    comments: ''
                },
                culdesac: { fluid: 'Small amount / Lượng ít.' },
                fibroids: [],
                adnexalFindings: [
                    {
                        findingLaterality: 'Right / Phải',
                        findingOrigin: 'Ovarian / Buồng trứng',
                        findingSize: '42x40x38 mm',
                        findingType: 'Hemorrhagic Cyst / Nang xuất huyết',
                        findingDescription: 'Complex cyst with internal reticular pattern (lace-like echoes) and possibly retracting clot. Thin smooth wall. No septations or papillary projections. No internal vascularity on color Doppler (Score 1). / Nang phức tạp với hồi âm dạng lưới bên trong (echo dạng ren) và có thể có cục máu đông co rút. Vách mỏng trơn láng. Không vách ngăn hay chồi. Không có tưới máu bên trong trên Doppler màu (Điểm 1).'
                    }
                ],
                 impression: 'Complex right ovarian cyst (4.2 cm) with features typical of a hemorrhagic cyst. Small amount of free fluid in the cul-de-sac. / Nang phức tạp buồng trứng phải (4,2 cm) với các đặc điểm điển hình của nang xuất huyết. Ít dịch tự do túi cùng Douglas.',
                 recommendation: 'Likely benign. Recommend follow-up ultrasound in 6-8 weeks to document resolution. / Nhiều khả năng lành tính. Đề nghị siêu âm kiểm tra lại sau 6-8 tuần để ghi nhận sự biến mất của nang.'
            }
        }
    },

    // 5. Endometrioma Example
     {
        name: "Endometrioma Example / Ví dụ Nang lạc nội mạc tử cung",
        data: {
            gynecologic: {
                ...createEmptyGynStructure(),
                // Assume other structures normal
                uterus: { position: 'Retroverted-retroflexed / Ngã sau - Gập sau', sizeL: '68', sizeW: '44', sizeAP: '36', shape: 'Normal / Bình thường', contour: 'Smooth / Trơn láng', myometrium: 'Homogeneous / Đồng nhất', comments: '' },
                endometrium: { thickness: '6', echogenicity: 'Homogeneous / Đồng nhất', appearance: 'Early proliferative pattern / Dạng tăng sinh sớm', iudStatus: 'Not Present / Không có' },
                 cervix: { appearance: 'Normal appearance / Hình dạng bình thường.', length: '' },
                adnexa: {
                    right: { // Normal ovary
                         visibility: 'Visualized / Thấy rõ', sizeL: '31', sizeW: '22', sizeAP: '19', volume: '',
                         appearance: 'Normal appearance with follicles. / Hình thái bình thường với các nang noãn.'
                    },
                    left: { // Ovary with endometrioma
                         visibility: 'Visualized / Thấy rõ', sizeL: '48', sizeW: '45', sizeAP: '42', volume: '',
                         appearance: 'Contains cyst (described below). May be adherent to pelvic side wall. / Chứa nang (mô tả bên dưới). Có thể dính vào thành chậu.'
                    },
                    comments: 'Consider possibility of pelvic adhesions. / Cân nhắc khả năng dính vùng chậu.'
                },
                 culdesac: { fluid: 'None / Không có.' },
                 fibroids: [],
                adnexalFindings: [
                    {
                         findingLaterality: 'Left / Trái',
                         findingOrigin: 'Ovarian / Buồng trứng',
                         findingSize: '40x38x35 mm',
                         findingType: 'Endometrioma / Nang lạc nội mạc',
                         findingDescription: 'Homogeneous low-level internal echoes (ground glass appearance). Thickened wall, may have echogenic foci within the wall. No definite solid components or papillary projections identified. No significant internal vascularity (Color Doppler Score 1). / Hồi âm bên trong mức độ thấp đồng nhất (dạng kính mờ). Vách dày, có thể có các nốt hồi âm dày trong vách. Không xác định rõ thành phần đặc hay chồi. Không có tưới máu bên trong đáng kể (Điểm Doppler màu 1).'
                    }
                ],
                 impression: 'Left ovarian cyst (4.0 cm) with features characteristic of an endometrioma. / Nang buồng trứng trái (4,0 cm) với các đặc điểm của nang lạc nội mạc tử cung.',
                 recommendation: 'Clinical correlation recommended. Follow-up or management based on clinical scenario and patient symptoms/goals. / Đề nghị đối chiếu lâm sàng. Theo dõi hoặc xử trí dựa trên bệnh cảnh lâm sàng và triệu chứng/mong muốn của bệnh nhân.'
            }
        }
    },

    // 6. Uterine Fibroids Example
    {
        name: "Uterine Fibroids Example / Ví dụ U xơ tử cung",
        data: {
             gynecologic: {
                 ...createEmptyGynStructure(),
                 scanApproach: 'Combined / Kết hợp',
                 uterus: {
                     position: 'Anteverted / Ngã trước',
                     sizeL: '95', sizeW: '65', sizeAP: '55', // Enlarged uterus
                     shape: 'Irregular / Không đều',
                     contour: 'Irregular / Không đều',
                     myometrium: 'Fibroids Present / Có U xơ', // Trigger fibroid section
                     comments: 'Uterus is enlarged and irregularly contoured due to multiple fibroids. / Tử cung to và bờ không đều do nhiều u xơ.'
                 },
                 // Assume normal endometrium, cervix, ovaries for this example
                  endometrium: { thickness: '9', echogenicity: 'Homogeneous / Đồng nhất', appearance: 'Secretory pattern / Dạng chế tiết', iudStatus: 'Not Present / Không có' },
                  cervix: { appearance: 'Normal appearance / Hình dạng bình thường.', length: '' },
                  adnexa: {
                      right: { visibility: 'Visualized / Thấy rõ', sizeL: '30', sizeW: '20', sizeAP: '18', volume: '', appearance: 'Normal appearance. / Hình thái bình thường.' },
                      left: { visibility: 'Visualized / Thấy rõ', sizeL: '29', sizeW: '21', sizeAP: '19', volume: '', appearance: 'Normal appearance. / Hình thái bình thường.' },
                      comments: ''
                  },
                  culdesac: { fluid: 'None / Không có.' },
                 fibroids: [ // Array with multiple fibroids
                      {
                          fibroidLocation: 'Intramural / Trong cơ', fibroidSize: '35x32x30 mm', fibroidEchogenicity: 'Hypoechoic / Kém',
                          fibroidDescription: 'Well-defined. No significant internal vascularity. / Giới hạn rõ. Không tăng sinh mạch máu đáng kể bên trong.', fibroidComments: 'Posterior wall / Thành sau'
                      },
                       {
                          fibroidLocation: 'Subserosal / Dưới thanh mạc', fibroidSize: '40x35x33 mm', fibroidEchogenicity: 'Isoechoic / Đồng nhất',
                          fibroidDescription: 'Calcified rim noted. / Ghi nhận viền vôi hóa.', fibroidComments: 'Fundal / Đáy'
                      },
                      {
                          fibroidLocation: 'Submucosal / Dưới niêm mạc', fibroidSize: '15x12x10 mm', fibroidEchogenicity: 'Hypoechoic / Kém',
                          fibroidDescription: 'Indents the endometrial cavity. / Đè đẩy vào lòng tử cung.', fibroidComments: 'Anterior wall / Thành trước'
                      }
                 ],
                 adnexalFindings: [],
                 impression: 'Enlarged, irregular uterus due to multiple fibroids as described above, including intramural, subserosal, and submucosal components. / Tử cung to, không đều do nhiều u xơ như mô tả ở trên, bao gồm thành phần trong cơ, dưới thanh mạc và dưới niêm mạc.',
                 recommendation: 'Clinical correlation with symptoms (e.g., bleeding, pain) recommended. Management depends on clinical context. / Đề nghị đối chiếu lâm sàng với các triệu chứng (vd: ra huyết, đau). Xử trí tùy thuộc vào bối cảnh lâm sàng.'
             }
        }
    },

     // 7. Endometrial Thickening Example (Postmenopausal)
    {
        name: "Endometrial Thickening Example (Postmenopausal) / Ví dụ Nội mạc tử cung dày (Sau mãn kinh)",
         data: {
            gynecologic: {
                 ...createEmptyGynStructure(),
                 scanApproach: 'Transvaginal / Ngã âm đạo',
                 uterus: { // Assume normal size/shape postmeno uterus
                     position: 'Midline / Trung gian', sizeL: '60', sizeW: '35', sizeAP: '30', shape: 'Normal / Bình thường', contour: 'Smooth / Trơn láng', myometrium: 'Homogeneous / Đồng nhất', comments: ''
                 },
                 endometrium: {
                     thickness: '12', // Thickened for postmenopausal
                     echogenicity: 'Heterogeneous / Không đồng nhất',
                     appearance: 'Thickened and heterogeneous endometrium. Small cystic spaces noted within. No discrete polyp seen. / Nội mạc tử cung dày và không đồng nhất. Ghi nhận các khoảng trống dạng nang nhỏ bên trong. Không thấy polyp rõ.',
                     iudStatus: 'Not Present / Không có'
                 },
                 cervix: { appearance: 'Normal appearance / Hình dạng bình thường.', length: '' },
                 adnexa: { // Assume normal postmeno ovaries
                     right: { visibility: 'Visualized / Thấy rõ', sizeL: '17', sizeW: '11', sizeAP: '9', volume: '', appearance: 'Quiescent / Atrophic appearance. / Hình thái im lặng / teo nhỏ.' },
                     left: { visibility: 'Visualized / Thấy rõ', sizeL: '16', sizeW: '10', sizeAP: '8', volume: '', appearance: 'Quiescent / Atrophic appearance. / Hình thái im lặng / teo nhỏ.' },
                     comments: ''
                 },
                 culdesac: { fluid: 'None / Không có.' },
                 fibroids: [],
                 adnexalFindings: [],
                 impression: 'Thickened (12 mm) and heterogeneous endometrium in a postmenopausal patient. This is abnormal and requires further investigation. / Nội mạc tử cung dày (12 mm) và không đồng nhất ở bệnh nhân sau mãn kinh. Đây là bất thường và cần khảo sát thêm.',
                 recommendation: 'Endometrial biopsy is recommended to exclude endometrial hyperplasia or malignancy. Consider Saline Infusion Sonohysterography (SIS) if biopsy is inconclusive or to evaluate for polyps. / Đề nghị sinh thiết nội mạc tử cung để loại trừ tăng sản hoặc ung thư nội mạc tử cung. Cân nhắc Siêu âm bơm nước lòng tử cung (SIS) nếu sinh thiết không kết luận được hoặc để đánh giá polyp.'
            }
        }
    },

    // Add more presets as needed (e.g., Complex Adnexal Mass, Dermoid, PCOM, IUD Check)
    // ... (Structure would follow the examples above) ...

]; // End of gynecologicPresets array

console.log("gynecologic-presets.js loaded.");