cd /d %~dp0
npx remotion render src/entry-palast.ts PalastShort out\palast-c3d-roh.mp4 --gl=angle --codec=h264 --crf=18
