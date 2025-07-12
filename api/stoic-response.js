const https = require('https');

module.exports = async (req, res) => {
  console.log('DEBUG: Function invoked');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  res.status(200).json({ message: 'Debug OK', method: req.method, body: req.body });
}; 