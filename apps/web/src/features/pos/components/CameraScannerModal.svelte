<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
  import { X, Camera, SwitchCamera, Flashlight, AlertCircle, CheckCircle2, Volume2, VolumeX } from 'lucide-svelte';
  import { toast } from '../../../lib/utils/toast.svelte';
  import type { UIProduct } from '../../../types';

  interface Props {
    products: UIProduct[];
    onscan: (product: UIProduct) => void;
    onclose: () => void;
  }

  let { products, onscan, onclose }: Props = $props();

  let html5Qrcode: Html5Qrcode | null = null;
  let isScanning = $state(false);
  let cameraError = $state<string | null>(null);
  let availableCameras = $state<{ id: string; label: string }[]>([]);
  let selectedCameraId = $state<string>('');
  let torchOn = $state(false);
  let soundEnabled = $state(true);
  let lastScannedCode = $state<string | null>(null);
  let scanSuccessEffect = $state(false);
  let scannedProductName = $state<string | null>(null);

  let scannerContainerId = 'reader-pos-camera';

  // Audio beep generator using Web Audio API for zero-dependency sound
  function playBeep() {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio beep error:', e);
    }
  }

  async function getCameras() {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        availableCameras = devices;
        // Prefer back/environment camera if available
        const backCamera = devices.find((d) =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        selectedCameraId = backCamera ? backCamera.id : devices[0].id;
      }
    } catch (err: any) {
      console.warn('Error listing cameras:', err);
    }
  }

  async function startScanner(cameraId?: string) {
    cameraError = null;
    if (html5Qrcode && isScanning) {
      try {
        await html5Qrcode.stop();
      } catch (e) {
        // ignore
      }
    }

    try {
      html5Qrcode = new Html5Qrcode(scannerContainerId);
      const cameraConfig = cameraId ? { deviceId: { exact: cameraId } } : { facingMode: 'environment' };

      await html5Qrcode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.333333,
        },
        (decodedText) => {
          handleBarcodeScanned(decodedText.trim());
        },
        () => {
          // Frame ignore / no barcode detected in frame
        }
      );
      isScanning = true;
    } catch (err: any) {
      console.error('Failed to start camera scanner:', err);
      cameraError = err?.message || 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.';
      isScanning = false;
    }
  }

  let debounceTimer: any = null;

  function handleBarcodeScanned(code: string) {
    if (!code) return;

    // Avoid duplicate triggers within 1.2 seconds for the same barcode
    if (lastScannedCode === code) return;

    lastScannedCode = code;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      lastScannedCode = null;
    }, 1200);

    const match = products.find(
      (p) =>
        p.isActive &&
        ((p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === code.toLowerCase()))
    );

    playBeep();

    if (match) {
      scannedProductName = match.name;
      scanSuccessEffect = true;
      setTimeout(() => {
        scanSuccessEffect = false;
      }, 800);

      onscan(match);
    } else {
      toast.error(`Barcode "${code}" tidak ditemukan dalam katalog produk POS.`);
    }
  }

  async function switchCamera() {
    if (availableCameras.length <= 1) return;
    const currentIndex = availableCameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    selectedCameraId = availableCameras[nextIndex].id;
    await startScanner(selectedCameraId);
  }

  async function toggleTorch() {
    if (!html5Qrcode || !isScanning) return;
    try {
      torchOn = !torchOn;
      await html5Qrcode.applyVideoConstraints({
        advanced: [{ torch: torchOn }] as any,
      });
    } catch (e) {
      toast.warning('Senter tidak didukung pada kamera ini.');
    }
  }

  function handleCloseModal() {
    if (html5Qrcode && isScanning) {
      html5Qrcode
        .stop()
        .then(() => {
          onclose();
        })
        .catch(() => {
          onclose();
        });
    } else {
      onclose();
    }
  }

  onMount(async () => {
    await getCameras();
    await startScanner(selectedCameraId);
  });

  onDestroy(() => {
    if (html5Qrcode && isScanning) {
      html5Qrcode.stop().catch(console.error);
    }
  });
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 select-none"
  role="dialog"
  aria-modal="true"
