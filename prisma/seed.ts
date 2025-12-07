import { PrismaClient, Gender } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('seeding');

  // clear data
  await prisma.sIM.deleteMany();
  await prisma.pemilik.deleteMany();

  // data dummy
  const pemilikData = [
    {
      nama: 'Budi Santoso',
      nik: '3174051990010001',
      alamat: 'Jl. Sudirman No. 123, Jakarta',
      tanggal_lahir: new Date('1990-01-15'),
      tempat_lahir: 'Jakarta',
      gender: Gender.LAKI,
      pekerjaan: 'Karyawan Swasta',
      tinggi: 170,
    },
    {
      nama: 'Siti Nurhaliza',
      nik: '3174052005020002',
      alamat: 'Jl. Gatot Subroto No. 45, Jakarta',
      tanggal_lahir: new Date('2005-02-20'),
      tempat_lahir: 'Bandung',
      gender: Gender.PEREMPUAN,
      pekerjaan: 'Mahasiswa',
      tinggi: 165,
    },
    {
      nama: 'Ahmad Dhani',
      nik: '3174051985030003',
      alamat: 'Jl. Thamrin No. 78, Jakarta',
      tanggal_lahir: new Date('1985-03-10'),
      tempat_lahir: 'Surabaya',
      gender: Gender.LAKI,
      pekerjaan: 'Wiraswasta',
      tinggi: 175,
    },
    {
      nama: 'Dewi Lestari',
      nik: '3174051992040004',
      alamat: 'Jl. Rasuna Said No. 56, Jakarta',
      tanggal_lahir: new Date('1992-04-25'),
      tempat_lahir: 'Yogyakarta',
      gender: Gender.PEREMPUAN,
      pekerjaan: 'Guru',
      tinggi: 160,
    },
    {
      nama: 'Rudi Hartono',
      nik: '3174051988050005',
      alamat: 'Jl. HR Rasuna Said No. 12, Jakarta',
      tanggal_lahir: new Date('1988-05-12'),
      tempat_lahir: 'Semarang',
      gender: Gender.LAKI,
      pekerjaan: 'PNS',
      tinggi: 172,
    },
  ];

  // Buat pemilik dengan SIM
  for (let i = 0; i < pemilikData.length; i++) {
    const pemilik = await prisma.pemilik.create({
      data: {
        ...pemilikData[i],
        sims: {
          create: [
            {
              nama: pemilikData[i].nama,
              tempatLahir: pemilikData[i].tempat_lahir,
              tanggal_lahir: pemilikData[i].tanggal_lahir,
              gender: pemilikData[i].gender,
              tinggi: pemilikData[i].tinggi || 170,
              pekerjaan: pemilikData[i].pekerjaan || 'Lainnya',
              noSim: `SIM-${String(i + 1).padStart(6, '0')}`,
              berlakuSd: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 tahun dari sekarang
              foto: null,
            },
            // Tambahkan SIM kedua untuk beberapa pemilik
            ...(i % 2 === 0
              ? [
                  {
                    nama: pemilikData[i].nama,
                    tempatLahir: pemilikData[i].tempat_lahir,
                    tanggal_lahir: pemilikData[i].tanggal_lahir,
                    gender: pemilikData[i].gender,
                    tinggi: pemilikData[i].tinggi || 170,
                    pekerjaan: pemilikData[i].pekerjaan || 'Lainnya',
                    noSim: `SIM-${String(i + 100).padStart(6, '0')}`,
                    berlakuSd: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 tahun
                    foto: null,
                  },
                ]
              : []),
          ],
        },
      },
    });

    console.log(`Created pemilik: ${pemilik.nama}`);
  }

  const additionalPemilik = [
    {
      nama: 'Andi Wijaya',
      nik: '3174051995060006',
      alamat: 'Jl. Kebon Sirih No. 34, Jakarta',
      tanggal_lahir: new Date('1995-06-18'),
      tempat_lahir: 'Medan',
      gender: Gender.LAKI,
      pekerjaan: 'Dokter',
      tinggi: 178,
    },
    {
      nama: 'Lisa Blackpink',
      nik: '3174051998070007',
      alamat: 'Jl. Senopati No. 89, Jakarta',
      tanggal_lahir: new Date('1998-07-22'),
      tempat_lahir: 'Solo',
      gender: Gender.PEREMPUAN,
      pekerjaan: 'Entertainer',
      tinggi: 168,
    },
    {
      nama: 'Joko Widodo',
      nik: '3174051987080008',
      alamat: 'Jl. Kemang Raya No. 67, Jakarta',
      tanggal_lahir: new Date('1987-08-30'),
      tempat_lahir: 'Palembang',
      gender: Gender.LAKI,
      pekerjaan: 'Pengusaha',
      tinggi: 173,
    },
    {
      nama: 'Rina Nose',
      nik: '3174051993090009',
      alamat: 'Jl. Pondok Indah No. 23, Jakarta',
      tanggal_lahir: new Date('1993-09-14'),
      tempat_lahir: 'Bekasi',
      gender: Gender.PEREMPUAN,
      pekerjaan: 'Komedian',
      tinggi: 162,
    },
    {
      nama: 'Bambang Pamungkas',
      nik: '3174051991100010',
      alamat: 'Jl. Cipete Raya No. 45, Jakarta',
      tanggal_lahir: new Date('1991-10-05'),
      tempat_lahir: 'Jakarta',
      gender: Gender.LAKI,
      pekerjaan: 'Atlet',
      tinggi: 176,
    },
  ];

  for (let i = 0; i < additionalPemilik.length; i++) {
    const pemilik = await prisma.pemilik.create({
      data: {
        ...additionalPemilik[i],
        sims: {
          create: [
            {
              nama: additionalPemilik[i].nama,
              tempatLahir: additionalPemilik[i].tempat_lahir,
              tanggal_lahir: additionalPemilik[i].tanggal_lahir,
              gender: additionalPemilik[i].gender,
              tinggi: additionalPemilik[i].tinggi || 170,
              pekerjaan: additionalPemilik[i].pekerjaan || 'Lainnya',
              noSim: `SIM-${String(i + 200).padStart(6, '0')}`,
              berlakuSd: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000),
              foto: null,
            },
            {
              nama: additionalPemilik[i].nama,
              tempatLahir: additionalPemilik[i].tempat_lahir,
              tanggal_lahir: additionalPemilik[i].tanggal_lahir,
              gender: additionalPemilik[i].gender,
              tinggi: additionalPemilik[i].tinggi || 170,
              pekerjaan: additionalPemilik[i].pekerjaan || 'Lainnya',
              noSim: `SIM-${String(i + 300).padStart(6, '0')}`,
              berlakuSd: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
              foto: null,
            },
          ],
        },
      },
    });

    console.log(`Created pemilik: ${pemilik.nama}`);
  }

  const totalPemilik = await prisma.pemilik.count();
  const totalSIM = await prisma.sIM.count();

  console.log(`\n🎉 Seeding completed!`);
  console.log(`Total Pemilik: ${totalPemilik}`);
  console.log(`Total SIM: ${totalSIM}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });