# ProteWine

Easy porting of Windows applications using Wine and Proton technologies to Linux systems and Steam Deck.

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

# For developers

### Debugging
```bash
./start debug
```

### Building the project
```bash
yarn run client-build && yarn run server-build && yarn run electron-builder
```