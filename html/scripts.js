'use strict';

let cmdsHistory = [];

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

const startCommands = ["neofetch", "echo welcome!"];
  
commands = commands.filter((c) => c.enabled != false);

document.addEventListener('DOMContentLoaded', async () => {

    username = localStorage.getItem('username') || 'user';
    cmdsHistory = localStorage.getItem('cmdsHistory') || [];
    cmdsHistory = cmdsHistory.length ? JSON.parse(cmdsHistory) : [];
    background().attributes.src.value = localStorage.getItem('wallpaper') || 'https://source.unsplash.com/random/1920x1080';

    const newAccent = `rgb(${increaseSaturation(getDominantColor(background()), 0.6)})`;
    document.documentElement.style.setProperty('--accent', newAccent);

    cmdsHistoryIndex = cmdsHistory.length;
    
    document.querySelector('#username').innerText = username;
    commandsInput().focus();
    getcommands();

    for(let cmd of startCommands) {
        await exec(cmd);
    }
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

const output = (msg) => { // should be changed
    const out = document.querySelector('.outputs');

    const outHtml = `
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

    if (out === null) {
        const input = document.querySelector('.context .input').outerHTML;
        document.querySelector('.context').innerHTML = `<div class="outputs">${outHtml}</div>${input}`;
        getcommands();
        commandsInput().focus();
    } else {
        out.innerHTML += outHtml;
    }

    context().scrollBy(0, context().scrollHeight);

}

const exec = (cmdline) => {
    return new Promise(async (resolve, reject) => {
        const [cmd, ...args] = cmdline.split(' ');

        const command = commands.find((c) => c && (c.command === cmd || (c.aliases && c.aliases.includes(cmd))));

        if (command) {
            if (command.action instanceof Function) {
                if (command.action.constructor.name === "AsyncFunction") {
                    await command.action(args);
                } else {
                    command.action(args); 
                }
            }
        } else {
            output(`Command not found: ${cmd}`);
        }

        resolve();
    });	
}

const execFromCLI = async (cmdline) => {

    exec(cmdline);

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

const getcommands = () => commandsInput().addEventListener('keydown', async (e) => {
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
            await execFromCLI(commandsInput().value);
        } else {
            output('');
        }

        reset();
        document.querySelector('.tips').classList.add('hide');
        
        return;
    }

    if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

    document.querySelector('.tips').classList.add('hide');
    reset();
    suggestedCmds = commands.filter((c) => getCost(c.command, commandsInput().value) < 3 || c.command.includes(commandsInput().value));

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

    context().scrollBy(0, context().scrollHeight);
});
