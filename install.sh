#!/bin/sh

set -e

help() {
    cat <<'EOF'
Install a binary release of a digger

Usage:
    install.sh [options]

Options:
    -h, --help      Display this message
    --git SLUG      Get the crate from "https://github/$SLUG"
    -f, --force     Force overwriting an existing binary
    --crate NAME    Name of the crate to install (default <repository name>)
    --tag TAG       Tag (version) of the crate to install (default <latest release>)
    --target TARGET Install the release compiled for $TARGET (default <`rustc` host>)
    --to LOCATION   Where to install the binary (default ~/.cargo/bin)
EOF
}

say() {
    echo "install.sh: $1"
}

say_err() {
    say "$1" >&2
}

err() {
    if [ ! -z $td ]; then
        rm -rf $td
    fi

    say_err "ERROR $1"
    exit 1
}

need() {
    if ! command -v $1 > /dev/null 2>&1; then
        err "need $1 (command not found)"
    fi
}

get_platform() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            local platform="debian"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
            local platform="darwin"
    elif [[ "$OSTYPE" == "cygwin" ]]; then
            say_err "Cygwin platform is not supported, abborting ..."
    elif [[ "$OSTYPE" == "msys" ]]; then
            # Lightweight shell and GNU utilities compiled for Windows (part of MinGW)
            say_err "mysys / MinGW platform is not supported, abborting ..."
    elif [[ "$OSTYPE" == "win32" ]]; then
            say_err "windows platform is not supported, abborting ..."
    elif [[ "$OSTYPE" == "freebsd"* ]]; then
            say_err "Freebsd platform is not supported, abborting ..."
    else
            say_err "Unknwon platform and not supported, aborting ..."
    fi   
    echo $platform 
}

# Dependencies
need basename
need curl
need install
need mkdir
need mktemp
need tar
need cut
need grep
need unzip



diggerdir=$HOME/.digger
platform=`get_platform`
tag=`curl -sk http://digger-releases.s3-eu-west-1.amazonaws.com/STABLE-VERSION`
destination="$diggerdir/dg$tag"
executable="$destination/dg/dg"
symlink="/usr/local/bin/dg"
filename="dg-$platform-$tag.zip"
url="http://digger-releases.s3-eu-west-1.amazonaws.com/$platform/$filename"

say "removing old installations"
rm -rf $destination
rm -rf $symlink

say "Downloading latest stable version of dg ($tag)"
wget $url

say "extrating zip file"
unzip -q $filename -d $destination
chmod +x $executable

say "creating symlink"
ln -s $executable $symlink
