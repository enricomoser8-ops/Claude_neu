import React from "react";
import { Composition } from "remotion";
import { PalastShort, PALAST_FRAMES } from "./videos/palast/Palast";
export const RootPalast: React.FC = () => (
  <Composition id="PalastShort" component={PalastShort} durationInFrames={PALAST_FRAMES} fps={30} width={1080} height={1920} />
);
