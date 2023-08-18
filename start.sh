#!/bin/bash

export NODE_ENV=production

npm run migrate up
if [ $? -ne 0 ]; then
  echo "Migration failed!"
  exit 1
fi

node ./main.js