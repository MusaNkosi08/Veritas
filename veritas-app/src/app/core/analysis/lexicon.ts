// Word lists behind the lexical metrics. Kept in one place so a
// reviewer can audit exactly what counts as "common" or "function".

/**
 * Function words, grouped into coarse part-of-speech classes.
 * Full POS tagging needs a model; these closed classes cover roughly
 * half of any English text and are stable enough to compare one
 * writer against their own earlier work.
 */
export const FUNCTION_CLASSES = {
  determiner: [
    'the', 'a', 'an', 'this', 'that', 'these', 'those', 'each', 'every', 'some', 'any', 'no',
    'all', 'both', 'either', 'neither', 'such', 'many', 'much', 'few', 'several', 'another', 'other',
  ],
  pronoun: [
    'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'ours', 'you', 'your', 'yours', 'he', 'him',
    'his', 'she', 'her', 'hers', 'it', 'its', 'they', 'them', 'their', 'theirs', 'myself',
    'ourselves', 'yourself', 'himself', 'herself', 'itself', 'themselves', 'who', 'whom',
    'whose', 'which', 'what', 'someone', 'something', 'anyone', 'anything', 'everyone',
    'everything', 'nobody', 'nothing', "i'm", "it's", "that's", "they're", "we're", "you're",
  ],
  preposition: [
    'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'from', 'about', 'into', 'through',
    'over', 'after', 'before', 'between', 'under', 'against', 'during', 'without', 'within',
    'among', 'across', 'towards', 'toward', 'upon', 'around', 'beyond', 'despite', 'since',
    'until', 'like', 'per', 'via',
  ],
  conjunction: [
    'and', 'but', 'or', 'nor', 'so', 'yet', 'because', 'although', 'though', 'while',
    'whereas', 'if', 'unless', 'when', 'whenever', 'where', 'as', 'than', 'whether', 'once',
    'however', 'therefore', 'moreover', 'furthermore', 'additionally', 'consequently', 'thus',
    'hence', 'nevertheless', 'meanwhile', 'also',
  ],
  auxiliary: [
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
    'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
    "don't", "doesn't", "didn't", "isn't", "wasn't", "can't", "won't", "wouldn't", "couldn't",
    "shouldn't", "aren't", "weren't", "haven't", "hasn't", "i've", "i'd", "i'll",
  ],
  particle: ['not', 'to', 'up', 'out', 'off', 'just', 'only', 'very', 'really', 'too', 'then', 'there', 'here', 'now'],
} as const;

export type FunctionClass = keyof typeof FUNCTION_CLASSES;
export const POS_CLASSES = [...Object.keys(FUNCTION_CLASSES), 'content'] as (FunctionClass | 'content')[];

export const FUNCTION_WORDS: ReadonlyMap<string, FunctionClass> = (() => {
  const map = new Map<string, FunctionClass>();
  // First class wins for words in two lists ("to"); order above is intentional.
  for (const [cls, list] of Object.entries(FUNCTION_CLASSES) as [FunctionClass, readonly string[]][]) {
    for (const w of list) if (!map.has(w)) map.set(w, cls);
  }
  return map;
})();

/**
 * The common core of English vocabulary: function words plus frequent
 * content words. Anything outside this set counts as a "rarer" token
 * for the perplexity proxy. It is a coarse instrument by design.
 */
export const COMMON_WORDS: ReadonlySet<string> = new Set([
  ...FUNCTION_WORDS.keys(),
  ...`time year people way day man woman thing child world life hand part place case week
  company system program question work government number night point home water room mother
  area money story fact month lot right study book eye job word business issue side kind head
  house service friend father power hour game line end member law car city community name
  president team minute idea kid body information back parent face others level office door
  health person art war history party result change morning reason research girl guy moment air
  teacher force education student school class group problem country state family example
  say get make go know take see come think look want give use find tell ask seem feel try
  leave call need become put mean keep let begin help talk turn start show hear play run move
  live believe hold bring happen write provide sit stand lose pay meet include continue set
  learn lead understand watch follow stop create speak read allow add spend grow open walk win
  offer remember love consider appear buy wait serve die send expect build stay fall cut reach
  kill remain suggest raise pass sell require report decide pull
  good new first last long great little own old big high different small large next early young
  important public bad same able best better sure free true whole real full clear hard easy
  possible social local late major political national human main certain recent strong
  general special simple common past private poor low current particular open natural
  more most other well even back still way also never always often sometimes again already
  ever far less least almost enough quite rather perhaps maybe yes today later soon away
  people's one two three four five ten hundred thousand second third time's things
  mean meant made said went got took came saw knew thought told asked felt left found gave
  used went looked wanted tried needed began kept`.split(/\s+/).filter(Boolean),
]);

/**
 * Phrases that turn up far more often in unedited model output than
 * in student drafts. Each is innocent alone; a dense cluster is a pattern.
 * The list is short and published on the Methodology page on purpose.
 */
export const FORMULAIC_PHRASES: readonly string[] = [
  'delve into', 'delves into', 'delving into', 'tapestry', 'testament to', 'in today\'s',
  'it is important to note', 'it is worth noting', 'plays a crucial role', 'plays a pivotal role',
  'a pivotal role', 'navigate the complexities', 'navigating the complexities', 'multifaceted',
  'in the realm of', 'ever-evolving', 'ever-changing landscape', 'rich tapestry', 'underscores',
  'underscore the', 'fostering', 'foster a', 'in conclusion,', 'overall,', 'furthermore,',
  'moreover,', 'additionally,', 'a nuanced understanding', 'holistic', 'serves as a',
  'not only', 'shed light on', 'sheds light on', 'paving the way', 'at its core',
  'in summary,', 'crucial', 'landscape of', 'intricate', 'seamlessly', 'leverage',
];
