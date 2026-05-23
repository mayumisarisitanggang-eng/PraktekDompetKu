import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// ─── Komponen Item Transaksi ────────────────────────────────────────
const TransaksiItem = ({ item }) => {
  const isMasuk = item.tipe === 'masuk';
  return (
    <View style={styles.txItem}>
      <View style={styles.txKiri}>
        <View style={[styles.txIcon, isMasuk ? styles.iconMasuk : styles.iconKeluar]}>
          <Text style={styles.txIconText}>{isMasuk ? '↓' : '↑'}</Text>
        </View>
        <View>
          <Text style={styles.txKet}>{item.ket}</Text>
          <Text style={styles.txWaktu}>{item.waktu}</Text>
        </View>
      </View>
      <Text style={[styles.txNominal, isMasuk ? styles.warnaMasuk : styles.warnaKeluar]}>
        {isMasuk ? '+' : '−'}{formatRupiah(item.nominal)}
      </Text>
    </View>
  );
};

// ─── Fungsi Utilitas ────────────────────────────────────────────────
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

const getWaktuSekarang = () => {
  const d = new Date();
  const jam = d.getHours().toString().padStart(2, '0');
  const menit = d.getMinutes().toString().padStart(2, '0');
  return `${jam}:${menit}`;
};

// ─── Komponen Utama ─────────────────────────────────────────────────
export default function App() {
  // State untuk daftar transaksi (pakai array of objects)
  const [transaksi, setTransaksi] = useState([]);

  // State untuk form input
  const [inputKet, setInputKet] = useState('');
  const [inputNominal, setInputNominal] = useState('');

  // ── Hitung total saldo ──────────────────────────────────────────
  // Logic: kalau 'masuk' tambah, kalau 'keluar' kurang
  const totalSaldo = transaksi.reduce((acc, item) => {
    return item.tipe === 'masuk' ? acc + item.nominal : acc - item.nominal;
  }, 0);

  const totalMasuk = transaksi
    .filter((t) => t.tipe === 'masuk')
    .reduce((acc, t) => acc + t.nominal, 0);

  const totalKeluar = transaksi
    .filter((t) => t.tipe === 'keluar')
    .reduce((acc, t) => acc + t.nominal, 0);

  // ── Fungsi reset semua transaksi (saldo kembali ke 0) ──────────
  const [konfirmasiReset, setKonfirmasiReset] = useState(false);

  const resetTransaksi = () => setKonfirmasiReset(true);
  const konfirmasiYa = () => { setTransaksi([]); setKonfirmasiReset(false); };
  const konfirmasiTidak = () => setKonfirmasiReset(false);

  // ── Fungsi tambah transaksi ─────────────────────────────────────
  const tambahTransaksi = (tipe) => {
    // Validasi input
    if (!inputKet.trim()) {
      Alert.alert('Oops!', 'Deskripsi tidak boleh kosong.');
      return;
    }
    const nominal = parseFloat(inputNominal);
    if (isNaN(nominal) || nominal <= 0) {
      Alert.alert('Oops!', 'Nominal harus berupa angka lebih dari 0.');
      return;
    }

    // Buat objek transaksi baru
    const transaksiBarú = {
      id: Date.now().toString(),
      ket: inputKet.trim(),
      nominal: nominal,
      tipe: tipe, // 'masuk' atau 'keluar'
      waktu: getWaktuSekarang(),
    };

    // Update state array transaksi (tambah di awal supaya tampil paling atas)
    setTransaksi([transaksiBarú, ...transaksi]);

    // Reset form
    setInputKet('');
    setInputNominal('');
  };

  // ── Render komponen ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── HEADER SALDO ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.appName}>💰 Praktek DompetKu</Text>
            <TouchableOpacity style={styles.btnReset} onPress={resetTransaksi}>
              <Text style={styles.btnResetText}>🔄 Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Konfirmasi Reset */}
          {konfirmasiReset && (
            <View style={styles.konfirmasiBox}>
              <Text style={styles.konfirmasiTeks}>Hapus semua data? Saldo kembali Rp 0</Text>
              <View style={styles.konfirmasiRow}>
                <TouchableOpacity style={styles.btnYa} onPress={konfirmasiYa}>
                  <Text style={styles.btnYaTeks}>Ya, Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnBatal} onPress={konfirmasiTidak}>
                  <Text style={styles.btnBatalTeks}>Batal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <Text style={styles.saldoLabel}>Saldo Saat Ini</Text>
          <Text
            style={[
              styles.saldoJumlah,
              totalSaldo >= 0 ? styles.warnaMasuk : styles.warnaKeluar,
            ]}
          >
            {formatRupiah(totalSaldo)}
          </Text>

          {/* Ringkasan masuk & keluar */}
          <View style={styles.ringkasanRow}>
            <View style={styles.ringkasanBox}>
              <Text style={styles.ringkasanLabel}>Pemasukan</Text>
              <Text style={[styles.ringkasanAngka, styles.warnaMasuk]}>
                {formatRupiah(totalMasuk)}
              </Text>
            </View>
            <View style={styles.ringkasanDivider} />
            <View style={styles.ringkasanBox}>
              <Text style={styles.ringkasanLabel}>Pengeluaran</Text>
              <Text style={[styles.ringkasanAngka, styles.warnaKeluar]}>
                {formatRupiah(totalKeluar)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── FORM INPUT ───────────────────────────────────────── */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Tambah Transaksi</Text>

          <TextInput
            style={styles.input}
            placeholder="Deskripsi (contoh: Beli Makan)"
            placeholderTextColor="#aaa"
            value={inputKet}
            onChangeText={setInputKet}
          />
          <TextInput
            style={styles.input}
            placeholder="Nominal (contoh: 50000)"
            placeholderTextColor="#aaa"
            value={inputNominal}
            onChangeText={setInputNominal}
            keyboardType="numeric"
          />

          {/* 2 Tombol: Pemasukan & Pengeluaran */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnMasuk]}
              onPress={() => tambahTransaksi('masuk')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>↓ Pemasukan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnKeluar]}
              onPress={() => tambahTransaksi('keluar')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>↑ Pengeluaran</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── RIWAYAT TRANSAKSI (FlatList) ─────────────────────── */}
        <View style={styles.listCard}>
          <Text style={styles.cardTitle}>
            Riwayat Transaksi ({transaksi.length})
          </Text>

          <FlatList
            data={transaksi}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TransaksiItem item={item} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Belum ada transaksi</Text>
                <Text style={styles.emptySubText}>
                  Tambah transaksi pertamamu di atas!
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── StyleSheet ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },

  // Header Saldo
  header: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  appName: {
    color: '#a0aec0',
    fontSize: 16,
    fontWeight: '600',
  },
  btnReset: {
    backgroundColor: '#2d3748',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnResetText: {
    color: '#fc8181',
    fontSize: 12,
    fontWeight: '600',
  },
  konfirmasiBox: {
    backgroundColor: '#2d3748',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginTop: 8,
  },
  konfirmasiTeks: {
    color: '#e2e8f0',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  konfirmasiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnYa: {
    flex: 1,
    backgroundColor: '#9b2c2c',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnYaTeks: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  btnBatal: {
    flex: 1,
    backgroundColor: '#4a5568',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnBatalTeks: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 13,
  },
  saldoLabel: {
    color: '#a0aec0',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  saldoJumlah: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  ringkasanRow: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  ringkasanBox: {
    flex: 1,
    alignItems: 'center',
  },
  ringkasanDivider: {
    width: 1,
    backgroundColor: '#2d3748',
    marginHorizontal: 8,
  },
  ringkasanLabel: {
    color: '#718096',
    fontSize: 12,
    marginBottom: 4,
  },
  ringkasanAngka: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Form & List Cards
  formCard: {
    backgroundColor: '#ffffff',
    margin: 12,
    marginBottom: 6,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Input
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#2d3748',
    backgroundColor: '#f7fafc',
    marginBottom: 10,
  },

  // Tombol
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  btnMasuk: {
    backgroundColor: '#276749',
  },
  btnKeluar: {
    backgroundColor: '#9b2c2c',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Item Transaksi
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#edf2f7',
  },
  txKiri: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconMasuk: {
    backgroundColor: '#c6f6d5',
  },
  iconKeluar: {
    backgroundColor: '#fed7d7',
  },
  txIconText: {
    fontSize: 16,
  },
  txKet: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
  },
  txWaktu: {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 2,
  },
  txNominal: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Warna logika (PENTING sesuai requirement)
  warnaMasuk: {
    color: '#276749', // HIJAU untuk pemasukan
  },
  warnaKeluar: {
    color: '#c53030', // MERAH untuk pengeluaran
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    color: '#a0aec0',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 13,
    color: '#cbd5e0',
    marginTop: 4,
  },
});