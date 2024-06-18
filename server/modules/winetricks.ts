import {AbstractModule} from './abstract-module';
import AppFolders from './app-folders';
import FileSystem from './file-system';
import Update from './update';
import Utils from '../helpers/utils';

const SKIP: string[] = [
  // apps
  '3m_library',
  '7zip',
  'winrar',
  'abiword',
  'adobe_diged',
  'adobe_diged4',
  'autohotkey',
  'busybox',
  'cmake',
  'colorprofile',
  'controlspy',
  'dotnet20sdk',
  'dxsdk_jun2010',
  'dxsdk_nov2006',
  'emu8086',
  'ev3',
  'firefox',
  'fontxplorer',
  'foobar2000',
  'iceweasel',
  'irfanview',
  'kindle',
  'kobo',
  'mingw',
  'mozillabuild',
  'mpc',
  'mspaint',
  'mt4',
  'njcwp_trial',
  'njjwp_trial',
  'nook',
  'npp',
  'office2003pro',
  'office2007pro',
  'office2013pro',
  'ollydbg110',
  'ollydbg200',
  'ollydbg201',
  'openwatcom',
  'protectionid',
  'psdk2003',
  'psdkwin7',
  'psdkwin71',
  'qq',
  'qqintl',
  'safari',
  'sketchup',
  'steam',
  'uplay',
  'utorrent',
  'utorrent3',
  'vc2005express',
  'vc2005expresssp1',
  'vc2005trial',
  'vc2008express',
  'vc2010express',
  'vlc',
  'vulkansdk',
  'winamp',

  // benchmarks
  '3dmark03',
  '3dmark05',
  '3dmark06',
  '3dmark2000',
  '3dmark2001',
  'stalker_pripyat_bench',
  'unigine_heaven',
  'wglgears',

  // dlls
  'd9vk',
  'd9vk010',
  'd9vk011',
  'd9vk012',
  'd9vk013',
  'd9vk013f',
  'd9vk020',
  'd9vk021',
  'd9vk022',
  'd9vk030',
  'd9vk040',
  'python26',
  'python27',

  // games
  'acreedbro',
  'algodoo_demo',
  'alienswarm_steam',
  'amnesia_tdd_demo',
  'aoe3_demo',
  'avatar_demo',
  'bfbc2',
  'bioshock2',
  'bioshock2_steam',
  'bioshock_demo',
  'blobby_volley',
  'borderlands_steam',
  'bttf101',
  'cim_demo',
  'civ4_demo',
  'civ5_demo_steam',
  'cnc3_demo',
  'cnc_redalert3_demo',
  'cod1',
  'cod4mw_demo',
  'cod5_waw',
  'cod_demo',
  'crayonphysics_demo',
  'crysis2',
  'csi6_demo',
  'darknesswithin2_demo',
  'darkspore',
  'dcuo',
  'deadspace',
  'deadspace2',
  'demolition_company_demo',
  'deusex2_demo',
  'diablo2',
  'digitanks_demo',
  'dirt2_demo',
  'dragonage',
  'dragonage2_demo',
  'dragonage_ue',
  'eve',
  'fable_tlc',
  'fifa11_demo',
  'gta_vc',
  'hon',
  'hordesoforcs2_demo',
  'kotor1',
  'lemonysnicket',
  'lhp_demo',
  'losthorizon_demo',
  'lswcs',
  'luxor_ar',
  'masseffect2',
  'masseffect2_demo',
  'maxmagicmarker_demo',
  'mdk',
  'menofwar',
  'mfsx_demo',
  'mfsxde',
  'myth2_demo',
  'nfsshift_demo',
  'oblivion',
  'penpenxmas',
  'popfs',
  'rct3deluxe',
  'riseofnations_demo',
  'ruse_demo_steam',
  'sammax301_demo',
  'sammax304_demo',
  'secondlife',
  'sims3',
  'sims3_gen',
  'simsmed',
  'singularity',
  'splitsecond',
  'spore',
  'spore_cc_demo',
  'starcraft2_demo',
  'supermeatboy_steam',
  'theundergarden_demo',
  'tmnationsforever',
  'torchlight',
  'trainztcc_2004',
  'trine_demo_steam',
  'trine_steam',
  'tropico3_demo',
  'twfc',
  'typingofthedead_demo',
  'ut3',
  'wog',
  'wormsreloaded_demo_steam',

  // prefix
  'apps',
  'benchmarks',
  'dlls',
  'fonts',
  'games',
  'settings',
  'nuget',
  'origin',
  'procexp',
  'ubisoftconnect',
];

export type WineTrickItemType = {name: string, description: string};

export default class WineTricks extends AbstractModule {
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly update: Update;

  private list: WineTrickItemType[];

  constructor(appFolders: AppFolders, fs: FileSystem, update: Update) {
    super();

    this.appFolders = appFolders;
    this.fs = fs;
    this.update = update;
  }

  public async init(): Promise<any> {
  }

  public async download(): Promise<void> {
    await this.update.downloadCabExtract();
    await this.update.downloadWineTricks();
  }

  public async getList(): Promise<WineTrickItemType[]> {
    if (undefined !== this.list) {
      return this.list;
    }

    await this.download();

    const wineTricks: string = await this.appFolders.getWineTricksFile();

    if (!await this.fs.exists(wineTricks)) {
      return;
    }

    const plainText: string = await this.fs.fileGetContents(wineTricks);

    const list: WineTrickItemType[] = [...plainText.matchAll(/^w_metadata (.+?) (.+?) \\\n.*title="(.+?)" \\/gm)]
      .filter((n: RegExpExecArray) => !SKIP.includes(n[1].trim()) && !/^galliumnine[0-9]{1,}/gm.test(n[1].trim()))
      .map((n: RegExpExecArray) => ({name: n[1].trim(), description: n[3].trim()}));

    const result: {[name: string]: string} = {};

    for (const item of list) {
      result[item.name] = item.description;
    }

    this.list = Utils.natsort(Object.keys(result)).map((name: string) => ({name, description: result[name]}));

    return this.list;
  }
}