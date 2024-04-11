'use strict';

const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

let cmdsHistory = [];
//- const cmds = ["help", "setusername", "clear", "echo"];
const commands = [
    { 
        command: "help", 
        usage: "help", 
        description: "List all available commands", 
        action: () => {
            output(commands.map((c) => `${escapeHtml(c.usage)} - ${escapeHtml(c.description)}`).join('<br>')) 
        }
    },
    { 
        command: "setusername",
        usage: "setusername <username>", 
        description: "Set username", 
        action: (args) => { 
            localStorage.setItem('username', args[0]); 
            username = args[0]; 
            document.querySelector('#username').innerText = username; 
            output(`Username set to: ${args[0]}`); 
        }
    },
    { 
        command: "clear", 
        usage: "clear", 
        description: "Clear the terminal", 
        action: () => {
            document.querySelector('.outputs').innerHTML = '';
        }
    },
    { 
        command: "echo", 
        usage: "echo <message>", 
        description: "Print message", 
        action: (args) => { 
            output(args.join(' '));
        }
    },
    {
        command: "open",
        usage: "open <url>",
        description: "Open the url in a new tab",
        action: (args) => {
            output(`Opening ${args[0]}...`);
            if (!args[0].startsWith('http')) {
                args[0] = 'http://' + args[0];
            }
            window.open(args[0], '_blank');
        }
    },
    {
        command: "search",
        usage: "search <query>",
        description: "Search the query on Google",
        action: (args) => {
            output(`Searching ${args.join(' ')} on Google...`);
            window.open('https://www.google.com/search?q=' + args.join('+'), '_blank');
        }
    },
    {
        command: "wallpaper",
        usage: "wallpaper <path>",
        description: "Set the wallpaper, provide the path of the image (url or local path)",
        action: (args) => {
            localStorage.setItem('wallpaper', args[0]);
            background().attributes.src.value = args[0];

            const newAccent = `rgb(${increaseSaturation(getDominantColor(background()), 0.6)})`;
            document.documentElement.style.setProperty('--accent', newAccent);

            output(`Wallpaper <a href="${args[0]}">changed</a>`);
        }
    }
];

let suggestedCmds = commands;
let suggestedCmdsIndex = 0;
let searchedCmd = '';
let tmpSearchedCmd = '';
let cmdsHistoryIndex = 0;
let username = 'user';

const context = () => document.querySelector('.context');
const suggestions = () => document.querySelector('.suggested-cmds-list');
const commandsInput = () => document.getElementById('commands');
const background = () => document.querySelector('#bg');

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
  
document.addEventListener('DOMContentLoaded', () => {

    username = localStorage.getItem('username') || 'user';
    cmdsHistory = localStorage.getItem('cmdsHistory') || [];
    cmdsHistory = cmdsHistory.length ? JSON.parse(cmdsHistory) : [];
    background().attributes.src.value = localStorage.getItem('wallpaper') || 'https://source.unsplash.com/random/1920x1080';

    const newAccent = `rgb(${increaseSaturation(getDominantColor(background()), 0.6)})`;
    document.documentElement.style.setProperty('--accent', newAccent);

    cmdsHistoryIndex = cmdsHistory.length;
    
    document.querySelector('#username').innerText = username;
    commandsInput().focus();
});

const previousCmd = () => {
    if (!cmdsHistory.length) return;

    cmdsHistoryIndex = cmdsHistoryIndex <= 0 ? 0 : cmdsHistoryIndex - 1;

    commandsInput().value = cmdsHistory[cmdsHistoryIndex];
}

const nextCmd = () => {
    if (!cmdsHistory.length) return;

    cmdsHistoryIndex = cmdsHistoryIndex >= cmdsHistory.length-1 ? cmdsHistory.length-1 : cmdsHistoryIndex + 1;

    commandsInput().value = cmdsHistory[cmdsHistoryIndex];
}

const output = (msg) => {
    const out = document.querySelector('.outputs');
    out.innerHTML += `
        <div class="cmd-output-wrapper">
            <div class="input"> 
                <div class="terminal-inputs-wrapper"> 
                    <div class="info"><span class="path">~</span><span>$</span></div>
                    <input type="text" value="${commandsInput().value}" disabled>
                </div>
            </div>
            <div class="output">
                <span class="output">${msg}</span>
            </div>
        </div>
    `;

}

const exec = (cmdline) => {
    const [cmd, ...args] = cmdline.split(' ');

    const command = commands.find((c) => c.command === cmd);

    if (command) {
        command.action(args);
    } else {
        output(cmd, `Command not found: ${command.command}`);
    }

    cmdsHistory.addToHistory(cmdline);
    commandsInput().value = '';
}

const reset = () => {
    suggestedCmds = commands;
    suggestedCmdsIndex = 0;
    searchedCmd = '';
    tmpSearchedCmd = '';
    cmdsHistoryIndex = cmdsHistory.length;
}

const loadSuggestions = () => {
    if (!suggestedCmds.length) return;

    document.querySelector('.tips').classList.remove('hide');

    suggestedCmdsIndex = suggestedCmdsIndex > suggestedCmds.length-1 ? 0 : suggestedCmdsIndex;

    commandsInput().value = suggestedCmds[suggestedCmdsIndex].command;
    suggestions().innerHTML = suggestedCmds.map((c) => `<span class="suggested-cmd">${c.command}</span>`).join('');
    suggestions().querySelectorAll('.suggested-cmd')[suggestedCmdsIndex].classList.add('selected');   

    suggestedCmdsIndex = suggestedCmdsIndex >= suggestedCmds.length - 1 ? 0 : suggestedCmdsIndex + 1;
}

commandsInput().addEventListener('keydown', (e) => {
    e = e || window.event;

    switch(e.key) {
    case 'ArrowUp':
        e.preventDefault();

        if (cmdsHistory.length) {
            if (cmdsHistoryIndex == cmdsHistory.length) {
                tmpSearchedCmd = commandsInput().value;
            }
            previousCmd();
        }
        return;
    case 'ArrowDown':
        e.preventDefault();
        if (cmdsHistory.length) {
            if (cmdsHistoryIndex < cmdsHistory.length-1) {
                nextCmd();
            } else if(tmpSearchedCmd != '') {
                commandsInput().value = tmpSearchedCmd;
                cmdsHistoryIndex = cmdsHistoryIndex >= cmdsHistory.length-1 ? cmdsHistory.length-1 : cmdsHistoryIndex + 1;
            }
        }
        return;
    case 'Tab':
        if (searchedCmd == '') {
            searchedCmd = commandsInput().value;
        }
        return;
    case 'Enter':
        if (commandsInput().value.length) {
            exec(commandsInput().value);
            context().scrollBy(0, context().scrollHeight);
            reset();
            document.querySelector('.tips').classList.add('hide');
        }
        return;
    }

    if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

    document.querySelector('.tips').classList.add('hide');
    reset();
    suggestedCmds = commands.filter((c) => c.command.toLowerCase().includes(commandsInput().value.toLowerCase()));

});

document.addEventListener('click', () => {
    commandsInput().focus();
});

document.addEventListener("keydown", (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();

        loadSuggestions();
        commandsInput().focus();
    }
});
