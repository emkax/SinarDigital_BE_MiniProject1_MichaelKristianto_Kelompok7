const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { PrismaClient, Gender } = require('../src/generated/prisma');

const router = express.Router();
const prisma = new PrismaClient();

// multer upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// helper function untuk delete file
function deleteFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// ==================== ROUTES ====================

// GET: Halaman form utama
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// GET: Halaman list SIM dengan pagination
router.get('/saved', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [sims, total] = await Promise.all([
      prisma.sIM.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          pemilik: true
        }
      }),
      prisma.sIM.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render('saved', { 
      cards: sims,
      currentPage: page,
      totalPages,
      total
    });
  } catch (error) {
    console.error('Error fetching SIM:', error);
    res.status(500).send('Error loading data');
  }
});

// POST: Create - Tambah SIM baru
router.post('/submit-sim', upload.single('foto'), async (req, res) => {
  try {
    const {
      nama,
      nik,
      alamat,
      tempat_lahir,
      tanggal_lahir,
      gender,
      tinggi,
      pekerjaan,
      no_sim,
      berlaku_sd
    } = req.body;

    // Validasi input
    if (!nama || !nik || !tempat_lahir || !tanggal_lahir || !gender || !tinggi || !pekerjaan || !no_sim) {
      return res.status(400).send('Semua field wajib diisi!');
    }

    // Cek atau buat pemilik
    let pemilik = await prisma.pemilik.findUnique({
      where: { nik }
    });

    if (!pemilik) {
      pemilik = await prisma.pemilik.create({
        data: {
          nama,
          nik,
          alamat: alamat || null,
          tanggal_lahir: new Date(tanggal_lahir),
          tempat_lahir,
          gender: gender.toUpperCase() === 'LAKI-LAKI' ? Gender.LAKI : Gender.PEREMPUAN,
          pekerjaan,
          tinggi: parseInt(tinggi)
        }
      });
    }

    // Buat SIM baru
    const newSIM = await prisma.sIM.create({
      data: {
        nama,
        tempatLahir: tempat_lahir,
        tanggal_lahir: new Date(tanggal_lahir),
        gender: gender.toUpperCase() === 'LAKI-LAKI' ? Gender.LAKI : Gender.PEREMPUAN,
        tinggi: parseInt(tinggi),
        pekerjaan,
        noSim: no_sim,
        berlakuSd: berlaku_sd ? new Date(berlaku_sd) : null,
        foto: req.file ? `/uploads/${req.file.filename}` : null,
        pemilikId: pemilik.id
      }
    });

    res.redirect('/sim/saved');
  } catch (error) {
    console.error('Error creating SIM:', error);
    
    //Hapus file jika ada error
    if (req.file) {
      deleteFile(path.join(__dirname, '../uploads', req.file.filename));
    }
    
    res.status(500).send('Error creating SIM: ' + error.message);
  }
});

// GET: Halaman edit SIM
router.get('/edit/:id', async (req, res) => {
  try {
    const sim = await prisma.sIM.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { pemilik: true }
    });

    if (!sim) {
      return res.status(404).send('SIM tidak ditemukan');
    }

    res.render('edit', { sim });
  } catch (error) {
    console.error('Error fetching SIM:', error);
    res.status(500).send('Error loading SIM');
  }
});

// POST: Update - Ubah data SIM
router.post('/update/:id', upload.single('foto'), async (req, res) => {
  try {
    const simId = parseInt(req.params.id);
    const {
      nama,
      tempat_lahir,
      tanggal_lahir,
      gender,
      tinggi,
      pekerjaan,
      no_sim,
      berlaku_sd,
      keep_foto
    } = req.body;

    // Cari SIM yang ada
    const existingSIM = await prisma.sIM.findUnique({
      where: { id: simId }
    });

    if (!existingSIM) {
      if (req.file) {
        deleteFile(path.join(__dirname, '../uploads', req.file.filename));
      }
      return res.status(404).send('SIM tidak ditemukan');
    }

    // Handle foto
    let fotoPath = existingSIM.foto;
    
    if (req.file) {
      // Hapus foto lama jika ada
      if (existingSIM.foto) {
        const oldPhotoPath = path.join(__dirname, '..', existingSIM.foto);
        deleteFile(oldPhotoPath);
      }
      fotoPath = `/uploads/${req.file.filename}`;
    } else if (keep_foto !== 'true' && existingSIM.foto) {
      // Hapus foto jika user tidak ingin keep
      const oldPhotoPath = path.join(__dirname, '..', existingSIM.foto);
      deleteFile(oldPhotoPath);
      fotoPath = null;
    }

    // Update SIM
    await prisma.sIM.update({
      where: { id: simId },
      data: {
        nama,
        tempatLahir: tempat_lahir,
        tanggal_lahir: new Date(tanggal_lahir),
        gender: gender.toUpperCase() === 'LAKI-LAKI' ? Gender.LAKI : Gender.PEREMPUAN,
        tinggi: parseInt(tinggi),
        pekerjaan,
        noSim: no_sim,
        berlakuSd: berlaku_sd ? new Date(berlaku_sd) : null,
        foto: fotoPath
      }
    });

    res.redirect('/sim/saved');
  } catch (error) {
    console.error('Error updating SIM:', error);
    
    if (req.file) {
      deleteFile(path.join(__dirname, '../uploads', req.file.filename));
    }
    
    res.status(500).send('Error updating SIM: ' + error.message);
  }
});

// POST: Delete - Hapus SIM
router.post('/delete/:id', async (req, res) => {
  try {
    const simId = parseInt(req.params.id);

    // Cari SIM yang akan dihapus
    const sim = await prisma.sIM.findUnique({
      where: { id: simId }
    });

    if (!sim) {
      return res.status(404).send('SIM tidak ditemukan');
    }

    // Hapus foto jika ada
    if (sim.foto) {
      const photoPath = path.join(__dirname, '..', sim.foto);
      deleteFile(photoPath);
    }

    // Hapus dari database
    await prisma.sIM.delete({
      where: { id: simId }
    });

    res.redirect('/sim/saved');
  } catch (error) {
    console.error('Error deleting SIM:', error);
    res.status(500).send('Error deleting SIM: ' + error.message);
  }
});

// GET: Detail SIM
router.get('/detail/:id', async (req, res) => {
  try {
    const sim = await prisma.sIM.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { pemilik: true }
    });

    if (!sim) {
      return res.status(404).send('SIM tidak ditemukan');
    }

    res.render('detail', { sim });
  } catch (error) {
    console.error('Error fetching SIM:', error);
    res.status(500).send('Error loading SIM');
  }
});

// POST: Delete foto only
router.post('/delete-foto/:id', async (req, res) => {
  try {
    const simId = parseInt(req.params.id);

    const sim = await prisma.sIM.findUnique({
      where: { id: simId }
    });

    if (!sim) {
      return res.status(404).json({ error: 'SIM tidak ditemukan' });
    }

    if (sim.foto) {
      const photoPath = path.join(__dirname, '..', sim.foto);
      deleteFile(photoPath);

      await prisma.sIM.update({
        where: { id: simId },
        data: { foto: null }
      });
    }

    res.json({ success: true, message: 'Foto berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting foto:', error);
    res.status(500).json({ error: 'Error deleting foto' });
  }
});

module.exports = router;