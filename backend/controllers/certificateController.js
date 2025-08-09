const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const QRCode = require('qrcode');
const { ethers } = require('ethers');
const pinataSDK = require('@pinata/sdk');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

// Helper: buat nama file aman
function slugify(text) {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

// Config Pinata
const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

// Config Blockchain
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const abi = require('../abi/CertificateRegistry.json').abi;
const contract = new ethers.Contract(process.env.SMART_CONTRACT_ADDRESS, abi, provider);

// Metadata storage (simpan & load ke file JSON)
const metadataPath = path.join(__dirname, '../cert-metadata.json');
let certMetadata = {};
if (fs.existsSync(metadataPath)) {
  certMetadata = JSON.parse(fs.readFileSync(metadataPath));
}
function saveMetadata() {
  fs.writeFileSync(metadataPath, JSON.stringify(certMetadata, null, 2));
}

// 1. Generate Sertifikat
// exports.generateCertificate = async (req, res) => {
//   try {
//     const { nama, nim, jurusan } = req.body;
//     if (!nama || !nim || !jurusan) {
//       return res.status(400).json({ message: 'nama, nim, dan jurusan wajib diisi' });
//     }

//     // CEK DUPLICATE KOMBINASI NIM
//     for (let h in certMetadata) {
//       if (certMetadata[h].nim.toLowerCase().trim() === nim.toLowerCase().trim()) {
//         return res.status(400).json({ message: 'Sertifikat untuk NIM ini sudah pernah dibuat.' });
//       }
//     }

//     // Path logo kampus
//     const logoPath = path.join(__dirname, '../assets/logo-umm.png');

    
//     // const namaSlug = slugify(nama);
//     // const today = new Date().toISOString().slice(0,10).replace(/-/g,"");
//     // const filename = `certificate_${namaSlug}_${nim}_${today}.pdf`;
//     // const filepath = path.join(__dirname, '../uploads', filename);
//     const namaSlug = slugify(nama);
//     // Format tanggal: yyyymmdd
//     const now = new Date();
//     const tanggalGenerate = [
//       now.getFullYear(),
//       String(now.getMonth() + 1).padStart(2, '0'),
//       String(now.getDate()).padStart(2, '0')
//     ].join('');
//     const filename = `${namaSlug}_${nim}_${tanggalGenerate}.pdf`;
//     const filepath = path.join(__dirname, '../uploads', filename);

//     // PDF A4 portrait
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage([595, 842]);
//     const colorBiru = rgb(41/255, 56/255, 145/255);
//     const colorAbu = rgb(245/255, 245/255, 248/255);

//     // Border biru tipis
//     const border = 10;
//     page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: colorBiru });
//     page.drawRectangle({ x: border, y: border, width: 595-2*border, height: 842-2*border, color: colorAbu });

//     // Font
//     const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//     const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica);

//     // === Logo atas tengah ===
//     const logoImg = fs.readFileSync(logoPath);
//     const logoEmbed = await pdfDoc.embedPng(logoImg);
//     const logoWidth = 95;
//     const logoHeight = 95;
//     const logoX = (595 - logoWidth) / 2;
//     const logoY = 725;
//     page.drawImage(logoEmbed, { x: logoX, y: logoY, width: logoWidth, height: logoHeight });

//     // === Judul tengah dengan underline ===
//     const title = 'SERTIFIKAT MEMBACA ALQURAN';
//     const titleFontSize = 18;
//     // Hitung lebar judul
//     const textWidth = fontBold.widthOfTextAtSize(title, titleFontSize);
//     const textX = (595 - textWidth) / 2;
//     const titleY = logoY - 25;
//     page.drawText(title, { x: textX, y: titleY, size: titleFontSize, font: fontBold, color: rgb(0,0,0) });
//     // Underline: garis tepat di bawah judul, panjang = judul
//     page.drawRectangle({ x: textX, y: titleY-3, width: textWidth, height: 2, color: rgb(0,0,0) });

//     // === Konten utama ===
//     let y = titleY - 34;
//     page.drawText('Assalamualaikum Wr.Wb.', { x: 54, y, size: 13, font: fontBold });

//     y -= 22;
//     const pembuka = "Dengan Rahmat Allah, Tim Penguji Membaca Al-Qur’an Mahasiswa Fakultas Teknik Universitas Muhammadiyah Makassar, Memberikan “Sertifikat Baca Al-Quran” Kepada Mahasiswa :";
//     drawMultiline(page, pembuka, 54, y, 12, fontReg, 17, 480);

//     y -= 3*17 + 8; // 3 baris + margin
//     page.drawText("Nama    :", { x: 77, y, size: 12, font: fontReg });
//     page.drawText(nama, { x: 160, y, size: 12, font: fontBold });

//     y -= 20;
//     page.drawText("Nim     :", { x: 77, y, size: 12, font: fontReg });
//     page.drawText(nim, { x: 160, y, size: 12, font: fontBold });

//     y -= 20;
//     page.drawText("Jurusan :", { x: 77, y, size: 12, font: fontReg });
//     page.drawText(jurusan, { x: 160, y, size: 12, font: fontBold });

//     y -= 28;
//     const penutup = "Setelah melalui Test Baca Al-Qur’an dan dinyatakan Lulus. Sertifikat ini diberikan kepada Mahasiswa yang bersangkutan untuk dipergunakan untuk persyaratan administrasi penyelesaian studi";
//     drawMultiline(page, penutup, 54, y, 12, fontReg, 17, 480);

//     y -= 3*17 + 7;
//     page.drawText('Wassalamu Alaikum Wr.Wb.', { x: 54, y, size: 13, font: fontBold });

//     // === QR code (kiri bawah, proporsional) ===
//     const tempQrData = 'QR Akan update setelah hash didapat';
//     const qrFileName = `qr_${namaSlug}_${nim}_${tanggalGenerate}.png`;
//     const qrPath = path.join(__dirname, '../uploads', qrFileName);
//     await QRCode.toFile(qrPath, tempQrData, { width: 120 });
//     const pngQrBytes = fs.readFileSync(qrPath);
//     const pngImage = await pdfDoc.embedPng(pngQrBytes);
//     // Kiri bawah
//     page.drawImage(pngImage, { x: 56, y: 75, width: 120, height: 120 });

//     // === Tanggal kanan bawah ===
//     const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
//     page.drawText(`Makassar, ${tgl}`, { x: 330, y: 90, size: 12, font: fontReg });

//     // Simpan PDF sementara (sebelum hash final)
//     const finalPdfBytes = await pdfDoc.save();
//     fs.writeFileSync(filepath, finalPdfBytes);

//     // 4. Hash file FINAL
//     const fileBuffer = fs.readFileSync(filepath);
//     const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

//     // 5. Update QR dengan hash link verifikasi
//     const hashQrData = `http://localhost:3000/api/certificate/verify/${hash}`; //5000 untuk test backend. untuk react pake 3000
//     // const hashQrData = `http://localhost:3000/api/certificate/verify/${nim}`;
//     await QRCode.toFile(qrPath, hashQrData, { width: 120 });
//     const newQrBytes = fs.readFileSync(qrPath);

//     // 6. Embed QR baru ke PDF final
//     const pdfFinal = await PDFDocument.load(fileBuffer);
//     const imgFinal = await pdfFinal.embedPng(newQrBytes);
//     pdfFinal.getPages()[0].drawImage(imgFinal, { x: 56, y: 75, width: 120, height: 120 });
//     const reallyFinalPdfBytes = await pdfFinal.save();
//     fs.writeFileSync(filepath, reallyFinalPdfBytes);

//     // 7. Hash ulang PDF FINAL setelah QR benar-benar final
//     const finalFileBuffer = fs.readFileSync(filepath);
//     const finalHash = crypto.createHash('sha256').update(finalFileBuffer).digest('hex');

//     // 8. Upload ke Pinata
//     const pinataResult = await pinata.pinFileToIPFS(fs.createReadStream(filepath));
//     const ipfsCid = pinataResult.IpfsHash;

//     // 9. Simpan ke smart contract (pakai hash final)
//     const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
//     const wallet = new ethers.Wallet(adminPrivateKey, provider);
//     const contractWithSigner = contract.connect(wallet);
//     const tx = await contractWithSigner.registerCertificate(finalHash, ipfsCid);
//     await tx.wait();

//     // 10. Simpan metadata ke file
//     certMetadata[finalHash] = {
//       nama,
//       nim,
//       jurusan,
//       tanggal: tgl,
//       hash: finalHash,
//       ipfsCid,
//       issuer: wallet.address
//     };
//     saveMetadata();

//     // 11. Response
//     res.json({
//       message: 'Sertifikat berhasil dibuat!',
//       nama, nim, jurusan, tanggal: tgl,
//       hash: finalHash,
//       ipfsCid,
//       ipfsUrl: `https://ipfs.io/ipfs/${ipfsCid}`,
//       downloadUrl: `/api/certificate/download/${filename}`
//     });
//     try { fs.unlinkSync(qrPath); } catch (e) {}

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };
// exports.generateCertificate = async (req, res) => {
//   try {
//     const { nama, nim, jurusan } = req.body;
//     if (!nama || !nim || !jurusan) {
//       return res.status(400).json({ message: 'nama, nim, dan jurusan wajib diisi' });
//     }

