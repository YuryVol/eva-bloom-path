# EVA App — Карта маршрутов

Сгенерировано: 2026-06-15  
Источники: `src/routes/`, `src/routeTree.gen.ts`, `src/lib/sphere-journeys.ts`, `src/lib/journey-types.ts`

---

## 1. Сводная таблица маршрутов

| Маршрут | Название | Auth | Статус | Источник | Примечания |
|---------|----------|------|--------|----------|------------|
| `/` | Сплеш / Роутер | — | ✅ Full | `src/routes/index.tsx` | Redirect-хаб при входе |
| `/intro` | Интро (видео) | — | ✅ Full | `src/routes/intro.tsx` | Видео + EmergencyModal inline |
| `/about-you` | Знакомство | — | ✅ Full | `src/routes/about-you.tsx` | Форма + ты/вы тоггл |
| `/auth-invite` | Регистрация | — | ✅ Full | `src/routes/auth-invite.tsx` | Google, Email, Аноним |
| `/login` | Вход (прямой) | — | ✅ Full | `src/routes/login.tsx` | Дублирует auth-invite |
| `/auth-callback` | OAuth Callback | — | 🟡 Stub | `src/routes/auth-callback.tsx` | Файл не прочитан |
| `/welcome` | Приветствие | — | ✅ Full | `src/routes/welcome.tsx` | Финал онбординга |
| `/to-spheres` | Видеопереход | — | 🔴 Unreachable | `src/routes/to-spheres.tsx` | Нет входящих из текущего flow |
| `/rewards-intro` | Введение в награды | — | 🔴 Unreachable | `src/routes/rewards-intro.tsx` | Нет входящих, дубль /help |
| `/emergency` | Экстренная помощь | — | ✅ Full | `src/routes/emergency.tsx` | Дублирует inline modal |
| `/disclaimer` | Дисклеймер | — | 🔴 Unreachable | `src/routes/disclaimer.tsx` | Нет входящих из current flow |
| `/reset-password` | Сброс пароля | — | 🟡 Stub | `src/routes/reset-password.tsx` | Файл не прочитан |
| `/home` | Мой мир | ✅ | ✅ Full | `src/routes/_authenticated/home.tsx` | WorldVisual, CheckinSheet |
| `/practices` | Практики | ✅ | ✅ Full | `src/routes/_authenticated/practices.tsx` | Accordion, streak, checkin |
| `/practices/$practiceId` | Детальная практика | ✅ | 🟡 Stub | `src/routes/_authenticated/practices_/$practiceId.tsx` | Файл не прочитан |
| `/practices/run/$componentKey` | Запуск практики | ✅ | 🟡 Stub | `src/routes/_authenticated/practices_/run/$componentKey.tsx` | Файл не прочитан |
| `/profile` | Прогресс | ✅ | ✅ Full | `src/routes/_authenticated/profile.tsx` | Badges, shop, milestones |
| `/opportunities` | Возможности | ✅ | ✅ Full | `src/routes/_authenticated/opportunities.tsx` | Shop, purchase history |
| `/help` | Справка | ✅ | ✅ Full | `src/routes/_authenticated/help.tsx` | XP/Coins. history.back() |
| `/partners/psychologist` | Психологи | ✅ | 🟡 Stub | `src/routes/_authenticated/partners/psychologist.tsx` | Файл не прочитан |
| `/journey` | Journey Layout | ✅ | ✅ Full | `src/routes/_authenticated/journey.tsx` | Guard + fetchActiveJourney |
| `/journey/` | Journey Index | ✅ | 🟡 Stub | `src/routes/_authenticated/journey/index.tsx` | Файл не прочитан |
| `/journey/spheres` | Выбор сфер | ✅ | ✅ Full | `src/routes/_authenticated/journey/spheres.tsx` | 8 сфер, 3 выбора |
| `/journey/assess` | Оценка сфер | ✅ | ✅ Full | `src/routes/_authenticated/journey/assess.tsx` | Слайдеры, priority_sphere |
| `/journey/path` | Выбор варианта | ✅ | 🔴 Unreachable | `src/routes/_authenticated/journey/path.tsx` | assess обходит path |
| `/journey/rel-entry` | Вход: Отношения | ✅ | ✅ Full | `src/routes/_authenticated/journey/rel-entry.tsx` | 4 типа проблемы |
| `/journey/fam-entry` | Вход: Семья | ✅ | ✅ Full | `src/routes/_authenticated/journey/fam-entry.tsx` | 3 типа |
| `/journey/career-entry` | Вход: Карьера | ✅ | ✅ Full | `src/routes/_authenticated/journey/career-entry.tsx` | 3 типа |
| `/journey/finance-entry` | Вход: Финансы | ✅ | ✅ Full | `src/routes/_authenticated/journey/finance-entry.tsx` | 3 типа |
| `/journey/growth-entry` | Вход: Развитие | ✅ | ✅ Full | `src/routes/_authenticated/journey/growth-entry.tsx` | 3 типа |
| `/journey/health-entry` | Вход: Здоровье | ✅ | ✅ Full | `src/routes/_authenticated/journey/health-entry.tsx` | 3 типа; score≤3 → bypass |
| `/journey/rest-entry` | Вход: Отдых | ✅ | ✅ Full | `src/routes/_authenticated/journey/rest-entry.tsx` | 3 типа |
| `/journey/people-entry` | Вход: Окружение | ✅ | ✅ Full | `src/routes/_authenticated/journey/people-entry.tsx` | 3 типа |
| `/journey/goal` | Цель | ✅ | ✅ Full | `src/routes/_authenticated/journey/goal.tsx` | Preset/custom, GOAL_IMAGES |
| `/journey/fears` | Страхи | ✅ | ✅ Full | `src/routes/_authenticated/journey/fears.tsx` | growth(fear-fail) |
| `/journey/feeling` | Желаемое состояние | ✅ | ✅ Full | `src/routes/_authenticated/journey/feeling.tsx` | textarea + slider |
| `/journey/current-state` | Текущее состояние | ✅ | 🔴 Unreachable | `src/routes/_authenticated/journey/current-state.tsx` | Возможно orphan/legacy |
| `/journey/resistance` | Сопротивление | ✅ | ✅ Full | `src/routes/_authenticated/journey/resistance.tsx` | Slider, score_before |
| `/journey/resistance-shape` | Образ сопротивления | ✅ | ✅ Full | `src/routes/_authenticated/journey/resistance-shape.tsx` | Shape/color/size |
| `/journey/emdr-intro` | EMDR Подготовка | ✅ | 🔴 Unreachable | `src/routes/_authenticated/journey/emdr-intro.tsx` | COMMON → emdr напрямую |
| `/journey/emdr` | EMDR Анимация | ✅ | ✅ Full | `src/routes/_authenticated/journey/emdr.tsx` | 3 цикла, +15XP +5coins |
| `/journey/reassess` | Переоценка | ✅ | ✅ Full | `src/routes/_authenticated/journey/reassess.tsx` | score_after |
| `/journey/practice-select` | Выбор практики | ✅ | 🔧 Partial | `src/routes/_authenticated/journey/practice-select.tsx` | Файл не прочитан |
| `/journey/practice-run` | Выполнение практики | ✅ | 🔧 Partial | `src/routes/_authenticated/journey/practice-run.tsx` | Файл не прочитан |
| `/journey/somatic-work` | Телесная работа | ✅ | 🔧 Partial | `src/routes/_authenticated/journey/somatic-work.tsx` | Файл не прочитан |
| `/journey/breathing-work` | Дыхание | ✅ | 🔧 Partial | `src/routes/_authenticated/journey/breathing-work.tsx` | Файл не прочитан |
| `/journey/creative-express` | Творческое выражение | ✅ | 🔧 Partial | `src/routes/_authenticated/journey/creative-express.tsx` | Файл не прочитан |
| `/journey/narrative-write` | Нарративное письмо | ✅ | 🔧 Partial | `src/routes/_authenticated/journey/narrative-write.tsx` | Файл не прочитан |
| `/journey/self-letter` | Письмо себе | ✅ | 🔧 Partial | `src/routes/_authenticated/journey/self-letter.tsx` | Файл не прочитан |
| `/journey/gratitude-focus` | Благодарность | ✅ | 🔧 Partial | `src/routes/_authenticated/journey/gratitude-focus.tsx` | Файл не прочитан |
| `/journey/polarity-map` | Карта полярности | ✅ | 🔧 Partial | `src/routes/_authenticated/journey/polarity-map.tsx` | Файл не прочитан |
| `/journey/fear-reframe` | Переформулировка страха | ✅ | 🔧 Partial | `src/routes/_authenticated/journey/fear-reframe.tsx` | Файл не прочитан |
| `/journey/success` | Первый шаг | ✅ | ✅ Full | `src/routes/_authenticated/journey/success.tsx` | +10XP +5coins |
| `/journey/summary` | Итоги | ✅ | ✅ Full | `src/routes/_authenticated/journey/summary.tsx` | completeJourney, rewards |
| `/journey/sphere-task-relationships` | Задание: Отношения | ✅ | 🔴 Unreachable | `src/routes/_authenticated/journey/sphere-task-relationships.tsx` | Legacy orphan |
| `/journey/sphere-task-career` | Задание: Карьера | ✅ | 🔴 Unreachable | `src/routes/_authenticated/journey/sphere-task-career.tsx` | Legacy orphan |
| `/journey/sphere-task-health` | Задание: Здоровье | ✅ | 🔴 Unreachable | `src/routes/_authenticated/journey/sphere-task-health.tsx` | Legacy orphan |

