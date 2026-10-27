from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = Workbook()

blue_font = Font(name="Arial", color="0000FF", size=11)
black = Font(name="Arial", color="000000", size=11)
black_bold = Font(name="Arial", color="000000", size=11, bold=True)
green_font = Font(name="Arial", color="008000", size=11)
header_font = Font(name="Arial", color="FFFFFF", size=11, bold=True)
title_font = Font(name="Arial", color="8B6914", size=14, bold=True)
section_font = Font(name="Arial", color="333333", size=12, bold=True)
muted_font = Font(name="Arial", color="888888", size=10)

yellow_fill = PatternFill("solid", fgColor="FFFF00")
header_fill = PatternFill("solid", fgColor="8B6914")
gray_fill = PatternFill("solid", fgColor="F5F5F5")
green_fill = PatternFill("solid", fgColor="E8F5E9")

thin_border = Border(
    left=Side(style="thin", color="CCCCCC"),
    right=Side(style="thin", color="CCCCCC"),
    top=Side(style="thin", color="CCCCCC"),
    bottom=Side(style="thin", color="CCCCCC")
)

center = Alignment(horizontal="center", vertical="center")
left_al = Alignment(horizontal="left", vertical="center")
right_al = Alignment(horizontal="right", vertical="center")

def set_col_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

P = "Параметры"

# ═══ SHEET 1: Параметры ═══
ws = wb.active
ws.title = P
set_col_widths(ws, [38, 18, 42])

ws["A1"] = "ЕВА — Финансовая модель"
ws["A1"].font = title_font
ws["A2"] = "Входные параметры (изменяйте синие ячейки)"
ws["A2"].font = muted_font

params = [
    ("", "", ""),
    ("ИНВЕСТИЦИИ И СРОКИ", "", ""),
    ("Объём инвестиций, RUB", 5000000, "Общий бюджет"),
    ("Горизонт модели, мес", 24, ""),
    ("", "", ""),
    ("ЦЕНООБРАЗОВАНИЕ", "", ""),
    ("Цена EVA+ месяц, RUB", 1990, "Основной тариф"),
    ("Цена EVA+ год, RUB", 9990, "Годовая подписка"),
    ("Доля годовых подписок, %", 30, "% на годовом тарифе"),
    ("", "", ""),
    ("ПРИВЛЕЧЕНИЕ", "", ""),
    ("CAC, RUB", 120, "Средний по каналам"),
    ("Органический трафик, %", 40, "Telegram, ASO, реферальная"),
    ("Новые пользователи мес 1", 200, "Старт"),
    ("Рост новых / мес, %", 15, "Месячный рост привлечения"),
    ("Макс. новых / мес", 5000, "Потолок"),
    ("", "", ""),
    ("КОНВЕРСИЯ И УДЕРЖАНИЕ", "", ""),
    ("Конверсия Free - EVA+, %", 5, "Бенчмарк: 3-8%"),
    ("Churn EVA+ месячный, %", 8, "Бенчмарк: 6-12%"),
    ("", "", ""),
    ("ИНВЕСТИЦИИ — РАСПРЕДЕЛЕНИЕ", "", ""),
    ("3D-моделирование + дизайн", 1500000, "30 состояний мира"),
    ("Мобильная разработка", 1350000, "React Native iOS+Android"),
    ("Миграция на РФ-хостинг", 592000, "Workers-Node.js, Auth, DB"),
    ("Маркетинг (из инвестиций)", 810000, "ASO, таргет, influencers"),
    ("Резерв", 298000, "Непредвиденные"),
    ("", "", ""),
    ("ОПЕРАЦИОННЫЕ РАСХОДЫ", "", ""),
    ("Разработка мес 1-6", 200000, "RUB/мес"),
    ("Разработка мес 7-12", 120000, ""),
    ("Разработка мес 13+", 100000, ""),
    ("Маркетинг мес 1-6", 120000, ""),
    ("Маркетинг мес 7-12", 150000, ""),
    ("Маркетинг мес 13+", 180000, ""),
    ("Инфраструктура РФ мес 1-6", 8000, "VPS+PG+S3+CDN"),
    ("Инфраструктура РФ мес 7-12", 19500, ""),
    ("Инфраструктура РФ мес 13+", 35000, ""),
    ("Контент мес 1-6", 50000, "Психолог, копирайт"),
    ("Контент мес 7-12", 30000, ""),
    ("Контент мес 13+", 20000, ""),
    ("App Store комиссия, %", 30, ""),
    ("Доля iOS-подписок, %", 40, ""),
    ("Telegram-бот доработка/мес", 15000, "С месяца 3"),
    ("", "", ""),
    ("ПЕРСПЕКТИВЫ РАЗВИТИЯ", "", ""),
    ("Доп. сценарии — старт мес", 6, ""),
    ("Доп. сценарии — выручка/мес", 50000, "Контент-паки"),
    ("Персональные маршруты — старт", 9, ""),
    ("Персональные маршруты — выр/мес", 80000, ""),
    ("Партнёрская экосистема — старт", 6, ""),
    ("Партнёрская экосистема — выр/мес", 30000, "Комиссия от психологов"),
    ("ИИ-помощник — старт мес", 12, ""),
    ("ИИ-помощник — выручка/мес", 100000, "Отдельная подписка"),
    ("Сообщества — старт мес", 12, ""),
    ("Сообщества — выручка/мес", 40000, "Платные группы"),
]

