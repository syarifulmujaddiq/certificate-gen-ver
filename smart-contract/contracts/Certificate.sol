// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    struct Certificate {
        string hash;          // SHA-256 hash sertifikat
        string ipfsCid;       // CID IPFS file sertifikat (hasil upload ke Pinata)
        address issuer;       // Siapa yang register (admin)
        bool valid;           // Status validitas
    }

    // Mapping dari hash ke data sertifikat
    mapping(string => Certificate) public certificates;

    // Event untuk log setiap register sertifikat baru
    event CertificateRegistered(string indexed hash, string ipfsCid, address indexed issuer);

    // Fungsi register sertifikat baru (hash unik)
    function registerCertificate(string memory _hash, string memory _ipfsCid) public {
        require(bytes(certificates[_hash].hash).length == 0, "Certificate already registered");
        certificates[_hash] = Certificate(_hash, _ipfsCid, msg.sender, true);
        emit CertificateRegistered(_hash, _ipfsCid, msg.sender);
    }

    // Fungsi verifikasi hash sertifikat
    // Dipakai untuk:
    // 1. Verifikasi by QR (hash dari QR code)
    // 2. Verifikasi file upload (hash hasil hash file)
    function verifyCertificate(string memory _hash) public view returns (bool valid, string memory ipfsCid, address issuer) {
        Certificate memory cert = certificates[_hash];
        if (cert.valid) {
            return (true, cert.ipfsCid, cert.issuer);
        }
        return (false, "", address(0));
    }

    // Fungsi revoke sertifikat (opsional, bisa tambah hak admin saja)
    function revokeCertificate(string memory _hash) public {
        require(bytes(certificates[_hash].hash).length != 0, "Certificate not found");
        // Bisa tambahkan hak akses hanya admin (bisa dengan modifier)
        certificates[_hash].valid = false;
    }
}
