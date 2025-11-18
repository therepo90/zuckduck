#echo $SHELL #bin/bash?
set -e
# cp all /assets dir to /dist
mkdir -p ./dist
cp -r ./assets/* ./dist/
