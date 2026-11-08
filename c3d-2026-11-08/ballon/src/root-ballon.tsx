import React from "react";
import { Composition } from "remotion";
import { BallonShort, BALLON_FRAMES } from "./videos/ballon/Ballon";
export const RootBallon: React.FC = () => (
  <Composition id="BallonShort" component={BallonShort} durationInFrames={BALLON_FRAMES} fps={30} width={1080} height={1920} />
);
