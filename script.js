/**
 * ==========================================================
 * EDITOR GREEN SCREEN - FULL SCRIPT (VERSION PRO)
 * ==========================================================
 * * Tips Mata: Gunakan Font Size 20px di editor HP lu.
 * Jarak antar baris dibuat lebar supaya gampang dibaca.
 */



// 1. KONEKSI KE ELEMEN HTML
// ----------------------------------------------------------

const video      = document.getElementById('vSource');
const canvas     = document.getElementById('outputCanvas');
const ctx        = canvas.getContext('2d', { willReadFrequently: true });

const inputVideo = document.getElementById('videoUpload');
const inputBg    = document.getElementById('bgUpload');
const slider     = document.getElementById('threshold');
const saveBtn    = document.getElementById('downloadBtn');



// 2. STATE / MEMORI DATA (JSON)
// ----------------------------------------------------------

// Kita pake objek JSON buat nyimpen settingan biar gak lupa
let config = {
    threshold: 110,
    projectName: "Proyek Green Screen Lu",
    lastUpdate: "2026"
};

// Objek untuk nampung gambar background
const background = new Image();



// 3. LOGIKA UPLOAD VIDEO
// ----------------------------------------------------------

inputVideo.onchange = function(event) {

    const file = event.target.files[0];

    if (file) {
        // Masukin video ke "mesin" player
        video.src = URL.createObjectURL(file);
        
        // Langsung putar videonya
        video.play();
    }

};



// 4. LOGIKA UPLOAD BACKGROUND (GAMBAR)
// ----------------------------------------------------------

inputBg.onchange = function(event) {

    const file = event.target.files[0];

    if (file) {
        // Simpan gambar ke memori objek background
        background.src = URL.createObjectURL(file);
    }

};



// 5. FUNGSI UTAMA PEMROSESAN (ANIMASI LOOP)
// ----------------------------------------------------------

function renderProses() {

    // Kalo video lagi mati, jangan maksa ngerender (biar HP gak panas)
    if (video.paused || video.ended) {
        requestAnimationFrame(renderProses);
        return;
    }


    // Samain ukuran canvas dengan resolusi video asli
    if (canvas.width !== video.videoWidth) {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
    }


    // LANGKAH A: Gambar Background di paling bawah
    if (background.src) {
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    } else {
        // Kalo gak ada background, kasih warna gelap aja
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }


    // LANGKAH B: Olah Video di "Canvas Bayangan" (Memori)
    // Biar HP gak nge-hang, kita olah di belakang layar
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height);


    // LANGKAH C: Ambil Data Pixel (R, G, B, A)
    let frame = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    let totalData = frame.data.length;
    let sensitivitas = slider.value; 


    // LANGKAH D: Looping Hapus Warna Hijau
    // Baris ini yang paling berat kerjanya, bro
    for (let i = 0; i < totalData; i += 4) {

        let r = frame.data[i];     // Merah
        let g = frame.data[i + 1]; // Hijau
        let b = frame.data[i + 2]; // Biru

        // Rumus sakti: Kalo hijaunya dominan, buang!
        if (g > r && g > b && g > sensitivitas) {
            
            // Angka 3 itu Alpha (transparansi). 0 berarti ilang.
            frame.data[i + 3] = 0; 
        }

    }


    // LANGKAH E: Tempelkan hasil ke layar utama
    tempCtx.putImageData(frame, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);


    // Jalankan terus fungsinya biar jadi video
    requestAnimationFrame(renderProses);

}



// 6. TOMBOL DOWNLOAD HASIL
// ----------------------------------------------------------

saveBtn.onclick = function() {

    // Ubah canvas jadi file foto PNG
    const image = canvas.toDataURL("image/png");

    const link = document.createElement('a');
    link.download = "hasil-editor-lu.png";
    link.href = image;

    // Klik otomatis buat download
    link.click();

};



// 7. AKTIFKAN SISTEM
// ----------------------------------------------------------

video.addEventListener('play', () => {
    
    console.log("Mesin Editor Dimulai...");
    renderProses();

});
