/**
 * EDITOR GREEN SCREEN - LOGIKA UTAMA
 * Dibuat khusus untuk performa stabil di mobile
 */

// --- 1. AMBIL ELEMEN DARI HTML ---
const video  = document.getElementById('vSource');
const canvas = document.getElementById('outputCanvas');
const ctx    = canvas.getContext('2d', { willReadFrequently: true });

const inVideo   = document.getElementById('videoUpload');
const inBg      = document.getElementById('bgUpload');
const inRange   = document.getElementById('threshold');
const btnSave   = document.getElementById('downloadBtn');

// Objek untuk menyimpan gambar latar belakang
const latarBelakang = new Image();


// --- 2. LOGIKA UPLOAD ---

// Saat user milih video
inVideo.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
        video.src = URL.createObjectURL(file);
        video.play();
    }
};

// Saat user milih foto background
inBg.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
        latarBelakang.src = URL.createObjectURL(file);
    }
};


// --- 3. PROSES PENGHAPUSAN WARNA (CHROMA KEY) ---

function jalankanEditor() {
    // Jangan jalan kalau video lagi berenti
    if (video.paused || video.ended) {
        requestAnimationFrame(jalankanEditor);
        return;
    }

    // Sesuaikan ukuran layar canvas dengan video asli
    if (canvas.width !== video.videoWidth) {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
    }

    // A. Gambar Background dulu di lapisan paling bawah
    if (latarBelakang.src) {
        ctx.drawImage(latarBelakang, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // B. Ambil data frame video sekarang
    // Kita pakai canvas bantuan di memori biar gak hang
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Ambil data pixel (RGBA)
    let frame = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    let jumlahPixel = frame.data.length;
    let batasHapus  = inRange.value;

    // C. LOOPING PIXEL (Otak utama Green Screen)
    for (let i = 0; i < jumlahPixel; i += 4) {
        let r = frame.data[i];     // Merah
        let g = frame.data[i + 1]; // Hijau
        let b = frame.data[i + 2]; // Biru

        // Rumus deteksi: Jika warna hijau lebih tinggi dari merah & biru
        // dan melewati batas threshold yang ditentukan user
        if (g > r && g > b && g > batasHapus) {
            frame.data[i + 3] = 0; // Ubah Alpha (transparansi) jadi nol/ilang
        }
    }

    // D. Tempelkan hasil editan video ke atas background
    tempCtx.putImageData(frame, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);

    // Ulangi terus menerus (looping)
    requestAnimationFrame(jalankanEditor);
}


// --- 4. TOMBOL DOWNLOAD ---
btnSave.onclick = function() {
    const dataFoto = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.download = "hasil-edit-keren.png";
    link.href = dataFoto;
    link.click();
};


// Jalankan fungsi editor pas video mulai diputar
video.addEventListener('play', () => {
    jalankanEditor();
});
                      ,