for i, (label, val, comment) in enumerate(params, 4):
    ws.cell(row=i, column=1, value=label)
    c2 = ws.cell(row=i, column=2, value=val)
    ws.cell(row=i, column=3, value=comment).font = muted_font
    if isinstance(val, (int, float)) and val != 0:
        c2.font = blue_font
        c2.fill = yellow_fill
        c2.number_format = '#,##0'
    if label and val == "" and not comment:
        ws.cell(row=i, column=1).font = section_font
        for cc in range(1, 4):
            ws.cell(row=i, column=cc).fill = gray_fill
    elif label:
        ws.cell(row=i, column=1).font = black

# Row references for Параметры sheet
R = {
    "invest": 6, "horizon": 7,
    "price_m": 10, "price_y": 11, "annual_pct": 12,
    "cac": 15, "organic": 16, "new_m1": 17, "growth": 18, "max_new": 19,
    "conv": 22, "churn": 23,
    "inv_3d": 26, "inv_mob": 27, "inv_mig": 28, "inv_mkt": 29, "inv_res": 30,
    "dev_1": 33, "dev_2": 34, "dev_3": 35,
    "mkt_1": 36, "mkt_2": 37, "mkt_3": 38,
    "infra_1": 39, "infra_2": 40, "infra_3": 41,
    "cont_1": 42, "cont_2": 43, "cont_3": 44,
    "appstore": 45, "ios_pct": 46, "tgbot": 47,
    "sc_start": 50, "sc_rev": 51,
    "pers_start": 52, "pers_rev": 53,
    "part_start": 54, "part_rev": 55,
    "ai_start": 56, "ai_rev": 57,
    "comm_start": 58, "comm_rev": 59,
}

# ═══ SHEET 2: P&L ═══
ws2 = wb.create_sheet("P&L помесячный")
set_col_widths(ws2, [32] + [14]*24)

ws2.cell(row=1, column=1, value="P&L помесячный (24 месяца)").font = title_font

headers = ["Показатель"] + [f"Мес {i}" for i in range(1, 25)]
for c, h in enumerate(headers, 1):
    cell = ws2.cell(row=3, column=c, value=h)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = center
    cell.border = thin_border

rows_def = [
    ("ПОЛЬЗОВАТЕЛИ", None),
    ("Новые пользователи", "new"),
    ("Всего (накопл.)", "total"),
    ("EVA+ подписчики", "prem"),
    ("", None),
    ("ВЫРУЧКА", None),
    ("ARPU средний", "arpu"),
    ("Подписки", "r_sub"),
    ("Доп. сценарии", "r_sc"),
    ("Персональные маршруты", "r_pers"),
    ("Партнёрская экосистема", "r_part"),
    ("ИИ-помощник", "r_ai"),
    ("Сообщества", "r_comm"),
    ("ИТОГО выручка", "r_tot"),
    ("", None),
    ("РАСХОДЫ", None),
    ("Разработка", "e_dev"),
    ("Маркетинг", "e_mkt"),
    ("Инфраструктура РФ", "e_inf"),
    ("Контент", "e_cnt"),
    ("App Store комиссия", "e_app"),
    ("Telegram-бот", "e_tg"),
    ("ИТОГО расходы", "e_tot"),
    ("", None),
    ("P&L месячный", "pnl"),
    ("P&L накопленный", "pnl_c"),
]

