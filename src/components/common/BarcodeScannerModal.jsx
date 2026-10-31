import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, RefreshCw, AlertCircle, CheckCircle2, Zap, Keyboard } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose, onScan, title = 'Escanear Código de Barras' }) {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const readerElementId = 'barcode-scanner-viewport';

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (e) {}

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(100);
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let scannerInstance = null;
    let isMounted = true;

    const startScanner = async () => {
      setError('');
      setIsScanning(true);

      try {
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (!devices || devices.length === 0) {
          setError('No se detectó ninguna cámara en este dispositivo.');
          setIsScanning(false);
          return;
        }

        setCameras(devices);

        // Preferir cámara trasera ('back' o 'environment') en móviles
        let targetCamera = devices[0].id;
        const backCam = devices.find(d => /back|rear|environment|trasera/i.test(d.label));
        if (backCam) {
          targetCamera = backCam.id;
        }
        setSelectedCameraId(targetCamera);

        scannerInstance = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.ITF
          ],
          verbose: false
        });

        scannerRef.current = scannerInstance;

        await scannerInstance.start(
          targetCamera,
          {
            fps: 15,
            qrbox: { width: 260, height: 160 },
            aspectRatio: 1.333333
          },
          (decodedText) => {
            if (decodedText) {
              playBeep();
              onScan(decodedText.trim());
              onClose();
            }
          },
          (errorMessage) => {
            // Ignorar errores frame a frame mientras enfoca
          }
        );
      } catch (err) {
        if (!isMounted) return;
        console.warn('Error iniciando escáner:', err);
        setError(
          err.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Habilita los permisos de cámara en tu navegador.'
            : 'No fue posible acceder a la cámara. Puedes escribir el código manualmente abajo.'
        );
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
              try { scannerRef.current.clear(); } catch (e) {}
            }).catch(() => {});
          } else {
            scannerRef.current.clear();
          }
        } catch (e) {}
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  const handleCameraChange = async (cameraId) => {
    setSelectedCameraId(cameraId);
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.start(
          cameraId,
          { fps: 15, qrbox: { width: 260, height: 160 }, aspectRatio: 1.333333 },
          (decodedText) => {
            if (decodedText) {
              playBeep();
              onScan(decodedText.trim());
              onClose();
            }
          },
          () => {}
        );
      } catch (e) {
        console.warn('Error cambiando de cámara:', e);
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      playBeep();
      onScan(manualCode.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-sm w-full relative shadow-2xl text-xs space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500">Apunta la cámara al código de barras o QR</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-[11px] text-rose-900">Aviso de Cámara</p>
              <p className="text-[11px] leading-tight text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Viewport del Escáner */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] border border-slate-200 flex items-center justify-center">
          <div id={readerElementId} className="w-full h-full" />
          
          {/* Mira o marco visual de escaneo */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-36 border-2 border-dashed border-blue-400/90 rounded-2xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]">
              {/* Esquinas destacadas */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-blue-500 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-blue-500 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-blue-500 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-blue-500 rounded-br-lg" />
              
              {/* Línea láser animada */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
            </div>
          </div>
        </div>

        {/* Selector de cámara si hay más de una */}
        {cameras.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-500 font-bold shrink-0">Cámara:</label>
            <select
              value={selectedCameraId}
              onChange={(e) => handleCameraChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label || `Cámara ${c.id.substring(0, 5)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Fallback de entrada manual */}
        <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Keyboard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Escribe el código manualmente..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={!manualCode.trim()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-xs shrink-0"
          >
            Usar
          </button>
        </form>

      </div>
    </div>
  );
}