//     // Cek duplicate
//     for (let h in certMetadata) {
//       if (certMetadata[h].nim.toLowerCase().trim() === nim.toLowerCase().trim()) {
//         return res.status(400).json({ message: 'Sertifikat untuk NIM ini sudah pernah dibuat.' });
//       }
//     }

//     const logoPath = path.join(__dirname, '../assets/logo-umm.png');
//     const namaSlug = slugify(nama);
//     const now = new Date();
//     const tanggalGenerate = [
//       now.getFullYear(),
//       String(now.getMonth() + 1).padStart(2, '0'),
//       String(now.getDate()).padStart(2, '0')
//     ].join('');
//     const filename = `${namaSlug}_${nim}_${tanggalGenerate}.pdf`;
//     const filepath = path.join(__dirname, '../uploads', filename);

//     // Generate PDF (tanpa embed QR)
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage([595, 842]);
//     const colorBiru = rgb(41 / 255, 56 / 255, 145 / 255);
//     const colorAbu = rgb(245 / 255, 245 / 255, 248 / 255);
//     const border = 10;
//     page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: colorBiru });
//     page.drawRectangle({ x: border, y: border, width: 595 - 2 * border, height: 842 - 2 * border, color: colorAbu });

//     const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//     const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
//     const logoImg = fs.readFileSync(logoPath);
//     const logoEmbed = await pdfDoc.embedPng(logoImg);
//     const logoWidth = 95, logoHeight = 95;
//     const logoX = (595 - logoWidth) / 2;
//     const logoY = 725;
//     page.drawImage(logoEmbed, { x: logoX, y: logoY, width: logoWidth, height: logoHeight });

