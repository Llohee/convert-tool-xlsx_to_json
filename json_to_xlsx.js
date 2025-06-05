const fs = require("fs")
const path = require("path")
const xlsx = require("xlsx")

const inputDir = path.join(__dirname, "input_file_json")
const outputDir = path.join(__dirname, "output_file_xlsx")

// Kiểm tra thư mục input
if (!fs.existsSync(inputDir)) {
  console.error("❌ Thư mục input_file_json không tồn tại!")
  process.exit(1)
}

// Tạo thư mục output nếu chưa tồn tại
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

function jsonToXlsx() {
  try {
    // Đọc tất cả các file JSON trong thư mục input
    const jsonFiles = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.json'))

    if (jsonFiles.length === 0) {
      console.error("❌ Không tìm thấy file JSON nào trong thư mục input_file_json")
      return
    }

    console.log(`📂 Tìm thấy ${jsonFiles.length} file JSON để xử lý`)

    // Đọc tất cả các file JSON và gộp dữ liệu
    const allData = {}
    const languages = new Set()

    jsonFiles.forEach(jsonFile => {
      try {
        const lang = path.parse(jsonFile).name
        const filePath = path.join(inputDir, jsonFile)
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        
        languages.add(lang)
        
        // Gộp dữ liệu theo key
        Object.entries(data).forEach(([key, value]) => {
          if (!allData[key]) {
            allData[key] = { KEY: key }
          }
          allData[key][lang] = value
        })

        console.log(`✅ Đã đọc file ${jsonFile}`)
      } catch (error) {
        console.error(`❌ Lỗi khi đọc file ${jsonFile}:`, error.message)
      }
    })

    // Chuyển đổi dữ liệu thành mảng và sắp xếp theo KEY
    const rows = Object.values(allData).sort((a, b) => a.KEY.localeCompare(b.KEY))

    // Tạo workbook mới
    const workbook = xlsx.utils.book_new()
    const worksheet = xlsx.utils.json_to_sheet(rows)

    // Đặt độ rộng cột
    const colWidths = [
      { wch: 100 }, // KEY column
      ...Array(languages.size).fill({ wch: 100 }) // Language columns
    ]
    worksheet['!cols'] = colWidths

    // Thêm worksheet vào workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Translations')

    // Lưu file XLSX
    const outputPath = path.join(outputDir, 'Sac_Devportal_Locales.xlsx')
    xlsx.writeFile(workbook, outputPath)

    console.log("🎉 Xuất file XLSX thành công!")
  } catch (error) {
    console.error("❌ Có lỗi xảy ra:", error.message)
  }
}

// Chạy chương trình
jsonToXlsx() 