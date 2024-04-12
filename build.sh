#!/bin/bash

cd GetAppIcon
# swift build --build-path ../.tmp --configuration=release -Xswiftc -static-stdlib
swift build --build-path ../.tmp --configuration=release
cd ..
cp .tmp/release/GetAppIcon ./run
rm -rf .tmp
