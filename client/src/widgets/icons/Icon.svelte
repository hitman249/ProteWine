<script lang="ts">
  import Gamepad from '../icons/Gamepad.svelte';
  import Settings from '../icons/Settings.svelte';
  import Layers from '../icons/Layers.svelte';
  import Prefix from '../icons/Prefix.svelte';
  import Updates from '../icons/Updates.svelte';
  import Build from '../icons/Build.svelte';
  import Database from '../icons/Database.svelte';
  import Plus from './Plus.svelte';
  import Reset from './Reset.svelte';
  import Wine from './Wine.svelte';
  import PrefixSettings from './PrefixSettings.svelte';
  import LayersAdd from './LayersAdd.svelte';
  import LayersList from './LayersList.svelte';
  import LayersItem from './LayersItem.svelte';
  import UpdateSelf from './UpdateSelf.svelte';
  import UpdateLayer from './UpdateLayer.svelte';
  import Unpack from './Unpack.svelte';
  import Pack from './Pack.svelte';
  import Compile from './Compile.svelte';
  import Storage from './Storage.svelte';
  import Manage from './Manage.svelte';
  import Root from './Root.svelte';
  import Home from './Home.svelte';
  import Directory from './Directory.svelte';
  import Archive from './Archive.svelte';
  import Image from './Image.svelte';
  import File from './File.svelte';
  import Text from './Text.svelte';
  import Executable from './Executable.svelte';
  import Video from './Video.svelte';
  import Music from './Music.svelte';
  import DiskImage from './DiskImage.svelte';
  import Symlink from './Symlink.svelte';
  import Copy from './Copy.svelte';
  import Move from './Move.svelte';
  import Link from './Link.svelte';

  export let status: string = 'normal';
  export let icon: string = '';
  export let style: string = '';
  export let value: any = undefined;
</script>

<!--{#if 'settings' === icon}-->
<!--  <Settings {status} {style}/>-->
<!--{/if}-->

{#if 'gamepad' === icon}
  <Gamepad {status} {style} />
{:else if 'settings' === icon}
  <PrefixSettings {status} {style} />
{:else if 'layers' === icon}
  <Layers {status} {value} {style} />
{:else if 'prefix' === icon}
  <Prefix {status} {style} />
{:else if 'updates' === icon}
  <Updates {status} {style} />
{:else if 'build' === icon}
  <Build {status} {style} />
{:else if 'database' === icon}
  <Database {status} {style} />
{:else if 'plus' === icon}
  <Plus {status} {style} />
{:else if 'reset' === icon}
  <Reset {status} {style} />
{:else if 'wine' === icon}
  <Wine {status} {style} />
{:else if 'layers-add' === icon}
  <LayersAdd {status} {style} />
{:else if 'layers-list' === icon}
  <LayersList {status} {style} />
{:else if 'layers-item' === icon}
  <LayersItem {status} {style} />
{:else if 'update-self' === icon}
  <UpdateSelf {status} {style} />
{:else if 'update-layer' === icon}
  <UpdateLayer {status} {style} />
{:else if 'unpack' === icon}
  <Unpack {status} {style} />
{:else if 'pack' === icon}
  <Pack {status} {style} />
{:else if 'compile' === icon}
  <Compile {status} {style} />
{:else if 'storage' === icon}
  <Storage {status} {style} />
{:else if 'manage' === icon}
  <Manage {status} {style} />
{:else if 'root' === icon}
  <Root {status} {style} />
{:else if 'home' === icon}
  <Home {status} {style} />
{:else if 'directory' === icon}
  <Directory {status} {style} />
{:else if 'archive' === icon}
  <Archive {status} {style} />
{:else if 'image' === icon}
  <Image {status} {style} />
{:else if 'file' === icon}
  <File {status} {style} />
{:else if 'text' === icon}
  <Text {status} {style} />
{:else if 'executable' === icon}
  <Executable {status} {style} />
{:else if 'video' === icon}
  <Video {status} {style} />
{:else if 'music' === icon}
  <Music {status} {style} />
{:else if 'disk-image' === icon}
  <DiskImage {status} {style} />
{:else if 'symlink' === icon}
  <Symlink {status} {style} />
{:else if 'copy' === icon}
  <Copy {status} {style} />
{:else if 'move' === icon}
  <Move {status} {style} />
{:else if 'link' === icon}
  <Link {status} {style} />
{/if}