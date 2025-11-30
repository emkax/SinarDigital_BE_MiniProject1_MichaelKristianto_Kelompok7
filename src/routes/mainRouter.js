const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});

const upload = multer({ storage });

const DATA_FILE = path.join(__dirname, '../../data/cards.json');

function loadCards() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const json = fs.readFileSync(DATA_FILE);
  return JSON.parse(json);
}

function saveCards(cards) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(cards, null, 2));
}

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.post('/submit-sim', upload.single('foto'), (req, res) => {
  const {
    nama,
    tempat_lahir,
    tanggal_lahir,
    gender,
    tinggi,
    pekerjaan,
    no_sim,
    berlaku_sd
  } = req.body;

  const cards = loadCards();

  const newCard = {
    id: Date.now(),
    nama,
    tempat_lahir,
    tanggal_lahir,
    gender,
    tinggi,
    pekerjaan,
    no_sim,
    berlaku_sd,
    foto: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString()
  };

  cards.push(newCard);
  saveCards(cards);

  res.redirect('/saved');
});

router.get('/saved', (req, res) => {
  const cards = loadCards();
  res.render('saved', { cards });
});

module.exports = router;
