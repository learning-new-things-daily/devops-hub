const fs = require('fs');
const path = require('path');

// Read the base template
const templatePath = path.join(__dirname, 'template.html');
let template = fs.readFileSync(templatePath, 'utf8');

// Define includes
const parts = {
  loader: fs.readFileSync('includes/loader.html', 'utf8'),
  header: fs.readFileSync('includes/header.html', 'utf8'),
  intro: fs.readFileSync('includes/sections/intro.html', 'utf8'),
  blog: fs.readFileSync('includes/sections/blog.html', 'utf8'),
  scripts: fs.readFileSync('includes/sections/scripts.html', 'utf8'),
  quiz: fs.readFileSync('includes/sections/quiz.html', 'utf8'),
  hire: fs.readFileSync('includes/sections/hire.html', 'utf8'),
  footer: fs.readFileSync('includes/footer.html', 'utf8'),
};

// Replace placeholders like <!--header--> in template.html
for (const [key, value] of Object.entries(parts)) {
  template = template.replace(`<!--${key}-->`, value);
}

// Write output to index.html
fs.writeFileSync('index.html', template);
console.log('✅ index.html generated!');
