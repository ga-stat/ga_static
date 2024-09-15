const fs = require('fs').promises;
const path = require('path');

async function setupJsFileRoutes(app) {
  const scriptsDir = path.join(process.cwd(), 'scripts');
  
  try {
    const files = await fs.readdir(scriptsDir);
    const jsFiles = files.filter(file => path.extname(file) === '.js');

    jsFiles.forEach(file => {
      const route = `/${file}`;
      const filePath = path.join(scriptsDir, file);

      app.get(route, (req, res) => {
        res.sendFile(filePath);
      });

      console.log(`Route set up for: ${route}`);
    });

    return jsFiles.length;
  } catch (error) {
    console.error('Error setting up JS file routes:', error);
    return 0;
  }
}

module.exports = setupJsFileRoutes;