rm = {}
for i, (label, key) in enumerate(rows_def, 4):
    ws2.cell(row=i, column=1, value=label).border = thin_border
    if key is None and label:
        ws2.cell(row=i, column=1).font = section_font
        for cc in range(1, 26):
            ws2.cell(row=i, column=cc).fill = gray_fill
            ws2.cell(row=i, column=cc).border = thin_border
    elif label:
        ws2.cell(row=i, column=1).font = black
    if key:
        rm[key] = i

def pr(r):
    return f"'{P}'!B{r}"

for m in range(1, 25):
    c = m + 1
    col = get_column_letter(c)
    prev = get_column_letter(c - 1) if m > 1 else ""

    ws2.cell(row=rm["new"], column=c).value = f'=MIN({pr(R["new_m1"])}*(1+{pr(R["growth"])}/100)^({m}-1),{pr(R["max_new"])})'
    ws2.cell(row=rm["total"], column=c).value = f'={col}{rm["new"]}' if m == 1 else f'={prev}{rm["total"]}+{col}{rm["new"]}'
    ws2.cell(row=rm["prem"], column=c).value = f'=ROUND({col}{rm["total"]}*{pr(R["conv"])}/100,0)'
    ws2.cell(row=rm["arpu"], column=c).value = f'={pr(R["price_m"])}*(1-{pr(R["annual_pct"])}/100)+{pr(R["price_y"])}/12*{pr(R["annual_pct"])}/100'
    ws2.cell(row=rm["r_sub"], column=c).value = f'={col}{rm["prem"]}*{col}{rm["arpu"]}'
    ws2.cell(row=rm["r_sc"], column=c).value = f'=IF({m}>={pr(R["sc_start"])},{pr(R["sc_rev"])},0)'
    ws2.cell(row=rm["r_pers"], column=c).value = f'=IF({m}>={pr(R["pers_start"])},{pr(R["pers_rev"])},0)'
    ws2.cell(row=rm["r_part"], column=c).value = f'=IF({m}>={pr(R["part_start"])},{pr(R["part_rev"])},0)'
    ws2.cell(row=rm["r_ai"], column=c).value = f'=IF({m}>={pr(R["ai_start"])},{pr(R["ai_rev"])},0)'
    ws2.cell(row=rm["r_comm"], column=c).value = f'=IF({m}>={pr(R["comm_start"])},{pr(R["comm_rev"])},0)'
    ws2.cell(row=rm["r_tot"], column=c).value = f'=SUM({col}{rm["r_sub"]}:{col}{rm["r_comm"]})'
    ws2.cell(row=rm["e_dev"], column=c).value = f'=IF({m}<=6,{pr(R["dev_1"])},IF({m}<=12,{pr(R["dev_2"])},{pr(R["dev_3"])}))'
    ws2.cell(row=rm["e_mkt"], column=c).value = f'=IF({m}<=6,{pr(R["mkt_1"])},IF({m}<=12,{pr(R["mkt_2"])},{pr(R["mkt_3"])}))'
    ws2.cell(row=rm["e_inf"], column=c).value = f'=IF({m}<=6,{pr(R["infra_1"])},IF({m}<=12,{pr(R["infra_2"])},{pr(R["infra_3"])}))'
    ws2.cell(row=rm["e_cnt"], column=c).value = f'=IF({m}<=6,{pr(R["cont_1"])},IF({m}<=12,{pr(R["cont_2"])},{pr(R["cont_3"])}))'
    ws2.cell(row=rm["e_app"], column=c).value = f'=ROUND({col}{rm["r_sub"]}*{pr(R["appstore"])}/100*{pr(R["ios_pct"])}/100,0)'
    ws2.cell(row=rm["e_tg"], column=c).value = f'=IF({m}>=3,{pr(R["tgbot"])},0)'
    ws2.cell(row=rm["e_tot"], column=c).value = f'=SUM({col}{rm["e_dev"]}:{col}{rm["e_tg"]})'
    ws2.cell(row=rm["pnl"], column=c).value = f'={col}{rm["r_tot"]}-{col}{rm["e_tot"]}'
    ws2.cell(row=rm["pnl_c"], column=c).value = (f'={col}{rm["pnl"]}-{pr(R["invest"])}' if m == 1
        else f'={prev}{rm["pnl_c"]}+{col}{rm["pnl"]}')

    for key in rm:
        cell = ws2.cell(row=rm[key], column=c)
        cell.number_format = '#,##0'
        cell.font = black
        cell.border = thin_border
        cell.alignment = right_al

