import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// READMEファイルのパス
const readmePath = join(rootDir, 'README.md');

// Stalin Sort ジョークREADME
const stalinSortReadme = `# ☭ Stalin Sort — The Algorithm That Never Loses

> **「秩序は自然発生しない。
> 気に入らない要素を"除外"すれば、配列は必ず整う。」**

※これはブラックジョークです。
※実在の人物・思想・歴史を推奨・賛美する意図は**一切ありません**。
※アルゴリズムの皮を被った風刺です。笑ってください。

---

## 🧠 概要

**Stalin Sort** は、
「並び替えが面倒？――なら、邪魔な要素を消せばいい」
という**潔すぎる思想**に基づく（※）ソートアルゴリズムです。

* 比較？ しません
* 交換？ しません
* 修正？ しません

**条件を満たさない要素を排除**し、
残った要素だけで「正しく見える秩序」を作ります。

---

## ✨ なぜ称えるのか（※称えている"フリ"）

* **実装が短い**（精神的にも）
* **バグが起きにくい**（起きる前に消える）
* **結果が明確**（残ったものが正義）

> 甘いよ……でもね。
> 「動くものだけが残る」って割り切り、
> 嫌いじゃないぜ。

---

## ⚙️ 仕組み（擬似コード）

\`\`\`pseudo
for each element in array:
  if element is out of order:
    remove element
return array
\`\`\`

**O(n)**。
速い。軽い。冷酷。

---

## 📈 特性

* **安定性**：∞（要素が減るため衝突しない）
* **メモリ**：最小（消えるから）
* **デバッグ**：不要（問題の要素が消える）

---

## 🧪 使用例

\`\`\`js
stalinSort([1, 2, 3, 0, 4, 5])
// => [1, 2, 3, 4, 5]
\`\`\`

\`0\` は消えました。
理由？ **並びを乱したからです。**

---

## 🚨 注意事項

* データは**減ります**
* 真のソートではありません
* 「なぜ消えたか」を説明できません
* 失われた要素は戻りません（仕様）

---

## 🏁 結論

**Stalin Sort はソートではない。**
しかし――
**意思決定の比喩としては、これ以上なく正直**。

> おいおい、
> 整って見えるってことは、
> 何かが消えてるってことだ。

---

## 📜 ライセンス

MIT（Maybe It's Totalitarian）

---

*This README is satire. Please don't use it to justify anything except a good laugh.*
`;

// 元のREADMEのバックアップを作成（初回のみ）
// READMEファイルを更新
writeFileSync(readmePath, stalinSortReadme, 'utf-8');

console.log('☭ README.md を Stalin Sort バージョンに更新しました');
console.log('⚠️  これはジョークです。元に戻すには README.md.backup を使用してください。');
