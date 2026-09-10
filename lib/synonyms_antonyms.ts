import { DictionaryRelation } from './dictionary';
import { getLemmas } from './morphology';

export interface WordThesaurus {
    synonyms: string[];
    antonyms: string[];
}

/**
 * Từ điển Đồng nghĩa (Synonyms) & Trái nghĩa (Antonyms) cốt lõi
 * Bao phủ các tính từ, động từ, danh từ và phó từ quan trọng nhất trong tiếng Anh.
 */
export const THESAURUS_MAP: Record<string, WordThesaurus> = {
    // ==========================================
    // 1. TÍNH TỪ PHỔ BIẾN (ADJECTIVES)
    // ==========================================
    "good": {
        synonyms: ["great", "excellent", "fine", "positive", "wonderful", "splendid", "superb", "fabulous"],
        antonyms: ["bad", "poor", "terrible", "evil", "awful", "inferior", "dreadful"]
    },
    "bad": {
        synonyms: ["poor", "terrible", "awful", "dreadful", "inferior", "nasty", "evil", "substandard"],
        antonyms: ["good", "great", "excellent", "fine", "positive", "superb"]
    },
    "happy": {
        synonyms: ["cheerful", "glad", "joyful", "delighted", "pleased", "content", "thrilled", "jubilant"],
        antonyms: ["sad", "unhappy", "sorrowful", "depressed", "gloomy", "miserable", "cheerless"]
    },
    "sad": {
        synonyms: ["unhappy", "sorrowful", "depressed", "gloomy", "melancholy", "heartbroken", "miserable"],
        antonyms: ["happy", "cheerful", "glad", "joyful", "delighted", "thrilled"]
    },
    "big": {
        synonyms: ["large", "huge", "giant", "enormous", "massive", "immense", "gigantic", "colossal"],
        antonyms: ["small", "little", "tiny", "miniature", "minute", "compact"]
    },
    "small": {
        synonyms: ["little", "tiny", "miniature", "minor", "slight", "compact", "minute"],
        antonyms: ["big", "large", "huge", "giant", "enormous", "massive", "gigantic"]
    },
    "fast": {
        synonyms: ["quick", "rapid", "swift", "speedy", "brisk", "fleet"],
        antonyms: ["slow", "sluggish", "gradual", "leisurely"]
    },
    "slow": {
        synonyms: ["sluggish", "gradual", "leisurely", "unhurried", "plodding"],
        antonyms: ["fast", "quick", "rapid", "swift", "speedy"]
    },
    "hot": {
        synonyms: ["warm", "boiling", "burning", "scorching", "fiery", "heated", "scalding"],
        antonyms: ["cold", "cool", "chilly", "freezing", "frigid", "frosty", "icy"]
    },
    "cold": {
        synonyms: ["cool", "chilly", "freezing", "frosty", "frigid", "icy", "bleak"],
        antonyms: ["hot", "warm", "boiling", "burning", "scorching"]
    },
    "rich": {
        synonyms: ["wealthy", "affluent", "prosperous", "well-off", "loaded", "opulent"],
        antonyms: ["poor", "broke", "impoverished", "destitute", "needy", "underprivileged"]
    },
    "poor": {
        synonyms: ["impoverished", "destitute", "needy", "broke", "underprivileged", "penniless"],
        antonyms: ["rich", "wealthy", "affluent", "prosperous", "opulent"]
    },
    "easy": {
        synonyms: ["simple", "effortless", "straightforward", "smooth", "uncomplicated", "elementary"],
        antonyms: ["difficult", "hard", "tough", "demanding", "challenging", "complex", "complicated"]
    },
    "difficult": {
        synonyms: ["hard", "tough", "demanding", "challenging", "complex", "complicated", "arduous"],
        antonyms: ["easy", "simple", "effortless", "straightforward", "smooth"]
    },
    "hard": {
        synonyms: ["difficult", "tough", "solid", "firm", "stiff", "demanding", "arduous"],
        antonyms: ["easy", "soft", "simple", "flexible", "effortless"]
    },
    "soft": {
        synonyms: ["tender", "cushiony", "flexible", "gentle", "mild", "yielding"],
        antonyms: ["hard", "tough", "solid", "firm", "rigid"]
    },
    "beautiful": {
        synonyms: ["pretty", "attractive", "gorgeous", "lovely", "stunning", "handsome", "exquisite"],
        antonyms: ["ugly", "hideous", "plain", "unattractive", "unsightly", "homely"]
    },
    "ugly": {
        synonyms: ["hideous", "unattractive", "unsightly", "homely", "plain", "grotesque"],
        antonyms: ["beautiful", "pretty", "attractive", "gorgeous", "lovely", "stunning"]
    },
    "smart": {
        synonyms: ["intelligent", "clever", "bright", "brilliant", "sharp", "wise", "brainy"],
        antonyms: ["stupid", "dumb", "foolish", "silly", "unintelligent", "witless"]
    },
    "stupid": {
        synonyms: ["dumb", "foolish", "silly", "unwise", "brainless", "idiotic"],
        antonyms: ["smart", "intelligent", "clever", "bright", "wise", "brilliant"]
    },
    "clean": {
        synonyms: ["pure", "tidy", "neat", "spotless", "sanitary", "stainless", "immaculate"],
        antonyms: ["dirty", "filthy", "messy", "soiled", "polluted", "stained"]
    },
    "dirty": {
        synonyms: ["filthy", "messy", "soiled", "unclean", "muddy", "stained", "grimy"],
        antonyms: ["clean", "pure", "tidy", "neat", "spotless", "immaculate"]
    },
    "strong": {
        synonyms: ["powerful", "mighty", "sturdy", "tough", "muscular", "robust", "resilient"],
        antonyms: ["weak", "fragile", "frail", "feeble", "powerless", "delicate"]
    },
    "weak": {
        synonyms: ["frail", "fragile", "feeble", "powerless", "delicate", "flimsy"],
        antonyms: ["strong", "powerful", "mighty", "sturdy", "robust"]
    },
    "cheap": {
        synonyms: ["inexpensive", "affordable", "low-cost", "economical", "budget", "reasonable"],
        antonyms: ["expensive", "costly", "pricey", "overpriced", "valuable", "exorbitant"]
    },
    "expensive": {
        synonyms: ["costly", "pricey", "high-priced", "valuable", "exorbitant", "steep"],
        antonyms: ["cheap", "inexpensive", "affordable", "economical", "budget"]
    },
    "important": {
        synonyms: ["crucial", "essential", "vital", "significant", "key", "critical", "major"],
        antonyms: ["unimportant", "trivial", "minor", "insignificant", "negligible"]
    },
    "interesting": {
        synonyms: ["fascinating", "engaging", "absorbing", "captivating", "intriguing", "compelling"],
        antonyms: ["boring", "dull", "uninteresting", "tedious", "monotonous"]
    },
    "boring": {
        synonyms: ["dull", "tedious", "tiresome", "monotonous", "unexciting", "drab"],
        antonyms: ["interesting", "fascinating", "exciting", "engaging", "absorbing"]
    },
    "bright": {
        synonyms: ["shining", "radiant", "luminous", "brilliant", "vivid", "sunny"],
        antonyms: ["dark", "dim", "dull", "gloomy", "shadowy", "murky"]
    },
    "dark": {
        synonyms: ["gloomy", "shadowy", "dim", "obscure", "black", "somber"],
        antonyms: ["bright", "light", "shining", "radiant", "luminous"]
    },
    "early": {
        synonyms: ["premature", "punctual", "ahead of time", "initial", "prompt"],
        antonyms: ["late", "delayed", "overdue", "tardy"]
    },
    "late": {
        synonyms: ["tardy", "delayed", "overdue", "behind time"],
        antonyms: ["early", "punctual", "prompt", "ahead of time"]
    },
    "safe": {
        synonyms: ["secure", "protected", "harmless", "sheltered", "sound"],
        antonyms: ["dangerous", "hazardous", "risky", "unsafe", "perilous"]
    },
    "dangerous": {
        synonyms: ["hazardous", "risky", "unsafe", "perilous", "treacherous"],
        antonyms: ["safe", "secure", "protected", "harmless"]
    },
    "true": {
        synonyms: ["correct", "accurate", "real", "genuine", "authentic", "factual"],
        antonyms: ["false", "untrue", "fake", "incorrect", "bogus", "spurious"]
    },
    "false": {
        synonyms: ["untrue", "fake", "incorrect", "counterfeit", "spurious", "bogus"],
        antonyms: ["true", "correct", "accurate", "real", "genuine", "factual"]
    },
    "correct": {
        synonyms: ["right", "accurate", "proper", "exact", "precise"],
        antonyms: ["wrong", "incorrect", "inaccurate", "improper", "erroneous"]
    },
    "wrong": {
        synonyms: ["incorrect", "inaccurate", "mistaken", "erroneous", "false", "faulty"],
        antonyms: ["correct", "right", "accurate", "proper", "exact"]
    },
    "loud": {
        synonyms: ["noisy", "clamorous", "deafening", "boisterous", "thunderous"],
        antonyms: ["quiet", "silent", "soft", "calm", "hushed"]
    },
    "quiet": {
        synonyms: ["silent", "soft", "calm", "peaceful", "tranquil", "serene", "hushed"],
        antonyms: ["loud", "noisy", "rowdy", "clamorous", "deafening"]
    },
    "heavy": {
        synonyms: ["weighty", "heft", "bulky", "burdensome", "dense"],
        antonyms: ["light", "weightless", "airy", "featherweight"]
    },
    "light": {
        synonyms: ["weightless", "airy", "bright", "luminous", "pale"],
        antonyms: ["heavy", "dark", "weighty", "burdensome"]
    },
    "full": {
        synonyms: ["packed", "filled", "loaded", "stuffed", "brimming", "crowded"],
        antonyms: ["empty", "vacant", "void", "bare", "blank"]
    },
    "empty": {
        synonyms: ["vacant", "hollow", "void", "bare", "blank", "depleted"],
        antonyms: ["full", "packed", "filled", "loaded", "crowded"]
    },
    "dry": {
        synonyms: ["arid", "parched", "dehydrated", "waterless", "barren"],
        antonyms: ["wet", "damp", "moist", "soaked", "humid"]
    },
    "wet": {
        synonyms: ["damp", "moist", "soaked", "humid", "waterlogged", "drenched"],
        antonyms: ["dry", "arid", "parched", "dehydrated"]
    },
    "brave": {
        synonyms: ["courageous", "fearless", "valiant", "bold", "heroic", "daring"],
        antonyms: ["cowardly", "timid", "fearful", "scared", "spineless"]
    },
    "cowardly": {
        synonyms: ["fearful", "timid", "scared", "spineless", "faint-hearted", "craven"],
        antonyms: ["brave", "courageous", "valiant", "bold", "heroic"]
    },
    "polite": {
        synonyms: ["courteous", "respectful", "civil", "well-mannered", "gentlemanly"],
        antonyms: ["rude", "impolite", "insolent", "discourteous", "disrespectful"]
    },
    "rude": {
        synonyms: ["impolite", "insolent", "discourteous", "disrespectful", "offensive"],
        antonyms: ["polite", "courteous", "respectful", "civil"]
    },
    "kind": {
        synonyms: ["caring", "gentle", "benevolent", "compassionate", "generous", "gracious"],
        antonyms: ["cruel", "mean", "harsh", "brutal", "heartless", "unkind"]
    },
    "cruel": {
        synonyms: ["mean", "brutal", "harsh", "ruthless", "heartless", "merciless"],
        antonyms: ["kind", "gentle", "benevolent", "compassionate", "merciful"]
    },
    "simple": {
        synonyms: ["easy", "plain", "basic", "uncomplicated", "elementary", "straightforward"],
        antonyms: ["complex", "complicated", "intricate", "elaborate", "sophisticated"]
    },
    "complex": {
        synonyms: ["complicated", "intricate", "elaborate", "sophisticated", "tangled"],
        antonyms: ["simple", "plain", "basic", "uncomplicated", "easy"]
    },
    "clear": {
        synonyms: ["obvious", "evident", "plain", "lucid", "transparent", "distinct"],
        antonyms: ["vague", "unclear", "obscure", "cloudy", "hazy", "murky"]
    },
    "vague": {
        synonyms: ["unclear", "obscure", "hazy", "fuzzy", "indistinct", "ambiguous"],
        antonyms: ["clear", "obvious", "precise", "distinct", "definite"]
    },
    "exact": {
        synonyms: ["precise", "accurate", "correct", "perfect", "strict"],
        antonyms: ["approximate", "rough", "inexact", "vague", "imprecise"]
    },
    "calm": {
        synonyms: ["peaceful", "tranquil", "serene", "relaxed", "composed", "placid"],
        antonyms: ["nervous", "anxious", "agitated", "stormy", "hectic", "turbulent"]
    },
    "nervous": {
        synonyms: ["anxious", "worried", "tense", "apprehensive", "jittery", "edgy"],
        antonyms: ["calm", "confident", "composed", "relaxed", "peaceful"]
    },
    "confident": {
        synonyms: ["assured", "certain", "bold", "positive", "secure"],
        antonyms: ["insecure", "nervous", "doubtful", "hesitant", "timid"]
    },
    "honest": {
        synonyms: ["truthful", "trustworthy", "sincere", "frank", "candid", "genuine"],
        antonyms: ["dishonest", "deceitful", "corrupt", "fraudulent", "untruthful"]
    },
    "dishonest": {
        synonyms: ["deceitful", "fraudulent", "crooked", "untruthful", "corrupt"],
        antonyms: ["honest", "truthful", "trustworthy", "sincere", "genuine"]
    },
    "patient": {
        synonyms: ["tolerant", "enduring", "persevering", "stoic", "forbearing"],
        antonyms: ["impatient", "hasty", "restless", "intolerant"]
    },
    "active": {
        synonyms: ["energetic", "dynamic", "lively", "vigorous", "busy"],
        antonyms: ["inactive", "passive", "lazy", "idle", "sluggish"]
    },
    "lazy": {
        synonyms: ["idle", "slothful", "indolent", "inactive", "inactive"],
        antonyms: ["diligent", "hardworking", "active", "industrious", "energetic"]
    },
    "healthy": {
        synonyms: ["fit", "well", "robust", "strong", "vigorous", "sound"],
        antonyms: ["sick", "ill", "unhealthy", "ailing", "diseased"]
    },
    "sick": {
        synonyms: ["ill", "unwell", "ailing", "diseased", "bedridden"],
        antonyms: ["healthy", "well", "fit", "robust", "sound"]
    },
    "wide": {
        synonyms: ["broad", "spacious", "extensive", "roomy", "vast"],
        antonyms: ["narrow", "constricted", "tight", "cramped"]
    },
    "narrow": {
        synonyms: ["constricted", "tight", "slender", "cramped", "confined"],
        antonyms: ["wide", "broad", "spacious", "extensive"]
    },
    "thick": {
        synonyms: ["dense", "heavy", "bulky", "stout", "deep"],
        antonyms: ["thin", "slim", "slender", "lean"]
    },
    "thin": {
        synonyms: ["slim", "slender", "lean", "skinny", "narrow"],
        antonyms: ["thick", "fat", "dense", "bulky", "stout"]
    },
    "sharp": {
        synonyms: ["pointed", "acute", "keen", "piercing", "cutting"],
        antonyms: ["blunt", "dull", "unsharpened"]
    },
    "dull": {
        synonyms: ["blunt", "boring", "drab", "tedious", "unsharpened"],
        antonyms: ["sharp", "bright", "interesting", "keen"]
    },
    "sweet": {
        synonyms: ["sugary", "honeyed", "pleasant", "delightful"],
        antonyms: ["sour", "bitter", "tart", "acidic"]
    },
    "sour": {
        synonyms: ["tart", "acidic", "acid", "bitter", "vinegary"],
        antonyms: ["sweet", "sugary", "pleasant"]
    },
    "fresh": {
        synonyms: ["crisp", "new", "pure", "clean", "refreshing"],
        antonyms: ["stale", "spoiled", "rotten", "old", "withered"]
    },

    // ==========================================
    // 2. ĐỘNG TỪ PHỔ BIẾN (VERBS)
    // ==========================================
    "go": {
        synonyms: ["travel", "move", "proceed", "depart", "journey", "advance", "walk", "wend"],
        antonyms: ["stay", "remain", "stop", "halt", "arrive"]
    },
    "come": {
        synonyms: ["arrive", "approach", "reach", "enter", "near"],
        antonyms: ["go", "leave", "depart", "vanish"]
    },
    "run": {
        synonyms: ["sprint", "dash", "jog", "race", "rush", "flee", "operate"],
        antonyms: ["walk", "crawl", "stop", "halt"]
    },
    "walk": {
        synonyms: ["stroll", "march", "tread", "amble", "pace", "step"],
        antonyms: ["run", "sprint", "stop", "halt"]
    },
    "make": {
        synonyms: ["produce", "create", "build", "form", "construct", "generate", "fabricate"],
        antonyms: ["destroy", "ruin", "demolish", "dismantle"]
    },
    "get": {
        synonyms: ["obtain", "acquire", "receive", "gain", "procure", "secure"],
        antonyms: ["give", "lose", "relinquish", "forfeit"]
    },
    "see": {
        synonyms: ["view", "look", "observe", "notice", "glance", "perceive", "witness"],
        antonyms: ["overlook", "ignore", "miss"]
    },
    "know": {
        synonyms: ["understand", "comprehend", "recognize", "realize", "perceive", "grasp"],
        antonyms: ["misunderstand", "doubt", "ignore"]
    },
    "think": {
        synonyms: ["believe", "consider", "ponder", "reflect", "contemplate", "reckon"],
        antonyms: ["disregard", "ignore", "forget"]
    },
    "tell": {
        synonyms: ["inform", "say", "speak", "narrate", "describe", "explain", "state"],
        antonyms: ["withhold", "conceal", "hide"]
    },
    "leave": {
        synonyms: ["depart", "vacate", "exit", "quit", "abandon", "withdraw"],
        antonyms: ["arrive", "stay", "remain", "enter"]
    },
    "stay": {
        synonyms: ["remain", "abide", "linger", "wait", "dwell"],
        antonyms: ["leave", "depart", "go", "move"]
    },
    "eat": {
        synonyms: ["consume", "devour", "dine", "ingest", "feed", "swallow"],
        antonyms: ["fast", "starve"]
    },
    "start": {
        synonyms: ["begin", "commence", "initiate", "launch", "open", "activate"],
        antonyms: ["finish", "end", "stop", "halt", "terminate", "conclude", "cease"]
    },
    "stop": {
        synonyms: ["halt", "cease", "pause", "terminate", "conclude", "end", "quit"],
        antonyms: ["start", "begin", "continue", "resume", "proceed"]
    },
    "continue": {
        synonyms: ["persist", "proceed", "carry on", "resume", "maintain", "pursue"],
        antonyms: ["stop", "halt", "cease", "quit", "pause", "abandon"]
    },
    "finish": {
        synonyms: ["complete", "end", "conclude", "finalize", "accomplish", "wrap up"],
        antonyms: ["start", "begin", "initiate", "commence"]
    },
    "create": {
        synonyms: ["make", "produce", "generate", "build", "invent", "establish", "form"],
        antonyms: ["destroy", "demolish", "ruin", "annihilate", "dismantle"]
    },
    "destroy": {
        synonyms: ["demolish", "ruin", "wreck", "smash", "annihilate", "devastate"],
        antonyms: ["create", "build", "construct", "repair", "restore", "produce"]
    },
    "build": {
        synonyms: ["construct", "erect", "assemble", "make", "develop", "fabricate"],
        antonyms: ["demolish", "destroy", "tear down", "dismantle", "wreck"]
    },
    "open": {
        synonyms: ["unlock", "unseal", "uncover", "launch", "initiate"],
        antonyms: ["close", "shut", "seal", "lock", "block"]
    },
    "close": {
        synonyms: ["shut", "seal", "lock", "conclude", "terminate"],
        antonyms: ["open", "unlock", "launch", "uncover"]
    },
    "buy": {
        synonyms: ["purchase", "acquire", "obtain", "get", "procure"],
        antonyms: ["sell", "vend", "market", "liquidate"]
    },
    "sell": {
        synonyms: ["vend", "market", "retail", "peddle", "trade"],
        antonyms: ["buy", "purchase", "acquire", "obtain"]
    },
    "give": {
        synonyms: ["provide", "offer", "grant", "donate", "hand", "present", "deliver"],
        antonyms: ["take", "receive", "accept", "keep", "withhold", "confiscate"]
    },
    "take": {
        synonyms: ["grab", "seize", "accept", "receive", "acquire", "capture"],
        antonyms: ["give", "offer", "provide", "return", "release", "drop"]
    },
    "send": {
        synonyms: ["dispatch", "transmit", "forward", "ship", "deliver", "convey"],
        antonyms: ["receive", "get", "accept", "keep", "collect"]
    },
    "receive": {
        synonyms: ["accept", "get", "obtain", "acquire", "collect"],
        antonyms: ["send", "dispatch", "give", "reject", "refuse"]
    },
    "find": {
        synonyms: ["discover", "locate", "uncover", "detect", "spot"],
        antonyms: ["lose", "misplace", "miss", "overlook"]
    },
    "lose": {
        synonyms: ["misplace", "forfeit", "drop", "concede"],
        antonyms: ["find", "win", "gain", "recover", "retain"]
    },
    "win": {
        synonyms: ["triumph", "prevail", "succeed", "conquer", "capture"],
        antonyms: ["lose", "fail", "surrender", "forfeit"]
    },
    "help": {
        synonyms: ["assist", "aid", "support", "serve", "collaborate", "relieve"],
        antonyms: ["hinder", "obstruct", "harm", "impede", "block"]
    },
    "love": {
        synonyms: ["adore", "cherish", "treasure", "fancy", "admire"],
        antonyms: ["hate", "loathe", "detest", "despise", "dislike"]
    },
    "hate": {
        synonyms: ["loathe", "detest", "despise", "abhor", "dislike"],
        antonyms: ["love", "adore", "cherish", "like", "admire"]
    },
    "like": {
        synonyms: ["enjoy", "appreciate", "fancy", "prefer", "admire"],
        antonyms: ["dislike", "hate", "detest", "loathe"]
    },
    "allow": {
        synonyms: ["permit", "authorize", "let", "approve", "sanction"],
        antonyms: ["forbid", "prohibit", "ban", "bar", "disallow"]
    },
    "forbid": {
        synonyms: ["prohibit", "ban", "bar", "outlaw", "veto"],
        antonyms: ["allow", "permit", "authorize", "let", "approve"]
    },
    "accept": {
        synonyms: ["embrace", "welcome", "approve", "acknowledge", "admit"],
        antonyms: ["reject", "refuse", "decline", "dismiss", "deny"]
    },
    "reject": {
        synonyms: ["refuse", "decline", "dismiss", "spurn", "turn down"],
        antonyms: ["accept", "embrace", "approve", "welcome"]
    },
    "remember": {
        synonyms: ["recall", "recollect", "reminisce", "retain"],
        antonyms: ["forget", "overlook", "ignore"]
    },
    "forget": {
        synonyms: ["overlook", "neglect", "disregard", "omit"],
        antonyms: ["remember", "recall", "recollect"]
    },
    "show": {
        synonyms: ["display", "reveal", "exhibit", "demonstrate", "present", "expose"],
        antonyms: ["hide", "conceal", "cover", "mask", "disguise"]
    },
    "hide": {
        synonyms: ["conceal", "cover", "mask", "veil", "disguise"],
        antonyms: ["show", "reveal", "display", "exhibit", "expose"]
    },
    "break": {
        synonyms: ["shatter", "fracture", "smash", "damage", "crack", "ruin"],
        antonyms: ["fix", "repair", "mend", "restore", "join"]
    },
    "fix": {
        synonyms: ["repair", "mend", "restore", "patch", "correct", "cure"],
        antonyms: ["break", "damage", "ruin", "destroy", "wreck"]
    },
    "teach": {
        synonyms: ["instruct", "educate", "train", "tutor", "guide", "lecture"],
        antonyms: ["learn", "study"]
    },
    "learn": {
        synonyms: ["study", "master", "acquire", "absorb", "grasp"],
        antonyms: ["teach", "instruct", "forget"]
    },
    "ask": {
        synonyms: ["inquire", "query", "question", "request", "demand"],
        antonyms: ["answer", "reply", "respond"]
    },
    "answer": {
        synonyms: ["reply", "respond", "retort", "counter"],
        antonyms: ["ask", "inquire", "question"]
    },
    "increase": {
        synonyms: ["boost", "raise", "grow", "expand", "enhance", "multiply"],
        antonyms: ["decrease", "reduce", "lower", "diminish", "curb", "lessen"]
    },
    "decrease": {
        synonyms: ["reduce", "lower", "diminish", "lessen", "cut", "curb"],
        antonyms: ["increase", "boost", "raise", "grow", "expand"]
    },
    "succeed": {
        synonyms: ["prosper", "triumph", "flourish", "accomplish", "achieve"],
        antonyms: ["fail", "flounder", "collapse", "lose"]
    },
    "fail": {
        synonyms: ["flop", "flounder", "collapse", "miss", "crumble"],
        antonyms: ["succeed", "prosper", "triumph", "achieve", "pass"]
    },
    "push": {
        synonyms: ["shove", "thrust", "propel", "press", "drive"],
        antonyms: ["pull", "drag", "haul", "tug"]
    },
    "pull": {
        synonyms: ["drag", "haul", "tug", "draw", "yank"],
        antonyms: ["push", "shove", "thrust", "press"]
    },
    "lead": {
        synonyms: ["guide", "direct", "command", "conduct", "head"],
        antonyms: ["follow", "trail", "obey"]
    },
    "follow": {
        synonyms: ["trail", "pursue", "obey", "shadow", "heed"],
        antonyms: ["lead", "guide", "direct", "head"]
    },
    "agree": {
        synonyms: ["concur", "consent", "accede", "settle", "harmonize"],
        antonyms: ["disagree", "differ", "dissent", "object", "dispute"]
    },
    "disagree": {
        synonyms: ["differ", "dissent", "object", "dispute", "clash"],
        antonyms: ["agree", "concur", "consent"]
    },
    "understand": {
        synonyms: ["comprehend", "grasp", "fathom", "perceive", "see"],
        antonyms: ["misunderstand", "misinterpret", "mistake"]
    },
    "live": {
        synonyms: ["exist", "reside", "survive", "dwell", "thrive"],
        antonyms: ["die", "perish", "expire"]
    },
    "die": {
        synonyms: ["perish", "expire", "pass away", "succumb"],
        antonyms: ["live", "exist", "survive"]
    },
    "protect": {
        synonyms: ["defend", "guard", "shield", "safeguard", "shelter"],
        antonyms: ["attack", "harm", "endanger", "assault"]
    },
    "attack": {
        synonyms: ["assault", "strike", "raid", "charge", "invade"],
        antonyms: ["defend", "protect", "shield", "guard"]
    },

    // ==========================================
    // 3. DANH TỪ CỐT LÕI (NOUNS & CONCEPTS)
    // ==========================================
    "class": {
        synonyms: ["course", "lesson", "grade", "category", "group", "lecture", "rank", "classification"],
        antonyms: []
    },
    "course": {
        synonyms: ["class", "curriculum", "program", "series", "route", "direction"],
        antonyms: []
    },
    "lesson": {
        synonyms: ["class", "lecture", "tutorial", "instruction", "session", "exercise"],
        antonyms: []
    },
    "student": {
        synonyms: ["pupil", "learner", "scholar", "undergraduate", "disciple"],
        antonyms: ["teacher", "instructor", "tutor", "professor"]
    },
    "teacher": {
        synonyms: ["instructor", "educator", "tutor", "professor", "mentor", "lecturer"],
        antonyms: ["student", "pupil", "learner"]
    },
    "school": {
        synonyms: ["academy", "institution", "college", "university", "faculty"],
        antonyms: []
    },
    "job": {
        synonyms: ["work", "career", "profession", "occupation", "position", "employment", "vocation"],
        antonyms: ["unemployment", "retirement", "leisure"]
    },
    "work": {
        synonyms: ["job", "labor", "task", "employment", "effort", "occupation"],
        antonyms: ["rest", "leisure", "play", "idleness"]
    },
    "money": {
        synonyms: ["cash", "currency", "funds", "capital", "wealth", "revenue"],
        antonyms: ["debt", "poverty"]
    },
    "problem": {
        synonyms: ["issue", "difficulty", "trouble", "obstacle", "dilemma", "crisis"],
        antonyms: ["solution", "answer", "resolution", "advantage"]
    },
    "solution": {
        synonyms: ["answer", "resolution", "key", "remedy", "cure"],
        antonyms: ["problem", "issue", "obstacle", "dilemma"]
    },
    "advantage": {
        synonyms: ["benefit", "gain", "perk", "edge", "asset", "plus"],
        antonyms: ["disadvantage", "drawback", "handicap", "downside", "minus"]
    },
    "disadvantage": {
        synonyms: ["drawback", "downside", "handicap", "shortcoming", "weakness"],
        antonyms: ["advantage", "benefit", "asset", "plus"]
    },
    "peace": {
        synonyms: ["harmony", "tranquility", "serenity", "calm", "order"],
        antonyms: ["war", "conflict", "turmoil", "chaos", "violence"]
    },
    "war": {
        synonyms: ["conflict", "battle", "combat", "hostility", "strife"],
        antonyms: ["peace", "harmony", "truce", "armistice"]
    },
    "friend": {
        synonyms: ["companion", "pal", "buddy", "comrade", "ally", "mate"],
        antonyms: ["enemy", "foe", "rival", "opponent", "adversary"]
    },
    "enemy": {
        synonyms: ["foe", "rival", "opponent", "adversary", "nemesis"],
        antonyms: ["friend", "ally", "companion", "partner"]
    },
    "courage": {
        synonyms: ["bravery", "valor", "fearlessness", "guts", "boldness"],
        antonyms: ["cowardice", "fear", "timidity"]
    },
    "wealth": {
        synonyms: ["fortune", "riches", "affluence", "prosperity", "capital"],
        antonyms: ["poverty", "destitution", "indigence"]
    },
    "poverty": {
        synonyms: ["destitution", "privation", "neediness", "deprivation"],
        antonyms: ["wealth", "riches", "affluence", "prosperity"]
    },
    "truth": {
        synonyms: ["fact", "reality", "veracity", "certainty", "accuracy"],
        antonyms: ["lie", "falsehood", "myth", "deception"]
    },
    "lie": {
        synonyms: ["falsehood", "untruth", "fabrication", "fib", "deception"],
        antonyms: ["truth", "fact", "reality"]
    },
    "success": {
        synonyms: ["triumph", "achievement", "victory", "accomplishment", "prospering"],
        antonyms: ["failure", "defeat", "flop", "collapse"]
    },
    "failure": {
        synonyms: ["defeat", "flop", "collapse", "breakdown", "disaster"],
        antonyms: ["success", "triumph", "victory", "achievement"]
    }
};