//     const title = 'SERTIFIKAT MEMBACA ALQURAN';
//     const titleFontSize = 18;
//     const textWidth = fontBold.widthOfTextAtSize(title, titleFontSize);
//     const textX = (595 - textWidth) / 2;
//     const titleY = logoY - 25;
//     page.drawText(title, { x: textX, y: titleY, size: titleFontSize, font: fontBold, color: rgb(0, 0, 0) });
//     page.drawRectangle({ x: textX, y: titleY - 3, width: textWidth, height: 2, color: rgb(0, 0, 0) });

//     let y = titleY - 34;
//     page.drawText('Assalamualaikum Wr.Wb.', { x: 54, y, size: 13, font: fontBold });

//     y -= 22;
//     const pembuka = "Dengan Rahmat Allah, Tim Penguji Membaca Al-Qur’an Mahasiswa Fakultas Teknik Universitas Muhammadiyah Makassar, Memberikan “Sertifikat Baca Al-Quran” Kepada Mahasiswa :";
//     drawMultiline(page, pembuka, 54, y, 12, fontReg, 17, 480);

//     y -= 3 * 17 + 8;
//     page.drawText("Nama    :", { x: 77, y, size: 12, font: fontReg });
//     page.drawText(nama, { x: 160, y, size: 12, font: fontBold });

