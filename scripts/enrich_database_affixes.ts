import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
console.log(`[AFFIXES] Opening database at ${dbPath}...`);
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// 1. DỌN SẠCH CÁC TỪ MA (0 ĐỊNH NGHĨA) TRONG BẢNG WORDS
console.log('[CLEANUP] Deleting ghost words with 0 definitions, 0 pronunciations, 0 translations, 0 relations...');
const delGhosts = db.prepare(`
    DELETE FROM words 
    WHERE id NOT IN (SELECT word_id FROM word_definitions)
      AND id NOT IN (SELECT word_id FROM pronunciations)
      AND id NOT IN (SELECT word_id FROM translations)
      AND id NOT IN (SELECT word_id FROM word_relations)
`).run();
console.log(`[CLEANUP] Deleted ${delGhosts.changes} dead ghost words from words table.`);

// 2. NẠP QUAN HỆ HẬU TỐ VÀ TIỀN TỐ CHO TOÀN BỘ TỪ TIẾNG ANH
console.log('[ENRICH] Loading English words into memory for morphological suffix analysis...');
const enWords = db.prepare("SELECT id, word FROM words WHERE lang_code = 'en'").all() as { id: number; word: string }[];
const wordMap = new Map<string, number>();
for (const w of enWords) {
    wordMap.set(w.word.toLowerCase(), w.id);
}
console.log(`[ENRICH] Loaded ${wordMap.size} English words.`);

// Load existing relations to avoid duplicate checks
const existingRels = new Set<string>();
const relRows = db.prepare("SELECT word_id, related_word, relation_type FROM word_relations").all() as { word_id: number; related_word: string; relation_type: string }[];
for (const r of relRows) {
    existingRels.add(`${r.word_id}_${r.related_word.toLowerCase()}_${r.relation_type}`);
}
console.log(`[ENRICH] Loaded ${existingRels.size} existing relations.`);

