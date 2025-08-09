<!-- Cara jalankan 
npx hardhat clean
npx hardhat node

open terminal lain
npx hardhat test >> uji coba fungsi dalam smart contract(opsional)
npx hardhat run scripts/deploy.js --network localhost >> copy contract paste di .env


#################
const hashQrData = `http://192.168.18.221:3000/verify/${hash}`; // /ip nya ganti menggunakan ip yang sama di wifi yang sama
open terminal lain >> backend
cd backend 
node app.js

#################
const res = await axios.get(
          `http://192.168.18.221:5000/api/certificate/verify/${hash}` //ip nya ganti menggunakan ip yang sama di wifi yang sama
        );
open terminal lain >> frontend 
cd frontend
npm start -->

# Sistem Verifikasi Sertifikat Berbasis Blockchain

Proyek ini adalah implementasi sistem manajemen dan verifikasi sertifikat digital berbasis **Blockchain** menggunakan **Smart Contract**, **IPFS (Pinata)**, dan **SHA-256**. Sistem ini memiliki dua bagian utama:
1. **Sistem Admin** — Untuk login, membuat sertifikat, dan memverifikasi sertifikat via upload file.
2. **Sistem Publik** — Untuk verifikasi sertifikat melalui QR Code (hash).

---

## ✨ Fitur Utama
- **Login Admin** dengan autentikasi JWT.
- **Generate Sertifikat**:
  - Input data (Nama, NIM, Jurusan)
  - Generate PDF sertifikat otomatis
  - Hash SHA-256 untuk integritas
  - Upload ke IPFS via Pinata
  - Simpan hash & CID ke blockchain via Smart Contract.
- **Verifikasi Sertifikat**:
  - **Admin** → Verifikasi dengan upload file PDF.
  - **Publik** → Verifikasi dengan scan QR Code.
- **Integrasi Smart Contract** di Ethereum test network (Hardhat).
- **UI** berbasis React + Tailwind CSS.

---

## 📂 Struktur Folder
```
CERTIFICATE-GEN-VER/
├── backend/                 # Backend API (Express.js)
│   ├── abi/                 # ABI Smart Contract
│   ├── controllers/         # Logika endpoint
│   ├── middleware/          # Middleware auth JWT
│   ├── routes/              # Routing API
│   ├── uploads/              # Temp file upload
│   ├── .env.example         # Contoh environment variable
│   ├── app.js               # Entry backend
│   └── cert-metadata.json   # Metadata sertifikat (runtime)
│
├── frontend/                # Frontend React
│   ├── src/components/      # Komponen UI
│   ├── public/              # Asset publik
│   └── App.js               # Routing & layout utama
│
├── smart-contract/          # Smart contract (Hardhat)
│   ├── contracts/           # Solidity code
│   ├── scripts/             # Deployment script
│   └── test/                # Unit test
│
└── README.md
```

---

## ⚙️ Persiapan Environment

### 1. Clone Repository
```bash
git clone https://github.com/<username>/<repo>.git
cd CERTIFICATE-GEN-VER
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit file .env sesuai kredensial dan konfigurasi
npm install
```

Contoh `.env`:
```env
PORT=5000
PINATA_API_KEY=your_pinata_key
PINATA_API_SECRET=your_pinata_secret
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
SMART_CONTRACT_ADDRESS=0xContractAddressHere
ADMIN_PRIVATE_KEY=0xYourPrivateKeyHere
JWT_SECRET=use-a-long-random-string-here
```

### 3. Setup Smart Contract
```bash
cd ../smart-contract
npm install
npx hardhat compile
npx hardhat node
```
Deploy contract:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Setup Frontend
```bash
cd ../frontend
npm install
npm start
```

---

## 🚀 Menjalankan Aplikasi
1. Jalankan **Hardhat Node**:
   ```bash
   cd smart-contract
   npx hardhat node
   ```
2. Deploy Smart Contract (pastikan network `localhost`):
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
3. Jalankan Backend:
   ```bash
   cd ../backend
   node app.js
   ```
4. Jalankan Frontend:
   ```bash
   cd ../frontend
   npm start
   ```

---

## 📌 Catatan Penting
- Jangan commit file `.env` ke GitHub (sudah diatur di `.gitignore`).
- Gunakan **JWT_SECRET** yang panjang & unik untuk keamanan token.
- Gunakan API key Pinata yang valid untuk upload ke IPFS.
- Pastikan alamat smart contract (`SMART_CONTRACT_ADDRESS`) sesuai hasil deploy.

---

## 📜 Lisensi
MIT License © 2025