**Легенда статусов:**
- ✅ Full — полностью рабочий, файл прочитан и переходы подтверждены
- 🔧 Partial — маршрут активен в DAG, но файл не прочитан полностью
- 🟡 Stub — маршрут существует, детали неизвестны
- 🔴 Unreachable — orphan или обходится текущей архитектурой

---

## 2. Пользовательские потоки

### 2.1 Новый пользователь

```
/ → /intro → /about-you → /auth-invite → /welcome → /journey/spheres
→ /journey/assess → /journey/{entryStep} → ... → /journey/success → /journey/summary
→ /home
```

### 2.2 Возвращающийся пользователь (продолжение)

```
/ → /home (activeJourney найден)
→ Кнопка "Продолжить" → /journey → navigate(currentStep)
→ ... → /journey/summary → /home
```

### 2.3 Продолжение второй и третьей сферы

```
/journey/summary → кнопка "Следующая сфера" → /journey/{entryStep следующей сферы}
→ ... → /journey/summary (2-я сфера)
→ /journey/{entryStep третьей сферы} → ... → /journey/spheres (всё пройдено)
```

---

## 3. Карта шагов по сферам

### ОБЩИЕ переходы (COMMON в sphere-journeys.ts)

```
resistance-shape → emdr   (NB: НЕ emdr-intro!)
emdr             → reassess
reassess         → success
success          → summary
practice-run     → success
creative-express → practice-select
self-letter      → practice-select
```