>
  <div
    class="relative w-full max-w-lg bg-surface dark:bg-slate-900 border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-ink"
    onclick={(e) => e.stopPropagation()}
    role="presentation"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800 bg-base/50 dark:bg-surface/30">
      <div class="flex items-center gap-2.5">
        <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Camera class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-extrabold text-slate-800 dark:text-white">Scanner Kamera POS</h3>
          <p class="text-[11px] text-slate-400 font-medium">Arahkan kamera ke Barcode / SKU Produk</p>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          onclick={() => (soundEnabled = !soundEnabled)}
          class="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl cursor-pointer transition-all bg-transparent border-0"
          title={soundEnabled ? 'Matikan Suara Beep' : 'Aktifkan Suara Beep'}
        >
          {#if soundEnabled}
            <Volume2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {:else}
            <VolumeX class="w-4 h-4" />
          {/if}
        </button>

        <button
          type="button"
          onclick={handleCloseModal}
          class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all bg-transparent border-0"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Main Camera Scanner Viewport -->
    <div class="p-6 flex flex-col items-center gap-4">
      <div class="relative w-full max-w-sm aspect-4/3 rounded-2xl overflow-hidden bg-black border-2 transition-colors duration-300 shadow-inner flex items-center justify-center {scanSuccessEffect ? 'border-emerald-500 ring-4 ring-emerald-500/30' : 'border-slate-800'}">
        <!-- Html5Qrcode Target Container -->
        <div id={scannerContainerId} class="w-full h-full object-cover"></div>

        <!-- Scanning Viewfinder Laser Overlay -->
        {#if isScanning && !cameraError}
          <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
            <!-- Target Rect Box -->
            <div class="w-64 h-36 border-2 border-emerald-400/80 rounded-xl relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <!-- Corner Brackets -->
              <div class="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-emerald-500"></div>
              <div class="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-emerald-500"></div>
              <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-emerald-500"></div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-emerald-500"></div>

              <!-- Animated Scan Laser Line -->
              <div class="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-laser-scan"></div>
            </div>
          </div>
        {/if}

        <!-- Camera Error State -->
        {#if cameraError}
          <div class="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-white gap-3 z-20">
            <AlertCircle class="w-10 h-10 text-rose-500" />
            <p class="text-xs font-semibold leading-relaxed text-slate-300">{cameraError}</p>
            <button
              type="button"
              onclick={() => startScanner(selectedCameraId)}
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer transition-all mt-1"
            >
              Coba Lagi
            </button>
          </div>
        {/if}

        <!-- Success Toast Overlay inside viewfinder -->
        {#if scanSuccessEffect && scannedProductName}
          <div class="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg animate-bounce">
            <CheckCircle2 class="w-4 h-4" />
            <span>+1 {scannedProductName}</span>
          </div>
        {/if}
      </div>

      <!-- Controls Toolbar below camera -->
      <div class="w-full flex items-center justify-between gap-3">
        {#if availableCameras.length > 1}
          <button
            type="button"
            onclick={switchCamera}
            class="flex items-center gap-1.5 px-3.5 py-2 bg-base dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all shadow-2xs"
          >
            <SwitchCamera class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ganti Kamera</span>
          </button>
        {:else}
          <div></div>
        {/if}

        <button
          type="button"
          onclick={toggleTorch}
          class="flex items-center gap-1.5 px-3.5 py-2 bg-base dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all shadow-2xs"
        >
          <Flashlight class="w-3.5 h-3.5 {torchOn ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}" />
          <span>{torchOn ? 'Matikan Senter' : 'Senter'}</span>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes laser-scan {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(140px);
    }
    100% {
      transform: translateY(0);
    }
  }

  .animate-laser-scan {
    animation: laser-scan 2s infinite ease-in-out;
  }
</style>
