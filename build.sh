#!/usr/bin/env bash
# fail if any commands fails
set -e
# debug log
set -x

# write your script here
echo "Hello JSARToolKit!"

#!/bin/bash
# fail if any commands fails
set -e
# debug log
set -x

OURDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [[ -z "${EMSCRIPTEN}" ]]; then
    # sudo apt-get update
    wget -q https://s3.amazonaws.com/mozilla-games/emscripten/releases/emsdk_portable.tar.gz

    #wget "https://docs.google.com/uc?export=download&confirm=gd87&id=0B0I5m7Yc2x-rdUxxV0pOT1o2b2c"
    tar -xf emsdk_portable.tar.gz
    ls
    cd emsdk_portable
    # Fetch the latest registry of available tools.
    ./emsdk update
    # Download and install the latest SDK tools.
    ./emsdk install latest
    # Make the "latest" SDK "active"
    ./emsdk activate latest

    source ./emsdk_env.sh

    mv $OURDIR/emscripten/artoolkit5/include/AR/config.h.in $OURDIR/emscripten/artoolkit5/include/AR/config.h
fi

cd $OURDIR

# Clone ARToolKit5 project to get the latest source files. From within jsartoolkit5 directory do git submodule update --init. 
# If you already cloned ARToolKit5 to a different directory make sure ARTOOLKIT5_ROOT environment variable exists
if [[ -z "${ARTOOLKIT5_ROOT}" ]]; then
    git submodule update --init
fi

npm run build