---

### Сфера: Отношения (relationships)

**rel_issue_type: conflict**
```
rel-entry → goal → resistance → resistance-shape → emdr → reassess → success → summary
```

**rel_issue_type: distance**
```
rel-entry → goal → self-letter → practice-select → practice-run → success → summary
```

**rel_issue_type: improve | seeking**
```
rel-entry → goal → feeling → polarity-map → practice-select → practice-run → success → summary
```

---

### Сфера: Семья (family)

**fam_issue_type: tension**
```
fam-entry → goal → resistance → resistance-shape → emdr → reassess → success → summary
```

**fam_issue_type: disconnection**
```
fam-entry → goal → self-letter → practice-select → practice-run → success → summary
```

**fam_issue_type: roles**
```
fam-entry → goal → narrative-write → practice-select → practice-run → success → summary
```

---

### Сфера: Карьера (career)

**career_issue_type: burnout**
```
career-entry → feeling → somatic-work → self-letter → practice-select → practice-run → success → summary
```

**career_issue_type: no-meaning**
```
career-entry → goal → polarity-map → creative-express → practice-select → practice-run → success → summary
```

**career_issue_type: conflict**
```
career-entry → goal → resistance → resistance-shape → emdr → reassess → success → summary
```

---

### Сфера: Финансы (finance)

**finance_issue_type: fear**
```
finance-entry → fear-reframe → goal → polarity-map → practice-select → practice-run → success → summary
```

**finance_issue_type: chaos**
```
finance-entry → goal → polarity-map → practice-select → practice-run → success → summary
```

**finance_issue_type: blocked-dream**
```
finance-entry → goal → gratitude-focus → creative-express → practice-select → practice-run → success → summary
```

---

### Сфера: Развитие (growth)

**growth_issue_type: fear-fail**
```
growth-entry → fears → fear-reframe → practice-select → practice-run → success → summary
```

**growth_issue_type: procrastination**
```
growth-entry → goal → feeling → narrative-write → success → summary
```
⚠️ Пропускает practice-select/practice-run

**growth_issue_type: direction**
```
growth-entry → goal → gratitude-focus → creative-express → practice-select → practice-run → success → summary
```

---

### Сфера: Здоровье (health)

**Если score ≤ 3 (критичное):**
```
[health-entry пропускается] → somatic-work → breathing-work → reassess → success → summary
```

**health_issue_type: body-pain**
```
health-entry → somatic-work → breathing-work → reassess → success → summary
```

**health_issue_type: habit**
```
health-entry → goal → feeling → breathing-work → practice-select → practice-run → success → summary
```

**health_issue_type: energy**
```
health-entry → goal → gratitude-focus → practice-select → practice-run → success → summary
```

---

### Сфера: Отдых (rest)

**rest_issue_type: cant-relax**
```
rest-entry → breathing-work → self-letter → practice-select → practice-run → success → summary
```

**rest_issue_type: guilt**
```
rest-entry → goal → self-letter → practice-select → practice-run → success → summary
```

**rest_issue_type: no-time**
```
rest-entry → goal → polarity-map → practice-select → practice-run → success → summary
```

---

### Сфера: Окружение (people)

**people_issue_type: toxic**
```
people-entry → goal → resistance → resistance-shape → emdr → reassess → success → summary
```

