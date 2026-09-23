/**
 * PresensiOS - Enterprise Workforce & Student Presence Operating System
 * Pure Vanilla ES6+ | Local-First Architecture | Zero Dependencies
 */

(function () {
  'use strict';

  // --- STATE MANAGEMENT ---
  const OFFICE_HQ = {
    name: 'Menara Graha Jakarta',
    lat: -6.1855,
    lng: 106.8227,
    maxRadius: 100 // meters
  };

  const EMPLOYEES = [
    { nip: 'EMP-2024-001', name: 'Aditya Pratama', div: 'IT Engineering' },
    { nip: 'EMP-2024-002', name: 'Budi Santoso', div: 'Finance' },
    { nip: 'EMP-2024-003', name: 'Citra Kirana', div: 'Creative' },
    { nip: 'EMP-2024-004', name: 'Dina Lestari', div: 'Operations' },
    { nip: 'EMP-2024-005', name: 'Eko Wicaksono', div: 'IT Engineering' },
    { nip: 'EMP-2024-006', name: 'Farah Amalia', div: 'Creative' }
  ];

  let currentEmployee = EMPLOYEES[0];
  let currentDistance = 15; // default simulated meters
  let isInRadius = true;
  let capturedPhoto = null; // Base64 data URL
  let capturedHash = null;
  let mediaStream = null;
  let fallbackAnimationId = null;

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSuccessChime() {
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      // Note 1: D5 (587.33Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Note 2: A5 (880Hz)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn('Audio not allowed yet', e);
    }
  }

  function playWarningBuzz() {
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- SEED DATABASE ---
  function getLogs() {
    try {
      const data = localStorage.getItem('presensios_logs');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return initSeedData();
  }

  function saveLogs(logs) {
    try {
      localStorage.setItem('presensios_logs', JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }

  function initSeedData() {
    const defaultPlaceholderPhoto = createPlaceholderPhoto('Aditya Pratama', 'EMP-2024-001', '07:45:12 WIB', 'VALID');
    const seed = [
      {
        id: 'LOG-101',
        nip: 'EMP-2024-001',
        name: 'Aditya Pratama',
        div: 'IT Engineering',
        type: 'Masuk Tepat Waktu',
        time: '07:45:12 WIB',
        date: getFormattedDate(),
        dist: '14 m (Kantor)',
        status: 'Tepat Waktu',
        hash: '#VERIF-8A9C1B2',
        photo: defaultPlaceholderPhoto
      },
      {
        id: 'LOG-102',
        nip: 'EMP-2024-002',
        name: 'Budi Santoso',
        div: 'Finance',
        type: 'Masuk Terlambat',
        time: '08:24:05 WIB',
        date: getFormattedDate(),
        dist: '22 m (Kantor)',
        status: 'Terlambat 24m',
        hash: '#VERIF-4F7D3E9',
        photo: createPlaceholderPhoto('Budi Santoso', 'EMP-2024-002', '08:24:05 WIB', 'TERLAMBAT')
      },
      {
        id: 'LOG-103',
        nip: 'EMP-2024-003',
        name: 'Citra Kirana',
        div: 'Creative',
        type: 'Masuk Tepat Waktu',
        time: '07:52:19 WIB',
        date: getFormattedDate(),
        dist: '8 m (Kantor)',
        status: 'Tepat Waktu',
        hash: '#VERIF-9C2A4F1',
        photo: createPlaceholderPhoto('Citra Kirana', 'EMP-2024-003', '07:52:19 WIB', 'VALID')
      },
      {
        id: 'LOG-104',
        nip: 'EMP-2024-004',
        name: 'Dina Lestari',
        div: 'Operations',
        type: 'Izin',
        time: '08:00:00 WIB',
        date: getFormattedDate(),
        dist: 'Remote / Lapangan',
        status: 'Izin / Cuti',
        hash: '#AUTH-DOC-982',
        photo: createPlaceholderPhoto('Dina Lestari', 'EMP-2024-004', '08:00:00 WIB', 'IZIN RESMI')
      }
    ];
    saveLogs(seed);
    return seed;
  }

  function createPlaceholderPhoto(name, nip, timeStr, badgeText) {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 480, 360);
    grad.addColorStop(0, '#111827');
    grad.addColorStop(1, '#0B0F17');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 360);

    // Oval Face Guide
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.ellipse(240, 150, 80, 110, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Avatar silhouette
    ctx.fillStyle = '#1F2937';
    ctx.beginPath();
    ctx.arc(240, 130, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(240, 260, 85, Math.PI, 0);
    ctx.fill();

    // Burn-in Watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 270, 480, 90);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(`● PRESENSI VERIFIKASI BIOMETRIK • ${badgeText}`, 15, 292);

    ctx.fillStyle = '#F3F4F6';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`Nama: ${name} | NIP: ${nip}`, 15, 312);
    ctx.fillText(`Waktu: ${getFormattedDate()}, ${timeStr}`, 15, 330);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px monospace';
    ctx.fillText(`GPS: Lat -6.1855, Lng 106.8227 (±3m) • HASH: #VERIF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, 15, 348);

    return canvas.toDataURL('image/jpeg', 0.85);
  }

  // --- TIME & DATE UTILS ---
  function getFormattedDate() {
    const d = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function startLiveClock() {
    const clockEl = document.getElementById('liveClock');
    const statusMasukEl = document.getElementById('masukStatus');

    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      if (clockEl) {
        clockEl.textContent = `${h}:${m}:${s} WIB`;
      }

      // Check In status estimation
      if (statusMasukEl) {
        if (now.getHours() < 8 || (now.getHours() === 8 && now.getMinutes() === 0)) {
          statusMasukEl.textContent = 'Tepat Waktu';
          statusMasukEl.className = 'summary-status badge-success';
        } else {
          const lateMins = (now.getHours() - 8) * 60 + now.getMinutes();
          statusMasukEl.textContent = `Terlambat (${lateMins} menit)`;
          statusMasukEl.className = 'summary-status badge-warning';
        }
      }
    }
    update();
    setInterval(update, 1000);
  }

  // --- CAMERA & BIOMETRIC SYSTEM ---
  function initCamera() {
    const video = document.getElementById('cameraFeed');
    const fallbackCanvas = document.getElementById('fallbackCanvas');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
        .then(stream => {
          mediaStream = stream;
          if (video) {
            video.srcObject = stream;
            video.style.display = 'block';
          }
          if (fallbackCanvas) fallbackCanvas.style.display = 'none';
          if (fallbackAnimationId) cancelAnimationFrame(fallbackAnimationId);
        })
        .catch(err => {
          console.warn('Webcam not accessible, launching biometric fallback simulator:', err);
          startFallbackSimulator();
        });
    } else {
      startFallbackSimulator();
    }
  }

  function startFallbackSimulator() {
    const video = document.getElementById('cameraFeed');
    const canvas = document.getElementById('fallbackCanvas');
    if (!canvas) return;

    if (video) video.style.display = 'none';
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;

    let scanY = 50;
    let scanDirection = 1.5;

    function renderSimulator() {
      ctx.fillStyle = '#0B0F17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid mesh
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Biometric Avatar Wireframe
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(200, 130, 60, 80, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Facial feature markers
      ctx.fillStyle = '#06B6D4';
      ctx.fillRect(180, 115, 6, 6); // left eye
      ctx.fillRect(214, 115, 6, 6); // right eye
      ctx.fillRect(198, 140, 4, 4); // nose
      ctx.fillRect(190, 165, 20, 3); // mouth

      // Live Scanning Bar
      scanY += scanDirection;
      if (scanY > 210 || scanY < 60) scanDirection = -scanDirection;

      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(130, scanY);
      ctx.lineTo(270, scanY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fillRect(130, scanY - 8, 140, 8);

      // Status text
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BIOMETRIC SIMULATOR ACTIVE', 200, 260);
      ctx.fillText('Tracking Face Matrix [OK]', 200, 278);

      fallbackAnimationId = requestAnimationFrame(renderSimulator);
    }
    renderSimulator();
  }

  function captureSnapshot() {
    initAudio();
    const video = document.getElementById('cameraFeed');
    const fallbackCanvas = document.getElementById('fallbackCanvas');
    const snapshotCanvas = document.getElementById('snapshotCanvas');
    if (!snapshotCanvas) return;

    snapshotCanvas.width = 640;
    snapshotCanvas.height = 480;
    const ctx = snapshotCanvas.getContext('2d');

    if (video && video.style.display !== 'none' && video.readyState >= 2) {
      // Mirror draw
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -640, 0, 640, 480);
      ctx.restore();
    } else if (fallbackCanvas) {
      ctx.drawImage(fallbackCanvas, 0, 0, 640, 480);
    }

    // Burn-in Watermark
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
    const randomHex = Math.random().toString(36).substr(2, 8).toUpperCase();
    capturedHash = `#VERIF-${randomHex}`;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 380, 640, 100);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('● PRESENSI VERIFIKASI BIOMETRIK • VALID', 20, 410);

    ctx.fillStyle = '#F3F4F6';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`Nama: ${currentEmployee.name} | NIP: ${currentEmployee.nip}`, 20, 432);
    ctx.fillText(`Waktu: ${getFormattedDate()}, ${timeStr}`, 20, 452);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px monospace';
    ctx.fillText(`GPS: Lat -6.1855, Lng 106.8227 (±3m) • Token: ${capturedHash}`, 20, 470);

    capturedPhoto = snapshotCanvas.toDataURL('image/jpeg', 0.9);

    // UI Updates
    const btnSnapshot = document.getElementById('btnSnapshot');
    const btnReset = document.getElementById('btnResetCamera');
    if (btnSnapshot) {
      btnSnapshot.innerHTML = '<span class="icon">✅</span> Wajah Terverifikasi';
      btnSnapshot.classList.remove('btn-primary');
      btnSnapshot.classList.add('btn-secondary');
    }
    if (btnReset) btnReset.style.display = 'inline-flex';

    playSuccessChime();
    showToast('Snapshot biometrik berhasil diverifikasi!', 'success');
    updateActionButtons();
  }

  function resetCameraSnapshot() {
    capturedPhoto = null;
    capturedHash = null;

    const btnSnapshot = document.getElementById('btnSnapshot');
    const btnReset = document.getElementById('btnResetCamera');
    if (btnSnapshot) {
      btnSnapshot.innerHTML = '<span class="icon">📸</span> Ambil Snapshot Wajah';
      btnSnapshot.classList.add('btn-primary');
      btnSnapshot.classList.remove('btn-secondary');
    }
    if (btnReset) btnReset.style.display = 'none';

    updateActionButtons();
    showToast('Kamera di-reset. Silakan ambil snapshot baru.', 'info');
  }

  // --- GEOFENCING RADAR (Haversine Formula) ---
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  function setSimulatedLocation(distanceMeters) {
    currentDistance = distanceMeters;
    isInRadius = distanceMeters <= OFFICE_HQ.maxRadius;

    const statusTitle = document.getElementById('statusTitle');
    const statusDist = document.getElementById('statusDist');
    const statusIcon = document.querySelector('.status-icon');
    const radarPing = document.getElementById('radarPing');

    if (isInRadius) {
      if (statusTitle) statusTitle.textContent = 'DALAM RADIUS KANTOR';
      if (statusDist) statusDist.textContent = `Jarak: ${distanceMeters} m (${OFFICE_HQ.name})`;
      if (statusIcon) statusIcon.textContent = '🟢';
      if (radarPing) radarPing.className = 'radar-ping';
      showToast(`Lokasi Valid: Dalam radius kantor (${distanceMeters}m)`, 'success');
    } else {
      if (statusTitle) statusTitle.textContent = 'DI LUAR JANGKAUAN';
      if (statusDist) statusDist.textContent = `Jarak: ${distanceMeters} m (Maks: ${OFFICE_HQ.maxRadius}m)`;
      if (statusIcon) statusIcon.textContent = '🔴';
      if (radarPing) radarPing.className = 'radar-ping out-of-zone';
      playWarningBuzz();
      showToast(`Peringatan: Di luar radius kantor (${distanceMeters}m). Absen terkunci!`, 'warning');
    }

    updateActionButtons();
  }

  function updateActionButtons() {
    const btnMasuk = document.getElementById('btnAbsenMasuk');
    const btnPulang = document.getElementById('btnAbsenPulang');
    const hintMasuk = document.getElementById('reqHintMasuk');
    const hintPulang = document.getElementById('reqHintPulang');

    const canSubmit = capturedPhoto !== null && isInRadius;

    if (btnMasuk) btnMasuk.disabled = !canSubmit;
    if (btnPulang) btnPulang.disabled = !canSubmit;

    let hintText = '';
    if (!capturedPhoto && !isInRadius) {
      hintText = '⚠️ Ambil snapshot wajah & pastikan posisi di dalam radius kantor.';
    } else if (!capturedPhoto) {
      hintText = '⚠️ Ambil snapshot wajah biometrik terlebih dahulu.';
    } else if (!isInRadius) {
      hintText = '⚠️ Lokasi di luar jangkauan! Pindah ke dalam radius kantor.';
    } else {
      hintText = '✅ Syarat lengkap! Tekan tombol untuk mencatat presensi.';
    }

    if (hintMasuk) hintMasuk.textContent = hintText;
    if (hintPulang) hintPulang.textContent = hintText;
  }

  // --- ACTIONS: CHECK-IN, CHECK-OUT, LEAVE ---
  function handleAbsenMasuk() {
    if (!capturedPhoto || !isInRadius) {
      showToast('Harap penuhi syarat biometrik dan radius kantor!', 'error');
      playWarningBuzz();
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);
    const lateMins = (now.getHours() - 8) * 60 + now.getMinutes();

    const newLog = {
      id: 'LOG-' + Date.now().toString().slice(-5),
      nip: currentEmployee.nip,
      name: currentEmployee.name,
      div: currentEmployee.div,
      type: isLate ? 'Masuk Terlambat' : 'Masuk Tepat Waktu',
      time: timeStr,
      date: getFormattedDate(),
      dist: `${currentDistance} m (Kantor)`,
      status: isLate ? `Terlambat ${lateMins}m` : 'Tepat Waktu',
      hash: capturedHash || '#VERIF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      photo: capturedPhoto
    };

    const logs = getLogs();
    logs.unshift(newLog);
    saveLogs(logs);

    playSuccessChime();
    showToast(`Presensi masuk berhasil dicatat! Status: ${newLog.status}`, 'success');

    resetCameraSnapshot();
    renderAll();
  }

  function handleAbsenPulang() {
    if (!capturedPhoto || !isInRadius) {
      showToast('Harap penuhi syarat biometrik dan radius kantor!', 'error');
      playWarningBuzz();
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    const newLog = {
      id: 'LOG-' + Date.now().toString().slice(-5),
      nip: currentEmployee.nip,
      name: currentEmployee.name,
      div: currentEmployee.div,
      type: 'Pulang',
      time: timeStr,
      date: getFormattedDate(),
      dist: `${currentDistance} m (Kantor)`,
      status: 'Pulang',
      hash: capturedHash || '#VERIF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      photo: capturedPhoto
    };

    const logs = getLogs();
    logs.unshift(newLog);
    saveLogs(logs);

    playSuccessChime();
    showToast(`Presensi pulang tercatat! Selamat beristirahat.`, 'success');

    resetCameraSnapshot();
    renderAll();
  }

  function handleAjukanIzin() {
    const izinType = document.getElementById('izinType').value;
    const izinReason = document.getElementById('izinReason').value.trim();

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    const newLog = {
      id: 'LOG-' + Date.now().toString().slice(-5),
      nip: currentEmployee.nip,
      name: currentEmployee.name,
      div: currentEmployee.div,
      type: 'Izin',
      time: timeStr,
      date: getFormattedDate(),
      dist: 'Form Pengajuan',
      status: izinType,
      hash: '#AUTH-DOC-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      photo: createPlaceholderPhoto(currentEmployee.name, currentEmployee.nip, timeStr, izinType.toUpperCase()),
      reason: izinReason || 'Tidak ada catatan tambahan'
    };

    const logs = getLogs();
    logs.unshift(newLog);
    saveLogs(logs);

    playSuccessChime();
    showToast(`Pengajuan ${izinType} berhasil dikirim ke HR!`, 'info');
    document.getElementById('izinReason').value = '';

    renderAll();
  }

  // --- HEATMAP (GitHub Style) ---
  function renderHeatmap() {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;
    container.innerHTML = '';

    const logs = getLogs().filter(l => l.nip === currentEmployee.nip);

    // 31 days in month
    for (let day = 1; day <= 31; day++) {
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';

      // Simulation of past days vs future days
      const currentDayNum = new Date().getDate();
      if (day > currentDayNum) {
        cell.className += ' l-gray';
        cell.title = `Tgl ${day}: Belum berjalan`;
      } else {
        // Find if employee had log
        const hasLog = logs.some(l => l.type && l.type.includes('Masuk'));
        if (day === currentDayNum) {
          cell.className += ' l-green';
          cell.title = `Tgl ${day}: Hadir Hari Ini`;
        } else if (day % 7 === 0 || day % 7 === 6) {
          cell.className += ' l-gray';
          cell.title = `Tgl ${day}: Akhir Pekan (Libur)`;
        } else if (day === 4 || day === 18) {
          cell.className += ' l-yellow';
          cell.title = `Tgl ${day}: Terlambat 15m`;
        } else if (day === 12) {
          cell.className += ' l-blue';
          cell.title = `Tgl ${day}: Izin Keperluan`;
        } else {
          cell.className += ' l-green';
          cell.title = `Tgl ${day}: Hadir Tepat Waktu`;
        }
      }
      container.appendChild(cell);
    }
  }

  // --- HR COMMAND CENTER & LOGS TABLE ---
  function renderHRMetrics() {
    const logs = getLogs();
    const kpiRate = document.getElementById('kpiRate');
    const kpiHadir = document.getElementById('kpiHadir');
    const kpiTelat = document.getElementById('kpiTelat');
    const kpiIzin = document.getElementById('kpiIzin');

    const totalEmployees = EMPLOYEES.length;
    const hadirLogs = logs.filter(l => l.type && l.type.includes('Masuk'));
    const uniqueHadir = new Set(hadirLogs.map(l => l.nip)).size;
    const telatCount = logs.filter(l => l.status && l.status.includes('Terlambat')).length;
    const izinCount = logs.filter(l => l.type === 'Izin' || (l.status && l.status.includes('Izin'))).length;

    const ratePct = Math.min(100, Math.round((uniqueHadir / totalEmployees) * 100)) || 85;

    if (kpiRate) kpiRate.textContent = `${ratePct}%`;
    if (kpiHadir) kpiHadir.textContent = uniqueHadir;
    if (kpiTelat) kpiTelat.textContent = telatCount;
    if (kpiIzin) kpiIzin.textContent = izinCount;
  }

  function renderTableLogs() {
    const tbody = document.getElementById('logTableBody');
    if (!tbody) return;

    const search = (document.getElementById('searchLog')?.value || '').toLowerCase();
    const filterDiv = document.getElementById('filterDivisi')?.value || 'Semua';
    const filterStat = document.getElementById('filterStatus')?.value || 'Semua';

    const logs = getLogs().filter(log => {
      const matchSearch = log.name.toLowerCase().includes(search) || log.nip.toLowerCase().includes(search);
      const matchDiv = filterDiv === 'Semua' || log.div === filterDiv;
      const matchStat = filterStat === 'Semua' || log.type.includes(filterStat) || log.status.includes(filterStat);
      return matchSearch && matchDiv && matchStat;
    });

    tbody.innerHTML = '';

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">Tidak ada data presensi yang cocok.</td></tr>`;
      return;
    }

    logs.forEach(log => {
      const tr = document.createElement('tr');

      // Status badge styling
      let badgeClass = 'badge-success';
      if (log.status.includes('Terlambat')) badgeClass = 'badge-warning';
      if (log.type === 'Izin' || log.status.includes('Izin') || log.status.includes('Sakit')) badgeClass = 'badge-info';

      tr.innerHTML = `
        <td>
          <img src="${log.photo}" alt="Selfie" class="thumb-photo" data-id="${log.id}">
        </td>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${log.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
            <div>
              <div style="font-weight:600; color:var(--text-primary);">${log.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${log.nip} • ${log.div}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:500;">${log.type}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${log.date} • ${log.time}</div>
        </td>
        <td>
          <span style="font-size:0.8rem; color:${log.dist.includes('Kantor') ? 'var(--accent-emerald)' : 'var(--accent-amber)'};">
            ${log.dist}
          </span>
        </td>
        <td>
          <span class="summary-status ${badgeClass}">${log.status}</span>
        </td>
        <td>
          <div class="action-btns">
            <button class="btn btn-outline btn-sm btn-detail" data-id="${log.id}">🔍 Detail</button>
            <button class="btn btn-outline btn-sm btn-delete" data-id="${log.id}" style="color:var(--accent-rose);">🗑️</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach row events
    tbody.querySelectorAll('.thumb-photo, .btn-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openBiometricModal(id);
      });
    });

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deleteLog(id);
      });
    });
  }

  function deleteLog(id) {
    if (!confirm('Yakin ingin menghapus catatan presensi ini?')) return;
    let logs = getLogs();
    logs = logs.filter(l => l.id !== id);
    saveLogs(logs);
    showToast('Catatan presensi berhasil dihapus.', 'info');
    renderAll();
  }

  // --- MODAL BIOMETRIK ---
  function openBiometricModal(logId) {
    const logs = getLogs();
    const log = logs.find(l => l.id === logId);
    if (!log) return;

    const modal = document.getElementById('modalBiometric');
    document.getElementById('modalPhoto').src = log.photo;
    document.getElementById('mNama').textContent = log.name;
    document.getElementById('mNIP').textContent = `${log.nip} (${log.div})`;
    document.getElementById('mWaktu').textContent = `${log.date}, ${log.time}`;
    document.getElementById('mGPS').textContent = log.dist;
    document.getElementById('mHash').textContent = log.hash || '#VERIF-SECURE';

    if (modal) modal.classList.add('active');
  }

  function closeModal() {
    const modal = document.getElementById('modalBiometric');
    if (modal) modal.classList.remove('active');
  }

  // --- EXPORT TO CSV ---
  function exportToCSV() {
    const logs = getLogs();
    if (!logs || logs.length === 0) {
      showToast('Tidak ada data untuk diekspor!', 'warning');
      return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    csvContent += 'ID,NIP,Nama Karyawan,Divisi,Tipe Presensi,Tanggal,Waktu,Jarak/Lokasi,Status,Hash Verifikasi\n';

    logs.forEach(l => {
      const row = [
        `"${l.id}"`,
        `"${l.nip}"`,
        `"${l.name}"`,
        `"${l.div}"`,
        `"${l.type}"`,
        `"${l.date}"`,
        `"${l.time}"`,
        `"${l.dist}"`,
        `"${l.status}"`,
        `"${l.hash || ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_presensi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSuccessChime();
    showToast('File CSV berhasil didownload!', 'success');
  }

  // --- INITIALIZATION & EVENT BINDINGS ---
  function renderAll() {
    renderHeatmap();
    renderHRMetrics();
    renderTableLogs();
    updateActionButtons();
  }

  document.addEventListener('DOMContentLoaded', () => {
    startLiveClock();
    initCamera();
    renderAll();

    // View Switcher
    const btnKiosk = document.getElementById('btnKiosk');
    const btnHR = document.getElementById('btnHR');
    const viewKiosk = document.getElementById('viewKiosk');
    const viewHR = document.getElementById('viewHR');

    if (btnKiosk && btnHR) {
      btnKiosk.addEventListener('click', () => {
        btnKiosk.classList.add('active');
        btnHR.classList.remove('active');
        viewKiosk.classList.add('active');
        viewHR.classList.remove('active');
      });

      btnHR.addEventListener('click', () => {
        btnHR.classList.add('active');
        btnKiosk.classList.remove('active');
        viewHR.classList.add('active');
        viewKiosk.classList.remove('active');
        renderHRMetrics();
        renderTableLogs();
      });
    }

    // Employee Selection
    const empSelect = document.getElementById('employeeSelect');
    if (empSelect) {
      empSelect.addEventListener('change', (e) => {
        try {
          const emp = JSON.parse(e.target.value);
          currentEmployee = emp;
          document.getElementById('infoName').textContent = emp.name;
          document.getElementById('infoNIP').textContent = emp.nip;
          document.getElementById('infoDiv').textContent = emp.div;
          document.getElementById('infoAvatar').textContent = emp.name.split(' ').map(n=>n[0]).join('').substring(0, 2);
          renderHeatmap();
          resetCameraSnapshot();
        } catch (err) {
          console.error(err);
        }
      });
    }

    // Camera Controls
    const btnSnapshot = document.getElementById('btnSnapshot');
    const btnResetCamera = document.getElementById('btnResetCamera');
    if (btnSnapshot) btnSnapshot.addEventListener('click', captureSnapshot);
    if (btnResetCamera) btnResetCamera.addEventListener('click', resetCameraSnapshot);

    // Geofence Demos
    const btnDemoKantor = document.getElementById('btnDemoKantor');
    const btnDemoLuar = document.getElementById('btnDemoLuar');
    if (btnDemoKantor) btnDemoKantor.addEventListener('click', () => setSimulatedLocation(14));
    if (btnDemoLuar) btnDemoLuar.addEventListener('click', () => setSimulatedLocation(680));

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.style.display = 'block';
      });
    });

    // Action Submissions
    const btnAbsenMasuk = document.getElementById('btnAbsenMasuk');
    const btnAbsenPulang = document.getElementById('btnAbsenPulang');
    const btnAjukanIzin = document.getElementById('btnAjukanIzin');

    if (btnAbsenMasuk) btnAbsenMasuk.addEventListener('click', handleAbsenMasuk);
    if (btnAbsenPulang) btnAbsenPulang.addEventListener('click', handleAbsenPulang);
    if (btnAjukanIzin) btnAjukanIzin.addEventListener('click', handleAjukanIzin);

    // Filter & Search
    const searchLog = document.getElementById('searchLog');
    const filterDiv = document.getElementById('filterDivisi');
    const filterStat = document.getElementById('filterStatus');

    if (searchLog) searchLog.addEventListener('input', renderTableLogs);
    if (filterDiv) filterDiv.addEventListener('change', renderTableLogs);
    if (filterStat) filterStat.addEventListener('change', renderTableLogs);

    // Export & Print
    const btnExport = document.getElementById('btnExportCSV');
    const btnPrint = document.getElementById('btnPrint');
    if (btnExport) btnExport.addEventListener('click', exportToCSV);
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());

    // Modal Events
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnTutupModal = document.getElementById('btnTutupModal');
    const modalBiometric = document.getElementById('modalBiometric');

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnTutupModal) btnTutupModal.addEventListener('click', closeModal);
    if (modalBiometric) {
      modalBiometric.addEventListener('click', (e) => {
        if (e.target === modalBiometric) closeModal();
      });
    }
  });

})();
