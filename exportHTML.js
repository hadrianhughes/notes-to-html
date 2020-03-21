const fs = require('fs');
const path = require('path');
const showdown = require('showdown');

const SRC_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(__dirname, '../html')
const STYLE_FILE = path.resolve(__dirname, 'style.css');

const getFilesNames = () =>
  fs.readdirSync(SRC_DIR)
    .filter(name => /^.*\.md$/.test(name));

const mapToObject = (list, fn) =>
  list
    .reduce((acc, item) => ({
      ...acc,
      [item]: fn(item)
    }), {});

const openFile = fileName => fs.readFileSync(path.resolve(SRC_DIR, fileName), 'utf8');

const pageTemplate = styles => (title, html) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css?family=Merriweather:400,400i,700&display=swap" rel="stylesheet" />
  <style>${styles}</style>
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

const markdownToHTML = (template, converter) => files =>
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
const notes = mapToObject(fileNames, openFile);
const styles = openFile(STYLE_FILE);

const sdConverter = new showdown.Converter({ tables: true });
const converter = markdownToHTML(pageTemplate(styles), sdConverter);
const htmlNotes = converter(notes);

writeFiles(htmlNotes);
