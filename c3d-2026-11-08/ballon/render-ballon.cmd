cd /d %~dp0
npx remotion render src/entry-ballon.ts BallonShort out\ballon-c3d-roh.mp4 --gl=angle --codec=h264 --crf=18
