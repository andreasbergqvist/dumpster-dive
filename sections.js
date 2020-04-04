const dumpster = require('./src');

const path = '/Users/spencer/data/wikipedia/enwiki-latest-pages-articles.xml';
// const path = '/Users/spencer/data/wikipedia/simplewiki-latest-pages-articles.xml';

const options = {
  file: path,
  workers: 1,
  log: function(worker, fs) {
    let roots = Object.keys(worker.sections);
    roots.forEach(root => {
      let obj = worker.sections[root];
      let keys = Object.keys(obj);
      keys = keys.sort((a, b) => {
        if (obj[a] > obj[b]) {
          return -1;
        } else if (obj[a] < obj[b]) {
          return 1;
        }
        return 0;
      });
      let total = worker.counts.pages || 1;
      let arr = keys.map(k => [k, (obj[k] / total) * 100]);
      fs.writeFileSync(
        `./results/sections/${root}.json`,
        JSON.stringify(arr.slice(0, 70), null, 2)
      );
    });
    console.log(`\n--${worker.counts.pages}--\n`);
  },
  custom: function(doc, worker) {
    let result = doc.classify();
    result = result || {};
    let category = result.category;
    worker.results[category] = worker.results[category] || 0;
    worker.results[category] += 1;

    // get page titles per root
    if (result.root) {
      worker.sections[result.root] = worker.sections[result.root] || [];
      let sections = doc.sections(); //.filter(obj => obj.title());
      sections.forEach(s => {
        let title = s.title().toLowerCase();
        worker.sections[result.root][title] = worker.sections[result.root][title] || 0;
        worker.sections[result.root][title] += 1;
      });
    }
  }
};

dumpster(options);