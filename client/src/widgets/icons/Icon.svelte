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

  export let status: string = 'normal';
  export let icon: string = '';
  export let value: any = undefined;
</script>

{#if 'gamepad' === icon}
  <Gamepad {status} />
{/if}
<!--{#if 'settings' === icon}-->
<!--  <Settings {status} />-->
<!--{/if}-->
{#if 'settings' === icon}
  <PrefixSettings {status} />
{/if}
{#if 'layers' === icon}
  <Layers {status} {value} />
{/if}
{#if 'prefix' === icon}
  <Prefix {status} />
{/if}
{#if 'updates' === icon}
  <Updates {status} />
{/if}
{#if 'build' === icon}
  <Build {status} />
{/if}
{#if 'database' === icon}
  <Database {status} />
{/if}
{#if 'plus' === icon}
  <Plus {status} />
{/if}
{#if 'reset' === icon}
  <Reset {status} />
{/if}
{#if 'wine' === icon}
  <Wine {status} />
{/if}
{#if 'layers-add' === icon}
  <LayersAdd {status} />
{/if}
{#if 'layers-list' === icon}
  <LayersList {status} />
{/if}
{#if 'layers-item' === icon}
  <LayersItem {status} />
{/if}
{#if 'update-self' === icon}
  <UpdateSelf {status} />
{/if}
{#if 'update-layer' === icon}
  <UpdateLayer {status} />
{/if}
{#if 'unpack' === icon}
  <Unpack {status} />
{/if}
{#if 'pack' === icon}
  <Pack {status} />
{/if}
{#if 'compile' === icon}
  <Compile {status} />
{/if}
{#if 'storage' === icon}
  <Storage {status} />
{/if}