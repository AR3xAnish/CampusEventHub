import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, CheckCircle, AlertCircle, Camera, Loader, KeyRound, ImagePlus } from 'lucide-react';

const SCANNER_ELEMENT_ID = 'campus-qr-scanner-viewport';

const QRScannerModal = ({ event, onClose }) => {
  const { user } = useContext(AuthContext);
  const html5QrRef = useRef(null);
  const fileInputRef = useRef(null);
  const [scanStatus, setScanStatus] = useState('idle');
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanLocked, setScanLocked] = useState(false);
  const [manualId, setManualId] = useState('');
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => startScanner(), 300);
    return () => { clearTimeout(timer); stopScanner(); };
  }, []);

  const stopScanner = useCallback(async () => {
    try {
      if (html5QrRef.current) {
        await html5QrRef.current.stop();
        html5QrRef.current = null;
      }
    } catch (_) {}
  }, []);

  // Handle photo taken from file input (mobile fallback)
  const handleFileCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanStatus('loading');
    try {
      const scanner = new Html5Qrcode('qr-file-decode-helper');
      const result = await scanner.scanFile(file, false);
      try { await scanner.clear(); } catch (_) {}
      await processCheckin(result);
    } catch (err) {
      setErrorMsg('Could not read a QR code from this photo. Try taking a clearer shot or use manual entry.');
      setScanStatus('error');
    }
    // Reset so same file can be picked again
    e.target.value = '';
  };


  const startScanner = async () => {
    setScanStatus('scanning');
    setScanLocked(false);
    if (!document.getElementById(SCANNER_ELEMENT_ID)) {
      setErrorMsg('Scanner element not found. Please close and re-open.');
      setScanStatus('camera-error');
      return;
    }
    try {
      if (html5QrRef.current) {
        try { await html5QrRef.current.stop(); } catch (_) {}
        html5QrRef.current = null;
      }
      const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID);
      html5QrRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
        handleScanSuccess,
        () => {}
      );
    } catch (err) {
      console.error('Camera error:', err);
      const msg = err?.toString?.() || '';
      if (msg.includes('Permission') || msg.includes('NotAllowed') || msg.includes('denied')) {
        setErrorMsg('Camera permission denied. Please allow camera access in your browser settings and reload.');
      } else if (msg.includes('NotFound') || msg.includes('Devices')) {
        setErrorMsg('No camera found on this device.');
      } else {
        setErrorMsg('Could not start the camera. Use the manual entry mode below instead.');
      }
      setScanStatus('camera-error');
      setShowManual(true);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    if (scanLocked) return;
    setScanLocked(true);
    await stopScanner();
    await processCheckin(decodedText);
  };

  const processCheckin = async (registrationId) => {
    setScanStatus('loading');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/registrations/checkin', { registrationId: registrationId.trim() }, config);
      setResultData(data.registration);
      setScanStatus('success');
    } catch (err) {
      if (err.response?.status === 429) {
        setErrorMsg(err.response?.data?.message || 'Scanning too fast! Please pause.');
        setScanStatus('rapid-abuse');
        return;
      }
      const isAlreadyIn = err.response?.data?.alreadyCheckedIn;
      if (isAlreadyIn) {
        setResultData(err.response?.data?.registration);
        setScanStatus('duplicate');
      } else {
        setErrorMsg(err.response?.data?.message || 'Check-in failed. Invalid or unknown QR code.');
        setScanStatus('error');
      }
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    await stopScanner();
    setScanLocked(true);
    await processCheckin(manualId);
  };

  const handleRescan = async () => {
    setResultData(null);
    setErrorMsg('');
    setScanLocked(false);
    setManualId('');
    setScanStatus('idle');
    setTimeout(() => startScanner(), 150);
  };

  const isFinalState = ['success', 'duplicate', 'error', 'rapid-abuse'].includes(scanStatus);
  const showViewport = scanStatus === 'scanning' || scanStatus === 'idle';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={onClose} />

      {/* Hidden helper div required by Html5Qrcode.scanFile() */}
      <div id="qr-file-decode-helper" className="hidden" />

      {/* Hidden file input — triggers camera on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileCapture}
      />
      <div className="relative w-full sm:max-w-sm bg-[#0d0f1a] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden animate-slide-up">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-pink-500"></div>

        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Camera size={20} className="text-secondary" /> QR Check-in
            </h2>
            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[210px]">{event?.title}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera Viewport — kept in DOM (hidden) so the element ID is stable */}
          <div className={`relative rounded-2xl overflow-hidden bg-dark/50 border border-white/10 ${showViewport ? 'block' : 'hidden'}`}>
            <div id={SCANNER_ELEMENT_ID} className="w-full aspect-square" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-44 h-44 relative">
                <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-secondary rounded-tl-lg"></span>
                <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-secondary rounded-tr-lg"></span>
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-secondary rounded-bl-lg"></span>
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-secondary rounded-br-lg"></span>
                <div className="absolute top-0 left-0 w-full h-0.5 bg-secondary/70 animate-scan-line"></div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {scanStatus === 'loading' && (
            <div className="aspect-square flex flex-col items-center justify-center gap-4 bg-dark/50 rounded-2xl border border-white/10">
              <Loader size={40} className="text-secondary animate-spin" />
              <p className="text-slate-300 font-semibold">Verifying ticket...</p>
            </div>
          )}

          {/* Success */}
          {scanStatus === 'success' && resultData && (
            <div className="aspect-square flex flex-col items-center justify-center gap-3 bg-green-500/5 rounded-2xl border border-green-500/20 p-6 text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center animate-success-scale">
                <CheckCircle size={40} className="text-green-400" />
              </div>
              <p className="text-white font-bold text-lg">Checked In! ✓</p>
              <p className="text-green-400 font-semibold">{resultData.student?.name}</p>
              <p className="text-slate-500 text-xs">USN: {resultData.leaderUSN}</p>
              {resultData.teamMembers?.length > 0 && (
                <p className="text-slate-500 text-xs">+{resultData.teamMembers.length} team member(s)</p>
              )}
            </div>
          )}

          {/* Duplicate */}
          {scanStatus === 'duplicate' && resultData && (
            <div className="aspect-square flex flex-col items-center justify-center gap-3 bg-amber-500/5 rounded-2xl border border-amber-500/20 p-6 text-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center">
                <AlertCircle size={40} className="text-amber-400" />
              </div>
              <p className="text-white font-bold text-lg">Already Checked In</p>
              <p className="text-amber-400 font-semibold">{resultData.student?.name}</p>
              <p className="text-slate-500 text-xs">At {resultData.checkedInAt ? new Date(resultData.checkedInAt).toLocaleTimeString() : 'earlier'}</p>
            </div>
          )}

          {/* Camera Error */}
          {scanStatus === 'camera-error' && (
            <div className="bg-red-500/5 border border-red-500/20 text-red-400 rounded-2xl p-5 text-sm flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Check-in Error */}
          {scanStatus === 'error' && (
            <div className="aspect-square flex flex-col items-center justify-center gap-3 bg-red-500/5 rounded-2xl border border-red-500/20 p-6 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle size={40} className="text-red-400" />
              </div>
              <p className="text-white font-bold text-lg">Scan Failed</p>
              <p className="text-red-400 text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Rapid Scan Abuse / Fraud Prevention */}
          {scanStatus === 'rapid-abuse' && (
            <div className="aspect-square flex flex-col items-center justify-center gap-3 bg-pink-500/5 rounded-2xl border border-pink-500/20 p-6 text-center">
              <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center animate-pulse">
                <AlertCircle size={40} className="text-secondary" />
              </div>
              <p className="text-white font-bold text-lg">Action Blocked</p>
              <p className="text-pink-400 text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Mobile: Take Photo button — always available alongside camera stream */}
          {(showViewport || scanStatus === 'camera-error') && !isFinalState && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-xl font-semibold text-white bg-secondary/20 hover:bg-secondary/30 border border-secondary/30 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ImagePlus size={18} />
              Take Photo of QR Code
            </button>
          )}

          {/* Manual ID fallback — auto-shown on camera error */}
          {(showManual || scanStatus === 'camera-error') && !isFinalState && (
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <label className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <KeyRound size={13} /> Enter Registration ID manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualId}
                  onChange={e => setManualId(e.target.value)}
                  placeholder="Paste registration ID here..."
                  className="glass-input flex-1 text-sm py-2.5 font-mono"
                  autoFocus
                />
                <button type="submit" disabled={!manualId.trim()}
                  className="px-4 py-2.5 rounded-xl bg-secondary/20 text-secondary border border-secondary/30 font-semibold text-sm hover:bg-secondary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Go
                </button>
              </div>
            </form>
          )}

          {/* Manual toggle when camera is working */}
          {scanStatus === 'scanning' && !showManual && (
            <button onClick={() => setShowManual(true)} className="text-slate-500 text-xs hover:text-slate-300 transition-colors">
              Camera not working? Enter ID manually →
            </button>
          )}

          {/* Rescan */}
          {isFinalState && (
            <button onClick={handleRescan} className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-secondary to-pink-600 hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2">
              <Camera size={18} /> Scan Next
            </button>
          )}

          {scanStatus === 'scanning' && (
            <p className="text-center text-slate-500 text-xs">Point the camera at a participant's QR ticket</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
