import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
const bakPath = path.join(process.cwd(), 'lib', 'dictionary.db.bak');

console.log('===============================================================');
console.log('🛠️ BẮT ĐẦU SỬA CHỮA TOÀN DIỆN CƠ SỞ DỮ LIỆU TỪ ĐIỂN');
console.log('===============================================================\n');

// 1. Sao lưu database
console.log(`[1/5] Sao lưu database từ ${dbPath} sang ${bakPath}...`);
fs.copyFileSync(dbPath, bakPath);
console.log('      Sao lưu thành công!\n');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

const transaction = db.transaction(() => {
    // =========================================================================
    // PHẦN 1: SỬA LỖI VÀ CHUẨN HOÁ PHIÊN ÂM (PRONUNCIATIONS)
    // =========================================================================
    console.log('[2/5] Đang xử lý phiên âm (Pronunciations)...');

    // 1.1. Sửa từ 'eye' phiên âm cũ 'ī' -> '/aɪ/'
    const eyeRes = db.prepare(`
        UPDATE pronunciations 
        SET ipa = '/aɪ/' 
        WHERE ipa = 'ī' AND word_id IN (SELECT id FROM words WHERE word = 'eye' AND lang_code = 'en')
    `).run();
    console.log(`      - Đã sửa phiên âm 'eye': ${eyeRes.changes} hàng.`);

    // 1.2. Xóa các IPA rỗng // hoặc [] hoặc dị dạng
    const delEmptyIpa = db.prepare(`
        DELETE FROM pronunciations 
        WHERE trim(ipa) IN ('//', '[]', '/', '[-] ', 'nan', 'undefined', 'null')
    `).run();
    console.log(`      - Đã xóa IPA rác/rỗng (//, []): ${delEmptyIpa.changes} hàng.`);

    // 1.3. Cập nhật phiên âm chuẩn cho các từ bị mất do xóa IPA rỗng
    const wordsToUpdateIpa: Record<string, { us: string; uk: string }> = {
        'coherent': { us: '/koʊˈhɪr.ənt/', uk: '/kəʊˈhɪə.rənt/' },
        'soi-disant': { us: '/ˌswɑː.diːˈzɑːŋ/', uk: '/ˌswɑː.diːˈzɑːŋ/' },
        'shilly-shallyer': { us: '/ˌʃɪl.iˈʃæl.i.ər/', uk: '/ˌʃɪl.iˈʃæl.i.ər/' },
        'his': { us: '/hɪz/', uk: '/hɪz/' },
        'my': { us: '/maɪ/', uk: '/maɪ/' },
        'who': { us: '/huː/', uk: '/huː/' },
        'which': { us: '/wɪtʃ/', uk: '/wɪtʃ/' },
        'only': { us: '/ˈoʊn.li/', uk: '/ˈəʊn.li/' }
    };

    const insertPron = db.prepare(`
        INSERT OR REPLACE INTO pronunciations (word_id, ipa, region)
        VALUES (?, ?, ?)
    `);
    const getEnWordId = db.prepare(`SELECT id FROM words WHERE word = ? AND lang_code = 'en' LIMIT 1`);

    for (const [w, prons] of Object.entries(wordsToUpdateIpa)) {
        const row = getEnWordId.get(w) as { id: number } | undefined;
        if (row) {
            insertPron.run(row.id, prons.us, 'US');
            insertPron.run(row.id, prons.uk, 'UK');
        }
    }
    console.log(`      - Đã bổ sung/cập nhật phiên âm US/UK cho: ${Object.keys(wordsToUpdateIpa).join(', ')}.`);

    // 1.4. Chuẩn hóa bọc dấu gạch chéo /.../ cho các từ tiếng Anh chưa có dấu bọc
    console.log('      - Đang chuẩn hóa bọc dấu /.../ cho các từ tiếng Anh...');
    const unbracketed = db.prepare(`
        SELECT p.id, p.word_id, p.ipa, p.region 
        FROM pronunciations p 
        JOIN words w ON p.word_id = w.id 
        WHERE w.lang_code = 'en' 
          AND p.ipa NOT LIKE '/%/' 
          AND p.ipa NOT LIKE '[%]' 
          AND length(trim(p.ipa)) > 0
    `).all() as { id: number; word_id: number; ipa: string; region: string | null }[];

    const checkPronExists = db.prepare(`
        SELECT id FROM pronunciations 
        WHERE word_id = ? AND ipa = ? AND (region = ? OR (region IS NULL AND ? IS NULL))
    `);
    const updatePronIpa = db.prepare('UPDATE pronunciations SET ipa = ? WHERE id = ?');
    const deletePron = db.prepare('DELETE FROM pronunciations WHERE id = ?');

    let wrappedCount = 0;
    let deletedDupePron = 0;

    for (const row of unbracketed) {
        const wrapped = '/' + row.ipa.trim() + '/';
        const exists = checkPronExists.get(row.word_id, wrapped, row.region, row.region) as { id: number } | undefined;
        if (exists && exists.id !== row.id) {
            deletePron.run(row.id);
            deletedDupePron++;
        } else {
            updatePronIpa.run(wrapped, row.id);
            wrappedCount++;
        }
    }
    console.log(`      - Đã bọc dấu /.../: ${wrappedCount} hàng, xóa trùng lặp: ${deletedDupePron} hàng.\n`);

    // =========================================================================
    // PHẦN 2: DỌN DẸP ĐỊNH NGHĨA RÁC (DEFINITIONS)
    // =========================================================================
    console.log('[3/5] Đang dọn dẹp định nghĩa rác (Definitions)...');

    // 2.1. Xóa liên kết các định nghĩa rác (: hoặc .) khỏi word_definitions
    const delJunkWordDefs = db.prepare(`
        DELETE FROM word_definitions 
        WHERE definition_id IN (
            SELECT id FROM definitions 
            WHERE trim(definition) IN (':', '.', '-', '--', '...', 't', 'Ở', '')
        )
    `).run();
    console.log(`      - Đã xóa liên kết định nghĩa rác trong word_definitions: ${delJunkWordDefs.changes} hàng.`);

    // 2.2. Xóa các định nghĩa mồ côi khỏi definitions
    const delOrphanDefs = db.prepare(`
        DELETE FROM definitions 
        WHERE id NOT IN (SELECT DISTINCT definition_id FROM word_definitions)
    `).run();
    console.log(`      - Đã xóa định nghĩa mồ côi trong definitions: ${delOrphanDefs.changes} hàng.\n`);

    // =========================================================================
    // PHẦN 3: SỬA VÒNG LẶP VÀ LÀM SẠCH QUAN HỆ TỪ (WORD RELATIONS)
    // =========================================================================
    console.log('[4/5] Đang sửa vòng lặp và làm sạch quan hệ từ gốc (Word Relations)...');

    // 3.1. Sửa quan hệ package ↔ packager: xóa package -> g -> packager
    const delPackageG = db.prepare(`
        DELETE FROM word_relations 
        WHERE word_id IN (SELECT id FROM words WHERE word = 'package' AND lang_code = 'en')
          AND related_word = 'packager' 
          AND relation_type = 'g'
    `).run();
    console.log(`      - Đã xóa quan hệ ngược package -> g -> packager: ${delPackageG.changes} hàng.`);

    // 3.2. Sửa metropolis ↔ metropoli: xóa metropolis -> g -> metropoli
    const delMetropolisG = db.prepare(`
        DELETE FROM word_relations 
        WHERE word_id IN (SELECT id FROM words WHERE word = 'metropolis')
          AND related_word = 'metropoli' 
          AND relation_type = 'g'
    `).run();
    console.log(`      - Đã xóa quan hệ ngược metropolis -> g -> metropoli: ${delMetropolisG.changes} hàng.`);

    // 3.3. Sửa các cặp biến thể chính tả tiếng Việt (dõi ↔ rõi, ăn quịt ↔ ăn quỵt, bỏ sót ↔ bỏ xót):
    // Xóa quan hệ g và d sai, thay bằng quan hệ 's' (Đồng nghĩa/biến thể)
    const spellingVariantPairs = [
        ['dõi', 'rõi'],
        ['ăn quịt', 'ăn quỵt'],
        ['bỏ sót', 'bỏ xót']
    ];

    const getViWord = db.prepare("SELECT id FROM words WHERE word = ? AND lang_code = 'vi' LIMIT 1");
    const insertRel = db.prepare("INSERT OR IGNORE INTO word_relations (word_id, related_word, relation_type) VALUES (?, ?, ?)");
    const deleteRelSpecific = db.prepare("DELETE FROM word_relations WHERE word_id = ? AND related_word = ? AND relation_type IN ('g', 'd')");

    for (const [w1, w2] of spellingVariantPairs) {
        const id1 = (getViWord.get(w1) as { id: number } | undefined)?.id;
        const id2 = (getViWord.get(w2) as { id: number } | undefined)?.id;
        if (id1 && id2) {
            deleteRelSpecific.run(id1, w2);
            deleteRelSpecific.run(id2, w1);
            insertRel.run(id1, w2, 's');
            insertRel.run(id2, w1, 's');
            console.log(`      - Đã chuyển cặp biến thể '${w1}' ↔ '${w2}' sang quan hệ đồng nghĩa/biến thể ('s').`);
        }
    }

    // 3.4. Làm sạch 786 quan hệ tiếng Anh bị lẫn chú thích tiếng Việt và dấu #
    console.log('      - Đang quét và làm sạch trường related_word bị lẫn chú thích tiếng Việt...');
    const dirtyEnRels = db.prepare(`
        SELECT wr.id, wr.word_id, wr.relation_type, wr.related_word 
        FROM word_relations wr 
        JOIN words w ON wr.word_id = w.id 
        WHERE w.lang_code = 'en' 
          AND (
            wr.related_word LIKE '%#%' 
            OR wr.related_word GLOB '*[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]*'
          )
    `).all() as { id: number; word_id: number; relation_type: string; related_word: string }[];

    console.log(`        Tìm thấy ${dirtyEnRels.length} hàng quan hệ cần làm sạch.`);

    // Hàm làm sạch chuỗi
    function cleanRelatedWord(raw: string): string {
        let cleaned = raw;

        // Bỏ phần sau dấu # (ví dụ wind#Ngoại động từ 2 -> wind)
        if (cleaned.includes('#')) {
            cleaned = cleaned.split('#')[0].trim();
        }

        // Bỏ phần sau gạch ngang dài em-dash hoặc en-dash (ví dụ coup d'état—một cuộc đảo chính -> coup d'état)
        if (cleaned.includes('—')) {
            cleaned = cleaned.split('—')[0].trim();
        }
        if (cleaned.includes(' - ')) {
            cleaned = cleaned.split(' - ')[0].trim();
        }

        // Nếu bắt đầu bằng "từ " (ví dụ "từ good game" -> "good game")
        if (cleaned.startsWith('từ ')) {
            cleaned = cleaned.substring(3).trim();
        }

        // Loại bỏ các từ chú thích tiếng Việt phổ biến ở cuối:
        // tham chiếu, về hưu, trở về, trung đoàn, đã đăng ký, quân cảnh, không lực Hoàng gia, giờ chuẩn..., số lượng, khổ bốn, đồng pezơta
        const vnAnnotationPatterns = [
            /\s+tham chiếu$/i,
            /\s+về hưu$/i,
            /\s+trở về$/i,
            /\s+trung đoàn$/i,
            /\s+đã đăng ký$/i,
            /\s+quân cảnh$/i,
            /\s+cảnh sát cưỡi ngựa$/i,
            /\s+không lực Hoàng gia$/i,
            /\s+nghị sự quốc hội Anh$/i,
            /\s+giờ chuẩn.*$/i,
            /\s+số lượng$/i,
            /\s+khổ bốn$/i,
            /\s+đồng pezơta$/i,
            /\s+nghị viên quốc hội$/i,
            /\s+trưởng ty cảnh sát$/i,
            /\s+bảo vệ quân sự$/i,
            /\s+tổng hành dinh$/i,
            /\s+viết tắt.*$/i
        ];

        for (const pat of vnAnnotationPatterns) {
            cleaned = cleaned.replace(pat, '').trim();
        }

        // Nếu chuỗi hoàn toàn là tiếng Việt không có chữ tiếng Anh (ví dụ "Tổ chức sở hữu trí tuệ"), giữ nguyên hoặc xử lý đặc biệt
        return cleaned.trim();
    }

    const updateRelStmt = db.prepare('UPDATE word_relations SET related_word = ? WHERE id = ?');
    const deleteRelStmt = db.prepare('DELETE FROM word_relations WHERE id = ?');
    const checkExistsStmt = db.prepare('SELECT id FROM word_relations WHERE word_id = ? AND related_word = ? AND relation_type = ? LIMIT 1');

    let cleanedCount = 0;
    let deletedDupeCount = 0;

    for (const item of dirtyEnRels) {
        const cleaned = cleanRelatedWord(item.related_word);

        if (!cleaned || cleaned === item.related_word) {
            // Nếu không thay đổi hoặc chuỗi rỗng
            if (!cleaned) {
                deleteRelStmt.run(item.id);
                cleanedCount++;
            }
            continue;
        }

        // Kiểm tra xem sau khi làm sạch có bị trùng hàng đã tồn tại không
        const existing = checkExistsStmt.get(item.word_id, cleaned, item.relation_type) as { id: number } | undefined;
        if (existing && existing.id !== item.id) {
            // Đã có hàng này rồi -> Xóa hàng bẩn để tránh vi phạm UNIQUE index
            deleteRelStmt.run(item.id);
            deletedDupeCount++;
        } else {
            updateRelStmt.run(cleaned, item.id);
            cleanedCount++;
        }
    }
    console.log(`      - Đã làm sạch thành công: ${cleanedCount} hàng, khử trùng lặp: ${deletedDupeCount} hàng.`);
});

// Chạy transaction
transaction();

// Checkpoint WAL và kiểm tra toàn vẹn
console.log('\n[5/5] Đang kiểm tra tính toàn vẹn (PRAGMA integrity_check)...');
db.pragma('wal_checkpoint(TRUNCATE)');
const check = db.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
console.log(`      Kết quả integrity_check: ${check.integrity_check}`);

db.close();

console.log('\n===============================================================');
console.log('✅ HOÀN TẤT SỬA CHỮA CƠ SỞ DỮ LIỆU THÀNH CÔNG!');
console.log('===============================================================\n');
