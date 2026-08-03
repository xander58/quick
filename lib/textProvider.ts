import quotesData from "@/data/quotes-ru.json";

export type TextMode = "quote" | "words";

export interface TextSample {
  text: string;
  author: string;
  source: string;
}

/**
 * 112 отрывков из 8 авторов (Чехов, Толстой, Тургенев, Достоевский, Гоголь,
 * Горький, Пушкин, Герцен), взятые из корпуса RusLit
 * (https://github.com/d0rj/RusLit) — общественное достояние, авторы умерли
 * более 70 лет назад. Отрывки нарезаны автоматически по границам предложений
 * (90–260 символов) и прошли проверку качества: начинаются с большой буквы,
 * заканчиваются знаком препинания, без обрывков диалогов и сносок, без
 * вкраплений на латинице (не заставляем переключать раскладку клавиатуры
 * посреди русского текста) и без редакторских скобок/артефактов оцифровки.
 *
 * Как пополнить корпус дальше — см. scripts/extract_quotes.py (там же
 * инструкция, как скачать корпус RusLit и перезапустить нарезку с другими
 * авторами или порогами длины).
 */
export const QUOTES_RU: TextSample[] = quotesData;

/**
 * Сид частотного словаря. Расширить до 500–1000 слов перед продакшеном.
 */
export const WORDS_RU: string[] = [
  "и", "в", "не", "он", "на", "я", "что", "тот", "быть", "с",
  "а", "весь", "это", "как", "она", "по", "но", "они", "к", "у",
  "ты", "из", "мы", "за", "вы", "так", "же", "от", "сказать", "себя",
  "один", "ещё", "бы", "человек", "когда", "уже", "или", "если", "только", "большой",
  "говорить", "наш", "какой", "который", "свой", "мочь", "время", "рука", "год", "знать",
  "видеть", "день", "дело", "жизнь", "стать", "хотеть", "слово", "лицо", "место", "работа",
];

function getRandomQuote(): TextSample {
  return QUOTES_RU[Math.floor(Math.random() * QUOTES_RU.length)];
}

/**
 * Убирает пунктуацию для режима "без пунктуации" — в духе Monkeytype.
 * Упрощение: заодно приводим к нижнему регистру, т.к. заглавные буквы
 * в середине текста (имена собственные) без знаков препинания смотрятся
 * непоследовательно. При расширении корпуса можно сделать точнее.
 *
 * ВАЖНО: одиночный дефис ("-") сюда специально не включён. В отличие от
 * тире (— / –), которое в текстах всегда окружено пробелами, дефис в
 * русском часто стоит внутри слова без пробелов: "где-нибудь", "кто-то",
 * "по-русски", "двумя-тремя". Если вырезать его наравне с остальной
 * пунктуацией, слова слипаются в бессмыслицу — "гденибудь", "двумятремя".
 *
 * НО: в части старых текстов тире записано как двойной дефис "--" (так
 * его печатали, когда не было отдельного символа «—»/«–»). Это тире,
 * а не часть слова — компаунд-слова никогда не пишутся через двойной
 * дефис, — поэтому его убираем отдельным шагом до защиты одиночного дефиса.
 */
function stripPunctuation(text: string): string {
  return text
    .replace(/--+/g, " ")
    .replace(/[.,!?;:"«»—–()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function generateWordSequence(count: number, punctuation: boolean): string {
  const words: string[] = [];
  let sentenceStart = true;
  for (let i = 0; i < count; i++) {
    let word = WORDS_RU[Math.floor(Math.random() * WORDS_RU.length)];

    if (punctuation) {
      if (sentenceStart) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
        sentenceStart = false;
      }
      const roll = Math.random();
      if (roll < 0.08) {
        word += ",";
      } else if (roll < 0.16) {
        word += ".";
        sentenceStart = true;
      }
    }

    words.push(word);
  }
  return words.join(" ");
}

/**
 * Для режима "words" длину текста не угадать заранее (замер идёт по таймеру,
 * а не по количеству слов), поэтому генерируем с запасом и не даём
 * тексту закончиться раньше времени (см. useTypingSession — там текст
 * дописывается по мере приближения к концу буфера).
 */
export function getTextForMode(mode: TextMode, punctuation: boolean): string {
  if (mode === "quote") {
    const quote = getRandomQuote().text;
    return punctuation ? quote : stripPunctuation(quote);
  }
  return generateWordSequence(80, punctuation);
}

export function getMoreWords(punctuation: boolean): string {
  return generateWordSequence(40, punctuation);
}
