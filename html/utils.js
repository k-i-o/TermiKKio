
Object.defineProperty(Array.prototype, "addToHistory", {
    value: function addToHistory(cmd) {
        cmdsHistory.push(cmd);
        localStorage.setItem('cmdsHistory', JSON.stringify(cmdsHistory));
    },
    writable: true,
    configurable: true,
});

function getDominantColor(imageObject) {
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1;
    canvas.height = 1;

    ctx.drawImage(imageObject, 0, 0, 1, 1);

    const i = ctx.getImageData(0, 0, 1, 1).data;

    return [i[0], i[1], i[2]];
}  

function increaseSaturation(rgb, sat) {
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
    
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    
    let l = (max + min) / 2;
    
    let sat_l = (max - min) / (1 - Math.abs(2 * l - 1));
    
    let new_sat_l = sat_l + sat;
    new_sat_l = Math.min(Math.max(new_sat_l, 0), 1);
    
    let c = (1 - Math.abs(2 * l - 1)) * new_sat_l;
    let h = 0;
    if (max === r) {
      h = 60 * (((g - b) / (max - min)) % 6);
    } else if (max === g) {
      h = 60 * (((b - r) / (max - min)) + 2);
    } else {
      h = 60 * (((r - g) / (max - min)) + 4);
    }
    
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    
    let new_r, new_g, new_b;
    
    if (0 <= h && h < 60) {
      new_r = c;
      new_g = x;
      new_b = 0;
    } else if (60 <= h && h < 120) {
      new_r = x;
      new_g = c;
      new_b = 0;
    } else if (120 <= h && h < 180) {
      new_r = 0;
      new_g = c;
      new_b = x;
    } else if (180 <= h && h < 240) {
      new_r = 0;
      new_g = x;
      new_b = c;
    } else if (240 <= h && h < 300) {
      new_r = x;
      new_g = 0;
      new_b = c;
    } else {
      new_r = c;
      new_g = 0;
      new_b = x;
    }
    
    new_r = Math.round((new_r + m) * 255);
    new_g = Math.round((new_g + m) * 255);
    new_b = Math.round((new_b + m) * 255);
    
    return [new_r, new_g, new_b];
}

const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

const getCost = (string, string1, caseSensitive = false) => {
    // Levenshtein distance
    if (!caseSensitive) {
        string = string.toLowerCase();
        string1 = string1.toLowerCase();
    }
    const a = string;
    const b = string1;
    const costs = new Array(b.length + 1);
    for (let j = 0; j < costs.length; j++) {
        costs[j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        costs[0] = i;
        let nw = i - 1;
        for (let j = 1; j <= b.length; j++) {
            let cj = Math.min(1 + Math.min(costs[j], costs[j - 1]), a[i - 1] === b[j - 1] ? nw : nw + 1);
            nw = costs[j];
            costs[j] = cj;
        }
    }

    return costs[b.length];
}