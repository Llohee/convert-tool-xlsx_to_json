const fs = require("fs")
const path = require("path")
const xlsx = require("xlsx")

const inputDir = path.join(__dirname, "input_file_xlsx")
const outputDir = path.join(__dirname, "output_file_json")

// Kiểm tra thư mục input
if (!fs.existsSync(inputDir)) {
  console.error("❌ Thư mục input_file_xlsx không tồn tại!")
  process.exit(1)
}

// Tạo thư mục output nếu chưa tồn tại
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

// Hàm chuyển từ XLSX sang JSON
function xlsxToJson() {
  try {
    const files = fs.readdirSync(inputDir)
    const xlsxFiles = files.filter((file) => file.endsWith(".xlsx"))
    
    if (xlsxFiles.length === 0) {
      console.error("❌ Không tìm thấy file .xlsx nào trong thư mục input_file_xlsx")
      return
    }

    console.log(`📂 Tìm thấy ${xlsxFiles.length} file XLSX để xử lý`)

    // Chuyển sheet data theo từng cột ngôn ngữ (trừ KEY)
    function configToLangRecords(sheetData) {
      const langMap = {}
      sheetData.forEach((row) => {
        const key = row["KEY"]
        if (!key) return
        Object.keys(row).forEach((col) => {
          if (col !== "KEY") {
            langMap[col] = langMap[col] || {}
            langMap[col][key.trim()] =
              typeof row[col] === "string" ? row[col].trim() : row[col] ?? ""
          }
        })
      })
      return langMap
    }

    // Gộp tất cả bản ghi ngôn ngữ từ nhiều file XLSX
    const allLangRecords = {}

    xlsxFiles.forEach((filename) => {
      try {
        const filePath = path.join(inputDir, filename)
        const workbook = xlsx.readFile(filePath)

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName]
          const data = xlsx.utils.sheet_to_json(sheet)
          const langRecords = configToLangRecords(data)

          Object.entries(langRecords).forEach(([lang, records]) => {
            allLangRecords[lang] = {
              ...allLangRecords[lang],
              ...records
            }
          })
        })

        console.log(`✅ Xử lý xong file ${filename}`)
      } catch (error) {
        console.error(`❌ Lỗi khi xử lý file ${filename}:`, error.message)
      }
    })

    // Xuất từng file JSON cho từng ngôn ngữ vào outputDir
    Object.entries(allLangRecords).forEach(([lang, records]) => {
      const outPath = path.join(outputDir, `${lang.toLowerCase()}.json`)
      fs.writeFileSync(outPath, JSON.stringify(records, null, 2))
    })

    console.log("🎉 Xuất tất cả file JSON theo ngôn ngữ thành công!")
  } catch (error) {
    console.error("❌ Có lỗi xảy ra:", error.message)
  }
}

// Chạy chương trình
xlsxToJson()

