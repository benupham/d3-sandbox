const fs = require('fs')

const productsMaster = JSON.parse(fs.readFileSync('./data/working-feature-set.json','utf8'));
const d3productData = JSON.parse(fs.readFileSync('./data/testd3dataNoSalesDept.json','utf8'));

d3ProductData = [];

productsMaster.features.forEach(f => {
  const d = {}
  d.type = f.properties.type;
  d.name = f.properties.name;
  d.value = f.properties.value || 0;
  d.img = f.properties.sampleImg || f.properties.src;
  d.price = f.properties.price;
  d.parent = f.properties.parent || 0;
  d.id = f.id;

  d3ProductData.push(d);
});


fs.writeFile('./data/productSet.json', JSON.stringify(d3ProductData, null, 2), (err) => {if (err) console.log(err); });