const express = require('express');
const path = require('path');
const mainRouter = require('./src/routes/mainRouter');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'src/public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({ extended: true }));

app.use('/', mainRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
