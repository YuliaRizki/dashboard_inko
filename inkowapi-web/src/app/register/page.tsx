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

const INDONESIA_REGIONS = {
  'DKI Jakarta': [
    'Jakarta Pusat',
    'Jakarta Barat',
    'Jakarta Timur',
    'Jakarta Selatan',
    'Jakarta Utara',
    'Kepulauan Seribu',
  ],
  'Jawa Barat': [
    'Bandung',
    'Bekasi',
    'Depok',
    'Bogor',
    'Cimahi',
    'Tasikmalaya',
    'Sukabumi',
    'Cirebon',
    'Garut',
    'Sumedang',
  ],
  Banten: ['Tangerang', 'Tangerang Selatan', 'Serang', 'Cilegon', 'Pandeglang', 'Lebak'],
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
    const potentialNik = text.replace(/[^0-9OIl]/g, '')
    const cleaned = potentialNik.replace(/[O]/g, '0').replace(/[Il]/g, '1')
    const match = cleaned.match(/\d{16}/)
    return match ? match[0] : ''
  }

  const matchFromList = (text: string, validList: string[]) => {
    if (!text) return ''
    const upper = text.toUpperCase().replace(/[^A-Z]/g, '')
    for (const valid of validList) {
      const validClean = valid.replace(/[^A-Z]/g, '')
      if (upper.includes(validClean) || validClean.includes(upper)) {
        return valid
      }
    }
    if (upper.includes('SLAM') || upper === 'SEM' || upper.includes('MOSLEM')) return 'ISLAM'
    if (upper.includes('RISTEN')) return 'KRISTEN'
    if (upper.includes('ATOLIK')) return 'KATOLIK'
    if (upper.includes('KAWIN')) return 'KAWIN'
    return text.toUpperCase()
  }

  /* Robust NIK Finder */
  const findBestNIK = (text: string) => {
    // 1. Look for a line explicitly labeled NIK that has ~16 digits
    const lines = text.split('\n')
    for (const line of lines) {
      if (line.match(/NIK|Nomor|NO\./i)) {
        const cleaned = cleanNIK(line)
        if (cleaned.length >= 16) return cleaned.substring(0, 16)
      }
    }
    // 2. Deep Search for ANY 16 digits sequence (ignoring non-digits)
    // This catches NIKs even if headers are missing or text is scrambled.
    // We look for a block that has 16 digits within a reasonable window.
    const digitsOnly = text.replace(/[^0-9]/g, '')
    const potentialNiks = digitsOnly.match(/\d{16}/g)

    // Return the first valid-looking 16 digit number (usually NIK is first large number)
    if (potentialNiks && potentialNiks.length > 0) return potentialNiks[0]

    return ''
  }

  const handleScan = async (file: File, type: 'ktp' | 'npwp') => {
    const setIsScanning = type === 'ktp' ? setIsScanningKTP : setIsScanningNPWP
    const setPreview = type === 'ktp' ? setKtpPreview : setNpwpPreview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setIsScanning(true)

    try {
      const worker = await createWorker('ind')
      const result = await worker.recognize(file)
      const extractedText = result.data.text
      console.log(`DEBUG: Raw ${type.toUpperCase()} Text:`, extractedText)

      if (type === 'ktp') {
        const finalNik = findBestNIK(extractedText)
        if (finalNik) setIdNumber(finalNik)

        const nameMatch = extractedText.match(/Nama\s*[:\s]*([^\n]+)/i)
        if (nameMatch) {
          let n = nameMatch[1]
            .replace(/[^a-zA-Z\s,.]/g, '')
            .trim()
            .toUpperCase()
          setFullName(n)
        }

        const dateMatch = extractedText.match(/(\d{2}-\d{2}-\d{4})/)
        if (dateMatch) setBirthDate(dateMatch[0])

        const birthLine = extractedText.match(/Lahir\s*[:\s]*([^\n]+)/i)
        if (birthLine) {
          const parts = birthLine[1].split(/[.,]\s*\d/)
          if (parts[0]) {
            setBirthPlace(
              parts[0]
                .replace(/[^a-zA-Z\s]/g, '')
                .trim()
                .toUpperCase(),
            )
          }
        }

        const religionRaw = extractedText.match(/Agama\s*[:\s]*([^\n]+)/i)
        if (religionRaw) {
          const relText = religionRaw[1]
          const validReligions = ['ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU']
          const matchedRel = matchFromList(relText, validReligions)
          setReligion(matchedRel)
        }

        // 5. Marital Status - improved for collapsed text
        const maritalRaw = extractedText.match(/Perkawinan[\s:.-]*([^\n]+)/i)
        if (maritalRaw) {
          const mText = maritalRaw[1].toUpperCase().replace(/\s/g, '') // Remove all spaces for checking

          if (
            mText.includes('BELUMKAWIN') ||
            mText.includes('BELUM') ||
            extractedText.toUpperCase().includes('BELUM KAWIN')
          ) {
            setMaritalStatus('BELUM KAWIN')
          } else if (mText.includes('CERAIHIDUP')) setMaritalStatus('CERAI HIDUP')
          else if (mText.includes('CERAIMATI')) setMaritalStatus('CERAI MATI')
          else if (mText.includes('KAWIN')) setMaritalStatus('KAWIN')
          else setMaritalStatus(cleanOCRText(maritalRaw[1]))
        }
        let fullAddr = ''
        const alamatStart = extractedText.match(/Alamat[\s:.-]*([^\n]+)/i)
        if (alamatStart) fullAddr += alamatStart[1] + ' '

        const rtrw = extractedText.match(/(?:RT\/RW|RTRW)[\s:.-]*([^\n]+)/i)
        if (rtrw) fullAddr += 'RT/RW ' + rtrw[1] + ' '

        const kel = extractedText.match(/(?:Kel|Desa)[\s:.-]*([^\n]+)/i)
        if (kel) fullAddr += 'KEL. ' + kel[1] + ' '

        const kec = extractedText.match(/Kecamatan[\s:.-]*([^\n]+)/i)
        if (kec) fullAddr += 'KEC. ' + kec[1]

        if (fullAddr) {
          let clean = fullAddr
            .replace(/\n/g, ' ')
            .replace(/[^a-zA-Z0-9\s/.,-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase()
          setAddress(clean)
        }

        // 7. Occupation
        const jobRaw = extractedText.match(/Pekerjaan[\s:.-]*([^\n]+)/i)
        if (jobRaw) {
          let j = jobRaw[1].toUpperCase()
          // Stop at known Next Field labels or City Names if they bleed in
          j = j.split(/Kewarganegaraan|JAKARTA|KOTA|KABUPATEN/i)[0]
          // Stop if we see a clear visual gap (double space)
          j = j.split(/\s{2,}/)[0]

          setOccupation(cleanOCRText(j))
        }

        // 8. Nationality
        if (extractedText.match(/WNI|INDONESIA/i)) setNationality('WNI')
        else if (extractedText.match(/WNA|ASING/i)) setNationality('WNA')
      } else if (type === 'npwp') {
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
      }

      await worker.terminate()
    } catch (error) {
      console.error('OCR Error:', error)
      alert('Gagal memindai dokumen. Silakan isi manual.')
    } finally {
      setIsScanning(false)
    }
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
