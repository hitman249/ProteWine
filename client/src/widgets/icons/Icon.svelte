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

  export let status: 'normal' | 'active' | 'focused' = 'normal';
  export let icon: string = '';
  export let value: any = undefined;
</script>

{#if 'gamepad' === icon}
  <Gamepad status={`item-${status}`} />
{/if}
<!--{#if 'settings' === icon}-->
<!--  <Settings status={`item-${status}`} />-->
<!--{/if}-->
{#if 'settings' === icon}
  <PrefixSettings status={`item-${status}`} />
{/if}
{#if 'layers' === icon}
  <Layers status={`item-${status}`} {value} />
{/if}
{#if 'prefix' === icon}
  <Prefix status={`item-${status}`} />
{/if}
{#if 'updates' === icon}
  <Updates status={`item-${status}`} />
{/if}
{#if 'build' === icon}
  <Build status={`item-${status}`} />
{/if}
{#if 'database' === icon}
  <Database status={`item-${status}`} />
{/if}
{#if 'plus' === icon}
  <Plus status={`item-${status}`} />
{/if}
{#if 'reset' === icon}
  <Reset status={`item-${status}`} />
{/if}
{#if 'wine' === icon}
  <Wine status={`item-${status}`} />
{/if}
{#if 'layers-add' === icon}
  <LayersAdd status={`item-${status}`} />
{/if}
{#if 'layers-list' === icon}
  <LayersList status={`item-${status}`} />
{/if}
{#if 'layers-item' === icon}
  <LayersItem status={`item-${status}`} />
{/if}
{#if 'update-self' === icon}
  <UpdateSelf status={`item-${status}`} />
{/if}
{#if 'update-layer' === icon}
  <UpdateLayer status={`item-${status}`} />
{/if}
{#if 'unpack' === icon}
  <Unpack status={`item-${status}`} />
{/if}
{#if 'pack' === icon}
  <Pack status={`item-${status}`} />
{/if}
{#if 'compile' === icon}
  <Compile status={`item-${status}`} />
{/if}