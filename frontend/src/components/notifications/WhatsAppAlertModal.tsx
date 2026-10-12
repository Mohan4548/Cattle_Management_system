import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  MessageSquare,
  Phone,
  Check,
  Copy,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Milk,
  Stethoscope,
  Heart,
  Share2,
} from 'lucide-react';
import axios from 'axios';

interface WhatsAppAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  cattleId?: string;
  cattleName?: string;
  tagNumber?: string;
  defaultAlertType?: 'VACCINATION_REMINDER' | 'CALVING_ALERT' | 'HEALTH_EMERGENCY' | 'MILK_PRODUCTION_SUMMARY';
}

export const WhatsAppAlertModal: React.FC<WhatsAppAlertModalProps> = ({
  isOpen,
  onClose,
  cattleId,
  cattleName,
  tagNumber,
  defaultAlertType = 'VACCINATION_REMINDER',
}) => {
  const [alertType, setAlertType] = useState<'VACCINATION_REMINDER' | 'CALVING_ALERT' | 'HEALTH_EMERGENCY' | 'MILK_PRODUCTION_SUMMARY'>(defaultAlertType);
  const [recipientType, setRecipientType] = useState<'VETERINARIAN' | 'FARM_WORKER' | 'FARM_OWNER' | 'DAIRY_COOPERATIVE'>('VETERINARIAN');
  const [recipientPhone, setRecipientPhone] = useState<string>('+91 98765 43210');
  const [recipientName, setRecipientName] = useState<string>('Dr. Sarah Jenkins');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [alertData, setAlertData] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      generateAlert();
    }
  }, [isOpen, alertType, recipientType, recipientPhone, recipientName, customNotes]);

  const generateAlert = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/alerts/whatsapp',
        {
          recipientType,
          recipientPhone,
          recipientName,
          alertType,
          cattleId: cattleId || 'cattle-1',
          customNotes: customNotes || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.data) {
        setAlertData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to generate alert text:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (alertData?.rawText) {
      navigator.clipboard.writeText(alertData.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenWhatsApp = () => {
    if (alertData?.whatsAppClickUrl) {
      window.open(alertData.whatsAppClickUrl, '_blank');
    }
  };

  const handleOpenSMS = () => {
    if (alertData?.smsClickUrl) {
      window.location.href = alertData.smsClickUrl;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white dark:bg-[#121E17] text-slate-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#15231B] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Farm WhatsApp & SMS Alert Dispatcher</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Instant Field Broadcast
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tagNumber ? `Dispatching alerts for ${cattleName || 'Cattle'} (${tagNumber})` : 'Send immediate notifications to staff, vets, or cooperative buyers.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Alert Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Alert Purpose & Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAlertType('VACCINATION_REMINDER')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                    alertType === 'VACCINATION_REMINDER'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#16251D] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Vaccination Due</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAlertType('CALVING_ALERT')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                    alertType === 'CALVING_ALERT'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#16251D] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Calving Milestone</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAlertType('HEALTH_EMERGENCY')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                    alertType === 'HEALTH_EMERGENCY'
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#16251D] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Urgent Health Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAlertType('MILK_PRODUCTION_SUMMARY')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                    alertType === 'MILK_PRODUCTION_SUMMARY'
                      ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#16251D] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Milk className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Daily Harvest Summary</span>
                </button>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-[#16251D] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2C22] text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Mobile / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2C22] text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Additional Custom Instructions */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Optional Custom Note / Urgent Instruction
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="E.g., Please bring booster syringe 20ml and check ear tag CAT-2026-0891"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2C22] text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Live Message Preview Box (Styled like WhatsApp chat bubble) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  Formatted WhatsApp Chat Preview
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFEAE2] dark:bg-[#0B1510] border border-[#DDD6C8] dark:border-slate-800 font-sans text-xs leading-relaxed text-slate-900 dark:text-slate-200 whitespace-pre-wrap shadow-inner relative">
                {alertData?.rawText || 'Generating preview...'}
              </div>
            </div>

            {/* Dispatch Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleOpenWhatsApp}
                className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                onClick={handleOpenSMS}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Phone className="w-4 h-4" />
                <span>Send SMS to Worker</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