// Cấu trúc chỉ mục 2 chiều mở rộng (Bidirectional Inverted Thesaurus Index)
const EXPANDED_INDEX = new Map<string, { synonyms: Set<string>; antonyms: Set<string> }>();

function buildExpandedIndex(): void {
    if (EXPANDED_INDEX.size > 0) return;

    // Bước 1: Nạp trực tiếp và tạo liên kết 2 chiều cơ bản
    for (const [headword, data] of Object.entries(THESAURUS_MAP)) {
        const key = headword.toLowerCase().trim();
        if (!EXPANDED_INDEX.has(key)) {
            EXPANDED_INDEX.set(key, { synonyms: new Set(), antonyms: new Set() });
        }
        const entry = EXPANDED_INDEX.get(key)!;

        for (const s of data.synonyms || []) {
            const cleanS = s.toLowerCase().trim();
            if (cleanS && cleanS !== key) {
                entry.synonyms.add(cleanS);
                if (!EXPANDED_INDEX.has(cleanS)) {
                    EXPANDED_INDEX.set(cleanS, { synonyms: new Set(), antonyms: new Set() });
                }
                EXPANDED_INDEX.get(cleanS)!.synonyms.add(key);
            }
        }

        for (const a of data.antonyms || []) {
            const cleanA = a.toLowerCase().trim();
            if (cleanA && cleanA !== key) {
                entry.antonyms.add(cleanA);
                if (!EXPANDED_INDEX.has(cleanA)) {
                    EXPANDED_INDEX.set(cleanA, { synonyms: new Set(), antonyms: new Set() });
                }
                EXPANDED_INDEX.get(cleanA)!.antonyms.add(key);
            }
        }
    }

    // Bước 2: Kế thừa từ đồng nghĩa cùng nhóm (Sibling synonyms)
    for (const [headword, data] of Object.entries(THESAURUS_MAP)) {
        const synList = data.synonyms || [];
        for (const s of synList) {
            const cleanS = s.toLowerCase().trim();
            const sEntry = EXPANDED_INDEX.get(cleanS);
            if (sEntry) {
                for (const sibling of synList) {
                    const cleanSib = sibling.toLowerCase().trim();
                    if (cleanSib !== cleanS) {
                        sEntry.synonyms.add(cleanSib);
                    }
                }
            }
        }
    }

    // Bước 3: Kế thừa từ trái nghĩa cho các từ đồng nghĩa cùng nhóm
    // (Nếu 'splendid' là đồng nghĩa của 'good', thì 'splendid' cũng nhận các từ trái nghĩa của 'good')
    for (const [headword, data] of Object.entries(THESAURUS_MAP)) {
        if (data.antonyms && data.antonyms.length > 0) {
            const synList = data.synonyms || [];
            for (const s of synList) {
                const cleanS = s.toLowerCase().trim();
                const sEntry = EXPANDED_INDEX.get(cleanS);
                if (sEntry) {
                    for (const a of data.antonyms) {
                        const cleanA = a.toLowerCase().trim();
                        if (cleanA !== cleanS && !sEntry.synonyms.has(cleanA)) {
                            sEntry.antonyms.add(cleanA);
                        }
                    }
                }
            }
        }
    }
}

