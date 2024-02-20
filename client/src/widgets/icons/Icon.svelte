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

  export let status: string = 'normal';
  export let icon: string = '';
  export let style: string = '';
  export let value: any = undefined;
</script>

{#if 'gamepad' === icon}
  <Gamepad {status} {style} />
{/if}
<!--{#if 'settings' === icon}-->
<!--  <Settings {status} {style}/>-->
<!--{/if}-->
{#if 'settings' === icon}
  <PrefixSettings {status} {style} />
{/if}
{#if 'layers' === icon}
  <Layers {status} {value} {style} />
{/if}
{#if 'prefix' === icon}
  <Prefix {status} {style} />
{/if}
{#if 'updates' === icon}
  <Updates {status} {style} />
{/if}
{#if 'build' === icon}
  <Build {status} {style} />
{/if}
{#if 'database' === icon}
  <Database {status} {style} />
{/if}
{#if 'plus' === icon}
  <Plus {status} {style} />
{/if}
{#if 'reset' === icon}
  <Reset {status} {style} />
{/if}
{#if 'wine' === icon}
  <Wine {status} {style} />
{/if}
{#if 'layers-add' === icon}
  <LayersAdd {status} {style} />
{/if}
{#if 'layers-list' === icon}
  <LayersList {status} {style} />
{/if}
{#if 'layers-item' === icon}
  <LayersItem {status} {style} />
{/if}
{#if 'update-self' === icon}
  <UpdateSelf {status} {style} />
{/if}
{#if 'update-layer' === icon}
  <UpdateLayer {status} {style} />
{/if}
{#if 'unpack' === icon}
  <Unpack {status} {style} />
{/if}
{#if 'pack' === icon}
  <Pack {status} {style} />
{/if}
{#if 'compile' === icon}
  <Compile {status} {style} />
{/if}
{#if 'storage' === icon}
  <Storage {status} {style} />
{/if}
{#if 'manage' === icon}
  <Manage {status} {style} />
{/if}