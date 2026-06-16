-- ════════════════════════════════════════════════════════
--  EVA Premium — Migration
--  Запустить в Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════

-- 1. Расширение profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_since timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_expires_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp_multiplier numeric DEFAULT 1.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS world_state_id integer DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_days_count integer DEFAULT 0;

-- 2. Лимиты путешествий (бесплатные)
CREATE TABLE IF NOT EXISTS journey_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  sphere_id text NOT NULL,
  last_journey_date date NOT NULL,
  UNIQUE(user_id, sphere_id)
);
ALTER TABLE journey_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY journey_limits_own ON journey_limits FOR ALL USING (user_id = auth.uid());

-- 3. Хранители сфер
CREATE TABLE IF NOT EXISTS sphere_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  sphere_id text NOT NULL,
  name text NOT NULL,
  silhouette_id text NOT NULL,
  color_primary text NOT NULL,
  color_secondary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, sphere_id)
);
ALTER TABLE sphere_guardians ENABLE ROW LEVEL SECURITY;
CREATE POLICY sphere_guardians_own ON sphere_guardians FOR ALL USING (user_id = auth.uid());

-- 4. Состояния мира Евы
CREATE TABLE IF NOT EXISTS eva_world_states (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  asset_key text NOT NULL,
  required_days integer NOT NULL
);

INSERT INTO eva_world_states (id, name, description, asset_key, required_days) VALUES
(1,  'Первый росток',    'Твой путь только начинается.',               'sprout',       0),
(2,  'Рассвет',          'Первые лучи касаются земли.',                 'dawn',         1),
(3,  'Пробуждение',      'Мир просыпается вместе с тобой.',             'awakening',    1),
(4,  'Первый свет',      'Свет пробивается сквозь листву.',             'first-light',  2),
(5,  'Тихое утро',       'Спокойствие разлито в воздухе.',              'quiet-morning',3),
(6,  'Зелёный побег',    'Жизнь настойчиво тянется вверх.',             'green-shoot',  4),
(7,  'Первый цветок',    'Что-то прекрасное начинает раскрываться.',    'first-flower', 5),
(8,  'Лёгкий ветер',     'Перемены приносят свежесть.',                 'light-wind',   5),
(9,  'Тёплый день',      'Тепло заботы согревает изнутри.',             'warm-day',     6),
(10, 'Живая тропа',      'Твой путь наполняется жизнью.',               'living-path',  7),
(11, 'Цветущий сад',     'Внутри расцветает целый сад.',                'garden',       8),
(12, 'Голоса леса',      'Природа говорит с тобой.',                    'forest-voices',9),
(13, 'Летний полдень',   'Полнота жизни в настоящем моменте.',          'summer-noon',  10),
(14, 'Водопад',          'Энергия течёт свободно.',                     'waterfall',    11),
(15, 'Радуга',           'После любой бури приходит свет.',             'rainbow',      12),
(16, 'Золотой час',      'Волшебное время перед закатом.',              'golden-hour',  14),
(17, 'Созревание',       'Плоды твоего труда зреют.',                   'ripening',     15),
(18, 'Полная луна',      'Полнота и завершённость.',                    'full-moon',    16),
(19, 'Звёздное небо',    'Ты часть чего-то большего.',                  'starry-sky',   17),
(20, 'Осенний свет',     'Красота в принятии изменений.',               'autumn-light', 18),
(21, 'Урожай',           'Время собирать то, что посеял.',              'harvest',      19),
(22, 'Тихий дождь',      'Очищение и обновление.',                      'quiet-rain',   21),
(23, 'Золотой лес',      'Мудрость золотого сезона.',                   'golden-forest',22),
(24, 'Первый снег',      'Тихая магия первого снега.',                  'first-snow',   23),
(25, 'Зимний покой',     'В тишине зреет новая сила.',                  'winter-rest',  24),
(26, 'Северное сияние',  'Что-то удивительное внутри тебя.',            'aurora',       25),
(27, 'Глубокая тишина',  'Покой глубже любых слов.',                    'deep-silence', 26),
(28, 'Кристальный лёд',  'Ясность и прозрачность намерений.',           'crystal-ice',  27),
(29, 'Предвесенье',      'Под снегом уже готовится новая жизнь.',       'pre-spring',   28),
(30, 'Вечный сад',       'Ты создал свой вечный мир.',                  'eternal-garden',30)
ON CONFLICT (id) DO NOTHING;

-- 5. Дневник Евы
CREATE TABLE IF NOT EXISTS eva_diary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  journey_id uuid REFERENCES journeys,
  entry_text text NOT NULL,
  entry_date timestamptz DEFAULT now(),
  sphere_id text,
  is_milestone boolean DEFAULT false,
  milestone_type text,
  is_read boolean DEFAULT false,
  generated_by text DEFAULT 'template'
);
ALTER TABLE eva_diary ENABLE ROW LEVEL SECURITY;
CREATE POLICY eva_diary_own ON eva_diary FOR ALL USING (user_id = auth.uid());

-- 6. Покупки Premium (заглушка)
CREATE TABLE IF NOT EXISTS premium_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  plan text DEFAULT 'monthly',
  status text DEFAULT 'mock',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE premium_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY premium_purchases_own ON premium_purchases FOR ALL USING (user_id = auth.uid());

-- 7. Admin-политики для новых таблиц
CREATE POLICY journey_limits_admin ON journey_limits FOR ALL USING (is_admin());
CREATE POLICY sphere_guardians_admin ON sphere_guardians FOR ALL USING (is_admin());
CREATE POLICY eva_diary_admin ON eva_diary FOR ALL USING (is_admin());
CREATE POLICY premium_purchases_admin ON premium_purchases FOR ALL USING (is_admin());
