#!/bin/bash
# Нормализация громкости звуков нажатия клавиши (public/sounds/alpaca/).
#
# Исходные записи свитча Alpaca (см. public/sounds/SOURCE.txt) были очень
# тихими — пик громкости около -20 дБ при доступном максимуме 0 дБ. Из-за
# этого звук был почти не слышен даже на приличной громкости устройства.
# Этот скрипт поднимает пик каждого сэмпла до -1 дБ (используем весь
# доступный динамический диапазон, оставляя небольшой запас от клиппинга).
#
# Запуск: bash scripts/normalize_sounds.sh
# Требует ffmpeg.

set -e
cd "$(dirname "$0")/../public/sounds/alpaca"

for f in press0 press1 press2 press3 press4; do
  current_max=$(ffmpeg -i "${f}.mp3" -af volumedetect -f null - 2>&1 \
    | grep max_volume | grep -oE '\-?[0-9]+\.[0-9]+')
  boost=$(python3 -c "print(-1.0 - (${current_max}))")
  echo "${f}: текущий пик ${current_max}дБ, поднимаем на +${boost}дБ"
  ffmpeg -y -i "${f}.mp3" -af "volume=${boost}dB" -q:a 2 "${f}_normalized.mp3" -loglevel error
  mv "${f}_normalized.mp3" "${f}.mp3"
done

echo "Готово. Проверить результат: ffmpeg -i press0.mp3 -af volumedetect -f null -"
