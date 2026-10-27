import { useOnboardingDraft } from "./onboarding-store";

/** Returns address-form-aware strings for Eva's dialogue directed at the user. */
export function useAddress() {
  const form = useOnboardingDraft((s) => s.address_form);
  const vy = form === "вы";
  return {
    vy,
    // pronoun forms
    ty: vy ? "вы" : "ты",
    tebe: vy ? "вам" : "тебе",
    tebya: vy ? "вас" : "тебя",
    toboj: vy ? "вами" : "тобой",
    tvoya: vy ? "ваша" : "твоя",
    tvoy: vy ? "ваш" : "твой",
    tvoyo: vy ? "ваше" : "твоё",
    tvoi: vy ? "ваши" : "твои",
    // verb forms
    hochesh: vy ? "хотите" : "хочешь",
    oschuschajesh: vy ? "ощущаете" : "ощущаешь",
    chuvstvujesh: vy ? "чувствуете" : "чувствуешь",
    pochuvstvovala: vy ? "вы почувствовали" : "ты почувствовала",
    ty_vybrala: vy ? "Вы выбрали" : "Ты выбрала",
    // imperatives (capitalised — use .toLowerCase() in mid-sentence)
    zakroj: vy ? "Закройте" : "Закрой",
    prislushajs: vy ? "Прислушайтесь" : "Прислушайся",
    podumaj: vy ? "Подумайте" : "Подумай",
    vsomni: vy ? "Вспомните" : "Вспомни",
    zameti: vy ? "Заметьте" : "Заметь",
    nazovi: vy ? "Назовите" : "Назови",
    daj: vy ? "Дайте" : "Дай",
    uderzhivaj: vy ? "Удерживайте" : "Удерживай",
    sledi: vy ? "Следите" : "Следи",
    nedvigaj: vy ? "не двигайте" : "не двигай",
    dyshe: vy ? "Дышите" : "Дыши",
    sdelajte: vy ? "Сделайте" : "Сделай",
    // label phrases
    gde_ty: vy ? "Где вы сейчас" : "Где ты сейчас",
    tvoy_put: vy ? "Ваш путь сегодня" : "Твой путь сегодня",
    tvoya_cel: vy ? "Ваша цель" : "Твоя цель",
    chego_ty_hochesh: vy ? "Чего вы хотите здесь?" : "Чего ты хочешь здесь?",
    tebya_zhdet: vy ? "Что вас ждёт" : "Что тебя ждёт",
    naskolko_legko: vy ? "Насколько сейчас вам это легко?" : "Насколько сейчас тебе это легко?",
    nashla: vy ? "вы нашли" : "ты нашла",
    ty_khochesh_rabotat: vy ? "хотите работать" : "хочешь работать",
    napishi: vy ? "Напишите" : "Напиши",
    vyrazite: vy ? "Выразите" : "Вырази",
    ostanovis: vy ? "Остановитесь" : "Остановись",
  };
}
