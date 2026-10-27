const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");
const fs = require("fs");

const STYLE_PREFIX = `Style: soft dreamlike digital illustration, painterly texture, muted warm palette, no text, no characters, no UI elements. Square format 1:1, 1024×1024. Small intimate landscape floating in soft atmospheric haze, slight aerial or eye-level angle. Warm candlelight tones, golden and amber highlights, deep indigo and violet shadows. Atmosphere: therapeutic, quiet, magical realism. Consistent visual world across all images.`;

const states = [
  // Spring / Awakening
  { n: 1,  key: "sprout",        season: "Весна / Пробуждение", name: "Росток",           desc: `A single tiny green sprout breaking through dark moist earth in the center of frame. Soft morning mist rising from the soil. One perfect droplet of dew catching warm golden light on the tip of the sprout. Dark earth tones below, pale golden haze above. Sense of first life, quiet miracle.` },
  { n: 2,  key: "dawn",          season: "Весна / Пробуждение", name: "Рассвет",           desc: `A misty valley just before sunrise. Pale pink and lavender horizon glowing behind dark silhouettes of bare trees. Thin wisps of mist drifting along the valley floor. One small bird in mid-flight silhouetted against the glowing sky. Absolute stillness, held breath before the world wakes.` },
  { n: 3,  key: "awakening",     season: "Весна / Пробуждение", name: "Пробуждение",       desc: `A frozen pond beginning to crack and thaw. Thin lines of pale light-blue water appearing between sheets of ice. The first reflections of a soft grey-pink sky shimmering in the dark water. Ice crystals at the edges catching light. Cold blue-white palette warming at the center.` },
  { n: 4,  key: "first-light",   season: "Весна / Пробуждение", name: "Первый свет",       desc: `First golden rays of morning sun piercing through a dense forest canopy. Light beams cutting diagonally through dark trunks, illuminating patches of bright green moss and unfurling ferns below. Soft golden dust particles floating in the light beams. Deep forest shadows contrasting with warm shafts of light.` },
  { n: 5,  key: "quiet-morning", season: "Весна / Пробуждение", name: "Тихое утро",        desc: `A narrow stone path winding through dewy spring grass. A small iron lantern on a post still glowing softly in the early morning, its warm light paling against the brightening sky. Pale lavender and rose sky above. Low mist hovering over the grass. Dew drops glistening on every blade.` },
  { n: 6,  key: "green-shoot",   season: "Весна / Пробуждение", name: "Зелёный побег",     desc: `An open meadow of fresh bright spring grass stretching to a soft horizon. Scattered clusters of tiny white wildflowers at ground level. A gentle breeze creating visible ripples across the grass surface. Warm golden light from a low sun casting long soft shadows. Air feels clean and new.` },
  { n: 7,  key: "first-flower",  season: "Весна / Пробуждение", name: "Первый цветок",     desc: `A single cherry blossom branch with three fully open pale pink blossoms against a soft blurred sage-green background. Two or three petals mid-fall, suspended in air. Soft diffused natural light, no harsh shadows. The branch curves gently from left to right. Minimalist, delicate, impermanent beauty.` },
  { n: 8,  key: "light-wind",    season: "Весна / Пробуждение", name: "Лёгкий ветер",      desc: `A rounded hilltop with tall grass and wildflowers bending visibly in a gentle wind. Dozens of dandelion seeds floating upward into a warm late-morning sky. Golden light from a low sun to one side. The grass creates flowing wave-like patterns. Sense of lightness and release.` },

  // Summer / Bloom
  { n: 9,  key: "warm-day",      season: "Лето / Расцвет",      name: "Тёплый день",       desc: `A sun-drenched garden path bordered on both sides by tall lavender and white chamomile. Warm amber summer haze in the air. Two bees frozen mid-flight above the flowers. Lazy summer noon light, high sun, soft blurred depth of field. The path leads to a small wooden gate half-hidden in greenery.` },
  { n: 10, key: "living-path",   season: "Лето / Расцвет",      name: "Живой путь",        desc: `A winding dirt path curving through a lush mature green forest. Dappled sunlight filtering through a leafy canopy, creating shifting pools of warm light on the path. Mossy stones at the path edge. Ferns and undergrowth on both sides. A sense of gentle forward movement and possibility.` },
  { n: 11, key: "garden",        season: "Лето / Расцвет",      name: "Сад",               desc: `An enclosed secret garden surrounded by old weathered stone walls covered in climbing roses and ivy. Inside: abundant summer blooms in rose, cream, and coral. A weathered wooden bench in one corner. Afternoon golden light. Feeling of being held, protected, abundant.` },
  { n: 12, key: "forest-voices", season: "Лето / Расцвет",      name: "Голоса леса",       desc: `Deep interior of an ancient lush forest. Shafts of golden green light descending between enormous moss-covered trunks. At the base of the trees: clusters of softly glowing bioluminescent mushrooms in blue-white. Fern fronds catching the light. An atmosphere of living magic and deep quiet.` },
  { n: 13, key: "summer-noon",   season: "Лето / Расцвет",      name: "Полдень",           desc: `A sunlit wildflower clearing at peak summer noon. Flowers in every colour — violet, yellow, orange, pink — at their fullest bloom. One large butterfly with patterned wings resting on a flower in the foreground. Sky a saturated deep cobalt blue above. Everything at maximum aliveness.` },
  { n: 14, key: "waterfall",     season: "Лето / Расцвет",      name: "Водопад",           desc: `A small magical waterfall cascading into a crystal-clear pool enclosed by ancient ferns and mossy rocks. A fine rainbow mist hovering above the pool. The water has a soft inner glow. Lush emerald and jade green surroundings. The sound of water almost visible in the image's stillness.` },
  { n: 15, key: "rainbow",       season: "Лето / Расцвет",      name: "Радуга",            desc: `The immediate aftermath of summer rain. A full rainbow arc bridging two green hills in the distance. Wet grass in the foreground glistening with droplets. A small distant farmhouse under the arc. The air fresh and luminous. Clouds breaking apart to let warm light through, half the sky bright, half still dramatic.` },
  { n: 16, key: "golden-hour",   season: "Лето / Расцвет",      name: "Золотой час",       desc: `A wide field of tall ripe wheat at golden hour. The sun a deep amber disc sitting just at the horizon, sky shifting from gold to rose to pale blue overhead. Long sweeping shadows across the wheat. Bronze and copper tones dominate. A single crow in silhouette on a fence post. Peak summer, on the edge of harvest.` },

  // Autumn / Ripening
  { n: 17, key: "ripening",      season: "Осень / Созревание",  name: "Созревание",        desc: `An old apple orchard with heavy-laden branches bending under the weight of deep red and golden fruit. Fallen apples scattered in long grass below. Shafts of warm amber autumn light filtering between the trees. A soft autumn haze. The smell of sweetness almost perceptible. Peak abundance before the harvest.` },
  { n: 18, key: "full-moon",     season: "Осень / Созревание",  name: "Полнолуние",        desc: `A full silver moon reflected perfectly in a completely still dark lake. The moon and its reflection the only light sources. Silhouettes of bare autumn trees framing both sides. Midnight blue sky. A few scattered stars. Deep mystery and quiet. The border between worlds feels thin.` },
  { n: 19, key: "starry-sky",    season: "Осень / Созревание",  name: "Звёздное небо",     desc: `A vast brilliant starry sky stretching over a dark rolling hill. The Milky Way clearly visible as a soft glowing band. One small warm-lit square window glowing in a distant house on the hill. The scale: enormous cosmos above, one tiny human presence below. Cosmic perspective, quiet solitude.` },
  { n: 20, key: "autumn-light",  season: "Осень / Созревание",  name: "Осенний свет",      desc: `A wide forest path completely carpeted in a deep layer of amber, crimson, and copper fallen leaves. Low diagonal shafts of late autumn sun piercing through the nearly bare canopy. Warm foggy golden air between the trees. A single leaf mid-fall caught in the light. Melancholic beauty, transience.` },
  { n: 21, key: "harvest",       season: "Осень / Созревание",  name: "Урожай",            desc: `A stone root cellar entrance nestled in a hillside, surrounded by an array of harvest abundance: large orange and green pumpkins, baskets overflowing with red apples, bunches of dried herbs and lavender hanging from the wooden doorframe. Warm afternoon side light. Sense of preparation, completion, care.` },
  { n: 22, key: "quiet-rain",    season: "Осень / Созревание",  name: "Тихий дождь",       desc: `Steady soft rain falling on a dark still pond. Overlapping concentric ripple circles spreading across the entire surface. A heavy grey-violet sky reflected in the water. One solitary fallen yellow birch leaf floating at the center. The sound of rain almost audible. Introspective, cleansing, internal.` },
  { n: 23, key: "golden-forest", season: "Осень / Созревание",  name: "Золотой лес",       desc: `A birch forest at peak autumn colour. Tall straight white trunks receding into the distance, every single tree in brilliant gold. The ground entirely covered in a carpet of yellow leaves. Late afternoon warm light cutting horizontally through the trunks. A cathedral-like stillness. Pure gold and white.` },
  { n: 24, key: "first-snow",    season: "Осень / Созревание",  name: "Первый снег",       desc: `The first thin dusting of snow falling on leaves that are still partially orange and brown. Delicate snowflakes visible mid-fall, each distinct. The ground half leaf, half white. A grey-lilac sky above. The contrast of warm autumn and first cold. A hush falls over the world. The turning point.` },

  // Winter / Rest
  { n: 25, key: "winter-rest",   season: "Зима / Покой",        name: "Зимний покой",      desc: `A wide open frozen landscape under deep undisturbed snow. Bare dark trees at the edges. A single trail of small animal tracks (a rabbit) crossing the pristine white surface, leading off into the distance. Long cool blue shadows on the snow. High pale sky. Deep silence, utter stillness, rest.` },
  { n: 26, key: "aurora",        season: "Зима / Покой",        name: "Аврора",            desc: `Northern lights dancing in vivid curtains above a snow-covered pine forest at night. Brilliant green and violet-pink auroras sweeping across a black sky full of stars. The pines below silhouetted and dusted with snow. The snow surface reflecting the aurora colours faintly. Otherworldly beauty, sacred silence.` },
  { n: 27, key: "deep-silence",  season: "Зима / Покой",        name: "Глубокая тишина",   desc: `A snow-covered valley in the deepest depths of winter night. No wind, not a single track in the snow. Stars reflected perfectly in a small patch of dark ice. The landscape almost monochromatic: deep indigo, midnight blue, soft white. Absolute stillness. The world at rest at its most profound.` },
  { n: 28, key: "crystal-ice",   season: "Зима / Покой",        name: "Кристаллический лёд", desc: `An extreme close-up of elaborate frost crystal formations on glass or ice. Intricate geometric and organic patterns: ferns, stars, fractals. Cold blue-white and silver palette. Early morning light passing through from behind, making the crystals glow and sparkle. The mathematics of nature made visible.` },
  { n: 29, key: "pre-spring",    season: "Зима / Покой",        name: "Преддверие весны",  desc: `A single perfect white snowdrop flower pushing up through a thin crust of late-winter snow. The surrounding world still grey-white and frozen. But this one tiny flower in sharp focus: white petals, green stem, alive. A sense of irresistible return. The first promise of warmth. Hope made visible.` },
  { n: 30, key: "eternal-garden",season: "Зима / Покой",        name: "Вечный сад",        desc: `A timeless enchanted garden where all four seasons coexist simultaneously in one space. One corner dusted with snow and bare branches, another in full summer bloom, another in amber autumn leaves, another with fresh spring blossoms. All bathed in the same soft golden mist. Time dissolved. Everything at once.` },
];

