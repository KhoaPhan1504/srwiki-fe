import type { CheatsheetEntry, FlagDefinition, RegexExample } from '~root/types';

export const FLAG_DEFINITIONS: FlagDefinition[] = [
  { flag: 'g', labelKey: 'flags.g.label', descriptionKey: 'flags.g.description' },
  { flag: 'i', labelKey: 'flags.i.label', descriptionKey: 'flags.i.description' },
  { flag: 'm', labelKey: 'flags.m.label', descriptionKey: 'flags.m.description' },
  { flag: 's', labelKey: 'flags.s.label', descriptionKey: 'flags.s.description' },
  { flag: 'u', labelKey: 'flags.u.label', descriptionKey: 'flags.u.description' },
  { flag: 'y', labelKey: 'flags.y.label', descriptionKey: 'flags.y.description' },
  { flag: 'd', labelKey: 'flags.d.label', descriptionKey: 'flags.d.description' },
];

export const EXAMPLE_PATTERNS: RegexExample[] = [
  {
    id: 'email',
    labelKey: 'examples.email',
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    flags: 'gm',
    sampleText: 'john@example.com\nnot-an-email\njane.doe@company.co',
  },
  {
    id: 'url',
    labelKey: 'examples.url',
    pattern: 'https?:\\/\\/[^\\s]+',
    flags: 'g',
    sampleText: 'Visit https://example.com or http://sub.example.com/path?q=1 for more.',
  },
  {
    id: 'ipv4',
    labelKey: 'examples.ipv4',
    pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    flags: 'g',
    sampleText: 'Server at 192.168.1.1, gateway 10.0.0.1, invalid 999.999.999.999',
  },
  {
    id: 'phone',
    labelKey: 'examples.phone',
    pattern: '\\+?\\d[\\d ()-]{7,}\\d',
    flags: 'g',
    sampleText: 'Call +1 415-555-0132 or 0912345678 for support.',
  },
  {
    id: 'numbers',
    labelKey: 'examples.numbers',
    pattern: '\\d+',
    flags: 'g',
    sampleText: 'Order #1024 shipped 3 items on day 07.',
  },
  {
    id: 'whitespace',
    labelKey: 'examples.whitespace',
    pattern: '\\s+',
    flags: 'g',
    sampleText: 'Multiple   spaces\tand\ttabs   here.',
  },
];

export const SYNTAX_CHEATSHEET: CheatsheetEntry[] = [
  { token: '.', descriptionKey: 'cheatsheet.dot' },
  { token: '\\d', descriptionKey: 'cheatsheet.digit' },
  { token: '\\w', descriptionKey: 'cheatsheet.word' },
  { token: '\\s', descriptionKey: 'cheatsheet.whitespace' },
  { token: '^', descriptionKey: 'cheatsheet.start' },
  { token: '$', descriptionKey: 'cheatsheet.end' },
  { token: '*', descriptionKey: 'cheatsheet.zeroOrMore' },
  { token: '+', descriptionKey: 'cheatsheet.oneOrMore' },
  { token: '?', descriptionKey: 'cheatsheet.zeroOrOne' },
  { token: '{n,m}', descriptionKey: 'cheatsheet.range' },
  { token: '[]', descriptionKey: 'cheatsheet.charClass' },
  { token: '()', descriptionKey: 'cheatsheet.group' },
  { token: '(?:)', descriptionKey: 'cheatsheet.nonCapturingGroup' },
  { token: '|', descriptionKey: 'cheatsheet.or' },
];

export type RegexFlag = 'g' | 'i' | 'm' | 's' | 'u' | 'y' | 'd';

export const MAX_MATCHES = 1000;
