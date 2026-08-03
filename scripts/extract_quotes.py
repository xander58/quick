"""
Скрипт нарезки цитат для тренажёра печати из корпуса RusLit
(https://github.com/d0rj/RusLit) — общественное достояние, тексты русской
классики в .txt, взятые из Wikisource/Ilibrary/LitLib.

Как запустить заново (например, чтобы добавить других авторов или
поменять длину отрывков):

  1. Скачать корпус:
     curl -sL https://codeload.github.com/d0rj/RusLit/tar.gz/refs/heads/main \
       -o ruslit.tar.gz && tar -xzf ruslit.tar.gz

  2. Поправить CORPUS_DIR ниже, чтобы указывал на распакованную папку prose/

  3. При желании добавить/убрать авторов в AUTHOR_NAMES (ключ — имя папки
     в корпусе, значение — как автор будет подписан в приложении) и
     подправить MIN_LEN/MAX_LEN/PER_AUTHOR_TARGET под новые требования

  4. python3 extract_quotes.py

  5. Скопировать результат /tmp/quotes_ru.json в data/quotes-ru.json
"""
import os
import re
import json
import random

random.seed(42)

CORPUS_DIR = "/tmp/RusLit-main/prose"
MIN_LEN = 90
MAX_LEN = 260
PER_AUTHOR_TARGET = 15

AUTHOR_NAMES = {
    "Chekhov": "Антон Чехов",
    "Tolstoy": "Лев Толстой",
    "Turgenev": "Иван Тургенев",
    "Dostoevsky": "Фёдор Достоевский",
    "Gogol": "Николай Гоголь",
    "Gorky": "Максим Горький",
    "Pushkin": "Александр Пушкин",
    "Herzen": "Александр Герцен",
}

def clean_text(raw: str) -> str:
    # убираем странные переносы строк внутри абзаца и лишние пробелы
    raw = raw.replace("\u00a0", " ")
    return re.sub(r"[ \t]+", " ", raw)

def split_sentences(paragraph: str):
    # разбиваем по концам предложений, сохраняя знак препинания
    parts = re.split(r"(?<=[.!?…])\s+", paragraph.strip())
    return [p.strip() for p in parts if p.strip()]

def is_good_candidate(sentence: str) -> bool:
    if not (MIN_LEN <= len(sentence) <= MAX_LEN):
        return False
    if sentence.startswith(("—", "-", "«")):
        return False
    if not sentence[0].isupper():
        return False
    if sentence.endswith(":"):
        return False
    if re.match(r"^[IVXLCDM]+\.?$", sentence.strip()):
        return False
    if sentence.isupper():
        return False
    if sentence.count('"') % 2 != 0:
        return False
    # избегаем предложений с обрывками вроде "..." в начале или множеством цифр (сноски)
    if re.search(r"\d{3,}", sentence):
        return False
    if sentence.count("—") > 1:
        return False
    # вкрапления на латинице (французские/латинские фразы, "table d'hôte",
    # "nec plus ultra" и т.п.) заставили бы печатающего переключать раскладку
    # клавиатуры посреди русского текста — для тренажёра это не подходит
    if re.search(r"[a-zA-Z]{2,}", sentence):
        return False
    # фигурные/квадратные скобки — обычно редакторские вставки или
    # артефакты оцифровки (незакрытые скобки, сноски переводчика)
    if re.search(r"[{}\[\]]", sentence):
        return False
    return True

def get_works(author_dir):
    files = [f for f in os.listdir(author_dir) if f.endswith(".txt")]
    random.shuffle(files)
    return files

results = []

for folder, author in AUTHOR_NAMES.items():
    author_dir = os.path.join(CORPUS_DIR, folder)
    if not os.path.isdir(author_dir):
        continue

    candidates = []
    files = get_works(author_dir)

    for fname in files:
        path = os.path.join(author_dir, fname)
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
        except UnicodeDecodeError:
            continue

        content = clean_text(content)
        lines = content.split("\n")

        # Название файла — куда надёжнее источник заголовка, чем первые строки
        # содержимого: формат шапки (пустая строка/автор/название) не унифицирован
        # по всему корпусу. А вот сколько строк в начале файла пропустить перед
        # телом текста — определяем по первым непустым строкам (это обычно
        # имя автора + название, 2 строки).
        title = os.path.splitext(fname)[0].strip()

        non_empty_idx = [i for i, l in enumerate(lines) if l.strip()]
        if len(non_empty_idx) < 3:
            continue
        body_start_idx = non_empty_idx[2]

        body = "\n".join(lines[body_start_idx:])
        paragraphs = [p for p in body.split("\n") if len(p.strip()) > MIN_LEN]

        for para in paragraphs[:40]:  # не уходим глубоко в каждый файл
            for sentence in split_sentences(para):
                if is_good_candidate(sentence):
                    candidates.append({"text": sentence, "author": author, "source": title})

        if len(candidates) >= PER_AUTHOR_TARGET * 4:
            break

    random.shuffle(candidates)
    # дедуп по префиксу текста на случай повторов
    seen = set()
    picked = []
    for c in candidates:
        key = c["text"][:40]
        if key in seen:
            continue
        seen.add(key)
        picked.append(c)
        if len(picked) >= PER_AUTHOR_TARGET:
            break

    results.extend(picked)

random.shuffle(results)

print(f"Итого отобрано: {len(results)}")
by_author = {}
for r in results:
    by_author[r["author"]] = by_author.get(r["author"], 0) + 1
for a, c in by_author.items():
    print(f"  {a}: {c}")

with open("/tmp/quotes_ru.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
