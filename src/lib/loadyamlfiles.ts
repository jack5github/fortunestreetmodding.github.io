import { cache } from '@solidjs/router';
import { readFileSync, readdirSync } from 'fs';
import { parse } from 'yaml'
import { MapDescriptor } from './mapdescriptor';
import slug from 'slug';

export interface MapDescriptorExtended extends MapDescriptor {
  path: string;
  slug: string;
  imageUrls: string[];
}

interface YamlDict {
  [key: string]: MapDescriptorExtended;
}

export interface VentureCard {
  defaultEasy: boolean;
  defaultStandard: boolean;
  description: string;
  descriptionExtra?: string;
  effect: string;
  grade: number;
  sentiment: number;
}

export async function getYaml(filePath: string): Promise<{}> {
  "use server";
  const yamlContent = readFileSync(filePath, 'utf8');
  const yamlData = parse(yamlContent);
  return yamlData;
}

export async function getYamlStr(filePath: string): Promise<string> {
  "use server";
  const yamlContent = readFileSync(filePath, 'utf8');
  return yamlContent;
}

export async function getBoardsDict(): Promise<YamlDict> {
  "use server";
  const yamlDict: YamlDict = {};

  const files = readdirSync("./_maps", { recursive: true, withFileTypes: true });

  files.forEach((file) => {
    if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
      const filePath = `./${file.parentPath}/${file.name}`;
      const yamlContent = readFileSync(filePath, 'utf8');
      const board = parse(yamlContent);

      // some post processing...

      // merge frbFile1,2,3,4 into frbFiles
      if(!board.frbFiles) {
        const frbFiles: string[] = [];
        if(board.frbFile2 !== undefined) {
          frbFiles.push(board.frbFile2);
        }
        if(board.frbFile3 !== undefined) {
          frbFiles.push(board.frbFile3);
        }
        if(board.frbFile4 !== undefined) {
          frbFiles.push(board.frbFile4);
        }
        board.frbFiles = [board.frbFile1!, ...frbFiles];
      }
      // set the directory path for the board
      board.path = file.parentPath;

      // set the slug name for the board
      board.slug = slug(file.name.replace(/\.(yaml|yml)$/, ''));

      // set the image urls for each frb file
      board.imageUrls = board.frbFiles!.map((frbFile: string) => `/${board.path}/${frbFile}.webp`);

      yamlDict[board.slug] = board;
    }
  });
  return yamlDict;
};

export async function getBoardsList(): Promise<MapDescriptorExtended[]> {
  "use server";
  const boardsDict = await getBoardsDict();
  const boardsList = Object.values(boardsDict);
  return boardsList;
}

export async function getVentureCards(): Promise<VentureCard[]> {
  "use server";
  const filePath = "./_data/ventureCards.yml";
  const yamlContent = readFileSync(filePath, 'utf8');
  return parse(yamlContent);
};

export async function getVentureCardEffects(): Promise<(string | undefined)[]> {
  "use server";
  const effects = await getVentureCards();
  return [...new Set(effects.map(card => card.effect))].sort();
}