INSERT INTO badge (id, name, url, description, how_to_get) VALUES
(1, '7日間連続達成バッジ', 'https://img-cofit.kdgn.tech/badge/models/bag_cofit_nomal.glb', '一週間のトレーニング継続を証明するバッジです。', '7日間連続で記録を付ける'),
(2, '14日間連続達成バッジ', 'https://img-cofit.kdgn.tech/badge/models/bag_cofit_silver.glb', '二週間のトレーニング継続を証明するバッジです。', '14日間連続で記録を付ける'),
(3, '30日間連続達成バッジ', 'https://img-cofit.kdgn.tech/badge/models/bag_cofit_gold.glb', '一ヶ月間のトレーニング継続を証明するバッジです。', '1ヶ月連続で記録を付ける'),
(4, 'スクワット100回達成', 'https://img-cofit.kdgn.tech/badge/models/bag_rank_silver.glb', '通算100回のスクワットを達成しました！', 'スクワットを合計100回達成する'),
(5, 'スクワット1000回達成', 'https://img-cofit.kdgn.tech/badge/models/bag_rank_gold.glb', '通算1,000回のスクワットを成し遂げました！', 'スクワットを合計1,000回達成する'),
(6, 'スクワット10000回達成', 'https://img-cofit.kdgn.tech/badge/models/bag_rank_champion.glb', '通算10,000回のスクワット。もはや神の領域です。', 'スクワットを合計10,000回達成する'),
(7, '腹筋100回達成', 'https://img-cofit.kdgn.tech/badge/models/flourbronze.glb', '通算100回の腹筋を達成しました！', '腹筋を合計100回達成する'),
(8, '腹筋1000回達成', 'https://img-cofit.kdgn.tech/badge/models/floursilver.glb', '通算1,000回の腹筋を成し遂げました。', '腹筋を合計1,000回達成する'),
(9, '腹筋10000回達成', 'https://img-cofit.kdgn.tech/badge/models/bag_rank_champion.glb', '通算10,000回の腹筋。究極のシックスパックの持ち主です。', '腹筋を合計10,000回達成する')
ON CONFLICT (id) DO UPDATE SET
    name = excluded.name,
    url = excluded.url,
    description = excluded.description,
    how_to_get = excluded.how_to_get;
