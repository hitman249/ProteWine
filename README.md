# ProteWine

<img src="icons/512.png" width="128">

[Donate](https://boosty.to/protewine/donate) | [Boosty](https://boosty.to/protewine) |  [Discord](https://discord.gg/X3S5xR46zm) |  [Telegram](https://t.me/protewine)  

Easy porting of Windows applications using Wine and Proton technologies to Linux systems and Steam Deck.

https://github.com/hitman249/ProteWine/assets/1325326/066bb40c-5192-4c03-b5c6-2c87eb366c22


## Requirments

1) Installed **Steam** client.
2) **SteamLinuxRuntime Sniper** must be installed inside the **Steam** client.  
   Manual installation command `steam steam://install/1628350`
3) Linux x86_64 arch.
4) All games must be installed in the `C:/Games` folder.

## Installation
1) Download [start](https://github.com/hitman249/ProteWine/releases/latest/download/start) file.
2) Create an empty directory and move the downloaded file there.
3) Run the file with the command: `chmod +x ./start && ./start`

### Quick command:
```bash
curl -L https://github.com/hitman249/ProteWine/releases/latest/download/start --output start; chmod +x ./start; ./start
```

### Troubleshooting

1) When this error occurs:
```
pressure-vessel-wrap[278991]: E: Child process exited with code 1: bwrap: setting up uid map: Permission denied
```

Run the command:
```bash
sudo chmod u+s /usr/bin/bwrap
```

### Environment

Env paths: `data/configs/games/*/.env`  

Example:  
```dotenv
WINE_FULLSCREEN_INTEGER_SCALING=1
PROTON_USE_WINED3D=0
```

# For developers

### Debugging
```bash
./start debug
```

### Building the project
```bash
yarn run client-build && yarn run server-build && yarn run electron-builder
```
