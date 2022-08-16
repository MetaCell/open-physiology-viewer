module.exports = {
    launch: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 1000,
        height: 800
      },
      timeout: 120000
    },
  }