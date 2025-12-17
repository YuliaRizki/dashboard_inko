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
  // ... (Add others as needed)
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
  const [nationality, setNationality] = useState("WNI");
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
        // NIK
        const nikMatch = extractedText.match(/\d{16}/);
        if (nikMatch) setIdNumber(nikMatch[0]);

        // Name
        const nameMatch = extractedText.match(/Nama\s*[:\s]*([^\n]+)/i);
        if (nameMatch)
          setFullName(
            nameMatch[1]
              .replace(/[^a-zA-Z\s]/g, "")
              .trim()
              .toUpperCase()
          );

        // Birth Info
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

        // Address
        const addressMatch = extractedText.match(
          /Alamat\s*[:\s]*([\s\S]*?)(?=Agama|$)/i
        );
        if (addressMatch) {
          const cleanAddress = addressMatch[1]
            .replace(/\n/g, " ")
            .replace(/RTIRW\s*[:\s]*/gi, "RT/RW ") // Fixes the RT/RW typo
            .replace(/KELLDESA\s*[:\s—]*/gi, "KEL/DESA ") // Fixes the Kelurahan typo
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();

          setAddress(cleanAddress);
        }

        // Religion
        const religionMatch = extractedText.match(/Agama\s*[:\s]*([^\n]+)/i);
        if (religionMatch)
          setReligion(
            religionMatch[1]
              .replace(/[^a-zA-Z]/g, "")
              .trim()
              .toUpperCase()
          );

        // Marital Status
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

        // Occupation
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
    <div className="w-full h-screen flex items-center justify-center relative bg-[#030405] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#1FBF8F]/10 rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[1200px] h-[85vh] bg-[#0A0C10] border border-white/10 rounded-[30px] flex flex-col shadow-2xl overflow-hidden glass-panel-premium"
      >
        <div className="p-8 pb-4 shrink-0 z-20 bg-[#0A0C10]/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              Identity_Verification
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              STEP 02/02{" "}
              <div className="w-32 h-1 bg-white/10 rounded-full">
                <div className="w-full h-full bg-[#1FBF8F]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar z-10">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div
              onClick={() => ktpInputRef.current?.click()}
              className="h-48 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center hover:border-[#1FBF8F] cursor-pointer group relative overflow-hidden transition-all"
            >
              {ktpPreview ? (
                <>
                  <img
                    src={ktpPreview}
                    alt="KTP Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                  <div className="relative z-10 flex flex-col items-center">
                    {isScanningKTP ? (
                      <Loader2 className="animate-spin text-[#1FBF8F]" />
                    ) : (
                      <CheckCircle2 className="text-[#1FBF8F]" />
                    )}
                    <p className="mt-2 text-[10px] font-bold text-white drop-shadow-md">
                      KTP UPLOADED
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {isScanningKTP ? (
                    <Loader2 className="animate-spin text-[#1FBF8F]" />
                  ) : (
                    <ScanFace className="text-white/40 group-hover:text-[#1FBF8F]" />
                  )}
                  <p className="mt-2 text-[10px] font-bold text-white/40">
                    UPLOAD KTP
                  </p>
                </>
              )}
            </div>

            <div
              onClick={() => npwpInputRef.current?.click()}
              className="h-48 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center hover:border-[#00C2FF] cursor-pointer group relative overflow-hidden transition-all"
            >
              {npwpPreview ? (
                <>
                  <img
                    src={npwpPreview}
                    alt="NPWP Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                  <div className="relative z-10 flex flex-col items-center">
                    {isScanningNPWP ? (
                      <Loader2 className="animate-spin text-[#00C2FF]" />
                    ) : (
                      <CheckCircle2 className="text-[#00C2FF]" />
                    )}
                    <p className="mt-2 text-[10px] font-bold text-white drop-shadow-md">
                      NPWP UPLOADED
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {isScanningNPWP ? (
                    <Loader2 className="animate-spin text-[#00C2FF]" />
                  ) : (
                    <FileText className="text-white/40 group-hover:text-[#00C2FF]" />
                  )}
                  <p className="mt-2 text-[10px] font-bold text-white/40">
                    UPLOAD NPWP
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                Protocol Identity
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
                  placeholder="POB"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  className="input-premium w-full uppercase"
                />
                <input
                  type="text"
                  placeholder="DOB"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="input-premium w-full"
                />
              </div>
              <input
                type="text"
                placeholder="NPWP NUMBER"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="input-premium w-full font-mono"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                Social & Professional
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="RELIGION"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="input-premium w-full uppercase"
                />
                <input
                  type="text"
                  placeholder="NATIONALITY"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="input-premium w-full uppercase"
                />
              </div>
              <input
                type="text"
                placeholder="MARITAL STATUS"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="input-premium w-full uppercase"
              />
              <input
                type="text"
                placeholder="OCCUPATION"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="input-premium w-full uppercase"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4 pb-8">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              Residency Protocol
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="input-premium w-full text-xs font-bold bg-transparent text-white/80"
              >
                <option value="" disabled>
                  SELECT PROVINCE
                </option>
                {Object.keys(INDONESIA_REGIONS).map((prov) => (
                  <option key={prov} value={prov} className="bg-[#0A0C10]">
                    {prov.toUpperCase()}
                  </option>
                ))}
              </select>
              <select
                value={selectedCity}
                disabled={!selectedProvince}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="input-premium w-full text-xs font-bold bg-transparent text-white/80"
              >
                <option value="" disabled>
                  SELECT CITY
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city} className="bg-[#0A0C10]">
                    {city.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-4 top-4 text-white/20"
              />
              <textarea
                placeholder="FULL RESIDENTIAL ADDRESS"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-premium w-full h-24 pt-3 pl-10 uppercase resize-none"
              />
            </div>
          </div>
        </div>

        <div className="p-8 pt-6 border-t border-white/5 shrink-0 bg-[#0A0C10]/20 backdrop-blur-md z-20">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push("/register")}
              className="text-white/40 text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-white"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              onClick={handleFinalize}
              className="btn-primary w-64 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
            >
              FINALISE DATA <ChevronRight size={14} />
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

      <AnimatePresence>
        {isFinalized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#030405]/95 backdrop-blur-xl text-center space-y-6"
          >
            <div className="w-24 h-24 bg-[#1FBF8F]/10 rounded-full flex items-center justify-center border-2 border-[#1FBF8F] shadow-[0_0_40px_rgba(31,191,143,0.3)]">
              <CheckCircle2 size={48} className="text-[#1FBF8F]" />
            </div>
            <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
              Identity_Secured
            </h2>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="btn-primary px-12 uppercase tracking-widest text-[10px]"
            >
              Enter Command Center
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
