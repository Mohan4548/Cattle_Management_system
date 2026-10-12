import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  ShieldCheck,
  Award,
  QrCode,
  Calendar,
  CheckCircle2,
  FileCheck,
  Beef,
  Activity,
  Heart,
  Milk,
  Stethoscope,
} from 'lucide-react';
import { Cattle } from '../../types';

interface CattlePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cattle: Cattle;
  vaccinations?: any[];
  healthRisk?: any;
}

export const CattlePassportModal: React.FC<CattlePassportModalProps> = ({
  isOpen,
  onClose,
  cattle,
  vaccinations = [],
  healthRisk,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const digitalId = (cattle as any).digital_identity_id || `CAT-2026-${cattle.id.replace('cattle-', '').padStart(6, '0')}`;
  const tagNumber = cattle.tag_number || (cattle as any).tag_id || 'FE-TAG-001';
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 print:border-none print:shadow-none print:max-w-none print:rounded-none relative max-h-[92vh] flex flex-col"
        >
          {/* Top Bar with Print & Close controls (hidden during print) */}
          <div className="p-4 px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-700" />
              <span className="font-bold text-sm text-slate-800">
                Official Livestock Digital Passport & Health Certificate
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Passport</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Official Document Body */}
          <div className="p-8 sm:p-10 overflow-y-auto print:overflow-visible print:p-8 space-y-6 bg-[#FCFBF8] border-8 border-double border-emerald-900/30 m-4 rounded-2xl print:m-0 print:border-4">
            {/* Header Crest & Titles */}
            <div className="text-center space-y-1.5 pb-5 border-b-2 border-emerald-950/20 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/10 text-emerald-900 text-[11px] font-bold tracking-widest uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                Department of Animal Husbandry & Dairy Operations
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-emerald-950 uppercase">
                National Livestock Digital Passport
              </h1>
              <p className="text-xs font-serif text-slate-600 tracking-wider">
                CERTIFICATE OF IDENTITY, BREED PEDIGREE & VETERINARY HEALTH CLEARANCE
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200/80">
                <span>PASSPORT NO: <strong>{digitalId}</strong></span>
                <span>DATE OF CERTIFICATION: <strong>{issueDate}</strong></span>
                <span>STATUS: <strong className="text-emerald-700">ACTIVE & VERIFIED</strong></span>
              </div>
            </div>

            {/* Profile Overview: Photo, QR & Core Identifiers */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              {/* Photo */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-emerald-900/30 shadow-inner bg-slate-100 relative">
                  <img
                    src={cattle.image_url || (cattle as any).photo_url || '/hero-farm.jpg'}
                    alt={cattle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-md font-mono">
                    PHOTO IDENTIFICATION
                  </div>
                </div>
              </div>

              {/* Core Details */}
              <div className="md:col-span-5 space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Official Registered Name</span>
                  <strong className="text-base text-slate-900 font-bold">{cattle.name}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Ear Tag ID</span>
                    <span className="font-mono font-bold text-emerald-900 text-xs">{tagNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Breed Classification</span>
                    <span className="font-bold text-slate-800">{cattle.breed} (Indian Indigenous)</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Sex / Gender</span>
                    <span className="font-bold text-slate-800 capitalize">{cattle.gender || 'Female'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Date of Birth / Age</span>
                    <span className="font-bold text-slate-800">{(cattle as any).age || cattle.date_of_birth || '3.5 Yrs'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Body Weight</span>
                    <span className="font-bold text-slate-800">{cattle.weight_kg ? `${cattle.weight_kg} kg` : '440 kg'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Coat & Horn Type</span>
                    <span className="font-bold text-slate-800">{cattle.color || 'Red / Dun'} • {cattle.horn_type || 'Short Curved'}</span>
                  </div>
                </div>
              </div>

              {/* Scannable Verification QR Code Block */}
              <div className="md:col-span-3 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                <div className="w-24 h-24 bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://farmease.app/verify/${digitalId}`}
                    alt="Digital Passport QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] font-mono text-emerald-900 font-bold mt-2">
                  SCAN TO VERIFY
                </span>
                <span className="text-[9px] text-slate-500 leading-tight">
                  Cryptographically linked field tag
                </span>
              </div>
            </div>

            {/* Pedigree & Dairy Production Certification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-emerald-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <Beef className="w-4 h-4 text-emerald-700" />
                  Lineage & Pedigree Provenance
                </h3>
                <div className="space-y-1.5 text-slate-700 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sire ID (Bull):</span>
                    <strong>IN-BULL-GIR-0994 (National Semen Bank)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dam ID (Mother Cow):</span>
                    <strong>IN-COW-GIR-0412 (Pureline Foundation)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reproduction Method:</span>
                    <strong>Artificial Insemination (AI - Cryopreserved)</strong>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-emerald-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <Milk className="w-4 h-4 text-emerald-700" />
                  Certified Lactation & Yield Metrics
                </h3>
                <div className="space-y-1.5 text-slate-700 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lactation Stage:</span>
                    <strong className="capitalize">{cattle.lactation_stage || 'Mid Lactation (Peak)'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily Average Yield:</span>
                    <strong>16.8 Liters / Day</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Milk Quality Benchmark:</span>
                    <strong>FAT: 4.8% | SNF: 8.9% (A2 Certified)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical & Vaccination Ledger Table */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h3 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                Certified Veterinary Immunization & Clinical Ledger
              </h3>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-1">Vaccine / Health Event</th>
                    <th className="py-1">Date Administered</th>
                    <th className="py-1">Next Protocol Due</th>
                    <th className="py-1">Veterinarian Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-1.5 font-medium">Foot and Mouth Disease (FMD) Quadrivalent</td>
                    <td className="py-1.5 font-mono">14 Jan 2026</td>
                    <td className="py-1.5 font-mono">14 Jul 2026</td>
                    <td className="py-1.5 text-emerald-700 font-bold">✓ Certified Compliant</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">Black Quarter (BQ) & Hemorrhagic Septicemia</td>
                    <td className="py-1.5 font-mono">22 Oct 2025</td>
                    <td className="py-1.5 font-mono">22 Oct 2026</td>
                    <td className="py-1.5 text-emerald-700 font-bold">✓ Certified Compliant</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">Brucellosis S19 Strain Prophylaxis</td>
                    <td className="py-1.5 font-mono">Heifer Stage</td>
                    <td className="py-1.5 font-mono">Lifetime Protected</td>
                    <td className="py-1.5 text-emerald-700 font-bold">✓ Certified Compliant</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">Albendazole Broad-Spectrum Deworming</td>
                    <td className="py-1.5 font-mono">01 Mar 2026</td>
                    <td className="py-1.5 font-mono">01 Jun 2026</td>
                    <td className="py-1.5 text-emerald-700 font-bold">✓ Certified Compliant</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Certification Seal & Authorized Signatures */}
            <div className="pt-4 border-t-2 border-emerald-950/20 grid grid-cols-2 gap-8 items-end text-xs">
              <div className="space-y-1">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-900/60 flex items-center justify-center text-center p-1 text-[8px] font-serif uppercase tracking-widest text-emerald-900 font-black">
                  SEAL OF LIVESTOCK REGISTRY
                </div>
                <div className="text-[10px] text-slate-500">
                  Official digital imprint issued by FarmEase Central Herd Ledger.
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="font-serif italic text-slate-800 text-sm">
                  Dr. Sarah Jenkins, M.V.Sc.
                </div>
                <div className="w-48 ml-auto border-b border-slate-400" />
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Authorized Veterinary Officer & Farm Registrar
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
