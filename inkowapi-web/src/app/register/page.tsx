"use client";
import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createWorker } from "tesseract.js";
import { saveIdentityProtocol } from "../actions/saveIdentity";
import {
  ScanFace,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";

const INDONESIA_REGIONS = {
  "DKI Jakarta": [
    "Jakarta Pusat",
    "Jakarta Barat",
    "Jakarta Timur",
    "Jakarta Selatan",
    "Jakarta Utara",
    "Kepulauan Seribu",
  ],
  "Jawa Barat": [
    "Bandung",
    "Bekasi",
    "Depok",
    "Bogor",
    "Cimahi",
    "Tasikmalaya",
    "Sukabumi",
    "Cirebon",
    "Garut",
    "Sumedang",
  ],
  Banten: [
    "Tangerang",
    "Tangerang Selatan",
    "Serang",
    "Cilegon",
    "Pandeglang",
    "Lebak",
  ],
};

// Brand Colors
// Brand Colors - Refactored to use CSS Variables
const colors = {
  primary: "var(--ink-green-primary)",
  accent: "var(--ink-green-accent)",
  mint: "var(--ink-green-mint)",
  deep: "var(--ink-green-deep)",
  cyan: "var(--ink-register-accent)",
  cyanLight: "var(--ink-accent-light-register)",
};

export default function IdentityVerificationPage() {
  const router = useRouter();
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const npwpInputRef = useRef<HTMLInputElement>(null);

  const [isScanningKTP, setIsScanningKTP] = useState(false);
  const [isScanningNPWP, setIsScanningNPWP] = useState(false);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [npwpPreview, setNpwpPreview] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [religion, setReligion] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [occupation, setOccupation] = useState("");
  const [nationality, setNationality] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [address, setAddress] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);

  const availableCities = useMemo(() => {
    return selectedProvince
      ? INDONESIA_REGIONS[selectedProvince as keyof typeof INDONESIA_REGIONS]
      : [];
  }, [selectedProvince]);

  const handleScan = async (file: File, type: "ktp" | "npwp") => {
    const setIsScanning = type === "ktp" ? setIsScanningKTP : setIsScanningNPWP;
    const setPreview = type === "ktp" ? setKtpPreview : setNpwpPreview;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsScanning(true);

    try {
      const worker = await createWorker("ind");
      const result = await worker.recognize(file);
      const extractedText = result.data.text;

      console.log(`DEBUG: Raw ${type.toUpperCase()} Text:`, extractedText);

      if (type === "ktp") {
        const nikMatch = extractedText.match(/\d{16}/);
        if (nikMatch) setIdNumber(nikMatch[0]);

        const nameMatch = extractedText.match(/Nama\s*[:\s]*([^\n]+)/i);
        if (nameMatch)
          setFullName(
            nameMatch[1]
              .replace(/[^a-zA-Z\s]/g, "")
              .trim()
              .toUpperCase()
          );

        const birthMatch = extractedText.match(
          /(?:Lahir)\s*[:\s]*([^\n,]+)[,\s]+(\d{2}-\d{2}-\d{4})/i
        );
        if (birthMatch) {
          setBirthPlace(
            birthMatch[1]
              .replace(/[^a-zA-Z\s]/g, "")
              .trim()
              .toUpperCase()
          );
          setBirthDate(birthMatch[2]);
        }

        const addressMatch = extractedText.match(
          /Alamat\s*[:\s]*([\s\S]*?)(?=Agama|$)/i
        );
        if (addressMatch) {
          const cleanAddress = addressMatch[1]
            .replace(/\n/g, " ")
            .replace(/RTIRW\s*[:\s]*/gi, "RT/RW ")
            .replace(/KELLDESA\s*[:\s—]*/gi, "KEL/DESA ")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();
          setAddress(cleanAddress);
        }

        const religionMatch = extractedText.match(/Agama\s*[:\s]*([^\n]+)/i);
        if (religionMatch)
          setReligion(
            religionMatch[1]
              .replace(/[^a-zA-Z]/g, "")
              .trim()
              .toUpperCase()
          );

        const maritalMatch = extractedText.match(
          /Perkawinan\s*[:\s]*([^\n,]+)/i
        );
        if (maritalMatch)
          setMaritalStatus(
            maritalMatch[1]
              .replace(/\b[LP]\b.*$/i, "")
              .replace(/[^a-zA-Z\s]/g, "")
              .trim()
              .toUpperCase()
          );

        const occupationMatch = extractedText.match(
          /Pekerjaan\s*[:\s]*([^\n]+)/i
        );
        if (occupationMatch)
          setOccupation(occupationMatch[1].trim().toUpperCase());

        if (extractedText.toUpperCase().includes("WNI")) setNationality("WNI");
      } else {
        const npwpMatch = extractedText.match(
          /\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}/
        );
        if (npwpMatch) setTaxId(npwpMatch[0]);
      }
      await worker.terminate();
    } catch (err) {
      console.error("OCR Error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFinalize = async () => {
    if (!idNumber || !fullName) {
      alert("PROTOCOL INCOMPLETE: Please ensure NIK and Name are scanned.");
      return;
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
    };

    const result = await saveIdentityProtocol(protocolData);

    if (result.success) {
      setIsFinalized(true);
    } else {
      alert(`SECURITY BREACH: ${result.error}`);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      {/* �️ RICH LIGHT ATMOSPHERIC BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(127, 255, 199, 0.3) 0%, rgba(31, 143, 74, 0.12) 50%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 35, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(8, 145, 178, 0.2) 0%, transparent 60%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[1200px] h-[85vh] glass-panel-premium flex flex-col overflow-hidden"
      >
        {/* HEADER */}
        <div
          className="p-8 pb-4 shrink-0 z-20"
          style={{
            background:
              "linear-gradient(180deg, rgba(31, 143, 74, 0.06) 0%, transparent 100%)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div>
                <h2
                  className="text-3xl font-black uppercase tracking-wide py-1 bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "var(--ink-gradient-emerald)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    display: "inline-block",
                    fontFamily: "var(--font-montserrat)",
                  }}
                >
                  Data Anggota
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-[#7A9990] uppercase tracking-widest">
              <span>STEP 02</span>
              <div className="w-32 h-2 bg-[#E8F5F0] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.mint})`,
                    boxShadow: "0 0 10px rgba(31, 143, 74, 0.4)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar z-10">
          {/* UPLOAD ZONES */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* KTP Upload */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => ktpInputRef.current?.click()}
              className="h-52 rounded-2xl flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden transition-all"
              style={{
                background: ktpPreview
                  ? "rgba(255, 255, 255, 0.5)"
                  : "linear-gradient(145deg, rgba(31, 143, 74, 0.06) 0%, rgba(255, 255, 255, 0.8) 100%)",
                border: ktpPreview
                  ? `2px solid ${colors.primary}`
                  : `2px dashed rgba(31, 143, 74, 0.25)`,
                boxShadow: ktpPreview
                  ? `0 0 30px rgba(31, 143, 74, 0.15), inset 0 0 20px rgba(31, 143, 74, 0.05)`
                  : "0 10px 30px -10px rgba(11, 61, 46, 0.1)",
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
                      <CheckCircle2
                        style={{ color: colors.primary }}
                        size={36}
                      />
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
                    <Loader2
                      className="animate-spin"
                      style={{ color: colors.primary }}
                      size={40}
                    />
                  ) : (
                    <ScanFace
                      className="transition-colors"
                      style={{ color: "#7A9990" }}
                      size={44}
                    />
                  )}
                  <p className="mt-3 text-xs font-bold text-[#7A9990] uppercase tracking-widest">
                    Upload KTP
                  </p>
                  <p className="text-[10px] text-[#B8CCC4] mt-1">
                    Klik Untuk Scan KTP
                  </p>
                </>
              )}
            </motion.div>

            {/* NPWP Upload */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => npwpInputRef.current?.click()}
              className="h-52 rounded-2xl flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden transition-all"
              style={{
                background: npwpPreview
                  ? "rgba(255, 255, 255, 0.5)"
                  : "linear-gradient(145deg, rgba(8, 145, 178, 0.06) 0%, rgba(255, 255, 255, 0.8) 100%)",
                border: npwpPreview
                  ? `2px solid ${colors.cyan}`
                  : `2px dashed rgba(8, 145, 178, 0.25)`,
                boxShadow: npwpPreview
                  ? `0 0 30px rgba(8, 145, 178, 0.15), inset 0 0 20px rgba(8, 145, 178, 0.05)`
                  : "0 10px 30px -10px rgba(8, 145, 178, 0.1)",
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
                      <Loader2
                        className="animate-spin"
                        style={{ color: colors.cyan }}
                        size={36}
                      />
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
                    <Loader2
                      className="animate-spin"
                      style={{ color: colors.cyan }}
                      size={40}
                    />
                  ) : (
                    <FileText
                      className="transition-colors"
                      style={{ color: "#7A9990" }}
                      size={44}
                    />
                  )}
                  <p className="mt-3 text-xs font-bold text-[#7A9990] uppercase tracking-widest">
                    Upload NPWP
                  </p>
                  <p className="text-[10px] text-[#B8CCC4] mt-1">
                    Klik Untuk Scan NPWP
                  </p>
                </>
              )}
            </motion.div>
          </div>

          {/* FORM FIELDS */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label
                className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                style={{ color: colors.primary }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: colors.primary }}
                />
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
              <div className="grid grid-cols-2 gap-2">
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
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: colors.cyan }}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
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
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: colors.accent }}
              />
              Alamat
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="input-premium w-full text-xs font-bold"
                style={{ background: "rgba(255, 255, 255, 0.9)" }}
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
                style={{ background: "rgba(255, 255, 255, 0.9)" }}
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
              <MapPin
                size={14}
                className="absolute left-4 top-4"
                style={{ color: "#7A9990" }}
              />
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
          className="p-8 pt-6 shrink-0 z-20"
          style={{
            border: "none",
            borderTop: "none",
            background: "transparent",
          }}
        >
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push("/login")}
              className="text-[#7A9990] text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-[#3D5A50] transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              onClick={handleFinalize}
              className="btn-primary w-64 flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]"
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
          onChange={(e) =>
            e.target.files?.[0] && handleScan(e.target.files[0], "ktp")
          }
        />
        <input
          type="file"
          ref={npwpInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) =>
            e.target.files?.[0] && handleScan(e.target.files[0], "npwp")
          }
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
                "radial-gradient(ellipse at center, rgba(127, 255, 199, 0.15) 0%, rgba(255, 255, 255, 0.98) 60%)",
              backdropFilter: "blur(20px)",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
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
                backgroundImage: "var(--ink-gradient-primary)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                display: "inline-block",
                fontFamily: "var(--font-montserrat)",
              }}
            >
              DATA BERHASIL DIUNGGAH
            </h2>
            <p className="text-[#3D5A50] text-sm max-w-md">
              Data Anda saat ini dalam tahap verifikasi oleh admin. Selamat
              datang di Inkowapi Network—pintu menuju kemandirian ekonomi
              digital.
            </p>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="btn-primary px-12 uppercase tracking-widest text-[11px]"
            >
              Masuk ke Dashboard Anggota
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
