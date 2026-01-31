INSERT INTO badge (id, name, image, model_url, description, how_to_get) VALUES
(1, '7日間連続達成バッジ', 'https://api.dicebear.com/7.x/icons/svg?seed=streak7', 'https://r2.cofit.example.com/models/badge_7_streak.glb', '一週間のトレーニング継続を証明するバッジです。', '7日間連続で記録を付ける'),
(2, '14日間連続達成バッジ', 'https://api.dicebear.com/7.x/icons/svg?seed=streak14', 'https://r2.cofit.example.com/models/badge_14_streak.glb', '二週間のトレーニング継続を証明するバッジです。', '14日間連続で記録を付ける'),
(3, '30日間連続達成バッジ', 'https://api.dicebear.com/7.x/icons/svg?seed=streak30', 'https://r2.cofit.example.com/models/badge_30_streak.glb', '一ヶ月間のトレーニング継続を証明するバッジです。', '1ヶ月連続で記録を付ける'),
(4, 'スクワット100回達成', 'https://api.dicebear.com/7.x/icons/svg?seed=squat100', 'https://r2.cofit.example.com/models/badge_squat_100.glb', '通算100回のスクワットを達成しました！', 'スクワットを合計100回達成する'),
(5, 'スクワット1000回達成', 'https://api.dicebear.com/7.x/icons/svg?seed=squat1000', 'https://r2.cofit.example.com/models/badge_squat_1000.glb', '通算1,000回のスクワットを成し遂げました！', 'スクワットを合計1,000回達成する'),
(6, 'スクワット10000回達成', 'https://api.dicebear.com/7.x/icons/svg?seed=squat10000', 'https://r2.cofit.example.com/models/badge_squat_10000.glb', '通算10,000回のスクワット。もはや神の領域です。', 'スクワットを合計10,000回達成する'),
(7, '腹筋100回達成', 'https://api.dicebear.com/7.x/icons/svg?seed=abs100', 'https://r2.cofit.example.com/models/badge_abs_100.glb', '通算100回の腹筋を達成しました！', '腹筋を合計100回達成する'),
(8, '腹筋1000回達成', 'https://api.dicebear.com/7.x/icons/svg?seed=abs1000', 'https://r2.cofit.example.com/models/badge_abs_1000.glb', '通算1,000回の腹筋を成し遂げました。', '腹筋を合計1,000回達成する'),
(9, '腹筋10000回達成', 'https://api.dicebear.com/7.x/icons/svg?seed=abs10000', 'https://r2.cofit.example.com/models/badge_abs_10000.glb', '通算10,000回の腹筋。究極のシックスパックの持ち主です。', '腹筋を合計10,000回達成する')
ON CONFLICT (id) DO UPDATE SET
    name = excluded.name,
    image = excluded.image,
    model_url = excluded.model_url,
    description = excluded.description,
    how_to_get = excluded.how_to_get;
