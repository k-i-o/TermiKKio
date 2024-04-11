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
            output("Opening " + args[0] + "...");
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
            output("Opening Google...");
            window.open('https://www.google.com/search?q=' + args.join('+'), '_blank');
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

Object.defineProperty(Array.prototype, "addToHistory", {
    value: function addToHistory(cmd) {
        cmdsHistory.push(cmd);
        localStorage.setItem('cmdsHistory', JSON.stringify(cmdsHistory));
    },
    writable: true,
    configurable: true,
});

document.addEventListener('DOMContentLoaded', () => {

    username = localStorage.getItem('username') || 'user';
    cmdsHistory = localStorage.getItem('cmdsHistory') || [];
    cmdsHistory = cmdsHistory.length ? JSON.parse(cmdsHistory) : [];

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
