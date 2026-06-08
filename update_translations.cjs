const fs = require('fs');

function updateJson(file, newProps) {
    let data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data.common) data.common = {};
    for (const [k, v] of Object.entries(newProps)) {
        data.common[k] = v;
    }
    fs.writeFileSync(file, JSON.stringify(data, null, 4));
}

updateJson('c:/Users/jazzm/Desktop/SURFING/CODE/SUMMER/src/lib/i18n/en.json', { show_more: "Show More", show_less: "Show Less" });
updateJson('c:/Users/jazzm/Desktop/SURFING/CODE/SUMMER/src/lib/i18n/es.json', { show_more: "Mostrar más", show_less: "Mostrar menos" });
console.log('Translations updated!');
