const fs = require('fs');
const path = require('path');
const showdown = require('showdown');

const SRC_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(__dirname, '../html')

const getFilesNames = () =>
  fs.readdirSync(SRC_DIR)
    .filter(name => /^.*\.md$/.test(name));

const openFiles = files =>
  files
    .reduce((acc, file) => ({
      ...acc,
      [file]: fs.readFileSync(path.resolve(SRC_DIR, file), 'utf8')
    }), {});

const template = (title, html) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css" />
  <link href="https://fonts.googleapis.com/css?family=Merriweather:400,400i,700&display=swap" rel="stylesheet" />
</head>
<body>
  ${html}
</body>
</html>
`;

const getNameWithoutExtension = fileName => {
  const [name] = fileName.split('.');
  return name;
};

const markdownToHTML = converter => files =>
  Object.keys(files)
    .reduce((acc, fileName) => {
      const text = files[fileName];
      const name = getNameWithoutExtension(fileName);
      const html = converter.makeHtml(text);

      return {
        ...acc,
        [name + '.html']: template(name, html)
      };
    }, {});

const writeFiles = files =>
  Object.keys(files)
    .forEach(fileName => {
      fs.writeFileSync(path.resolve(OUT_DIR, fileName), files[fileName], 'utf8');
    });


const fileNames = getFilesNames();
const notes = openFiles(fileNames);

const sdConverter = new showdown.Converter();
const converter = markdownToHTML(sdConverter);
const htmlNotes = converter(notes);

writeFiles(htmlNotes);
