insert into partners (slug, name, base_url, utm_campaign, is_active, sphere_ids, trigger_condition, eva_phrase, cta_text, is_free)
values
  (
    'voltabot',
    'Voltabot',
    'https://voltabot.com/',
    'route_complete',
    true,
    array['family','relationships','career','growth','finance','rest','people','health'],
    '{"always": true}'::jsonb,
    'Большой шаг пока не нужен. Начни с маленькой бережной игры.',
    'Попробовать бесплатно →',
    true
  ),
  (
    'skillbox',
    'Skillbox',
    'https://skillbox.ru/',
    'route_complete',
    true,
    array['career','growth','finance'],
    '{"growth_min": 1}'::jsonb,
    'Ты уже чувствуешь, куда тянется твой интерес. Если захочешь сделать это опорой — вот дверь.',
    'Открыть подборку курсов →',
    false
  ),
  (
    'balansity',
    'Balansity',
    'https://balansity.ru/',
    'route_complete',
    true,
    array['family'],
    '{"has_children_mention": true}'::jsonb,
    'Заботиться о себе — это и заботиться о связи с ребёнком.',
    'Найти специалиста →',
    false
  ),
  (
    'psychologist',
    'Живой психолог',
    '/partners/psychologist',
    'route_complete',
    true,
    array['relationships','health'],
    '{"baseline_max": 4}'::jsonb,
    'Иногда самый сильный шаг — позволить живому человеку быть рядом. Это не слабость.',
    'Узнать больше →',
    false
  )
on conflict (slug) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  sphere_ids = excluded.sphere_ids,
  trigger_condition = excluded.trigger_condition,
  eva_phrase = excluded.eva_phrase,
  cta_text = excluded.cta_text,
  is_free = excluded.is_free,
  is_active = excluded.is_active;
