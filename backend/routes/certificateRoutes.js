const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const certificateController = require('../controllers/certificateController');
const auth = require('../middleware/auth');

// Generate sertifikat (hanya admin)
router.post('/generate', auth, certificateController.generateCertificate);

//Download QR 
router.get('/download-qr/:qrfilename', certificateController.downloadQr);

// Download file pdf
// router.get('/download/:filename',auth, certificateController.downloadCertificate);
router.get('/download/:filename', certificateController.downloadCertificate);

// Verifikasi by QR hash (public)
router.get('/verify/:hash', certificateController.verifyCertificateByHash);

// Verifikasi file upload (admin)
router.post('/verify-file', auth, upload.single('file'), certificateController.verifyCertificateByFile);



module.exports = router;