//     y -= 20;
//     page.drawText("Nim     :", { x: 77, y, size: 12, font: fontReg });
//     page.drawText(nim, { x: 160, y, size: 12, font: fontBold });

//     y -= 20;
//     page.drawText("Jurusan :", { x: 77, y, size: 12, font: fontReg });
//     page.drawText(jurusan, { x: 160, y, size: 12, font: fontBold });

//     y -= 28;
//     const penutup = "Setelah melalui Test Baca Al-Qur’an dan dinyatakan Lulus. Sertifikat ini diberikan kepada Mahasiswa yang bersangkutan untuk dipergunakan untuk persyaratan administrasi penyelesaian studi";
//     drawMultiline(page, penutup, 54, y, 12, fontReg, 17, 480);

//     y -= 3 * 17 + 7;
//     page.drawText('Wassalamu Alaikum Wr.Wb.', { x: 54, y, size: 13, font: fontBold });

//     // Tanggal kanan bawah
//     const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
//     page.drawText(`Makassar, ${tgl}`, { x: 330, y: 90, size: 12, font: fontReg });

//     // Simpan PDF sementara (sebelum hash final)
//     const finalPdfBytes = await pdfDoc.save();
//     fs.writeFileSync(filepath, finalPdfBytes);

//     // Hash file FINAL
//     const fileBuffer = fs.readFileSync(filepath);
//     const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

//     // Generate QR (link ke halaman verifikasi)
//     const hashQrData = `http://localhost:3000/certificate/verify-qr/${hash}`;
//     const qrFileName = `qr_${namaSlug}_${nim}_${tanggalGenerate}.png`;
//     const qrPath = path.join(__dirname, '../uploads', qrFileName);
//     await QRCode.toFile(qrPath, hashQrData, { width: 220 });

//     // Hash ulang PDF FINAL (optional, agar benar2 final)
//     const finalFileBuffer = fs.readFileSync(filepath);
//     const finalHash = crypto.createHash('sha256').update(finalFileBuffer).digest('hex');

//     // Upload ke Pinata
//     const pinataResult = await pinata.pinFileToIPFS(fs.createReadStream(filepath));
//     const ipfsCid = pinataResult.IpfsHash;

//     // Simpan ke smart contract (pakai hash final)
//     const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
//     const wallet = new ethers.Wallet(adminPrivateKey, provider);
//     const contractWithSigner = contract.connect(wallet);
//     const tx = await contractWithSigner.registerCertificate(finalHash, ipfsCid);
//     await tx.wait();

//     certMetadata[finalHash] = {
//       nama,
//       nim,
//       jurusan,
//       tanggal: tgl,
//       hash: finalHash,
//       ipfsCid,
//       issuer: wallet.address,
//       qrFileName
//     };
//     saveMetadata();

