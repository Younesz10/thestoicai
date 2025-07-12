const https = require('https');

module.exports = async (req, res) => {
  try {
    console.log('Function started');
    res.status(200).json({ message: 'Function ran, logging works.' });
  } catch (error) {
    console.error('Function crashed:', error);
    res.status(500).json({ error: 'Function crashed', details: error.message });
  }
}; 