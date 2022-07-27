#!/bin/sh
PORT=10010

if test -z ${NEXT_PUBLIC_PORT+y}
then
    echo "PORT NOT SET USING DEFAULT"
else
    echo "CUSTOM PORT SET"
    PORT=$NEXT_PUBLIC_PORT
fi

export NODE_OPTIONS="--max-old-space-size=8192"

mkdir -p video

./node_modules/.bin/next build
./node_modules/.bin/next start -p $PORT