// Khởi tạo chỉ mục ngay khi module được import
buildExpandedIndex();

/**
 * Tra cứu danh sách Đồng nghĩa & Trái nghĩa dạng quan hệ (DictionaryRelation[]) cho một từ tiếng Anh
 * Hỗ trợ tự động phân giải qua từ gốc (lemma) nếu từ nhập vào là dạng chia (như happier -> happy, went -> go, classes -> class...)
 */
export function getSynonymsAndAntonyms(wordText: string): DictionaryRelation[] {
    const clean = wordText.trim().toLowerCase();
    const relations: DictionaryRelation[] = [];
    const seen = new Set<string>();

    buildExpandedIndex();

    let entry = EXPANDED_INDEX.get(clean);

    // Nếu không tìm thấy trực tiếp, thử tra theo dạng từ gốc (lemma)
    if (!entry || (entry.synonyms.size === 0 && entry.antonyms.size === 0)) {
        const lemmas = getLemmas(clean);
        for (const item of lemmas) {
            const lemmaClean = item.lemma.toLowerCase().trim();
            if (EXPANDED_INDEX.has(lemmaClean)) {
                entry = EXPANDED_INDEX.get(lemmaClean);
                break;
            }
        }
    }

    if (entry) {
        // Đồng nghĩa (Synonyms)
        for (const syn of entry.synonyms) {
            const key = `Đồng nghĩa:${syn.toLowerCase()}`;
            if (!seen.has(key) && syn.toLowerCase() !== clean) {
                seen.add(key);
                relations.push({
                    related_word: syn,
                    relation_type: "Đồng nghĩa"
                });
            }
        }

        // Trái nghĩa (Antonyms)
        for (const ant of entry.antonyms) {
            const key = `Trái nghĩa:${ant.toLowerCase()}`;
            if (!seen.has(key) && ant.toLowerCase() !== clean) {
                seen.add(key);
                relations.push({
                    related_word: ant,
                    relation_type: "Trái nghĩa"
                });
            }
        }
    }

    return relations;
}

