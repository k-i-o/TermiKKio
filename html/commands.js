let commands = [
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
            window.open('https://www.google.com/search?q=' + encodeURIComponent(args.join(' ')), '_blank');
        }
    }, 
    {
        command: "wallpaper",
        usage: "wallpaper <path>",
        description: "Set the wallpaper, provide the path of the image (url or local path) use -r to remove the wallpaper eg. wallpaper -r",//, use -s to save the wallpaper eg. wallpaper -s <name>",
        action: (args) => {
            if (args[0] === '-r') {
                localStorage.removeItem('wallpaper');
                background().attributes.src.value = 'https://source.unsplash.com/random/1920x1080';
                document.documentElement.style.setProperty('--accent', getDominantColor(background()));
                output(`Wallpaper <a href="https://source.unsplash.com/random/1920x1080">removed</a>`);
                return;
            }

            // if (args[0] === '-s') {
                    
            //     if (!args.length) {
            //         output(`Please provide a name for the wallpaper`);
            //         return;
            //     }

            //     let wallpapers = localStorage.getItem('wallpapers');
            //     if (wallpapers) {
            //         wallpapers = JSON.parse(wallpapers);

            //         if(wallpapers.find((w) => w.name === args[1])) {
            //             output(`Wallpaper's name already in use, please choose another name`);
            //             return;
            //         }

            //         let existingWallpaper = wallpapers.find((w) => w.url === background().attributes.src.value);

            //         if(existingWallpaper) {
            //             output(`Wallpaper already exists with name <u>${existingWallpaper.name}</u>`);
            //             return;
            //         }

            //         wallpapers.push({name: args[1], url: background().attributes.src.value});
                    
            //         localStorage.setItem('wallpapers', JSON.stringify(wallpapers));
            //         output(`Wallpaper saved with name ${args[1]}`);
            //     } else {
            //         localStorage.setItem('wallpapers', JSON.stringify([{name: args[1], url: background().attributes.src.value}]));
            //         output(`Wallpaper saved with name ${args[1]}`);
            //     }

            //     return;
            // }

            localStorage.setItem('wallpaper', args[0]);
            background().attributes.src.value = args[0];

            const newAccent = `rgb(${increaseSaturation(getDominantColor(background()), 0.6)})`;
            document.documentElement.style.setProperty('--accent', newAccent);

            output(`Wallpaper <a href="${args[0]}">changed</a>`);
        }
    },
    {
        enabled: false,
        command: "wallpapers",
        usage: "See all saved wallpapers",
        description: "Save the current wallpaper",
        action: () => {
            const wallpapers = Object.keys(localStorage).filter((key) => key.startsWith('wallpaper-'));
            if (!wallpapers.length) {
                output(`No wallpapers saved`);
                return;
            }

            output(wallpapers.map((w) => `<a href="${localStorage.getItem(w)}">${w}</a>`).join('<br>'));
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