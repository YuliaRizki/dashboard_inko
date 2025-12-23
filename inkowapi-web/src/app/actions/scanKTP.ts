'use server'

export async function proxyScanKTP(formData: FormData) {
  console.log('Server Action: proxyScanKTP called')
  try {
    const file = formData.get('file') as File
    if (file) {
      console.log(`Server Action: Processing file ${file.name} (${file.size} bytes)`)
    } else {
      console.warn('Server Action: No file found in FormData')
    }

    const response = await fetch('https://ktp-ocr.kadin360.id/scan-ktp', {
      method: 'POST',
      body: formData,
    })

    console.log(`Server Action: external API Status ${response.status} ${response.statusText}`)

    if (!response.ok) {
      console.error(`OCR API fail: ${response.status} ${response.statusText}`)
      return { success: false, error: response.statusText }
    }

    const data = await response.json()
    console.log('Server Action: Success')
    return { success: true, data }
  } catch (error) {
    console.error('OCR Proxy Error:', error)
    return { success: false, error: 'Network error connecting to OCR service' }
  }
}
