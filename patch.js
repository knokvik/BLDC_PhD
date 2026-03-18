const fs = require('fs');

const file = 'motor-frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("const BACKEND_URL = 'http://localhost:5005';", "const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5005';");

fs.writeFileSync(file, content);
