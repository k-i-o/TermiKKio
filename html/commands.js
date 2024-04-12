const commands = [
    { 
        command: "help", 
        usage: "help", 
        aliases: ["h", "?"],
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
        aliases: ["cls"],
        description: "Clear the terminal", 
        action: () => {
            const outputs = document.querySelector('.outputs');
            if(outputs) outputs.innerHTML = '';
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
        aliases: ["o"],
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
        aliases: ["s"],
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
    },
    {
        command: "neofetch",
        usage: "neofetch",
        description: "Display system information",
        action: async (args) => {
            const os = navigator.platform;
            const browser = navigator.appCodeName;
            const version = navigator.appVersion;
            const user = navigator.userAgent;
            const req = await fetch("https://api.ipify.org?format=json");
            const { ip } = await req.json();
            const outputHtml = `
                <style>
                    .neofetch {
                        display: flex;
                    }
                    
                    .neofetch-logo {
                        width: 100px;
                        height: 100px;
                        margin-right: 10px;
                    }

                    .neofetch-info {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: flex-start;
                        gap: 3px;
                    }
                    
                    .neofetch-info-item {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        gap: 10px;
                    }
                </style>

                <div class="neofetch">
                    <div class="neofetch-logo">
                        <span class="logo">_</span>
                        <span class="logo">_</span>
                        <span class="logo">_</span>
                    </div>
                    <div class="neofetch-info">
                        <span>OS: ${os}</span>
                        <span>Browser: ${browser}</span>
                        <span>Version: ${version}</span>
                        <span>User Agent: ${user}</span>
                        <span>User ip: ${ip}</span>
                    </div>
                </div>
            `;
            output(outputHtml);
        }
    }
];