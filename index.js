const webvtt = require('node-webvtt');
const fs = require('fs');

const parsedVttFirst = webvtt.parse(fs.readFileSync(process.argv[2], 'utf-8'));
const parsedVttSecond = webvtt.parse(fs.readFileSync(process.argv[3], 'utf-8'));

const cuesArray = [parsedVttFirst.cues, parsedVttSecond.cues].flat();
cuesArray.sort((a, b) => {
  // startを昇順にソート
  if (a.start > b.start) {
    return 1;
  }
  if (a.start < b.start) {
    return -1;
  }

  // endを昇順にソート
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

if (!fs.existsSync('output')) {
  fs.mkdirSync('output');
}

fs.writeFileSync('./output/mergedVtt.vtt', mergedVtt, (err, data) => {
  if (err) console.log(err);
});
