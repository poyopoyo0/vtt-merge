const inquirer = require('inquirer');
const inquirerFuzzyPath = require('inquirer-fuzzy-path');
const webvtt = require('node-webvtt');
const fs = require('fs');

inquirer.registerPrompt('inquirer-fuzzy-path', inquirerFuzzyPath);

if (!fs.existsSync('output')) {
  fs.mkdirSync('output');
}

(async () => {
  const vttFilePath = await inquirer.prompt([
    {
      type: 'inquirer-fuzzy-path',
      name: 'vttFilePathFirst',
      itemType: 'file',
      excludePath: (nodePath) => nodePath.match(/^(\.git|node_modules)/),
      loop: false,
      message: 'First vtt file path.',
    },
    {
      type: 'inquirer-fuzzy-path',
      name: 'vttFilePathSecond',
      itemType: 'file',
      excludePath: (nodePath) => nodePath.match(/^(\.git|node_modules)/),
      loop: false,
      message: 'Second vtt file path.',
    },
    {
      type: 'inquirer-fuzzy-path',
      name: 'mergedVttFilePath',
      itemType: 'directory',
      excludePath: (nodePath) => nodePath.match(/^(\.git|node_modules)/),
      default: 'output',
      loop: false,
      message: 'Merged vtt file path.',
    },
  ]);

  const parsedVttFirst = webvtt.parse(fs.readFileSync(vttFilePath.vttFilePathFirst, 'utf-8'));
  const parsedVttSecond = webvtt.parse(fs.readFileSync(vttFilePath.vttFilePathSecond, 'utf-8'));

  const cuesArray = [parsedVttFirst.cues, parsedVttSecond.cues].flat();
  cuesArray.sort((a, b) => {
    // Sort 'start' in ascending order.
    if (a.start > b.start) {
      return 1;
    }
    if (a.start < b.start) {
      return -1;
    }

    // Sort 'end' in ascending order.
    if (a.end > b.end) {
      return 1;
    }
    if (a.end < b.end) {
      return -1;
    }

    return 0;
  });

  const mergedVtt = webvtt.compile({
    cues: cuesArray,
    valid: true,
  });

  fs.writeFile(`${vttFilePath.mergedVttFilePath}/mergedVtt.vtt`, mergedVtt, (err, data) => {
    if (err) console.log(err);
    console.log(
      `\nMerged vtt file was generated as ${vttFilePath.mergedVttFilePath}/mergedVtt.vtt.\n`
    );
  });
})();