**people_issue_type: lonely**
```
people-entry → goal → gratitude-focus → practice-select → practice-run → success → summary
```

**people_issue_type: expand**
```
people-entry → goal → creative-express → success → summary
```
⚠️ Пропускает practice-select/practice-run

---

## 4. Orphaned и Dead-end маршруты

| Маршрут | Тип проблемы | Подробности |
|---------|-------------|-------------|
| `/journey/path` | Orphan (обход) | `assess.tsx` вызывает `getEntryStep()` и переходит напрямую на entryStep сферы, минуя `/journey/path`. Маршрут физически существует, но недостижим из нормального флоу. |
| `/journey/emdr-intro` | Orphan (обход) | `COMMON` в `sphere-journeys.ts`: `resistance-shape → emdr`. `emdr-intro` никогда не вызывается из `getNextStep()`. Экран с противопоказаниями недостижим. |
| `/journey/current-state` | Orphan (legacy) | Нет входящих переходов из текущего DAG. Возможно merged в `/journey/feeling`. |
| `/journey/sphere-task-relationships` | Legacy orphan | `getJourneySteps()` упоминает через `SPHERE_EXTRA_STEPS`, но `getNextStep()` не вызывает. |
| `/journey/sphere-task-career` | Legacy orphan | Аналогично. |
| `/journey/sphere-task-health` | Legacy orphan | Аналогично. |
| `/to-spheres` | Orphan | `rewards-intro` ведёт напрямую на `/journey/spheres`. Нет входящих из текущего flow. |
| `/rewards-intro` | Orphan | Нет входящих переходов из текущего onboarding flow. Дублирует `/help`. |
| `/disclaimer` | Orphan/legacy | Нет входящих из текущего flow. `emergency.tsx` возвращает сюда, но самому disclaimer неоткуда попасть. |

---

## 5. Отсутствующие экраны / состояния (ожидаемые, но не реализованные)

### 5.1 Экраны подтверждения противопоказаний к EMDR

**Проблема:** `/journey/emdr-intro` существует с полным UI (аккордеон противопоказаний), но недостижим из нормального потока. Пользователь попадает на EMDR-анимацию без предупреждения о противопоказаниях (эпилепсия, острая травма и пр.).

**Ожидается:** добавить переход `resistance-shape → emdr-intro → emdr` в `COMMON` вместо прямого `resistance-shape → emdr`.

---

### 5.2 Экран выбора пути `/journey/path` не интегрирован

**Проблема:** Экран выбора варианта пути (10 вариантов: deep, somatic, creative и пр.) существует, но `assess.tsx` обходит его. В данный момент вариант определяется автоматически через `getRecommendedVariant()` или сфера-функции, без выбора пользователя.

**Ожидается:** либо интегрировать `/journey/path` после `assess`, либо явно пометить его как deprecated и удалить.

---

### 5.3 Экран онбординга для существующего пользователя

**Проблема:** нет экрана «Добро пожаловать обратно» или «Выбери продолжение» для возвращающихся пользователей. `home.tsx` показывает мир, но нет отдельного re-entry экрана после долгого перерыва.

---

### 5.4 Экран ошибки для потерянного journey state

**Проблема:** если `getActiveJourney()` возвращает null/ошибку, `journey.tsx` логирует ошибку в консоль, но не показывает пользователю ничего специфического — только пустой layout. Нет fallback экрана «Путешествие не найдено».

---

### 5.5 Состояние «сфера заблокирована» на /journey/spheres

**Проблема:** если пользователь уже завершил всё (3 сферы полностью пройдены), `/journey/spheres` показывает те же 8 сфер. Нет состояния «всё пройдено» или «ждите следующего цикла».

---

### 5.6 Полный экран достижения milestone

**Проблема:** `/profile` показывает milestones с progress bars и клик переходит на практику, но нет отдельного celebratory экрана при первом достижении milestone.

---

### 5.7 Экран onboarding для анонимного пользователя в /journey/summary

**Частично реализован:** `summary.tsx` показывает inline prompt для анонимного пользователя. Но нет отдельного, полноценного экрана конверсии с объяснением преимуществ регистрации.

---

### 5.8 Экран «Вы вернулись» после долгого перерыва (world:winter)

**Проблема:** `home.tsx` показывает `world:winter` визуально, но нет специального контента или экрана для пользователей, не заходивших >30 дней.

---

### 5.9 Checkin при входе в journey (не только на /home)

**Проблема:** чекин настроения доступен только через CheckinSheet на `/home`. Нет возможности сделать чекин из journey flow, хотя `submitCheckin()` server function существует.

---

### 5.10 Детальный экран badge/достижения

**Проблема:** `/profile` показывает сетку из 9 badges. Share через Canvas API реализован, но нет детального экрана/модала с описанием, историей получения, условиями разблокировки для залоченных badges.
