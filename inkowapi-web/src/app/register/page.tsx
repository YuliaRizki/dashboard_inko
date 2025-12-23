'use client'
import React, { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createWorker } from 'tesseract.js'
import { saveIdentityProtocol } from '../actions/saveIdentity'
import {
  ScanFace,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Shield,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const INDONESIA_REGIONS: { [key: string]: string[] } = {
  // SUMATERA
  'Aceh': [
    'Banda Aceh', 'Sabang', 'Langsa', 'Lhokseumawe', 'Subulussalam',
    'Aceh Besar', 'Aceh Barat', 'Aceh Barat Daya', 'Aceh Jaya', 'Aceh Selatan',
    'Aceh Singkil', 'Aceh Tamiang', 'Aceh Tengah', 'Aceh Tenggara', 'Aceh Timur',
    'Aceh Utara', 'Bener Meriah', 'Bireuen', 'Gayo Lues', 'Nagan Raya',
    'Pidie', 'Pidie Jaya', 'Simeulue',
  ],
  'Sumatera Utara': [
    'Medan', 'Binjai', 'Pematangsiantar', 'Tanjungbalai', 'Tebing Tinggi',
    'Sibolga', 'Padangsidimpuan', 'Gunungsitoli', 'Asahan', 'Batubara',
    'Dairi', 'Deli Serdang', 'Humbang Hasundutan', 'Karo', 'Labuhanbatu',
    'Labuhanbatu Selatan', 'Labuhanbatu Utara', 'Langkat', 'Mandailing Natal',
    'Nias', 'Nias Barat', 'Nias Selatan', 'Nias Utara', 'Padang Lawas',
    'Padang Lawas Utara', 'Pakpak Bharat', 'Samosir', 'Serdang Bedagai',
    'Simalungun', 'Tapanuli Selatan', 'Tapanuli Tengah', 'Tapanuli Utara', 'Toba',
  ],
  'Sumatera Barat': [
    'Padang', 'Bukittinggi', 'Padang Panjang', 'Payakumbuh', 'Pariaman',
    'Sawahlunto', 'Solok', 'Agam', 'Dharmasraya', 'Kepulauan Mentawai',
    'Lima Puluh Kota', 'Padang Pariaman', 'Pasaman', 'Pasaman Barat',
    'Pesisir Selatan', 'Sijunjung', 'Solok Selatan', 'Tanah Datar',
  ],
  'Riau': [
    'Pekanbaru', 'Dumai', 'Bengkalis', 'Indragiri Hilir', 'Indragiri Hulu',
    'Kampar', 'Kepulauan Meranti', 'Kuantan Singingi', 'Pelalawan',
    'Rokan Hilir', 'Rokan Hulu', 'Siak',
  ],
  'Kepulauan Riau': [
    'Batam', 'Tanjungpinang', 'Bintan', 'Karimun', 'Kepulauan Anambas',
    'Lingga', 'Natuna',
  ],
  'Jambi': [
    'Jambi', 'Sungai Penuh', 'Batanghari', 'Bungo', 'Kerinci', 'Merangin',
    'Muaro Jambi', 'Sarolangun', 'Tanjung Jabung Barat', 'Tanjung Jabung Timur', 'Tebo',
  ],
  'Sumatera Selatan': [
    'Palembang', 'Lubuklinggau', 'Pagar Alam', 'Prabumulih', 'Banyuasin',
    'Empat Lawang', 'Lahat', 'Muara Enim', 'Musi Banyuasin', 'Musi Rawas',
    'Musi Rawas Utara', 'Ogan Ilir', 'Ogan Komering Ilir', 'Ogan Komering Ulu',
    'Ogan Komering Ulu Selatan', 'Ogan Komering Ulu Timur', 'Penukal Abab Lematang Ilir',
  ],
  'Bengkulu': [
    'Bengkulu', 'Bengkulu Selatan', 'Bengkulu Tengah', 'Bengkulu Utara',
    'Kaur', 'Kepahiang', 'Lebong', 'Mukomuko', 'Rejang Lebong', 'Seluma',
  ],
  'Lampung': [
    'Bandar Lampung', 'Metro', 'Lampung Barat', 'Lampung Selatan', 'Lampung Tengah',
    'Lampung Timur', 'Lampung Utara', 'Mesuji', 'Pesawaran', 'Pesisir Barat',
    'Pringsewu', 'Tanggamus', 'Tulang Bawang', 'Tulang Bawang Barat', 'Way Kanan',
  ],
  'Bangka Belitung': [
    'Pangkalpinang', 'Bangka', 'Bangka Barat', 'Bangka Selatan', 'Bangka Tengah',
    'Belitung', 'Belitung Timur',
  ],

  // JAWA
  'DKI Jakarta': [
    'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Selatan',
    'Jakarta Utara', 'Kepulauan Seribu',
  ],
  'Jawa Barat': [
    'Bandung', 'Bekasi', 'Bogor', 'Cimahi', 'Cirebon', 'Depok', 'Sukabumi', 'Tasikmalaya',
    'Bandung Barat', 'Bekasi', 'Bogor', 'Ciamis', 'Cianjur', 'Cirebon',
    'Garut', 'Indramayu', 'Karawang', 'Kuningan', 'Majalengka', 'Pangandaran',
    'Purwakarta', 'Subang', 'Sukabumi', 'Sumedang', 'Tasikmalaya',
  ],
  'Banten': [
    'Cilegon', 'Serang', 'Tangerang', 'Tangerang Selatan', 'Lebak', 'Pandeglang',
  ],
  'Jawa Tengah': [
    'Semarang', 'Magelang', 'Pekalongan', 'Salatiga', 'Surakarta', 'Tegal',
    'Banjarnegara', 'Banyumas', 'Batang', 'Blora', 'Boyolali', 'Brebes',
    'Cilacap', 'Demak', 'Grobogan', 'Jepara', 'Karanganyar', 'Kebumen',
    'Kendal', 'Klaten', 'Kudus', 'Magelang', 'Pati', 'Pekalongan',
    'Pemalang', 'Purbalingga', 'Purworejo', 'Rembang', 'Semarang', 'Sragen',
    'Sukoharjo', 'Tegal', 'Temanggung', 'Wonogiri', 'Wonosobo',
  ],
  'DI Yogyakarta': [
    'Yogyakarta', 'Bantul', 'Gunungkidul', 'Kulon Progo', 'Sleman',
  ],
  'Jawa Timur': [
    'Surabaya', 'Batu', 'Blitar', 'Kediri', 'Madiun', 'Malang', 'Mojokerto',
    'Pasuruan', 'Probolinggo', 'Bangkalan', 'Banyuwangi', 'Blitar', 'Bojonegoro',
    'Bondowoso', 'Gresik', 'Jember', 'Jombang', 'Kediri', 'Lamongan',
    'Lumajang', 'Madiun', 'Magetan', 'Malang', 'Mojokerto', 'Nganjuk',
    'Ngawi', 'Pacitan', 'Pamekasan', 'Pasuruan', 'Ponorogo', 'Probolinggo',
    'Sampang', 'Sidoarjo', 'Situbondo', 'Sumenep', 'Trenggalek', 'Tuban', 'Tulungagung',
  ],

  // KALIMANTAN
  'Kalimantan Barat': [
    'Pontianak', 'Singkawang', 'Bengkayang', 'Kapuas Hulu', 'Kayong Utara',
    'Ketapang', 'Kubu Raya', 'Landak', 'Melawi', 'Mempawah', 'Sambas',
    'Sanggau', 'Sekadau', 'Sintang',
  ],
  'Kalimantan Tengah': [
    'Palangkaraya', 'Barito Selatan', 'Barito Timur', 'Barito Utara',
    'Gunung Mas', 'Kapuas', 'Katingan', 'Kotawaringin Barat', 'Kotawaringin Timur',
    'Lamandau', 'Murung Raya', 'Pulang Pisau', 'Seruyan', 'Sukamara',
  ],
  'Kalimantan Selatan': [
    'Banjarmasin', 'Banjarbaru', 'Balangan', 'Banjar', 'Barito Kuala',
    'Hulu Sungai Selatan', 'Hulu Sungai Tengah', 'Hulu Sungai Utara',
    'Kotabaru', 'Tabalong', 'Tanah Bumbu', 'Tanah Laut', 'Tapin',
  ],
  'Kalimantan Timur': [
    'Balikpapan', 'Bontang', 'Samarinda', 'Berau', 'Kutai Barat',
    'Kutai Kartanegara', 'Kutai Timur', 'Mahakam Ulu', 'Paser', 'Penajam Paser Utara',
  ],
  'Kalimantan Utara': [
    'Tarakan', 'Bulungan', 'Malinau', 'Nunukan', 'Tana Tidung',
  ],

  // SULAWESI
  'Sulawesi Utara': [
    'Manado', 'Bitung', 'Kotamobagu', 'Tomohon', 'Bolaang Mongondow',
    'Bolaang Mongondow Selatan', 'Bolaang Mongondow Timur', 'Bolaang Mongondow Utara',
    'Kepulauan Sangihe', 'Kepulauan Siau Tagulandang Biaro', 'Kepulauan Talaud',
    'Minahasa', 'Minahasa Selatan', 'Minahasa Tenggara', 'Minahasa Utara',
  ],
  'Sulawesi Tengah': [
    'Palu', 'Banggai', 'Banggai Kepulauan', 'Banggai Laut', 'Buol',
    'Donggala', 'Morowali', 'Morowali Utara', 'Parigi Moutong', 'Poso',
    'Sigi', 'Tojo Una-Una', 'Toli-Toli',
  ],
  'Sulawesi Selatan': [
    'Makassar', 'Palopo', 'Parepare', 'Bantaeng', 'Barru', 'Bone', 'Bulukumba',
    'Enrekang', 'Gowa', 'Jeneponto', 'Kepulauan Selayar', 'Luwu', 'Luwu Timur',
    'Luwu Utara', 'Maros', 'Pangkajene Kepulauan', 'Pinrang', 'Sidenreng Rappang',
    'Sinjai', 'Soppeng', 'Takalar', 'Tana Toraja', 'Toraja Utara', 'Wajo',
  ],
  'Sulawesi Tenggara': [
    'Kendari', 'Bau-Bau', 'Bombana', 'Buton', 'Buton Selatan', 'Buton Tengah',
    'Buton Utara', 'Kolaka', 'Kolaka Timur', 'Kolaka Utara', 'Konawe',
    'Konawe Kepulauan', 'Konawe Selatan', 'Konawe Utara', 'Muna', 'Muna Barat', 'Wakatobi',
  ],
  'Gorontalo': [
    'Gorontalo', 'Boalemo', 'Bone Bolango', 'Gorontalo Utara', 'Pohuwato',
  ],
  'Sulawesi Barat': [
    'Mamuju', 'Majene', 'Mamasa', 'Mamuju Tengah', 'Pasangkayu', 'Polewali Mandar',
  ],

  // BALI & NUSA TENGGARA
  'Bali': [
    'Denpasar', 'Badung', 'Bangli', 'Buleleng', 'Gianyar', 'Jembrana',
    'Karangasem', 'Klungkung', 'Tabanan',
  ],
  'Nusa Tenggara Barat': [
    'Mataram', 'Bima', 'Bima', 'Dompu', 'Lombok Barat', 'Lombok Tengah',
    'Lombok Timur', 'Lombok Utara', 'Sumbawa', 'Sumbawa Barat',
  ],
  'Nusa Tenggara Timur': [
    'Kupang', 'Alor', 'Belu', 'Ende', 'Flores Timur', 'Kupang', 'Lembata',
    'Malaka', 'Manggarai', 'Manggarai Barat', 'Manggarai Timur', 'Nagekeo',
    'Ngada', 'Rote Ndao', 'Sabu Raijua', 'Sikka', 'Sumba Barat',
    'Sumba Barat Daya', 'Sumba Tengah', 'Sumba Timur', 'Timor Tengah Selatan', 'Timor Tengah Utara',
  ],

  // MALUKU
  'Maluku': [
    'Ambon', 'Tual', 'Buru', 'Buru Selatan', 'Kepulauan Aru', 'Kepulauan Tanimbar',
    'Maluku Barat Daya', 'Maluku Tengah', 'Maluku Tenggara', 'Seram Bagian Barat', 'Seram Bagian Timur',
  ],
  'Maluku Utara': [
    'Ternate', 'Tidore Kepulauan', 'Halmahera Barat', 'Halmahera Selatan',
    'Halmahera Tengah', 'Halmahera Timur', 'Halmahera Utara', 'Kepulauan Sula', 'Pulau Morotai', 'Pulau Taliabu',
  ],

  // PAPUA
  'Papua': [
    'Jayapura', 'Biak Numfor', 'Jayapura', 'Keerom', 'Kepulauan Yapen',
    'Mamberamo Raya', 'Sarmi', 'Supiori', 'Waropen',
  ],
  'Papua Barat': [
    'Manokwari', 'Sorong', 'Fakfak', 'Kaimana', 'Manokwari Selatan',
    'Pegunungan Arfak', 'Sorong', 'Sorong Selatan', 'Tambrauw', 'Teluk Bintuni', 'Teluk Wondama',
  ],
  'Papua Selatan': [
    'Merauke', 'Asmat', 'Boven Digoel', 'Mappi',
  ],
  'Papua Tengah': [
    'Nabire', 'Deiyai', 'Dogiyai', 'Intan Jaya', 'Mimika', 'Paniai', 'Puncak', 'Puncak Jaya',
  ],
  'Papua Pegunungan': [
    'Wamena', 'Jayawijaya', 'Lanny Jaya', 'Mamberamo Tengah', 'Nduga',
    'Pegunungan Bintang', 'Tolikara', 'Yalimo', 'Yahukimo',
  ],
  'Papua Barat Daya': [
    'Sorong', 'Maybrat', 'Raja Ampat', 'Sorong Selatan', 'Tambrauw',
  ],
}

const colors = {
  primary: 'var(--ink-green-primary)',
  accent: 'var(--ink-green-accent)',
  mint: 'var(--ink-green-mint)',
  deep: 'var(--ink-green-deep)',
  cyan: 'var(--ink-register-accent)',
  cyanLight: 'var(--ink-accent-light-register)',
}

export default function IdentityVerificationPage() {
  const router = useRouter()
  const ktpInputRef = useRef<HTMLInputElement>(null)
  const npwpInputRef = useRef<HTMLInputElement>(null)

  const [isScanningKTP, setIsScanningKTP] = useState(false)
  const [isScanningNPWP, setIsScanningNPWP] = useState(false)
  const [ktpPreview, setKtpPreview] = useState<string | null>(null)
  const [npwpPreview, setNpwpPreview] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [religion, setReligion] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [occupation, setOccupation] = useState('')
  const [nationality, setNationality] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [address, setAddress] = useState('')
  const [isFinalized, setIsFinalized] = useState(false)

  const availableCities = useMemo(() => {
    return selectedProvince
      ? INDONESIA_REGIONS[selectedProvince as keyof typeof INDONESIA_REGIONS]
      : []
  }, [selectedProvince])

  const cleanOCRText = (text: string) => {
    return text.replace(/[:|]/g, ' ').replace(/\s+/g, ' ').trim()
  }

  const cleanNIK = (text: string) => {
    // Replace common OCR misreads: O→0, I/l/L→1, T→7, S→5, B→8, Z→2
    const potentialNik = text
      .replace(/[O]/g, '0')
      .replace(/[IlL|]/g, '1')
      .replace(/[T]/g, '7')
      .replace(/[S]/g, '5')
      .replace(/[B]/g, '8')
      .replace(/[Z]/g, '2')
      .replace(/[^0-9]/g, '')
    const match = potentialNik.match(/\d{16}/)
    return match ? match[0] : ''
  }

  const matchFromList = (text: string, validList: string[]) => {
    if (!text) return ''
    const upper = text.toUpperCase().replace(/[^A-Z]/g, '')
    
    // Special handling for religion - check first before generic matching
    // OCR often misreads ISLAM as: 1SLAM, ISLM, ISIAM, |SLAM, lSLAM, SEAN, SEAM, etc.
    if (upper.includes('SLAM') || upper.includes('SLAV') || upper.includes('ISIAM') || 
        upper.includes('ISLM') || upper.includes('ISL') || 
        upper === 'SEM' || upper === 'SEAN' || upper === 'SEAM' || upper === 'SIAM' ||
        upper.includes('MOSLEM') || upper.includes('MUSLIM') || 
        /^[I1L|]?S[L1I]?A?M$/i.test(upper) || /ISL.?M/i.test(upper) ||
        /^S[EI]A[MN]$/i.test(upper)) {
      return 'ISLAM'
    }
    if (upper.includes('RISTEN') || upper.includes('KRISTEN') || upper.includes('KR1STEN')) return 'KRISTEN'
    if (upper.includes('ATOLIK') || upper.includes('KATOLIK') || upper.includes('KATHOL')) return 'KATOLIK'
    if (upper.includes('HINDU') || upper.includes('H1NDU')) return 'HINDU'
    if (upper.includes('BUDDHA') || upper.includes('BUDHA') || upper.includes('BUDDA')) return 'BUDDHA'
    if (upper.includes('KONGHUCU') || upper.includes('KHONGHUCU') || upper.includes('KONGHU')) return 'KONGHUCU'
    
    for (const valid of validList) {
      const validClean = valid.replace(/[^A-Z]/g, '')
      if (upper.includes(validClean) || validClean.includes(upper)) {
        return valid
      }
    }
    if (upper.includes('KAWIN')) return 'KAWIN'
    return text.toUpperCase()
  }

  // Valid Indonesian province codes (first 2 digits of NIK)
  const VALID_PROVINCE_CODES = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // Sumatera
    '21', // Kepulauan Riau
    '31', '32', '33', '34', '35', '36', // Jawa
    '51', '52', '53', // Bali, NTB, NTT
    '61', '62', '63', '64', '65', // Kalimantan
    '71', '72', '73', '74', '75', '76', // Sulawesi
    '81', '82', // Maluku
    '91', '92', '94', // Papua
  ]

  // Validate if a NIK has valid date of birth
  // NIK format: PPKKCC DDMMYY XXXX
  // Position 6-11: DDMMYY (date of birth, DD+40 for female)
  const isValidNIKDate = (nik: string) => {
    if (nik.length !== 16) return false
    
    const dd = parseInt(nik.substring(6, 8))
    const mm = parseInt(nik.substring(8, 10))
    const yy = parseInt(nik.substring(10, 12))
    
    // Day: 01-31 for male, 41-71 for female
    const isValidDay = (dd >= 1 && dd <= 31) || (dd >= 41 && dd <= 71)
    // Month: 01-12
    const isValidMonth = mm >= 1 && mm <= 12
    // Year: reasonable range (00-99, representing 1900s or 2000s)
    const isValidYear = yy >= 0 && yy <= 99
    
    return isValidDay && isValidMonth && isValidYear
  }

  // Validate if a NIK looks correct (province + date validation)
  const isValidNIK = (nik: string) => {
    if (nik.length !== 16) return false
    // Check if starts with valid province code
    const provinceCode = nik.substring(0, 2)
    if (!VALID_PROVINCE_CODES.includes(provinceCode)) return false
    // Also validate the date portion
    return isValidNIKDate(nik)
  }

  // Score a NIK candidate - higher is better
  const scoreNIK = (nik: string) => {
    let score = 0
    if (nik.length !== 16) return -1
    
    const provinceCode = nik.substring(0, 2)
    // Prefer Jawa codes (31-36) as most common
    if (['31', '32', '33', '34', '35', '36'].includes(provinceCode)) score += 10
    else if (VALID_PROVINCE_CODES.includes(provinceCode)) score += 5
    
    // Validate date
    if (isValidNIKDate(nik)) score += 20
    
    // Prefer NIKs that don't start with 1 followed by 3 (common OCR error)
    if (!nik.startsWith('13')) score += 2
    
    return score
  }

  /* Robust NIK Finder */
  const findBestNIK = (text: string) => {
    console.log('DEBUG findBestNIK input:', text)
    
    // 1. First apply OCR character substitutions
    const substituted = text
      .replace(/[O]/g, '0')
      .replace(/[IlL|]/g, '1')
      .replace(/[T]/g, '7')
      .replace(/[S]/g, '5')
      .replace(/[B]/g, '8')
      .replace(/[Z]/g, '2')
    
    // 2. Extract all digits from substituted text
    const digitsOnly = substituted.replace(/[^0-9]/g, '')
    console.log('DEBUG digits only:', digitsOnly)
    
    // 2. If we have more than 16 digits, find all possible 16-digit windows
    const candidates: { nik: string; score: number }[] = []
    
    if (digitsOnly.length >= 16) {
      for (let i = 0; i <= digitsOnly.length - 16; i++) {
        const candidate = digitsOnly.substring(i, i + 16)
        const score = scoreNIK(candidate)
        if (score > 0) {
          candidates.push({ nik: candidate, score })
          console.log(`DEBUG candidate at ${i}: ${candidate}, score: ${score}`)
        }
      }
    }
    
    // 3. Sort by score (highest first) and return best match
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score)
      console.log('DEBUG best NIK:', candidates[0].nik)
      return candidates[0].nik
    }
    
    // 4. Fallback: if no valid candidates, try to find any 16 digits
    const potentialNiks = digitsOnly.match(/\d{16}/g)
    if (potentialNiks && potentialNiks.length > 0) {
      console.log('DEBUG fallback NIK:', potentialNiks[0])
      return potentialNiks[0]
    }

    return ''
  }

  // RGB to HSL conversion for better color detection
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    return [h * 360, s * 100, l * 100]
  }

  // Preprocess KTP image - minimal preprocessing, let Tesseract do the work
  const preprocessImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // Scale up 2x for better OCR
        const scale = 2
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const width = canvas.width
        const height = canvas.height
        
        // Step 1: Convert to grayscale first
        const grayscale = new Uint8Array(width * height)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2]
          // Use luminosity method
          const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
          grayscale[i / 4] = gray
        }
        
        // Step 2: Apply Gaussian blur to reduce texture/emboss noise
        const blurred = new Uint8Array(width * height)
        for (let i = 0; i < grayscale.length; i++) blurred[i] = grayscale[i]
        
        const blurKernel = [
          1/16, 2/16, 1/16,
          2/16, 4/16, 2/16,
          1/16, 2/16, 1/16
        ]
        
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            let sum = 0
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const idx = (y + ky) * width + (x + kx)
                const kIdx = (ky + 1) * 3 + (kx + 1)
                sum += grayscale[idx] * blurKernel[kIdx]
              }
            }
            blurred[y * width + x] = Math.round(sum)
          }
        }
        
        // Step 3: Enhance contrast using histogram stretching
        let minVal = 255, maxVal = 0
        for (let i = 0; i < blurred.length; i++) {
          if (blurred[i] < minVal) minVal = blurred[i]
          if (blurred[i] > maxVal) maxVal = blurred[i]
        }
        
        const range = maxVal - minVal || 1
        for (let i = 0; i < blurred.length; i++) {
          blurred[i] = Math.round(((blurred[i] - minVal) / range) * 255)
        }
        
        console.log(`DEBUG: Contrast range ${minVal}-${maxVal}`)
        
        // Step 4: Apply to canvas - keep as grayscale (Tesseract handles binarization)
        for (let i = 0; i < blurred.length; i++) {
          const idx = i * 4
          data[idx] = blurred[i]
          data[idx + 1] = blurred[i]
          data[idx + 2] = blurred[i]
        }
        
        ctx.putImageData(imageData, 0, 0)
        
        console.log('DEBUG: KTP preprocessing complete (grayscale + contrast)')
        
        canvas.toBlob((blob) => {
          resolve(blob || file)
        }, 'image/png')
      }
      img.src = URL.createObjectURL(file)
    })
  }
  
  // Clean address from contaminated KTP fields and OCR noise
  const cleanAddress = (rawAddress: string): string => {
    let cleaned = rawAddress
    
    // Remove dashes (common OCR artifact)
    cleaned = cleaned.replace(/[—–-]{2,}/g, ' ').replace(/[—–]/g, '')
    
    // Remove common KTP field labels and values that shouldn't be in address
    const patternsToRemove = [
      // KTP field contamination
      /\bLAKI[\s-]*LAKI\b/gi,
      /\bPEREMPUAN\b/gi,
      /\bGOL\.?\s*DARAH\b/gi,
      /\b(GOL|GOLONGAN)\s*[ABOS+-]+\b/gi,
      /\bJENIS\s*KELAMIN\b/gi,
      /\bAGAMA\s*:?\s*\w+\b/gi,
      /\bSTATUS\s*PERKAWINAN\b/gi,
      /\bPEKERJAAN\s*:?\s*\w+\b/gi,
      /\bKEWARGANEGARAAN\b/gi,
      /\bBERLAKU\s*HINGGA\b/gi,
      /\bSEUMUR\s*HIDUP\b/gi,
      /\b\d{2}[-/.]\d{2}[-/.]\d{4}\b/g, // dates
      
      // OCR noise patterns - random short character sequences
      /\s+[)\(}\{]\s*/g,  // stray brackets
      /\s+TV\s+/gi,       // "TV" noise
      /\bBR\s*FO\b/gi,    // "BR FO" noise
      /\bNN\b/gi,         // "NN" noise
      /\bDL\b/gi,         // "DL" noise
      /\bWNI\b/gi,
      /\bWNA\b/gi,
      /\b[iI]\s+[TtHh]h?\b/gi, // "i Th" noise
      
      // Single/double character noise at word boundaries
      /\s+[A-Z]{1,2}\s+(?=[A-Z]{3,})/g,  // 1-2 char between words
      /(?<=[A-Z]{3,})\s+[A-Z]{1,2}\s*$/g, // 1-2 char at end
      
      // Punctuation noise
      /[:;|]+\s*[-:;|]*\s*[-:;|]*/g,
      /[)\(}\{\[\]]/g,
    ]
    
    for (const pattern of patternsToRemove) {
      cleaned = cleaned.replace(pattern, ' ')
    }
    
    // Fix RT/RW format - normalize various OCR misreads
    // Pattern: digits that should be RT/RW format
    cleaned = cleaned.replace(/RT\/RW\s*:?\s*(\d{3,})/gi, (match, digits) => {
      // If we have 6+ digits like "0020098", try to split into RT/RW
      if (digits.length >= 6) {
        const rt = digits.substring(0, 3).replace(/^0+/, '') || '0'
        const rw = digits.substring(3, 6).replace(/^0+/, '') || '0'
        return `RT/RW ${rt.padStart(3, '0')}/${rw.padStart(3, '0')}`
      }
      return match
    })
    
    // Clean up extra spaces and uppercase
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase()
    
    // Remove any remaining short garbage words (1-2 chars that aren't RT, RW, etc)
    const validShortWords = ['RT', 'RW', 'JL', 'GG', 'NO', 'KM']
    cleaned = cleaned.split(' ').filter(word => {
      if (word.length <= 2) {
        return validShortWords.includes(word) || /^\d+$/.test(word)
      }
      return true
    }).join(' ')
    
    return cleaned
  }

  const handleScan = async (file: File, type: 'ktp' | 'npwp') => {
    const setIsScanning = type === 'ktp' ? setIsScanningKTP : setIsScanningNPWP
    const setPreview = type === 'ktp' ? setKtpPreview : setNpwpPreview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setIsScanning(true)

    try {
      if (type === 'ktp') {
        // Use Python API for KTP scanning (better accuracy)
        const formData = new FormData()
        formData.append('file', file)
        
        try {
          const response = await fetch('https://ktp-ocr.kadin360.id/scan-ktp', {
            method: 'POST',
            body: formData,
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('DEBUG: Python API response:', data)
            
            // Set all fields from API response
            if (data.nik) setIdNumber(data.nik)
            if (data.nama) setFullName(data.nama)
            if (data.tempat_lahir) setBirthPlace(data.tempat_lahir)
            if (data.tanggal_lahir) setBirthDate(data.tanggal_lahir)
            if (data.agama) setReligion(data.agama)
            if (data.status_perkawinan) setMaritalStatus(data.status_perkawinan)
            if (data.pekerjaan) setOccupation(data.pekerjaan)
            if (data.kewarganegaraan) setNationality(data.kewarganegaraan)
            
            // Combine address fields
            const addressParts = [
              data.alamat,
              data.rt_rw ? `RT/RW ${data.rt_rw}` : '',
              data.kelurahan ? `KEL. ${data.kelurahan}` : '',
              data.kecamatan ? `KEC. ${data.kecamatan}` : '',
            ].filter(Boolean)
            if (addressParts.length > 0) {
              setAddress(addressParts.join(' '))
            }
          } else {
            console.warn('Python API failed, falling back to Tesseract.js')
            await handleScanWithTesseract(file)
          }
        } catch (apiError) {
          console.warn('Python API not available, falling back to Tesseract.js:', apiError)
          await handleScanWithTesseract(file)
        }
      } else if (type === 'npwp') {
        // NPWP still uses Tesseract.js
        await handleScanNPWP(file)
      }
    } catch (error) {
      console.error('OCR Error:', error)
      alert('Gagal memindai dokumen. Silakan isi manual.')
    } finally {
      setIsScanning(false)
    }
  }

  // Fallback: Scan KTP using Tesseract.js
  const handleScanWithTesseract = async (file: File) => {
    // Preprocess image for better OCR
    const processedImage = await preprocessImage(file)
    
    // Create worker with English (better for digits) and Indonesian
    const worker = await createWorker(['eng', 'ind'])
    
    const result = await worker.recognize(processedImage)
    const extractedText = result.data.text
    console.log('DEBUG: Raw KTP Text (Tesseract):', extractedText)

    // Helper to clean OCR text
    const cleanText = (text: string) => {
      return text
        .replace(/[^a-zA-Z\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase()
    }

    // 1. NIK
    const finalNik = findBestNIK(extractedText)
    if (finalNik) setIdNumber(finalNik)

        // 2. Name
        const nameMatch = extractedText.match(/Nama\s*[:\s]*([^\n]+)/i)
        if (nameMatch) {
          let n = cleanText(nameMatch[1])
          // Remove RT/RW and other noise that might be captured
          n = n.replace(/\s+(RT|RW|TA|TH|NIK|JL|GG|NO)\s*$/gi, '')
            .replace(/\s+\d+\s*$/g, '') // Remove trailing numbers
            .replace(/\s+[A-Z]{1,2}\s*$/g, '') // Remove 1-2 char noise at end
            .trim()
          // Fix common OCR misreads in names: Z→A (AMANDZ→AMANDA)
          n = n.replace(/Z(?=[A-Z\s]|$)/g, 'A')
          console.log('DEBUG: Parsed name:', n)
          setFullName(n)
        }

        // 3. Birth Date - look for DD-MM-YYYY pattern
        const dateMatch = extractedText.match(/(\d{2}[-/.]\d{2}[-/.]\d{4})/)
        if (dateMatch) {
          setBirthDate(dateMatch[0].replace(/[/.]/g, '-'))
        }

        // 4. Birth Place - from Tempat/Tgl Lahir line
        const birthLine = extractedText.match(/(?:Tempat\/Tgl\s*Lahir|Lahir)\s*[:\s]*([^\n\d]+)/i)
        if (birthLine) {
          const place = cleanText(birthLine[1])
          console.log('DEBUG: Parsed birth place:', place)
          setBirthPlace(place)
        }

        // 5. Religion
        const religionMatch = extractedText.match(/Agama\s*[:\s]*([^\n]+)/i)
        if (religionMatch) {
          const rel = cleanText(religionMatch[1])
          console.log('DEBUG: Parsed religion:', rel)
          // Map to standard values
          if (rel.includes('ISLAM')) setReligion('ISLAM')
          else if (rel.includes('KRISTEN')) setReligion('KRISTEN')
          else if (rel.includes('KATOLIK')) setReligion('KATOLIK')
          else if (rel.includes('HINDU')) setReligion('HINDU')
          else if (rel.includes('BUDDHA')) setReligion('BUDDHA')
          else if (rel.includes('KONGHUCU')) setReligion('KONGHUCU')
          else setReligion(rel)
        }

        // 6. Marital Status
        const maritalMatch = extractedText.match(/(?:Status\s*)?Perkawinan\s*[:\s]*([^\n]+)/i)
        if (maritalMatch) {
          let status = cleanText(maritalMatch[1])
          // Remove city names that might be captured
          status = status.replace(/\b(SIDOARJO|SIDOARO|SURABAYA|JAKARTA|BANDUNG|SEMARANG|MALANG|YOGYAKARTA)\b/gi, '').trim()
          console.log('DEBUG: Parsed marital status:', status)
          if (status.includes('BELUM')) setMaritalStatus('BELUM KAWIN')
          else if (status.includes('CERAI') && status.includes('HIDUP')) setMaritalStatus('CERAI HIDUP')
          else if (status.includes('CERAI') && status.includes('MATI')) setMaritalStatus('CERAI MATI')
          else if (status.includes('KAWIN')) setMaritalStatus('KAWIN')
          else setMaritalStatus(status)
        }

        // 7. Occupation - clean from city/province names that might be captured
        const jobMatch = extractedText.match(/Pekerjaan\s*[:\s]*([^\n]+)/i)
        if (jobMatch) {
          let job = cleanText(jobMatch[1])
          
          // Fix common OCR patterns
          // DBELUM/DBELUMTIDAK → BELUM/TIDAK (D is noise from dashes)
          job = job.replace(/^D?BELUM\s*\/??\s*TIDAK/i, 'BELUM/TIDAK')
          job = job.replace(/^D+/i, '') // Remove leading D's
          
          // Remove city/province names that might be captured from KTP header
          const citiesToRemove = [
            'JAKARTA BARAT', 'JAKARTA TIMUR', 'JAKARTA SELATAN', 'JAKARTA UTARA', 'JAKARTA PUSAT',
            'KOTA JAKARTA', 'DKI JAKARTA', 'JAKARTA',
            'BANDUNG', 'SURABAYA', 'MEDAN', 'SEMARANG', 'MAKASSAR', 'PALEMBANG',
            'TANGERANG', 'DEPOK', 'BEKASI', 'BOGOR', 'MALANG', 'YOGYAKARTA',
            'DENPASAR', 'BALIKPAPAN', 'BATAM', 'PEKANBARU', 'PADANG',
            'KOTA ADMINISTRASI', 'KABUPATEN', 'KOTA',
          ]
          
          for (const city of citiesToRemove) {
            job = job.replace(new RegExp(`\\b${city}\\b`, 'gi'), '').trim()
          }
          
          // Clean up extra spaces
          job = job.replace(/\s+/g, ' ').trim()
          
          console.log('DEBUG: Parsed occupation:', job)
          setOccupation(job)
        }

        // 8. Address - combine multiple lines and clean from contaminated fields
        let addressRaw = ''
        const alamatMatch = extractedText.match(/Alamat\s*[:\s]*([^\n]+)/i)
        if (alamatMatch) addressRaw += alamatMatch[1] + ' '
        
        const rtrwMatch = extractedText.match(/RT\/RW\s*[:\s]*([\d\/]+)/i)
        if (rtrwMatch) addressRaw += 'RT/RW ' + rtrwMatch[1] + ' '
        
        // Be specific: match "Kel/Desa" or "Kel." or "Kelurahan" - NOT just "Kel" (which matches Jenis Kelamin)
        const kelMatch = extractedText.match(/(?:Kel(?:urahan)?\/Desa|Kel\.|Kelurahan|Desa)\s*[:\s]*([^\n]+)/i)
        if (kelMatch) addressRaw += 'KEL. ' + kelMatch[1] + ' '
        
        const kecMatch = extractedText.match(/Kecamatan\s*[:\s]*([^\n]+)/i)
        if (kecMatch) addressRaw += 'KEC. ' + kecMatch[1]
        
        if (addressRaw.trim()) {
          // Clean the address from contaminated KTP fields
          const cleanedAddr = cleanAddress(addressRaw)
          console.log('DEBUG: Raw address:', addressRaw)
          console.log('DEBUG: Cleaned address:', cleanedAddr)
          setAddress(cleanedAddr)
        }

        // 9. Nationality
        if (extractedText.match(/WNI/i)) setNationality('WNI')
        else if (extractedText.match(/WNA/i)) setNationality('WNA')

        await worker.terminate()
  }

  // Scan NPWP using Tesseract.js
  const handleScanNPWP = async (file: File) => {
    const processedImage = await preprocessImage(file)
    const worker = await createWorker(['eng', 'ind'])
    const result = await worker.recognize(processedImage)
    const extractedText = result.data.text
    console.log('DEBUG: Raw NPWP Text:', extractedText)

    const npwpClean = extractedText.replace(/[^0-9.\-]/g, '')
    const npwpMatch = npwpClean.match(/\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}/)
    if (npwpMatch) setTaxId(npwpMatch[0])
    else {
      const digits = npwpClean.replace(/[^0-9]/g, '')
      if (digits.length >= 15) {
        const fmt = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
          5,
          8,
        )}.${digits.slice(8, 9)}-${digits.slice(9, 12)}.${digits.slice(12, 15)}`
        setTaxId(fmt)
      }
    }

    await worker.terminate()
  }

  const handleFinalize = async () => {
    if (!idNumber || !fullName) {
      alert('PROTOCOL INCOMPLETE: Please ensure NIK and Name are scanned.')
      return
    }

    const protocolData = {
      fullName,
      idNumber,
      birthPlace,
      birthDate,
      taxId,
      religion,
      nationality,
      maritalStatus,
      occupation,
      address,
    }

    const result = await saveIdentityProtocol(protocolData)

    if (result.success) {
      setIsFinalized(true)
    } else {
      alert(`SECURITY BREACH: ${result.error}`)
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{
            background:
              'radial-gradient(circle, rgba(127, 255, 199, 0.3) 0%, rgba(31, 143, 74, 0.12) 50%, transparent 70%)',
          }}
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 35, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[130px]"
          style={{
            background: 'radial-gradient(circle, rgba(8, 145, 178, 0.2) 0%, transparent 60%)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[1200px] h-screen md:h-[85vh] glass-panel-premium flex flex-col overflow-hidden md:rounded-[32px]"
      >
        <div
          className="p-6 md:p-8 pb-4 shrink-0 z-20"
          style={{
            background: 'linear-gradient(180deg, rgba(31, 143, 74, 0.06) 0%, transparent 100%)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h2
                  className="text-2xl md:text-3xl font-black uppercase tracking-wide py-1 bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'var(--ink-gradient-emerald)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    display: 'inline-block',
                    fontFamily: 'var(--font-montserrat)',
                  }}
                >
                  Data Anggota
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-[#7A9990] uppercase tracking-widest self-end md:self-auto">
              <span>STEP 02</span>
              <div className="w-32 h-2 bg-[#E8F5F0] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.mint})`,
                    boxShadow: '0 0 10px rgba(31, 143, 74, 0.4)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-2 md:pt-6 custom-scrollbar z-10 pb-24 md:pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* KTP Upload */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => ktpInputRef.current?.click()}
              className="h-40 md:h-52 rounded-2xl flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden transition-all"
              style={{
                background: ktpPreview
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'linear-gradient(145deg, rgba(31, 143, 74, 0.06) 0%, rgba(255, 255, 255, 0.8) 100%)',
                border: ktpPreview
                  ? `2px solid ${colors.primary}`
                  : `2px dashed rgba(31, 143, 74, 0.25)`,
                boxShadow: ktpPreview
                  ? `0 0 30px rgba(31, 143, 74, 0.15), inset 0 0 20px rgba(31, 143, 74, 0.05)`
                  : '0 10px 30px -10px rgba(11, 61, 46, 0.1)',
              }}
            >
              {ktpPreview ? (
                <>
                  <img
                    src={ktpPreview}
                    alt="KTP Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                  <div className="relative z-10 flex flex-col items-center">
                    {isScanningKTP ? (
                      <Loader2
                        className="animate-spin"
                        style={{ color: colors.primary }}
                        size={36}
                      />
                    ) : (
                      <CheckCircle2 style={{ color: colors.primary }} size={36} />
                    )}
                    <p
                      className="mt-3 text-xs font-bold uppercase tracking-widest"
                      style={{ color: colors.deep }}
                    >
                      KTP Uploaded
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {isScanningKTP ? (
                    <Loader2 className="animate-spin" style={{ color: colors.primary }} size={40} />
                  ) : (
                    <ScanFace
                      className="transition-colors"
                      style={{ color: '#7A9990' }}
                      size={44}
                    />
                  )}
                  <p className="mt-3 text-xs font-bold text-[#7A9990] uppercase tracking-widest">
                    Upload KTP
                  </p>
                  <p className="text-[10px] text-[#B8CCC4] mt-1">Klik Untuk Scan KTP</p>
                </>
              )}
            </motion.div>

            {/* NPWP Upload */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => npwpInputRef.current?.click()}
              className="h-40 md:h-52 rounded-2xl flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden transition-all"
              style={{
                background: npwpPreview
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'linear-gradient(145deg, rgba(8, 145, 178, 0.06) 0%, rgba(255, 255, 255, 0.8) 100%)',
                border: npwpPreview
                  ? `2px solid ${colors.cyan}`
                  : `2px dashed rgba(8, 145, 178, 0.25)`,
                boxShadow: npwpPreview
                  ? `0 0 30px rgba(8, 145, 178, 0.15), inset 0 0 20px rgba(8, 145, 178, 0.05)`
                  : '0 10px 30px -10px rgba(8, 145, 178, 0.1)',
              }}
            >
              {npwpPreview ? (
                <>
                  <img
                    src={npwpPreview}
                    alt="NPWP Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                  <div className="relative z-10 flex flex-col items-center">
                    {isScanningNPWP ? (
                      <Loader2 className="animate-spin" style={{ color: colors.cyan }} size={36} />
                    ) : (
                      <CheckCircle2 style={{ color: colors.cyan }} size={36} />
                    )}
                    <p
                      className="mt-3 text-xs font-bold uppercase tracking-widest"
                      style={{ color: colors.deep }}
                    >
                      NPWP Uploaded
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {isScanningNPWP ? (
                    <Loader2 className="animate-spin" style={{ color: colors.cyan }} size={40} />
                  ) : (
                    <FileText
                      className="transition-colors"
                      style={{ color: '#7A9990' }}
                      size={44}
                    />
                  )}
                  <p className="mt-3 text-xs font-bold text-[#7A9990] uppercase tracking-widest">
                    Upload NPWP
                  </p>
                  <p className="text-[10px] text-[#B8CCC4] mt-1">Klik Untuk Scan NPWP</p>
                </>
              )}
            </motion.div>
          </div>

          {/* FORM FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <label
                className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                style={{ color: colors.primary }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.primary }} />
                Identitas Anggota
              </label>
              <input
                type="text"
                placeholder="FULL NAME"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-premium w-full uppercase"
              />
              <input
                type="text"
                placeholder="NIK (ID NUMBER)"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="input-premium w-full font-mono"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-2">
                <input
                  type="text"
                  placeholder="TEMPAT LAHIR"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  className="input-premium w-full uppercase"
                />
                <input
                  type="text"
                  placeholder="TANGGAL LAHIR"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="input-premium w-full"
                />
              </div>
              <input
                type="text"
                placeholder="NOMOR NPWP"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="input-premium w-full font-mono"
              />
            </div>

            <div className="space-y-4">
              <label
                className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                style={{ color: colors.cyan }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.cyan }} />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-2">
                <input
                  type="text"
                  placeholder="AGAMA"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="input-premium w-full uppercase"
                />
                <input
                  type="text"
                  placeholder="KEWARGANEGARAAN"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="input-premium w-full uppercase"
                />
              </div>
              <input
                type="text"
                placeholder="STATUS PERNIKAHAN"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="input-premium w-full uppercase"
              />
              <input
                type="text"
                placeholder="PEKERJAAN"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="input-premium w-full uppercase"
              />
            </div>
          </div>

          {/* RESIDENCY SECTION */}
          <div className="mt-8 space-y-4 pb-8">
            <label
              className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
              style={{ color: colors.accent }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.accent }} />
              Alamat
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="input-premium w-full text-xs font-bold"
                style={{ background: 'rgba(255, 255, 255, 0.9)' }}
              >
                <option value="" disabled>
                  Provinsi
                </option>
                {Object.keys(INDONESIA_REGIONS).map((prov) => (
                  <option key={prov} value={prov}>
                    {prov.toUpperCase()}
                  </option>
                ))}
              </select>
              <select
                value={selectedCity}
                disabled={!selectedProvince}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="input-premium w-full text-xs font-bold"
                style={{ background: 'rgba(255, 255, 255, 0.9)' }}
              >
                <option value="" disabled>
                  Kota
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <MapPin size={14} className="absolute left-4 top-4" style={{ color: '#7A9990' }} />
              <textarea
                placeholder="Alamat Lengkap"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-premium w-full h-24 pt-3 pl-10 uppercase resize-none"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="p-6 md:p-8 pt-4 md:pt-6 shrink-0 z-20 absolute bottom-0 md:relative w-full bg-white/50 md:bg-transparent backdrop-blur-md md:backdrop-blur-none"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.5)',
            background:
              'linear-gradient(0deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8)) md:transparent',
          }}
        >
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/login')}
              className="text-[#7A9990] text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-[#3D5A50] transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              onClick={handleFinalize}
              className="btn-primary w-48 md:w-64 flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]"
            >
              Finalisasi Data <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={ktpInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0], 'ktp')}
        />
        <input
          type="file"
          ref={npwpInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0], 'npwp')}
        />
      </motion.div>

      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {isFinalized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center space-y-6"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(127, 255, 199, 0.15) 0%, rgba(255, 255, 255, 0.98) 60%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(145deg, rgba(31, 143, 74, 0.15), rgba(127, 255, 199, 0.2))`,
                border: `3px solid ${colors.primary}`,
                boxShadow: `0 0 60px rgba(31, 143, 74, 0.3)`,
              }}
            >
              <CheckCircle2 size={56} style={{ color: colors.primary }} />
            </motion.div>
            <h2
              className="text-5xl font-black uppercase tracking-tighter pr-4 py-2 bg-clip-text text-transparent"
              style={{
                backgroundImage: 'var(--ink-gradient-primary)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                display: 'inline-block',
                fontFamily: 'var(--font-montserrat)',
              }}
            >
              DATA BERHASIL DIUNGGAH
            </h2>
            <p className="text-[#3D5A50] text-sm max-w-md">
              Data Anda saat ini dalam tahap verifikasi oleh admin. Selamat datang di Inkowapi
              Network—pintu menuju kemandirian ekonomi digital.
            </p>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="btn-primary px-12 uppercase tracking-widest text-[11px]"
            >
              Masuk ke Dashboard Anggota
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
