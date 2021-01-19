const { engineConnect } = require('./controller');
module.exports = (app) => {
  app.get('/helloworldd', async (req, res) => {
    return res.json(await engineConnect());
  });
};