//     res.json({
//       message: 'Sertifikat berhasil dibuat!',
//       nama, nim, jurusan, tanggal: tgl,
//       hash: finalHash,
//       ipfsCid,
//       ipfsUrl: `https://ipfs.io/ipfs/${ipfsCid}`,
//       downloadUrl: `/api/certificate/download/${filename}`,
//       downloadQrUrl: `/api/certificate/download-qr/${qrFileName}` // URL download QR
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.generateCertificate = async (req, res) => {
  try {
    const { nama, nim, jurusan } = req.body;
    if (!nama || !nim || !jurusan) {
      return res.status(400).json({ message: 'nama, nim, dan jurusan wajib diisi' });
    }

    // Cek duplicate
    for (let h in certMetadata) {
      if (certMetadata[h].nim.toLowerCase().trim() === nim.toLowerCase().trim()) {
        return res.status(400).json({ message: 'Sertifikat untuk NIM ini sudah pernah dibuat.' });
      }
    }

    const logoPath = path.join(__dirname, '../assets/logo-umm.png');
    const namaSlug = slugify(nama);
    const now = new Date();
    const tanggalGenerate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('');
    const filename = `${namaSlug}_${nim}_${tanggalGenerate}.pdf`;
    const filepath = path.join(__dirname, '../uploads', filename);

    // Generate PDF (tanpa embed QR)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const colorBiru = rgb(41 / 255, 56 / 255, 145 / 255);
    const colorAbu = rgb(245 / 255, 245 / 255, 248 / 255);
    const border = 10;
    page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: colorBiru });
    page.drawRectangle({ x: border, y: border, width: 595 - 2 * border, height: 842 - 2 * border, color: colorAbu });

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const logoImg = fs.readFileSync(logoPath);
    const logoEmbed = await pdfDoc.embedPng(logoImg);
    const logoWidth = 95, logoHeight = 95;
    const logoX = (595 - logoWidth) / 2;
    const logoY = 725;
    page.drawImage(logoEmbed, { x: logoX, y: logoY, width: logoWidth, height: logoHeight });

    const title = 'SERTIFIKAT MEMBACA ALQURAN';
    const titleFontSize = 18;
    const textWidth = fontBold.widthOfTextAtSize(title, titleFontSize);
    const textX = (595 - textWidth) / 2;
    const titleY = logoY - 25;
    page.drawText(title, { x: textX, y: titleY, size: titleFontSize, font: fontBold, color: rgb(0, 0, 0) });
    page.drawRectangle({ x: textX, y: titleY - 3, width: textWidth, height: 2, color: rgb(0, 0, 0) });

    let y = titleY - 34;
    page.drawText('Assalamualaikum Wr.Wb.', { x: 54, y, size: 13, font: fontBold });

    y -= 22;
    const pembuka = "Dengan Rahmat Allah, Tim Penguji Membaca Al-Qur’an Mahasiswa Fakultas Teknik Universitas Muhammadiyah Makassar, Memberikan “Sertifikat Baca Al-Quran” Kepada Mahasiswa :";
    drawMultiline(page, pembuka, 54, y, 12, fontReg, 17, 480);

    y -= 3 * 17 + 8;
    page.drawText("Nama    :", { x: 77, y, size: 12, font: fontReg });
    page.drawText(nama, { x: 160, y, size: 12, font: fontBold });

    y -= 20;
    page.drawText("Nim     :", { x: 77, y, size: 12, font: fontReg });
    page.drawText(nim, { x: 160, y, size: 12, font: fontBold });

    y -= 20;
    page.drawText("Jurusan :", { x: 77, y, size: 12, font: fontReg });
    page.drawText(jurusan, { x: 160, y, size: 12, font: fontBold });

    y -= 28;
    const penutup = "Setelah melalui Test Baca Al-Qur’an dan dinyatakan Lulus. Sertifikat ini diberikan kepada Mahasiswa yang bersangkutan untuk dipergunakan untuk persyaratan administrasi penyelesaian studi";
    drawMultiline(page, penutup, 54, y, 12, fontReg, 17, 480);

    y -= 3 * 17 + 7;
    page.drawText('Wassalamu Alaikum Wr.Wb.', { x: 54, y, size: 13, font: fontBold });

    // Tanggal kanan bawah
    const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    page.drawText(`Makassar, ${tgl}`, { x: 330, y: 90, size: 12, font: fontReg });

    // Simpan PDF sementara (sebelum hash final)
    const finalPdfBytes = await pdfDoc.save();
    fs.writeFileSync(filepath, finalPdfBytes);

    // Hash file FINAL
    const fileBuffer = fs.readFileSync(filepath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // --- UPDATE QR CODE LINK (ke halaman React) ---
    const hashQrData = `http://192.168.0.61:3000/verify/${hash}`; // ARAHKAN KE HALAMAN FRONTEND! ip nya ganti untuk mempermudah verifikasi di device lain
    const qrFileName = `qr_${namaSlug}_${nim}_${tanggalGenerate}.png`;
    const qrPath = path.join(__dirname, '../uploads', qrFileName);
    await QRCode.toFile(qrPath, hashQrData, { width: 220 });

    // Hash ulang PDF FINAL (optional, agar benar2 final)
    const finalFileBuffer = fs.readFileSync(filepath);
    const finalHash = crypto.createHash('sha256').update(finalFileBuffer).digest('hex');

    // Upload ke Pinata
    const pinataResult = await pinata.pinFileToIPFS(fs.createReadStream(filepath));
    const ipfsCid = pinataResult.IpfsHash;

    // Simpan ke smart contract (pakai hash final)
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    const wallet = new ethers.Wallet(adminPrivateKey, provider);
    const contractWithSigner = contract.connect(wallet);
    const tx = await contractWithSigner.registerCertificate(finalHash, ipfsCid);
    await tx.wait();

    certMetadata[finalHash] = {
      nama,
      nim,
      jurusan,
      tanggal: tgl,
      hash: finalHash,
      ipfsCid,
      issuer: wallet.address,
      qrFileName
    };
    saveMetadata();

    res.json({
      message: 'Sertifikat berhasil dibuat!',
      nama, nim, jurusan, tanggal: tgl,
      hash: finalHash,
      ipfsCid,
      ipfsUrl: `https://ipfs.io/ipfs/${ipfsCid}`,
      downloadUrl: `/api/certificate/download/${filename}`,
      downloadQrUrl: `/api/certificate/download-qr/${qrFileName}` // URL download QR
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Helper fungsi untuk multi-line text (otomatis wrap maxWidth)
function drawMultiline(page, text, x, y, size, font, lineHeight=16, maxWidth=480) {
  const words = text.split(' ');
  let line = '';
  let lineY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && n > 0) {
      page.drawText(line.trim(), { x, y: lineY, size, font });
      line = words[n] + ' ';
      lineY -= lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) page.drawText(line.trim(), { x, y: lineY, size, font });
}


// 2. Verifikasi by hash dari QR (public)
exports.verifyCertificateByHash = async (req, res) => {
  const { hash } = req.params;
  try {
    const result = await contract.verifyCertificate(hash);

    // Ambil metadata
    let meta = certMetadata[hash] || {};
    res.json({
      valid: result[0],
      Nama: meta.nama || "",
      NIM: meta.nim || "",
      Jurusan: meta.jurusan || "",
      ipfsUrl: meta.ipfsCid ? `https://ipfs.io/ipfs/${meta.ipfsCid}` : "",
      issuer: result[2],
      tanggal: meta.tanggal || ""
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Verifikasi by upload file (hash file, lalu cek)
exports.verifyCertificateByFile = async (req, res) => {
  const filePath = req.file.path;
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const result = await contract.verifyCertificate(hash);
    fs.unlinkSync(filePath);
    res.json({
      valid: result[0],
      ipfsCid: result[1],
      issuer: result[2],
      hash
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Download certificate file by filename (PDF)
const uploadsDir = path.resolve(__dirname, '../uploads');
exports.downloadCertificate = (req, res) => {
  let filename = req.params.filename;
  filename = filename.toLowerCase().trim(); // pastikan lowercase
  const file = path.join(uploadsDir, filename);

  // Print isi folder uploads
  const files = fs.readdirSync(uploadsDir);
  console.log('Isi folder uploads:', files);

  // Cek satu-satu kesamaan filename
  let match = false;
  files.forEach(f => {
    if (f.toLowerCase().trim() === filename) {
      match = true;
      console.log('Match found:', f);
    }
  });

  console.log('Akses file:', file, 'Ada:', fs.existsSync(file), 'Match:', match);

  if (!fs.existsSync(file)) {
    return res.status(404).json({ message: 'File tidak ditemukan' });
  }
  res.download(file, filename, (err) => {
    if (err) {
      res.status(500).json({ error: 'Gagal download file' });
    }
  });
};

//Download Qr
exports.downloadQr = (req, res) => {
  const qrFileName = req.params.qrfilename;
  const qrPath = path.join(__dirname, '../uploads', qrFileName);
  if (!fs.existsSync(qrPath)) {
    return res.status(404).json({ message: 'QR code tidak ditemukan' });
  }
  res.download(qrPath, qrFileName, (err) => {
    if (err) {
      res.status(500).json({ error: 'Gagal download QR code' });
    }
  });
};


