import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <header className="h-20 border-b border-slate-800 px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <span className="font-black text-lg text-white">FarmEase Support</span>
      </header>

      <main className="px-6 py-16 max-w-4xl mx-auto space-y-8 flex-1 w-full">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white">Get in Touch with Our Agritech Team</h1>
          <p className="text-xs text-slate-400">Have questions about setting up FarmEase for your farm? We are here to help!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-6">
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> Head Office Location
              </span>
              <p className="font-bold text-white">FarmEase Agritech Park, Coimbatore, Tamil Nadu, India</p>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" /> Phone & WhatsApp Support
              </span>
              <p className="font-bold text-white">+91 98765 43210 (Mon-Sat 8:00 AM - 8:00 PM)</p>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" /> Email Support
              </span>
              <p className="font-bold text-white">support@farmease.com</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Message Sent!</h3>
                <p className="text-xs text-slate-400">Thank you for reaching out. Our agritech support team will contact you within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Sarah Jenkins"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@greenvalleyfarm.com"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Message / Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Inquiring about enterprise subscription for 150 Gir cattle..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all shadow-glow flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 p-6 text-center text-xs text-slate-500">
        © 2026 FarmEase SaaS Inc. All rights reserved.
      </footer>
    </div>
  );
};
