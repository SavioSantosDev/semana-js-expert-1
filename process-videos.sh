# Diretório onde estão os vídeos.
ASSETS_FOLDER=assets

# Diretório onde os vídeos serão pré processados.
TIMELINE_OUTPUT=$ASSETS_FOLDER/timeline

# Loop nos arquivos .mp4
for fileMP4 in `ls $ASSETS_FOLDER | grep .mp4`; do
  
  # Corta a extensão e a resolução do arquivo
  FILENAME=$(echo $fileMP4 | sed -n 's/.mp4//p' | sed -n 's/-1920x1080//p')

  # Cria uma pasta com o nome de cada um dos vídeos.
  mkdir -p $TIMELINE_OUTPUT/$FILENAME

  FILE_INPUT=$ASSETS_FOLDER/$fileMP4
  FILE_OUTPUT=$TIMELINE_OUTPUT/$FILENAME/$FILENAME

  DURATION=$(ffprobe -i $FILE_INPUT -show_format -v quiet | sed -n 's/duration=//p')

  OUTPUT_720=$FILE_OUTPUT-$DURATION-720
  OUTPUT_360=$FILE_OUTPUT-$DURATION-360
  OUTPUT_144=$FILE_OUTPUT-$DURATION-144

  # Ver nas referências, o link para escolha das configurações recomendadas para cada resolução.
  echo 'rendering in 720p'
  ffmpeg -y -i $FILE_INPUT \
    -c:a aac -ac 2 \
    -vcodec h264 -acodec aac \
    -ab 128k \
    -movflags frag_keyframe+empty_moov+default_base_moof \
    -b:v 1500k \
    -maxrate 1500k \
    -bufsize 1000k \
    -vf "scale=-1:720" \
    $OUTPUT_720.mp4
    # -v quiet \

  echo 'rendering in 360p'
  ffmpeg -y -i $FILE_INPUT \
    -c:a aac -ac 2 \
    -vcodec h264 -acodec aac \
    -ab 128k \
    -movflags frag_keyframe+empty_moov+default_base_moof \
    -b:v 400k \
    -maxrate 400k \
    -bufsize 400k \
    -vf "scale=-1:360" \
    $OUTPUT_360.mp4

    echo 'rendering in 144p'
  ffmpeg -y -i $FILE_INPUT \
    -c:a aac -ac 2 \
    -vcodec h264 -acodec aac \
    -ab 128k \
    -movflags frag_keyframe+empty_moov+default_base_moof \
    -b:v 300k \
    -maxrate 300k \
    -bufsize 300k \
    -vf "scale=256:144" \
    $OUTPUT_144.mp4
done