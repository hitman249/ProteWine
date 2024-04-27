<script lang="ts">
  import {onDestroy, onMount, tick} from 'svelte';
  import {StickerType} from '../stickers';
  import List from '../../components/list/List.svelte';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import {PopupNames} from '../../modules/popup';
  import FormData, {GameOperation} from '../../models/form-data';
  import type {MenuItem} from '../../modules/menu';
  import Loader from '../Loader.svelte';

  let list: List;
  const data: FormData<MenuItem> = window.$app.getPopup().getData();
  let loading: boolean = true;

  const mock: string[] = `[Wine Launcher] Run command:
 sh -c "export VK_LAYER_PATH=\\"$VK_LAYER_PATH:/home/neiron/work/wine-launcher/data/cache/implicit_layer.d\\" XDG_CACHE_HOME=\\"/home/neiron/work/wine-launcher/data/cache\\" WINE=\\"/home/neiron/work/wine-launcher/wine/bin/wine\\" WINE64=\\"/home/neiron/work/wine-launcher/wine/bin/wine64\\" WINEPREFIX=\\"/home/neiron/work/wine-launcher/prefix\\" WINESERVER=\\"/home/neiron/work/wine-launcher/wine/bin/wineserver\\" WINEARCH=\\"win64\\" WINEDEBUG=\\"\\" WINESTART=\\"C:\\\\windows\\\\command\\\\start.exe\\" WINEDLLOVERRIDES=\\"mscoree=;mshtml=;winemenubuilder.exe=d;winegstreamer=\\" SteamAppId=\\"\\" SteamGameId=\\"\\" STEAM_COMPAT_CLIENT_INSTALL_PATH=\\"/home/neiron/work/wine-launcher/prefix\\" STEAM_COMPAT_DATA_PATH=\\"/home/neiron/work/wine-launcher/prefix\\" WINEDLLPATH=\\"/home/neiron/work/wine-launcher/wine/lib:/home/neiron/work/wine-launcher/wine/lib/wine:/home/neiron/work/wine-launcher/wine/lib/wine/x86_64-unix:/home/neiron/work/wine-launcher/wine/lib32:/home/neiron/work/wine-launcher/wine/lib32/wine:/home/neiron/work/wine-launcher/wine/lib32/wine/i386-unix\\" LC_ALL=\\"ru_RU.UTF-8\\" WINEESYNC=\\"1\\" WINEFSYNC=\\"1\\" STAGING_SHARED_MEMORY=\\"1\\" WINE_LARGE_ADDRESS_AWARE=\\"1\\" vblank_mode=\\"0\\" mesa_glthread=\\"true\\" && cd \\"/home/neiron/work/wine-launcher\\" && cd \\"/home/neiron/work/wine-launcher/prefix/drive_c/Games/test\\" &&  \\"/home/neiron/work/wine-launcher/wine/bin/wine\\"  \\"unrealtournament.exe\\" "

esync: up and running.
002c:fixme:winediag:LdrInitializeThunk Wine TkG (staging) 7.20 is a testing version containing experimental patches.
002c:fixme:winediag:LdrInitializeThunk Please don't report bugs about it on winehq.org and use https://github.com/Frogging-Family/wine-tkg-git/issues instead.
002c:err:wineboot:process_run_key Error running cmd L"C:\\\\windows\\\\system32\\\\winemenubuilder.exe -a -r" (2).
0050:err:winedevice:ServiceMain Failed to load L"C:\\\\windows\\\\system32\\\\win32k.sys"
0050:err:winedevice:ServiceMain Failed to load L"C:\\\\windows\\\\system32\\\\drivers\\\\dxgkrnl.sys"
0050:err:winedevice:ServiceMain Failed to load L"C:\\\\windows\\\\system32\\\\drivers\\\\dxgmms1.sys"
0074:err:winedevice:ServiceMain Failed to load L"C:\\\\windows\\\\system32\\\\win32k.sys"
0074:err:winedevice:ServiceMain Failed to load L"C:\\\\windows\\\\system32\\\\drivers\\\\dxgkrnl.sys"
0074:err:winedevice:ServiceMain Failed to load L"C:\\\\windows\\\\system32\\\\drivers\\\\dxgmms1.sys"
007c:fixme:hid:handle_IRP_MN_QUERY_ID Unhandled type 00000005
007c:err:plugplay:enumerate_new_device Unable to install a function driver for device L"WINEBUS\\\\VID_845E&PID_0001\\\\0&0000&0&0".
007c:fixme:hid:handle_IRP_MN_QUERY_ID Unhandled type 00000005
007c:err:plugplay:enumerate_new_device Unable to install a function driver for device L"WINEBUS\\\\VID_845E&PID_0002\\\\0&0000&0&0".
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
0084:fixme:wineusb:add_usb_device Interface 1 has 5 alternate settings; using the first one.
0084:fixme:wineusb:add_usb_device Interface 3 has 12 alternate settings; using the first one.
0084:fixme:wineusb:add_usb_device Interface 1 has 6 alternate settings; using the first one.
0084:fixme:wineusb:add_usb_device Interface 1 has 2 alternate settings; using the first one.
0084:fixme:wineusb:add_usb_device Interface 2 has 2 alternate settings; using the first one.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
007c:fixme:wineusb:query_id Unhandled ID query type 0x5.
ATTENTION: default value of option mesa_glthread overridden by environment.
ATTENTION: default value of option mesa_glthread overridden by environment.
002c:fixme:ver:GetCurrentPackageId (000000000061FD70 0000000000000000): stub
0118:err:module:import_dll Library Window.dll (which is needed by L"C:\\\\Games\\\\test\\\\unrealtournament.exe") not found
0118:err:module:import_dll Library Core.dll (which is needed by L"C:\\\\Games\\\\test\\\\unrealtournament.exe") not found
0118:err:module:import_dll Library Engine.dll (which is needed by L"C:\\\\Games\\\\test\\\\unrealtournament.exe") not found
0118:err:module:LdrInitializeThunk Importing dlls for L"C:\\\\Games\\\\test\\\\unrealtournament.exe" failed, status c0000135
0034:fixme:ver:GetCurrentPackageId (000000000062FD70 0000000000000000): stub`.split('\n');


  function iterable() {
    if (mock.length === 0) {
      return;
    }

    setTimeout(() => {
      let autoscroll: boolean = (list?.getIndex() || 0) === (items.length - 1);
      let line: string = mock.shift();
      items = [...items, line];

      tick().then(() => {
        if (autoscroll) {
          list?.changeIndex(items.length - 1, true);
        }

        iterable();
      });
    }, 1000);
  }

  let items: string[] = [];

  const keyboardWatch = (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      list?.keyDown();
    }

    if (KeyboardKey.UP === key) {
      list?.keyUp();
    }

    if (KeyboardKey.ENTER === key || KeyboardKey.RIGHT === key) {
      unbindEvents();
      data.setOperation(list?.getItem()?.value);
      data.setFileManagerExecutable(false);
      window.$app.getPopup().open(PopupNames.FILE_MANAGER, data);

      return;
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key || KeyboardKey.LEFT === key) {
      unbindEvents();
      window.$app.getPopup().back();
    }
  };

  export function bindEvents(): void {
    window.$app.getKeyboard().on(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  }

  export function unbindEvents(): void {
    window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  }

  onMount(() => {
    bindEvents();
    iterable();
  });

  onDestroy(() => {
    unbindEvents();
  });
</script>

<div class="popup">
  <div class="header">
    Running
  </div>
  <div class="content">
    <div class="center">
      <List
        bind:this={list}
        {items}
        headersDummy={Math.trunc((window.innerHeight - 200) / 30 / 2) - 1}
        paddingIndent={0}
        itemSize={30}
        itemSpace={40}
        itemCenter={true}
        horizontal={false}
        extendItemClass="vertical-item"
        type={StickerType.LOG}
      />
    </div>
  </div>
  <div class="footer">
    {#if loading}
      <Loader style="margin-top: 10px;"/>
    {/if}
  </div>
</div>

<style lang="less">
  .popup {
    color: #ffffff;
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;

    .header {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      height: 97px;
      width: calc(100% - 100px);
      top: 0;
      left: 0;
      right: 0;
      margin: 0 auto;
      border-bottom: rgb(255 255 255 / 80%) solid 1px;
      padding-bottom: 3px;
      font-weight: 100;
      font-size: 16px;
      filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
    }

    .footer {
      display: flex;
      height: 100px;
      width: calc(100% - 100px);
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0 auto;
      border-top: rgb(255 255 255 / 80%) solid 1px;
      justify-content: end;
    }

    .content {
      display: flex;
      position: relative;
      width: 100%;
      flex: 1;
      justify-content: center;

      .center {
        width: calc(100% - 100px);
        height: 100%;
        position: absolute;
        margin: auto;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
    }
  }
</style>