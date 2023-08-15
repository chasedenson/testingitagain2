const express = require('express');
const app = express();
const dotenv = require('dotenv');

app.use(express.static('public'));

dotenv.config({path: '.env'});

// Serve CSS file
// Handle requests for the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/assets/web/assets/mobirise-icons2/mobirise2.css', (req, res) => {
  res.sendFile(__dirname + '/assets/web/assets/mobirise-icons2/mobirise2.css');
});

app.get('/assets/web/assets/mobirise-icons/mobirise-icons.css', (req, res) => {
  res.sendFile(__dirname + '/assets/web/assets/mobirise-icons/mobirise-icons.css');
});

app.get('/assets/bootstrap/css/bootstrap.min.css', (req, res) => {
  res.sendFile(__dirname + '/assets/bootstrap/css/bootstrap.min.css');
});

app.get('/assets/bootstrap/css/bootstrap-grid.min.css', (req, res) => {
  res.sendFile(__dirname + '/assets/bootstrap/css/bootstrap-grid.min.css');
});

app.get('/assets/bootstrap/css/bootstrap-reboot.min.css', (req, res) => {
  res.sendFile(__dirname + '/assets/bootstrap/css/bootstrap-reboot.min.css');
});

app.get('/assets/popup-overlay-plugin/style.css', (req, res) => {
  res.sendFile(__dirname + '/assets/popup-overlay-plugin/style.css');
});

app.get('/assets/socicon/css/styles.css', (req, res) => {
  res.sendFile(__dirname + '/assets/socicon/css/styles.css');
});

app.get('/assets/theme/css/style.css', (req, res) => {
  res.sendFile(__dirname + '/assets/dropdown/css/style.css');
});

app.get('/assets/theme/css/style.css', (req, res) => {
  res.sendFile(__dirname + '/assets/theme/css/style.css');
});

app.get('/assets/recaptcha.css', (req, res) => {
  res.sendFile(__dirname + '/assets/recaptcha.css');
});

// Serve CSS files as static files
app.use('/assets', express.static(__dirname + '/assets'));

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});