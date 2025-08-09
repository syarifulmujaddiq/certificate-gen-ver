Cara jalankan 
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
npm start