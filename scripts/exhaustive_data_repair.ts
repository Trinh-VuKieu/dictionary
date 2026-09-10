import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
const db = new Database(dbPath);

console.log('=== STARTING EXHAUSTIVE DATA REPAIR & ENRICHMENT ===\n');

db.transaction(() => {
    // -------------------------------------------------------------
    // 1. Ensure Missing Irregular Verbs in SQLite
    // -------------------------------------------------------------
    console.log('--- 1. Inserting missing irregular verbs ---');
    const getWordStmt = db.prepare("SELECT id FROM words WHERE word = ? AND lang_code = 'en'");
    const insertWordStmt = db.prepare("INSERT INTO words (word, source_id, lang_code) VALUES (?, 4, 'en')");
    const insertDefStmt = db.prepare("INSERT INTO definitions (definition, pos, definition_lang, links) VALUES (?, ?, 'vi', ?)");
    const insertWordDefStmt = db.prepare("INSERT INTO word_definitions (word_id, definition_id, source_id) VALUES (?, ?, 4)");
    const insertPronStmt = db.prepare("INSERT OR IGNORE INTO pronunciations (word_id, ipa, region) VALUES (?, ?, ?)");
    const insertRelStmt = db.prepare("INSERT OR IGNORE INTO word_relations (word_id, related_word, relation_type) VALUES (?, ?, ?)");

    const missingIrregulars: [string, string, string, string, string][] = [
        ['grown', 'grow', 'Dạng quá khứ phân từ (Past Participle - V3) của động từ grow (đã lớn lên, phát triển, trưởng thành).', '/ɡroʊn/', '/ɡrəʊn/'],
        ['lain', 'lie', 'Dạng quá khứ phân từ (Past Participle - V3) của động từ lie (nằm, tọa lạc).', '/leɪn/', '/leɪn/'],
        ['spelt', 'spell', 'Dạng quá khứ đơn và quá khứ phân từ của động từ spell (đánh vần).', '/spɛlt/', '/spɛlt/'],
        ['burned', 'burn', 'Dạng quá khứ đơn và quá khứ phân từ của động từ burn (đốt cháy, bị cháy).', '/bɜːrnd/', '/bɜːnd/'],
        ['speeded', 'speed', 'Dạng quá khứ đơn và quá khứ phân từ của động từ speed (tăng tốc, chạy quá tốc độ).', '/ˈspiːdɪd/', '/ˈspiːdɪd/']
    ];

    for (const [form, root, def, usIpa, ukIpa] of missingIrregulars) {
        let row = getWordStmt.get(form) as { id: number } | undefined;
        if (!row) {
            const res = insertWordStmt.run(form);
            row = { id: Number(res.lastInsertRowid) };
        }
        const defRes = insertDefStmt.run(def, 'Động từ', JSON.stringify([root]));
        insertWordDefStmt.run(row.id, Number(defRes.lastInsertRowid));
        insertPronStmt.run(row.id, usIpa, 'US');
        insertPronStmt.run(row.id, ukIpa, 'UK');
        insertRelStmt.run(row.id, root, 'g');

        const rootRow = getWordStmt.get(root) as { id: number } | undefined;
        if (rootRow) {
            insertRelStmt.run(rootRow.id, form, 'd');
        }
    }
    console.log('Inserted 5 irregular verb entries with US/UK pronunciations and bidirectional root relations.');

    // -------------------------------------------------------------
    // 2. Populate All Remaining 147 0-Definition English Words
    // -------------------------------------------------------------
    console.log('\n--- 2. Populating definitions for all 147 0-def English words ---');
    const en0Words = db.prepare(`
        SELECT w.id, w.word FROM words w
        LEFT JOIN word_definitions wd ON w.id = wd.word_id
        WHERE w.lang_code = 'en' AND wd.id IS NULL
    `).all() as { id: number; word: string }[];

    const knownDefMap: Record<string, { def: string; pos: string; ipa?: string; root?: string }> = {
        "'tween": { def: "Dạng viết tắt của between (ở giữa).", pos: "Giới từ", ipa: "/twiːn/", root: "between" },
        "'twixt": { def: "Dạng viết tắt của betwixt (ở giữa).", pos: "Giới từ", ipa: "/twɪkst/", root: "betwixt" },
        "4": { def: "Số 4 (bốn), con số bốn.", pos: "Số từ", ipa: "/fɔːr/" },
        "abr.": { def: "Viết tắt của abbreviation (sự viết tắt, từ viết tắt).", pos: "Viết tắt", root: "abbreviation" },
        "agn.": { def: "Viết tắt của Agnes.", pos: "Tên riêng" },
        "aids": { def: "Hội chứng suy giảm miễn dịch mắc phải (Acquired Immune Deficiency Syndrome).", pos: "Danh từ", ipa: "/eɪdz/" },
        "alex.": { def: "Viết tắt của Alexander.", pos: "Tên riêng", root: "Alexander" },
        "alex.r": { def: "Viết tắt của Alexander.", pos: "Tên riêng", root: "Alexander" },
        "alf.": { def: "Viết tắt của Alfred.", pos: "Tên riêng", root: "Alfred" },
        "altaic": { def: "Thuộc hệ ngôn ngữ Altai (khu vực Trung Á).", pos: "Tính từ", ipa: "/ælˈteɪ.ɪk/" },
        "amb.": { def: "Viết tắt của ambassador (đại sứ).", pos: "Viết tắt", root: "ambassador" },
        "amitabha buddha": { def: "Đức Phật A Di Đà (Phật giáo Đại thừa).", pos: "Danh từ riêng" },
        "amitābha buddha": { def: "Đức Phật A Di Đà (phiên âm tiếng Phạn có dấu).", pos: "Danh từ riêng" },
        "an.": { def: "Viết tắt của anno / annum (năm trong tiếng Latinh).", pos: "Viết tắt" },
        "and.": { def: "Viết tắt của Andrew.", pos: "Tên riêng", root: "Andrew" },
        "ant.": { def: "Viết tắt của antonym (từ trái nghĩa) hoặc antiquities.", pos: "Viết tắt", root: "antonym" },
        "art.": { def: "Viết tắt của article (điều khoản, mạo từ, bài báo).", pos: "Viết tắt", root: "article" },
        "aug.": { def: "Viết tắt của August (tháng Tám).", pos: "Danh từ", ipa: "/ˈɔː.ɡəst/", root: "August" },
        "bacca": { def: "Quả mọng (thuật ngữ thực vật học, tương đương berry).", pos: "Danh từ", ipa: "/ˈbæk.ə/" },
        "barb.": { def: "Viết tắt của Barbara.", pos: "Tên riêng", root: "Barbara" },
        "bart.": { def: "Viết tắt của baronet (tước nam tước).", pos: "Danh từ", root: "baronet" },
        "battambang": { def: "Tỉnh Battambang (thành phố và tỉnh ở tây bắc Campuchia).", pos: "Địa danh" },
        "bdc": { def: "Viết tắt của Bottom Dead Centre (điểm chết dưới) hoặc Backup Domain Controller.", pos: "Viết tắt" },
        "benj.": { def: "Viết tắt của Benjamin.", pos: "Tên riêng", root: "Benjamin" },
        "bhavana": { def: "Sự tu tập thiền định, phát triển tâm thức (thuật ngữ Phật giáo Phạn/Pali).", pos: "Danh từ" },
        "brid.": { def: "Viết tắt của Bridget.", pos: "Tên riêng", root: "Bridget" },
        "cath.": { def: "Viết tắt của Catherine hoặc Catholic (Công giáo).", pos: "Viết tắt" },
        "chan": { def: "Thiền tông (trường phái Phật giáo Thiền có nguồn gốc từ Trung Quốc).", pos: "Danh từ", root: "Zen" },
        "change bowlers": { def: "Thay đổi người ném bóng (thuật ngữ thể thao cricket).", pos: "Cụm động từ" },
        "clem.": { def: "Viết tắt của Clement.", pos: "Tên riêng", root: "Clement" },
        "cnc": { def: "Viết tắt của Computer Numerical Control (hệ thống điều khiển gia công số bằng máy tính).", pos: "Danh từ", ipa: "/ˌsiː.enˈsiː/" },
        "const.": { def: "Viết tắt của constitution (hiến pháp) hoặc constable (cảnh sát viên).", pos: "Viết tắt" },
        "corn.": { def: "Viết tắt của Cornelius.", pos: "Tên riêng", root: "Cornelius" },
        "cso": { def: "Viết tắt của Chief Security Officer (Giám đốc An ninh) hoặc Chief Strategy Officer.", pos: "Danh từ" },
        "cuv": { def: "Viết tắt của Crossover Utility Vehicle (xe crossover thể thao đa dụng).", pos: "Danh từ" },
        "dav.": { def: "Viết tắt của David.", pos: "Tên riêng", root: "David" },
        "deb.": { def: "Viết tắt của Deborah hoặc debutante.", pos: "Tên riêng" },
        "den.": { def: "Viết tắt của Denis hoặc Denmark.", pos: "Viết tắt" },
        "digital camera": { def: "Máy ảnh kỹ thuật số (thiết bị chụp và lưu ảnh điện tử).", pos: "Danh từ", ipa: "/ˌdɪdʒ.ə.t̬əl ˈkæm.rə/" },
        "doug.": { def: "Viết tắt của Douglas.", pos: "Tên riêng", root: "Douglas" },
        "dwt": { def: "Viết tắt của deadweight tonnage (trọng tải toàn phần) hoặc pennyweight.", pos: "Viết tắt" },
        "edm.": { def: "Viết tắt của Edmund.", pos: "Tên riêng", root: "Edmund" },
        "edrus": { def: "Viết tắt cổ của Edward.", pos: "Tên riêng", root: "Edward" },
        "edw.": { def: "Viết tắt của Edward.", pos: "Tên riêng", root: "Edward" },
        "eliz.": { def: "Viết tắt của Elizabeth.", pos: "Tên riêng", root: "Elizabeth" },
        "ellipsize": { def: "Cắt ngắn chuỗi văn bản và thêm dấu ba chấm '...' (lập trình UI/UX).", pos: "Động từ", ipa: "/ɪˈlɪp.saɪz/" },
        "elnr": { def: "Viết tắt của Eleanor.", pos: "Tên riêng", root: "Eleanor" },
        "esth.": { def: "Viết tắt của Esther.", pos: "Tên riêng", root: "Esther" },
        "exodontist": { def: "Bác sĩ chuyên khoa nhổ răng.", pos: "Danh từ", ipa: "/ˌɛk.səˈdɑːn.tɪst/" },
        "ezek.": { def: "Viết tắt của Ezekiel.", pos: "Tên riêng", root: "Ezekiel" },
        "fido": { def: "Fido (tên gọi kinh điển cho chó cưng, biểu tượng của sự trung thành).", pos: "Tên riêng", ipa: "/ˈfaɪ.doʊ/" },
        "fred.": { def: "Viết tắt của Frederick.", pos: "Tên riêng", root: "Frederick" },
        "froo.": { def: "Viết tắt của froodite (khoáng vật froodit).", pos: "Danh từ" },
        "gab.": { def: "Viết tắt của Gabriel.", pos: "Tên riêng", root: "Gabriel" },
        "gas-attack": { def: "Cuộc tấn công bằng khí độc trong chiến tranh.", pos: "Danh từ", ipa: "/ˈɡæs əˌtæk/" },
        "geo.": { def: "Viết tắt của George.", pos: "Tên riêng", root: "George" },
        "geof.": { def: "Viết tắt của Geoffrey.", pos: "Tên riêng", root: "Geoffrey" },
        "godf.": { def: "Viết tắt của Godfrey.", pos: "Tên riêng", root: "Godfrey" },
        "greg.": { def: "Viết tắt của Gregory.", pos: "Tên riêng", root: "Gregory" },
        "gul.": { def: "Viết tắt của Gulielmus (William).", pos: "Tên riêng", root: "William" },
        "han.": { def: "Viết tắt của Hannah.", pos: "Tên riêng", root: "Hannah" },
        "heavenli immortals": { def: "Các vị thiên tiên, chư tiên cõi trời (Đạo giáo).", pos: "Danh từ" },
        "hel.": { def: "Viết tắt của Helen.", pos: "Tên riêng", root: "Helen" },
        "hen.": { def: "Viết tắt của Henry.", pos: "Tên riêng", root: "Henry" },
        "herb.": { def: "Viết tắt của Herbert.", pos: "Tên riêng", root: "Herbert" },
        "hot-pluggable": { def: "Có khả năng cắm nóng (kết nối hoặc tháo thiết bị khi máy đang chạy).", pos: "Tính từ", ipa: "/ˌhɑːtˈplʌɡ.ə.bəl/" },
        "iff": { def: "Khi và chỉ khi (if and only if - thuật ngữ toán học và logic học).", pos: "Liên từ", ipa: "/ɪf/" },
        "in wake of": { def: "Theo sau, là hệ quả của (in the wake of).", pos: "Cụm giới từ" },
        "inelastic and unit elastic demand": { def: "Cầu không co giãn và cầu co giãn đơn vị (kinh tế học).", pos: "Thuật ngữ kinh tế" },
        "ioh.": { def: "Viết tắt của Iohannes (John).", pos: "Tên riêng", root: "John" },
        "isb.": { def: "Viết tắt của Isabel.", pos: "Tên riêng", root: "Isabel" },
        "jabus": { def: "Viết tắt cổ của Jacob.", pos: "Tên riêng", root: "Jacob" },
        "jac.": { def: "Viết tắt của Jacob.", pos: "Tên riêng", root: "Jacob" },
        "jam.": { def: "Viết tắt của James.", pos: "Tên riêng", root: "James" },
        "jer.": { def: "Viết tắt của Jeremiah.", pos: "Tên riêng", root: "Jeremiah" },
        "jitter": { def: "Độ trễ dao động, hiện tượng chập chờn tín hiệu mạng.", pos: "Danh từ", ipa: "/ˈdʒɪt̬.ɚ/" },
        "jno": { def: "Viết tắt cổ của John.", pos: "Tên riêng", root: "John" },
        "jon.": { def: "Viết tắt của Jonathan.", pos: "Tên riêng", root: "Jonathan" },
        "jos.": { def: "Viết tắt của Joseph.", pos: "Tên riêng", root: "Joseph" },
        "josh.": { def: "Viết tắt của Joshua.", pos: "Tên riêng", root: "Joshua" },
        "jud.": { def: "Viết tắt của Judith hoặc judicial.", pos: "Viết tắt" },
        "kampot": { def: "Tỉnh Kampot (tỉnh ven biển phía nam Campuchia, nổi tiếng với hồ tiêu Kampot).", pos: "Địa danh" },
        "koh kong": { def: "Tỉnh Koh Kong (tỉnh phía tây nam Campuchia ven vịnh Thái Lan).", pos: "Địa danh" },
        "kratié": { def: "Tỉnh Kratié (tỉnh ở đông bắc Campuchia ven sông Mê Kông).", pos: "Địa danh" },
        "lau.": { def: "Viết tắt của Laurence.", pos: "Tên riêng", root: "Laurence" },
        "lawr.": { def: "Viết tắt của Lawrence.", pos: "Tên riêng", root: "Lawrence" },
        "leon.": { def: "Viết tắt của Leonard.", pos: "Tên riêng", root: "Leonard" },
        "lyd.": { def: "Viết tắt của Lydia.", pos: "Tên riêng", root: "Lydia" },
        "ma": { def: "Mẹ, má, u, bu (cách gọi thân mật của mother).", pos: "Danh từ", ipa: "/mɑː/", root: "mother" },
        "maitri": { def: "Tâm từ, lòng từ bi, tình hữu ái không vị kỷ (Phật giáo).", pos: "Danh từ" },
        "marchese": { def: "Hầu tước (tước hiệu quý tộc Ý tương đương marquess).", pos: "Danh từ", ipa: "/mɑːrˈkeɪ.zeɪ/" },
        "margt": { def: "Viết tắt của Margaret.", pos: "Tên riêng", root: "Margaret" },
        "mashup": { def: "Bản phối kết hợp, sản phẩm kết hợp nhiều nguồn (âm nhạc, web).", pos: "Danh từ", ipa: "/ˈmæʃ.ʌp/" },
        "matt.": { def: "Viết tắt của Matthew.", pos: "Tên riêng", root: "Matthew" },
        "mau.": { def: "Viết tắt của Maurice.", pos: "Tên riêng", root: "Maurice" },
        "menta": { def: "Dạng số nhiều của mentum (cằm, cấu trúc dưới môi của côn trùng).", pos: "Danh từ", root: "mentum" },
        "mesotheliomata": { def: "Dạng số nhiều của mesothelioma (u trung biểu mô).", pos: "Danh từ", root: "mesothelioma" },
        "metacognition": { def: "Siêu nhận thức (nhận thức và hiểu biết về chính tư duy của mình).", pos: "Danh từ", ipa: "/ˌmet̬.ə.kɑːɡˈnɪʃ.ən/" },
        "mich.": { def: "Viết tắt của Michael hoặc tiểu bang Michigan.", pos: "Viết tắt" },
        "micls": { def: "Viết tắt của Michael.", pos: "Tên riêng", root: "Michael" },
        "mill.": { def: "Viết tắt của millimeter hoặc million.", pos: "Viết tắt" },
        "mondulkiri": { def: "Tỉnh Mondulkiri (tỉnh miền núi phía đông Campuchia giáp Việt Nam).", pos: "Địa danh" },
        "narcoses": { def: "Dạng số nhiều của narcosis (tình trạng mê man, gây mê).", pos: "Danh từ", ipa: "/nɑːrˈkoʊ.siːz/", root: "narcosis" },
        "nath.": { def: "Viết tắt của Nathaniel.", pos: "Tên riêng", root: "Nathaniel" },
        "nich.": { def: "Viết tắt của Nicholas.", pos: "Tên riêng", root: "Nicholas" },
        "nics": { def: "Các card mạng giao tiếp (Network Interface Cards).", pos: "Danh từ", root: "nic" },
        "ol.": { def: "Viết tắt của Oliver.", pos: "Tên riêng", root: "Oliver" },
        "paiilin": { def: "Thị xã Pailin (khu vực nổi tiếng với đá quý ở Campuchia).", pos: "Địa danh" },
        "plug and play": { def: "Cắm và chạy (công nghệ tự động nhận diện thiết bị phần cứng).", pos: "Tính từ", ipa: "/ˌplʌɡ.ənˈpleɪ/" },
        "pluggable": { def: "Có thể cắm vào, gắn kết module linh hoạt.", pos: "Tính từ", ipa: "/ˈplʌɡ.ə.bəl/" },
        "prajna": { def: "Bát nhã, trí tuệ thấu triệt chân lý tối hậu (Phật giáo).", pos: "Danh từ" },
        "pursat": { def: "Tỉnh Pursat (tỉnh ở phía tây Campuchia ven Biển Hồ).", pos: "Địa danh" },
        "pw": { def: "Viết tắt của password (mật khẩu) hoặc prisoner of war.", pos: "Viết tắt", root: "password" },
        "ratanakiri": { def: "Tỉnh Ratanakiri (tỉnh đông bắc Campuchia giáp Kon Tum/Gia Lai).", pos: "Địa danh" },
        "ri": { def: "Viết tắt của tiểu bang Rhode Island hoặc refractive index.", pos: "Viết tắt" },
        "saturated fat": { def: "Chất béo bão hòa (loại axit béo có trong mỡ động vật).", pos: "Danh từ", ipa: "/ˌsætʃ.ər.eɪ.t̬ɪd ˈfæt/" },
        "sniveler": { def: "Kẻ khóc thút thít, người hay rên rỉ than vãn.", pos: "Danh từ", ipa: "/ˈsnɪv.əl.ɚ/" },
        "sodding": { def: "Chết tiệt, khốn nạn (từ lóng biểu thị sự bực tức).", pos: "Tính từ", ipa: "/ˈsɑː.dɪŋ/" },
        "stfu": { def: "Câm mồm đi (từ viết tắt của shut the fuck up - từ lóng thô tục).", pos: "Thán từ", root: "shut up" },
        "tabulae": { def: "Dạng số nhiều của tabula (tấm bảng ghi chép La Mã cổ đại).", pos: "Danh từ", root: "tabula" },
        "takoéo": { def: "Tỉnh Takéo (tỉnh phía nam Campuchia giáp An Giang).", pos: "Địa danh" },
        "tendiness": { def: "Trạng thái căng thẳng cơ bắp hoặc tâm lý.", pos: "Danh từ" },
        "tmeses": { def: "Dạng số nhiều của tmesis (phép chêm từ vào giữa từ ghép).", pos: "Danh từ", root: "tmesis" },
        "unbethink": { def: "Quên bẵng đi, không nhớ ra được nữa (từ cổ).", pos: "Động từ" },
        "undercreep": { def: "Bò lén lút bên dưới, luồn lách phía dưới.", pos: "Động từ" },
        "underdraw": { def: "Vẽ phác thảo bên dưới, rút bớt ở dưới.", pos: "Động từ" },
        "underspend": { def: "Chi tiêu ít hơn mức ngân sách dự kiến.", pos: "Động từ", ipa: "/ˌʌn.dɚˈspend/", root: "spend" },
        "understride": { def: "Bước sải chân ngắn hơn hoặc bước sải bên dưới.", pos: "Động từ" },
        "undraw": { def: "Kéo mở ra (màn cửa, rèm), rút lại.", pos: "Động từ", ipa: "/ʌnˈdrɔː/", root: "draw" },
        "uvae": { def: "Dạng số nhiều của uva (chùm nho, quả giống nho trong giải phẫu).", pos: "Danh từ", root: "uva" },
        "verminoses": { def: "Dạng số nhiều của verminosis (bệnh nhiễm giun sán).", pos: "Danh từ", root: "verminosis" },
        "victrices": { def: "Dạng số nhiều của victrix (nữ anh hùng chiến thắng).", pos: "Danh từ", root: "victrix" },
        "video camera": { def: "Máy quay phim, máy quay video.", pos: "Danh từ", ipa: "/ˈvɪd.i.oʊ ˌkæm.rə/" },
        "video conference": { def: "Hội nghị truyền hình trực tuyến từ xa qua mạng.", pos: "Danh từ", ipa: "/ˈvɪd.i.oʊ ˌkɑːn.fɚ.əns/" },
        "virtuose": { def: "Có tính nghệ sĩ điêu luyện, thuộc bậc thầy nghệ thuật.", pos: "Tính từ" },
        "wbs": { def: "Viết tắt của Work Breakdown Structure (cơ cấu phân chia công việc).", pos: "Danh từ" },
        "wdm": { def: "Viết tắt của Wavelength Division Multiplexing (ghép kênh theo bước sóng).", pos: "Danh từ" },
        "whitelist": { def: "Danh sách trắng (danh sách được phép truy cập hoặc tin cậy).", pos: "Danh từ", ipa: "/ˈwaɪt.lɪst/", root: "white" },
        "wipo": { def: "Tổ chức Sở hữu Trí tuệ Thế giới (World Intellectual Property Organization).", pos: "Tổ chức" },
        "wlan": { def: "Mạng cục bộ không dây (Wireless Local Area Network, mạng Wi-Fi).", pos: "Danh từ", ipa: "/ˈdʌb.əl.juːˌlæn/" },
        "wm.": { def: "Viết tắt của William.", pos: "Tên riêng", root: "William" },
        "wvlan": { def: "Mạng không dây nội bộ thoại (Wireless Voice LAN).", pos: "Danh từ" },
        "’em": { def: "Dạng viết tắt thân mật của đại từ them (họ, chúng nó).", pos: "Đại từ", ipa: "/əm/", root: "them" },
        "’ll": { def: "Dạng viết tắt của trợ động từ will hoặc shall.", pos: "Trợ động từ", ipa: "/l/", root: "will" },
        "’ve": { def: "Dạng viết tắt của trợ động từ have.", pos: "Trợ động từ", ipa: "/v/", root: "have" }
    };

    let populatedEn0 = 0;
    for (const row of en0Words) {
        const info = knownDefMap[row.word.toLowerCase()];
        const defText = info?.def || `Từ vựng tiếng Anh: '${row.word}'.`;
        const posText = info?.pos || 'Từ vựng';
        const links = info?.root ? JSON.stringify([info.root]) : JSON.stringify([]);

        const defRes = insertDefStmt.run(defText, posText, links);
        insertWordDefStmt.run(row.id, Number(defRes.lastInsertRowid));

        if (info?.ipa) {
            insertPronStmt.run(row.id, info.ipa, 'US');
            insertPronStmt.run(row.id, info.ipa, 'UK');
        }
        if (info?.root) {
            insertRelStmt.run(row.id, info.root, 'g');
            const rootRow = getWordStmt.get(info.root) as { id: number } | undefined;
            if (rootRow) {
                insertRelStmt.run(rootRow.id, row.word, 'd');
            }
        }
        populatedEn0++;
    }
    console.log(`Populated definitions for all ${populatedEn0} remaining English words.`);

    // -------------------------------------------------------------
    // 3. Batch Populate Prefix Relations in SQLite (7,822 words)
    // -------------------------------------------------------------
    console.log('\n--- 3. Batch populating prefix relations in SQLite ---');
    const allEnWords = db.prepare("SELECT id, word FROM words WHERE lang_code = 'en'").all() as { id: number; word: string }[];
    const checkRelStmt = db.prepare("SELECT id FROM word_relations WHERE word_id = ? AND related_word = ? AND relation_type = 'g'");

    const prefixRules: RegExp[] = [
        /^un([a-z]{3,})$/,
        /^dis([a-z]{3,})$/,
        /^im([a-z]{3,})$/,
        /^in([a-z]{3,})$/,
        /^non\-?([a-z]{3,})$/,
        /^mis([a-z]{3,})$/,
        /^re([a-z]{3,})$/,
        /^over([a-z]{3,})$/,
        /^under([a-z]{3,})$/
    ];

    let prefixCount = 0;
    for (const w of allEnWords) {
        const lower = w.word.toLowerCase();
        for (const regex of prefixRules) {
            const m = lower.match(regex);
            if (m) {
                const root = m[1];
                if (root.length < 3 || root === lower) continue;
                const rootRow = getWordStmt.get(root) as { id: number } | undefined;
                if (rootRow) {
                    const existingRel = checkRelStmt.get(w.id, root);
                    if (!existingRel) {
                        insertRelStmt.run(w.id, root, 'g');
                        insertRelStmt.run(rootRow.id, w.word, 'd');
                        prefixCount++;
                    }
                    break;
                }
            }
        }
    }
    console.log(`Inserted ${prefixCount} prefix relations with reciprocal derivatives.`);

    // -------------------------------------------------------------
    // 4. Batch Populate Plural (-s) Relations in SQLite (888 words)
    // -------------------------------------------------------------
    console.log('\n--- 4. Batch populating plural (-s) relations in SQLite ---');
    let sCount = 0;
    for (const w of allEnWords) {
        const lower = w.word.toLowerCase();
        if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 3) {
            const candidates = [];
            if (lower.endsWith('ies') && lower.length > 4) candidates.push(lower.slice(0, -3) + 'y');
            if (lower.endsWith('es') && lower.length > 4) {
                candidates.push(lower.slice(0, -2));
                candidates.push(lower.slice(0, -1));
            }
            candidates.push(lower.slice(0, -1));

            for (const cand of candidates) {
                const rootRow = getWordStmt.get(cand) as { id: number } | undefined;
                if (rootRow) {
                    const existingRel = checkRelStmt.get(w.id, cand);
                    if (!existingRel) {
                        insertRelStmt.run(w.id, cand, 'g');
                        insertRelStmt.run(rootRow.id, w.word, 'd');
                        sCount++;
                    }
                    break;
                }
            }
        }
    }
    console.log(`Inserted ${sCount} plural relations with reciprocal derivatives.`);

    // -------------------------------------------------------------
    // 5. Batch Populate -ed and -ing Relations in SQLite (992 words)
    // -------------------------------------------------------------
    console.log('\n--- 5. Batch populating -ed and -ing relations in SQLite ---');
    let edIngCount = 0;
    for (const w of allEnWords) {
        const lower = w.word.toLowerCase();
        // -ed
        if (lower.endsWith('ed') && lower.length > 4) {
            const candidates = [];
            if (lower.endsWith('ied') && lower.length > 4) candidates.push(lower.slice(0, -3) + 'y');
            candidates.push(lower.slice(0, -2));
            candidates.push(lower.slice(0, -1));
            for (const cand of candidates) {
                const rootRow = getWordStmt.get(cand) as { id: number } | undefined;
                if (rootRow) {
                    const existingRel = checkRelStmt.get(w.id, cand);
                    if (!existingRel) {
                        insertRelStmt.run(w.id, cand, 'g');
                        insertRelStmt.run(rootRow.id, w.word, 'd');
                        edIngCount++;
                    }
                    break;
                }
            }
        }
        // -ing
        if (lower.endsWith('ing') && lower.length > 5) {
            const candidates = [lower.slice(0, -3), lower.slice(0, -3) + 'e'];
            for (const cand of candidates) {
                const rootRow = getWordStmt.get(cand) as { id: number } | undefined;
                if (rootRow) {
                    const existingRel = checkRelStmt.get(w.id, cand);
                    if (!existingRel) {
                        insertRelStmt.run(w.id, cand, 'g');
                        insertRelStmt.run(rootRow.id, w.word, 'd');
                        edIngCount++;
                    }
                    break;
                }
            }
        }
    }
    console.log(`Inserted ${edIngCount} -ed and -ing relations with reciprocal derivatives.`);

    // -------------------------------------------------------------
    // 6. Delete Dead Ghost Words (0 defs, 0 rels, 0 trans, 0 prons, not referenced)
    // -------------------------------------------------------------
    console.log('\n--- 6. Deleting completely dead ghost words ---');
    const deleteGhostStmt = db.prepare(`
        DELETE FROM words
        WHERE id NOT IN (SELECT word_id FROM word_definitions)
          AND id NOT IN (SELECT word_id FROM word_relations)
          AND id NOT IN (SELECT word_id FROM translations)
          AND id NOT IN (SELECT word_id FROM pronunciations)
          AND word NOT IN (SELECT related_word FROM word_relations)
    `);
    const deleteRes = deleteGhostStmt.run();
    console.log(`Deleted ${deleteRes.changes} dead ghost words from words table.`);
})();

console.log('\n--- Checkpointing SQLite WAL ---');
db.pragma('wal_checkpoint(TRUNCATE)');
db.close();
console.log('=== EXHAUSTIVE DATA REPAIR FINISHED SUCCESSFULLY ===');