function getPossibleRoots(word: string): string[] {
    const w = word.toLowerCase();
    const roots: string[] = [];

    // 1. -ness (happiness -> happy, kindness -> kind, darkness -> dark)
    if (w.endsWith('ness') && w.length > 5) {
        const base = w.slice(0, -4);
        if (base.endsWith('i')) roots.push(base.slice(0, -1) + 'y');
        roots.push(base);
    }

    // 2. -ful (hopeful -> hope, beautiful -> beauty, useful -> use)
    if (w.endsWith('ful') && w.length > 4) {
        const base = w.slice(0, -3);
        if (base.endsWith('i')) roots.push(base.slice(0, -1) + 'y');
        roots.push(base);
    }

    // 3. -less (hopeless -> hope, careless -> care, useless -> use)
    if (w.endsWith('less') && w.length > 5) {
        const base = w.slice(0, -4);
        if (base.endsWith('i')) roots.push(base.slice(0, -1) + 'y');
        roots.push(base);
    }

    // 4. -able / -ible (readable -> read, comfortable -> comfort, enjoyable -> enjoy, lovable -> love)
    if (w.endsWith('able') && w.length > 5) {
        const base = w.slice(0, -4);
        if (base.endsWith('i')) roots.push(base.slice(0, -1) + 'y');
        roots.push(base);
        roots.push(base + 'e');
    } else if (w.endsWith('ible') && w.length > 5) {
        const base = w.slice(0, -4);
        roots.push(base);
        roots.push(base + 'e');
    }

    // 5. -ment (development -> develop, movement -> move, agreement -> agree)
    if (w.endsWith('ment') && w.length > 5) {
        const base = w.slice(0, -4);
        roots.push(base);
        if (base.endsWith('i')) roots.push(base.slice(0, -1) + 'y');
    }

    // 6. -tion / -sion / -ation
    if (w.endsWith('sion') && w.length > 5) {
        roots.push(w.slice(0, -4) + 'de'); // decision -> decide, conclusion -> conclude
        roots.push(w.slice(0, -4) + 'd');
        roots.push(w.slice(0, -4) + 't');
    }
    if (w.endsWith('ation') && w.length > 6) {
        roots.push(w.slice(0, -5)); // inform
        roots.push(w.slice(0, -5) + 'e'); // imagine
    }
    if (w.endsWith('ion') && w.length > 4) {
        roots.push(w.slice(0, -3)); // act, direct, connect, collect, protect
        roots.push(w.slice(0, -3) + 'e'); // create, celebrate, translate, educate
    }

    // 7. -er / -or (teacher -> teach, driver -> drive, actor -> act, runner -> run)
    if (w.endsWith('er') && w.length > 4) {
        const base = w.slice(0, -2);
        if (base.length >= 3 && base[base.length - 1] === base[base.length - 2] && !/[aeiouy]/.test(base[base.length - 1])) {
            roots.push(base.slice(0, -1)); // runner -> run, winner -> win
        }
        roots.push(base);
        roots.push(base + 'e');
        if (base.endsWith('i')) roots.push(base.slice(0, -1) + 'y');
    } else if (w.endsWith('or') && w.length > 4) {
        const base = w.slice(0, -2);
        if (base.length >= 3 && base[base.length - 1] === base[base.length - 2] && !/[aeiouy]/.test(base[base.length - 1])) {
            roots.push(base.slice(0, -1));
        }
        roots.push(base);
        roots.push(base + 'e');
        roots.push(base + 't');
    }

    // 8. -ly / -ily (quickly -> quick, happily -> happy, badly -> bad)
    if (w.endsWith('ily') && w.length > 4) {
        roots.push(w.slice(0, -3) + 'y');
    } else if (w.endsWith('ly') && w.length > 3) {
        roots.push(w.slice(0, -2));
    }

    // 9. Prefixes: un-, dis-, im-, in-, il-, ir-, non-, mis-, re-, over-, under-
    const prefixRules: RegExp[] = [
        /^un([a-z]{3,})$/,
        /^dis([a-z]{3,})$/,
        /^(?:im|in|il|ir)([a-z]{3,})$/,
        /^non\-?([a-z]{3,})$/,
        /^mis([a-z]{3,})$/,
        /^re([a-z]{3,})$/,
        /^over([a-z]{3,})$/,
        /^under([a-z]{3,})$/
    ];
    for (const rule of prefixRules) {
        const m = w.match(rule);
        if (m) {
            roots.push(m[1]);
        }
    }

    return roots.filter(r => r.length >= 3 && r !== w && wordMap.has(r));
}

const insertRelStmt = db.prepare('INSERT OR IGNORE INTO word_relations (word_id, related_word, relation_type) VALUES (?, ?, ?)');

let addedG = 0;
let addedD = 0;

const runEnrichment = db.transaction(() => {
    for (const [w, id] of wordMap.entries()) {
        const possibleRoots = getPossibleRoots(w);
        if (possibleRoots.length > 0) {
            const root = possibleRoots[0]; // best candidate
            const rootId = wordMap.get(root)!;

            // 1. Add Gốc từ 'g' for the derived word: w -> root
            const gKey = `${id}_${root}_g`;
            if (!existingRels.has(gKey)) {
                insertRelStmt.run(id, root, 'g');
                existingRels.add(gKey);
                addedG++;
            }

            // 2. Add Từ phái sinh 'd' for the root word: root -> w
            const dKey = `${rootId}_${w}_d`;
            if (!existingRels.has(dKey)) {
                insertRelStmt.run(rootId, w, 'd');
                existingRels.add(dKey);
                addedD++;
            }
        }
    }
});

runEnrichment();
console.log(`[ENRICH] Successfully added ${addedG} 'g' (Gốc từ) relations and ${addedD} 'd' (Từ phái sinh) relations!`);

// 3. CHECKPOINT WAL
console.log('[CHECKPOINT] Checkpointing WAL to main database...');
db.pragma('wal_checkpoint(TRUNCATE)');
console.log('[COMPLETE] All database enrichments and cleanups completed successfully.');

