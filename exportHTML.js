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

const replaceFileExtension = (fileName, to) => {
  const [name] = fileName.split('.');
  return `${name}.${to}`;
};

const markdownToHTML = converter => files =>
  Object.keys(files)
    .reduce((acc, fileName) => {
      const text = files[fileName];
      const mdName = replaceFileExtension(fileName, 'html');

      return {
        ...acc,
        [mdName]: converter.makeHtml(files[fileName])
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