for key in ["r_tot", "e_tot", "pnl", "pnl_c"]:
    for c in range(1, 26):
        ws2.cell(row=rm[key], column=c).font = black_bold
    if key == "pnl_c":
        for c in range(1, 26):
            ws2.cell(row=rm[key], column=c).fill = green_fill

# ═══ SHEET 3: Unit-экономика ═══
ws3 = wb.create_sheet("Unit-экономика")
set_col_widths(ws3, [30, 20, 35])

ws3.cell(row=1, column=1, value="Unit-экономика EVA").font = title_font

for c, h in enumerate(["Метрика", "Значение", "Комментарий"], 1):
    cell = ws3.cell(row=3, column=c, value=h)
    cell.font = header_font
    cell.fill = header_fill
    cell.border = thin_border

unit = [
    ("ARPU средний/мес", f"={pr(R['price_m'])}*(1-{pr(R['annual_pct'])}/100)+{pr(R['price_y'])}/12*{pr(R['annual_pct'])}/100", "Микс тарифов"),
    ("CAC", f"={pr(R['cac'])}", ""),
    ("Churn месячный", f"={pr(R['churn'])}/100", ""),
    ("Срок жизни, мес", f"=1/({pr(R['churn'])}/100)", "1/churn"),
    ("LTV", f"=B4*B7", "ARPU * срок жизни"),
    ("LTV / CAC", f"=B8/B5", "Целевой: >3x"),
    ("Payback, мес", f"=B5/B4", "CAC / ARPU"),
]

for i, (a, b, c) in enumerate(unit, 4):
    ws3.cell(row=i, column=1, value=a).font = black
    cell_b = ws3.cell(row=i, column=2, value=b)
    cell_b.font = green_font
    cell_b.number_format = '#,##0.0'
    ws3.cell(row=i, column=3, value=c).font = muted_font
    for cc in range(1, 4):
        ws3.cell(row=i, column=cc).border = thin_border

# ═══ SHEET 4: Сводка ═══
ws4 = wb.create_sheet("Сводка")
set_col_widths(ws4, [35, 20])

ws4.cell(row=1, column=1, value="Сводные показатели").font = title_font

summ = [
    ("Инвестиции", f"={pr(R['invest'])}", '#,##0'),
    ("Пользователей мес 24", f"='P&L помесячный'!Y{rm['total']}", '#,##0'),
    ("EVA+ подписчиков мес 24", f"='P&L помесячный'!Y{rm['prem']}", '#,##0'),
    ("Выручка мес 24", f"='P&L помесячный'!Y{rm['r_tot']}", '#,##0'),
    ("P&L накопл. мес 24", f"='P&L помесячный'!Y{rm['pnl_c']}", '#,##0'),
    ("ROI мес 24", f"='P&L помесячный'!Y{rm['pnl_c']}/{pr(R['invest'])}", '0.0%'),
    ("LTV / CAC", f"='Unit-экономика'!B9", '0.0"x"'),
]

for i, (a, b, fmt) in enumerate(summ, 3):
    ws4.cell(row=i, column=1, value=a).font = black_bold
    cell_b = ws4.cell(row=i, column=2, value=b)
    cell_b.font = green_font
    cell_b.number_format = fmt
    for cc in range(1, 3):
        ws4.cell(row=i, column=cc).border = thin_border

out = r"C:\Users\volyu\OneDrive\Desktop\PSY\МИП\Геймификация\Ева_30.05.26\docs\EVA_financial_model.xlsx"
wb.save(out)
print(f"OK: {out}")
