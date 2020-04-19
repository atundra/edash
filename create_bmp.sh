#!/usr/bin/env bash

if [[ $# -ne 2 ]]; then
  echo "Arguments error: script accepts 2 arguments, input image and output file name without extension"
  exit 1
fi

magick convert -alpha off -compress none $1 BMP3:$2.bmp