/**
 * Lấy cấu trúc WordThesaurus { synonyms, antonyms } cho một từ tiếng Anh
 */
export function getThesaurusEntry(wordText: string): WordThesaurus | null {
    const clean = wordText.trim().toLowerCase();
    buildExpandedIndex();

    let entry = EXPANDED_INDEX.get(clean);
    if (!entry || (entry.synonyms.size === 0 && entry.antonyms.size === 0)) {
        const lemmas = getLemmas(clean);
        for (const item of lemmas) {
            const lemmaClean = item.lemma.toLowerCase().trim();
            if (EXPANDED_INDEX.has(lemmaClean)) {
                entry = EXPANDED_INDEX.get(lemmaClean);
                break;
            }
        }
    }

    if (!entry || (entry.synonyms.size === 0 && entry.antonyms.size === 0)) {
        return null;
    }

    return {
        synonyms: Array.from(entry.synonyms).filter(s => s !== clean),
        antonyms: Array.from(entry.antonyms).filter(a => a !== clean)
    };
}

/**
 * Lấy danh sách từ đồng nghĩa thuần mảng chuỗi
 */
export function getSynonymsList(wordText: string): string[] {
    const entry = getThesaurusEntry(wordText);
    return entry ? entry.synonyms : [];
}

/**
 * Lấy danh sách từ trái nghĩa thuần mảng chuỗi
 */
export function getAntonymsList(wordText: string): string[] {
    const entry = getThesaurusEntry(wordText);
    return entry ? entry.antonyms : [];
}
