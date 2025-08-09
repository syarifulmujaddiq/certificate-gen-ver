const { ethers } = require("hardhat");

async function main() {
  // Hash transaksi yang ingin dicek (ganti dengan hash lain sesuai kebutuhan)
  const txHash = "0x1179b84ce0d9738b7d21e58feb53a32c43b5c690474888550d924286d562fae8";  // Hash transaksi
  // Ambil detail transaksi dari provider berdasarkan hash
  const tx = await ethers.provider.getTransaction(txHash);

  if (!tx) {
    console.log("Transaksi tidak ditemukan atau belum terdaftar di jaringan Blockchain.");
    return;
  }

  // Tampilkan data input transaksi dalam format hex
  console.log("Input data transaksi (Hex):", tx.data);

  // Definisikan ABI fungsi smart contract yang ingin dideteksi/didekode
  const contractABI = [
    "function registerCertificate(string memory _hash, string memory _ipfsCid) public"
  ];

  const iface = new ethers.Interface(contractABI);
  const decodedInput = iface.parseTransaction({ data: tx.data });

  console.log("Decoded Input:", decodedInput);
  console.log("Function yang dipanggil:", decodedInput.name);
  console.log("Argumen dari user:", decodedInput.args);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
