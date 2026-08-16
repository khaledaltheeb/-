type UnknownRecord = Record<string, unknown>;

type FourSteps = readonly [string, string, string, string];

export type DailyToolBodyEnhancement = {
  bodyJson: unknown;
  interactive: boolean;
  toolKey: string | null;
};

const HUB_SOURCE_PATH = 'daily-tools/index.html';
const SLEEP_SOURCE_PATH = 'daily-tools/sleep-wind-down-plan/index.html';
const STEP_HEADING = 'خطوات الاستخدام';
const PROGRESS_PATTERN = /^أُنجز\s+\d+\s+من\s+4(?:\s|$)/u;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null;
}

function cleanText(value: unknown, max = 2000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function normalizeSourcePath(value: unknown): string {
  return cleanText(value, 1000).replace(/^\/+/, '');
}

function normalizeFamily(value: unknown): string {
  return cleanText(value, 120).toLowerCase().replace(/[\s_]+/g, '-');
}

function blockType(value: unknown): string {
  return cleanText(asRecord(value)?.type, 60).toLowerCase();
}

function blockText(value: unknown): string {
  const block = asRecord(value);
  return block ? cleanText(block.text ?? block.title, 2000) : '';
}

function listItemText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  const item = asRecord(value);
  return item ? cleanText(item.text ?? item.label ?? item.value ?? item.title, 2000) : '';
}

function fourStepList(value: unknown): FourSteps | null {
  const block = asRecord(value);
  if (!block || blockType(block) !== 'list' || !Array.isArray(block.items)) return null;
  const items = block.items.map(listItemText).filter(Boolean);
  if (items.length !== 4) return null;
  return [items[0], items[1], items[2], items[3]];
}

function standardToolKey(sourcePath: string): string | null {
  if (!sourcePath || sourcePath === HUB_SOURCE_PATH || sourcePath === SLEEP_SOURCE_PATH) return null;
  const match = sourcePath.match(/^daily-tools\/([^/]+)\/index\.html$/i);
  if (!match) return null;
  const slug = match[1].toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,119}$/.test(slug) ? slug : null;
}

/**
 * Replaces the preserved static four-step interaction with the local-only
 * checklist block. Activation is provenance-gated to preserved Daily Tools
 * records and intentionally excludes the hub and sleep tracker outlier.
 */
export function enhanceLegacyDailyToolBody(input: {
  sourceFamily?: string | null;
  sourcePath: string;
  bodyJson: unknown;
}): DailyToolBodyEnhancement {
  const sourcePath = normalizeSourcePath(input.sourcePath);
  const sourceFamily = normalizeFamily(input.sourceFamily);
  const toolKey = standardToolKey(sourcePath);

  if (!toolKey || (sourceFamily && sourceFamily !== 'daily-tools')) {
    return { bodyJson: input.bodyJson, interactive: false, toolKey: null };
  }

  const root = asRecord(input.bodyJson);
  const blocks = Array.isArray(root?.blocks) ? root.blocks : null;
  if (!root || !blocks) return { bodyJson: input.bodyJson, interactive: false, toolKey: null };

  const headingIndex = blocks.findIndex((block) => blockType(block) === 'heading' && blockText(block) === STEP_HEADING);
  if (headingIndex < 0) return { bodyJson: input.bodyJson, interactive: false, toolKey: null };

  let listIndex = -1;
  let steps: FourSteps | null = null;
  for (let index = headingIndex + 1; index < blocks.length; index += 1) {
    if (blockType(blocks[index]) === 'heading') break;
    const candidate = fourStepList(blocks[index]);
    if (candidate) {
      listIndex = index;
      steps = candidate;
      break;
    }
  }
  if (listIndex < 0 || !steps) return { bodyJson: input.bodyJson, interactive: false, toolKey: null };

  const replacement: UnknownRecord = {
    type: 'daily_tool_four_step_checklist',
    toolKey,
    legend: STEP_HEADING,
    steps: [...steps],
  };

  const nextBlocks: unknown[] = [];
  for (let index = 0; index < blocks.length; index += 1) {
    if (index === headingIndex) {
      nextBlocks.push(replacement);
      continue;
    }
    if (index === listIndex) continue;
    if (index > headingIndex && index < listIndex && blockType(blocks[index]) === 'paragraph' && PROGRESS_PATTERN.test(blockText(blocks[index]))) {
      continue;
    }
    nextBlocks.push(blocks[index]);
  }

  return {
    bodyJson: { ...root, blocks: nextBlocks },
    interactive: true,
    toolKey,
  };
}