const children = [];

// Title
children.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "ЕВА — 30 состояний мира", bold: true, size: 36, font: "Arial" })],
    spacing: { after: 200 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Промпты для GPT Image 2 · Формат 1024×1024", size: 20, font: "Arial", color: "888888" })],
    spacing: { after: 400 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Как использовать", bold: true, size: 24, font: "Arial" })],
    spacing: { after: 120 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Каждый блок — отдельная генерация. Копируй весь текст промпта целиком и вставляй в GPT Image 2. Загружай уже готовые изображения (world-healthy.png, world-wilting.png, world-dormant.png, world-winter.png) как style reference для консистентности палитры.", size: 20, font: "Arial", color: "444444" })],
    spacing: { after: 600 },
  })
);

let currentSeason = "";

for (const s of states) {
  // Season header
  if (s.season !== currentSeason) {
    currentSeason = s.season;
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: `— ${s.season} —`, bold: true, size: 28, font: "Arial", color: "7B5E3A" })],
        spacing: { before: 480, after: 200 },
      })
    );
  }

  // State number + name
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${s.n}. ${s.name}`, bold: true, size: 24, font: "Arial" }),
        new TextRun({ text: `  [${s.key}]`, size: 20, font: "Arial", color: "999999" }),
      ],
      spacing: { before: 280, after: 100 },
    })
  );

  // Full prompt box
  const fullPrompt = `${STYLE_PREFIX}\n\n${s.desc}`;
  children.push(
    new Paragraph({
      children: [new TextRun({ text: fullPrompt, size: 19, font: "Courier New", color: "1A1A1A" })],
      indent: { left: 360, right: 360 },
      shading: { fill: "F5F0E8" },
      border: {
        left: { style: "single", size: 12, color: "C4A96E", space: 12 },
      },
      spacing: { before: 60, after: 280 },
    })
  );
}

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = "C:/Users/volyu/OneDrive/Desktop/EVA_world_prompts.docx";
  fs.writeFileSync(out, buf);
  console.log("✓ Saved:", out);
});
