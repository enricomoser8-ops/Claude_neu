# Ausgelesene Effekte und Expressions aus Chris Morans Asset-Paket

Erzeugt mit tools/aepdump.py (Strings aus den Binärdateien). Effektwerte (Zahlen) stehen nicht drin, nur Effektnamen, Ebenen-/Reglernamen und Expressions wörtlich. AE-Version der Dateien: 2024-2026 (in AE 2023 nicht zu öffnen).
```
===== CRT Emulation_Template.aep 525623
MATCHNAMES: ADBE Accepts Lights, ADBE Accepts Shadows, ADBE Ambient Coefficient, ADBE Anchor Point, ADBE Appears in Reflections, ADBE Bevel Direction, ADBE Box Blur2, ADBE Brightness & Contrast 2, ADBE Casts Shadows, ADBE Diffuse Coefficient, ADBE Displacement Map, ADBE Exposure2, ADBE Fresnel Coefficient, ADBE Gaussian Blur 2, ADBE Geometry2, ADBE Glo2, ADBE Glossiness Coefficient, ADBE HUE SATURATION, ADBE Index of Refraction, ADBE Metal Coefficient, ADBE Noise2, ADBE Opacity, ADBE Optics Compensation, ADBE Orientation, ADBE Position, ADBE Position_0, ADBE Position_1, ADBE Position_2, ADBE Posterize Time, ADBE Reflection Coefficient, ADBE Rotate X, ADBE Rotate Y, ADBE Rotate Z, ADBE Scale, ADBE Shadow Color, ADBE Shininess Coefficient, ADBE Simple Choker, ADBE Slider Control, ADBE Solid Composite, ADBE Specular Coefficient, ADBE Transp Rolloff, ADBE Transparency Coefficient, ADBE Venetian Blinds, bevelEmboss/enabled, chromeFX/enabled, dropShadow/enabled, frameFX/enabled, gradientFill/enabled, innerGlow/enabled, innerShadow/enabled, outerGlow/enabled, patternFill/enabled, solidFill/enabled
NAMES: Slider Control | Downsample % | Slider | Compositing Options | Hue/Saturation | Master|Reds|Yellows|Greens|Cyans|Blues|Magentas | Colorize | Channel Range | Transform | Uniform Scale | Use Composition’s Shutter Angle | Bilinear|Bicubic | Scale Height | Glow | Alpha Channel|Color Channels | On Top|Behind|None | Original Colors|A & B Colors|Arbitrary Map | Sawtooth A>B|Sawtooth B>A|Triangle A>B>A|Triangle B>A>B | Horizontal and Vertical|Horizontal|Vertical | Glow Threshold | Glow Radius | Simple Choker | Final Output|Matte | Choke Matte | Gaussian Blur | Repeat Edge Pixels | Brightness & Contrast | Use Legacy (supports HDR) | Displacement Map | Center Map|Stretch Map to Fit|Tile Map | Wrap Pixels Around | Expand Output | Displacement Map Layer | Exposure | Master|Individual Channels | Bypass Linear Light Conversion | Master | Red | Green | Blue | Fast Box Blur | Blur Radius | Optics Compensation | Reverse Lens Distortion | Horizontal|Vertical|Diagonal | Optimal Pixels (Invalidates Reversal) | Off|Max 2X|Max 4X|Unlimited | Field Of View (FOV) | Noise | Use Color Noise | Clip Result Values | Amount of Noise | Venetian Blinds | Transition Completion | Direction | Width | Feather | Solid Composite | Color | Posterize Time | 6ed1497e-17ad-4a5b-846f-52bb81e20104 | Solids | {} | javascript-1.0 | Emulation | CONTROLS | Flicker Strength | Tv Edges | Smudges | Edge Glow | Glow Mask | Overlay | Screen Mask | Displacement | Exposure Flicker | Masking | Mask 1 | Screen Distortion | Heavy Color Noise | Blur | Blur Dimensions | Footage Placeholder | Scale | Transform 2 | Default | Front | Left | Top | Back | Right | Bottom | Custom View 1 | Custom View 2 | Custom View 3 | Markers | CRT Emulation @ChrisMoran__ | en_US | Footage Scale | 4fb90945-d4bc-4a5f-b968-78f2768a6b40 | 6a988a43-3597-4da0-ae89-9cd68d53dfff | Overlay Intensity | 2082a641-f91f-47d2-b991-d00a6707a831 | Smudges  Strength | 7557fb95-f373-426f-b8c3-4fdaec7c5313 | 556a82b7-37e8-430c-b1c5-9a8725b9732a | Footage Position | 5d3845fe-9b13-45b7-96c7-346280cc8a8a | Footage | f0fc04d8-1736-4c3e-946b-93284bb46a07 | 00000000-0000-0000-0000-000000000000 | bf8d5ab1-5bfe-4f48-a348-20c3629b7137.png | Fine Tune | b1abc3b3-d283-4b27-b9c1-82d001bfd30e | FOOTAGE | Untitled | H.264 - Match Render Settings - 15 Mbps | PlaceholderFootage.mp4
EXPR>> wiggle(
  24,
  thisComp.layer("CONTROLS").effect("Flicker Strength")("Slider") / 100
);
EXPR>> wiggle(2,30)
EXPR>> loopOut(type = "cycle", numKeyframes = 0)
EXPR>> wiggle(24,5)
EXPR>> ctrl = thisComp.layer("CONTROLS"); // change if needed
q = ctrl.effect("Downsample %")("Slider"); // use your actual slider name

q = clamp(q, 1, 100);
q;
EXPR>> ctrl = thisComp.layer("CONTROLS"); // change if needed
q = ctrl.effect("Downsample %")("Slider"); // use your actual slider name

q = clamp(q, 1, 100);

// inverse: 20 -> 500, 100 -> 100
inv = 10000 / q;

// If Scale is not separated, return [x,y]. If separated, return a single number.
if (value instanceof Array){
  [inv, inv]
} else {
  inv
}
EXPR>> loopOutDuration(type = "cycle", duration = 0)
===== Callouts_Vox.aep 516559
MATCHNAMES: ADBE Anchor Point, ADBE Appears in Reflections, ADBE Bevel Direction, ADBE Box Blur2, ADBE CurvesCustom, ADBE Exposure2, ADBE Fresnel Coefficient, ADBE Glossiness Coefficient, ADBE Index of Refraction, ADBE Opacity, ADBE Orientation, ADBE Position, ADBE Position_0, ADBE Position_1, ADBE Position_2, ADBE Posterize Time, ADBE Reflection Coefficient, ADBE Rotate X, ADBE Rotate Y, ADBE Rotate Z, ADBE Roughen Edges, ADBE Scale, ADBE Transp Rolloff, ADBE Transparency Coefficient, PEQCAGL, VISINF Grain Implant, bevelEmboss/enabled, chromeFX/enabled, dropShadow/enabled, frameFX/enabled, gradientFill/enabled, innerGlow/enabled, innerShadow/enabled, outerGlow/enabled, patternFill/enabled, solidFill/enabled
NAMES: Quick Chromatic Aberration 3 | Product Page | More Free Plugins | Get Support | Apple | Apple M2 Max | 4.1 Metal - 89.3 | 4.10 | Red & Blue|Red & Green|Green & Blue | Relative %|Absolute Point | Single|(-|Auto|Fixed | Reset Transforms | Not Recommended for Text | Auto|Manual | PreProc|Output Multed|(-|Final Result | Update Shaders | About | GPU Spec: | Transform | Position | Anchor | Stylistic | Distort Uniform | Blur | Sample Count | Sample Multiplier | Compositing | Buffer Expansion | Debug | View | Output Buffer Fill | GPU Buffer Fill | Left | Top | Right | Bottom | Compositing Options | Posterize Time | Exposure | Master|Individual Channels | Bypass Linear Light Conversion | Master | Red | Green | Blue | Add Grain | Preview|Blending Matte|Final Output | Film|Multiply|Add|Screen|Overlay | Multiply|Screen | Intensity|Alpha|Inverted Intensity|Inverted Alpha | Center|Stretch to Fit | Viewing Mode | Preview Region | Center | Tweaking | Size | Channel Intensities | Channel Size | Color | Application | Channel Balance | Animation | Blend with Original | Color Matching | Masking Layer | Curves | RGB|Red|Green|Blue|Alpha | Fast Box Blur | Horizontal and Vertical|Horizontal|Vertical | Repeat Edge Pixels | Blur Radius | Roughen Edges | Cycle Evolution | Evolution Options | Random Seed | 6ed1497e-17ad-4a5b-846f-52bb81e20104 | Solids | {"lutInterpolationMethod":1} | {} | javascript-1.0 | Callouts | Mask 1 | Highlighter | Shape 1 | Path 1 | Stroke 1 | Fill 1 | Trim Paths 1 | Arrow | Group 1 | Border | Edge Sharpness | Scale | Roughen Edges 2 | Dopler 3 | Ellipse 1 | Ellipse Path 1 | Dopler | Dopler 2 | Squiggle | Circle | FREE | x | CALLOUTS | Range Selector 1 | Shape Layer 1 | Rectangle 1 | Rectangle Path 1 | Default | Front | Back | Custom View 1 | Custom View 2 | Custom View 3 | Markers | Untitled | en_US
EXPR>> // Exposure flicker (subtle, random, film projection feel)
seedRandom(index + time, true);
flickerStrength = 0.03;  // adjust: 0.02 - 0.1 for subtlety
freq = 2;               // flicker frequency per second

// Generate random value at intervals
holdTime = 1 / freq;
floorTime = Math.floor(time / holdTime) * holdTime;
randomVal = random(-flickerStrength, flickerStrength);

randomVal
EXPR>> posterizeTime(12);
value
===== InkBleed.aep 327077
MATCHNAMES: ADBE Anchor Point, ADBE Appears in Reflections, ADBE Bevel Direction, ADBE Box Blur2, ADBE CurvesCustom, ADBE Exposure2, ADBE Fresnel Coefficient, ADBE Glossiness Coefficient, ADBE Index of Refraction, ADBE Opacity, ADBE Orientation, ADBE Position, ADBE Position_0, ADBE Position_1, ADBE Position_2, ADBE Posterize Time, ADBE Reflection Coefficient, ADBE Rotate X, ADBE Rotate Y, ADBE Rotate Z, ADBE Roughen Edges, ADBE Scale, ADBE Simple Choker, ADBE Transp Rolloff, ADBE Transparency Coefficient, PEQCAGL, VISINF Grain Implant, bevelEmboss/enabled, chromeFX/enabled, dropShadow/enabled, frameFX/enabled, gradientFill/enabled, innerGlow/enabled, innerShadow/enabled, outerGlow/enabled, patternFill/enabled, solidFill/enabled
NAMES: Quick Chromatic Aberration 3 | Product Page | More Free Plugins | Get Support | Apple | Apple M2 Max | 4.1 Metal - 89.3 | 4.10 | Red & Blue|Red & Green|Green & Blue | Relative %|Absolute Point | Single|(-|Auto|Fixed | Reset Transforms | Not Recommended for Text | Auto|Manual | PreProc|Output Multed|(-|Final Result | Update Shaders | About | GPU Spec: | Transform | Position | Anchor | Stylistic | Distort Uniform | Blur | Sample Count | Sample Multiplier | Compositing | Buffer Expansion | Debug | View | Output Buffer Fill | GPU Buffer Fill | Left | Top | Right | Bottom | Compositing Options | Posterize Time | Exposure | Master|Individual Channels | Bypass Linear Light Conversion | Master | Red | Green | Blue | Add Grain | Preview|Blending Matte|Final Output | Film|Multiply|Add|Screen|Overlay | Multiply|Screen | Intensity|Alpha|Inverted Intensity|Inverted Alpha | Center|Stretch to Fit | Viewing Mode | Preview Region | Center | Tweaking | Size | Channel Intensities | Channel Size | Color | Application | Channel Balance | Animation | Blend with Original | Color Matching | Masking Layer | Curves | RGB|Red|Green|Blue|Alpha | Fast Box Blur | Horizontal and Vertical|Horizontal|Vertical | Repeat Edge Pixels | Blur Radius | Roughen Edges | Cycle Evolution | Border | Edge Sharpness | Scale | Evolution Options | Random Seed | Simple Choker | Final Output|Matte | Choke Matte | 6ed1497e-17ad-4a5b-846f-52bb81e20104 | Solids | {"lutInterpolationMethod":1} | {} | javascript-1.0 | Ink Bleed | Mask 1 | Foux Camera | Circle | Group 1 | Path 1 | Stroke 1 | Trim Paths 1 | Roughen Edges 2 | INK BLEED | Shape Layer 1 | Rectangle 1 | Rectangle Path 1 | Fill 1 | Default | Front | Back | Custom View 1 | Custom View 2 | Custom View 3 | Markers | Untitled | en_US
EXPR>> // Exposure flicker (subtle, random, film projection feel)
seedRandom(index + time, true);
flickerStrength = 0.03;  // adjust: 0.02 - 0.1 for subtlety
freq = 2;               // flicker frequency per second

// Generate random value at intervals
holdTime = 1 / freq;
floorTime = Math.floor(time / holdTime) * holdTime;
randomVal = random(-flickerStrength, flickerStrength);

randomVal
EXPR>> posterizeTime(8);
value
EXPR>> posterizeTime(12);
value
===== Texturing.aep 205651
MATCHNAMES: ADBE Anchor Point, ADBE Appears in Reflections, ADBE Bevel Direction, ADBE CurvesCustom, ADBE Displacement Map, ADBE Fresnel Coefficient, ADBE Glossiness Coefficient, ADBE Index of Refraction, ADBE Opacity, ADBE Orientation, ADBE Position, ADBE Position_0, ADBE Position_1, ADBE Position_2, ADBE Reflection Coefficient, ADBE Rotate X, ADBE Rotate Y, ADBE Rotate Z, ADBE Roughen Edges, ADBE Scale, ADBE Transp Rolloff, ADBE Transparency Coefficient, bevelEmboss/enabled, chromeFX/enabled, dropShadow/enabled, frameFX/enabled, gradientFill/enabled, innerGlow/enabled, innerShadow/enabled, outerGlow/enabled, patternFill/enabled, solidFill/enabled
NAMES: Curves | RGB|Red|Green|Blue|Alpha | Compositing Options | Roughen Edges | Cycle Evolution | Border | Scale | Evolution Options | Random Seed | Displacement Map | Center Map|Stretch Map to Fit|Tile Map | Wrap Pixels Around | Expand Output | Displacement Map Layer | Max Horizontal Displacement | 6ed1497e-17ad-4a5b-846f-52bb81e20104 | Solids | {"lutInterpolationMethod":1} | {} | javascript-1.0 | Texture Layers | Layer 0 | Layer 2 | Newspaper | RIDGES | Texturing Example Comp | Faded Newspaper | Line 2 | Group 1 | Path 1 | Stroke 1 | Trim Paths 1 | TEXTURE | Range Selector 1 | Roughen Edges (add to further augment displacement) | Edge Sharpness | Stretch Width or Height | Vingette | BG | Default | Front | Left | Top | Back | Right | Bottom | Custom View 1 | Custom View 2 | Custom View 3 | Markers | Untitled | en_US
===== Flicker & Weave.aep 228232
MATCHNAMES: ADBE Accepts Lights, ADBE Accepts Shadows, ADBE Ambient Coefficient, ADBE Anchor Point, ADBE Appears in Reflections, ADBE Bevel Direction, ADBE Casts Shadows, ADBE Diffuse Coefficient, ADBE Exposure2, ADBE Fresnel Coefficient, ADBE Geometry2, ADBE Glossiness Coefficient, ADBE Index of Refraction, ADBE Metal Coefficient, ADBE Opacity, ADBE Orientation, ADBE Position, ADBE Position_0, ADBE Position_1, ADBE Position_2, ADBE Reflection Coefficient, ADBE Rotate X, ADBE Rotate Y, ADBE Rotate Z, ADBE Scale, ADBE Shadow Color, ADBE Shininess Coefficient, ADBE Specular Coefficient, ADBE Transp Rolloff, ADBE Transparency Coefficient, bevelEmboss/enabled, chromeFX/enabled, dropShadow/enabled, frameFX/enabled, gradientFill/enabled, innerGlow/enabled, innerShadow/enabled, outerGlow/enabled, patternFill/enabled, solidFill/enabled
NAMES: Transform | Uniform Scale | Use Composition’s Shutter Angle | Bilinear|Bicubic | Position | Scale | Compositing Options | Exposure | Master|Individual Channels | Bypass Linear Light Conversion | Master | Red | Green | Blue | 6ed1497e-17ad-4a5b-846f-52bb81e20104 | Solids | {} | javascript-1.0 | Flicker Presets | Static | Weave | Flicker | Default | Front | Left | Top | Back | Right | Bottom | Custom View 1 | Custom View 2 | Custom View 3 | Markers | Untitled | en_US | Qr | Untitled-1 Layers
EXPR>> fps = 24; // number of moves per second
seedRandom(Math.floor(time * fps), true);

jitter = 1.5; // max pixel movement
value + [random(-jitter, jitter), random(-jitter, jitter)]
EXPR>> wiggle(24,.2)
===== Flicker and Glow.aep 1946221
MATCHNAMES: ADBE Anchor Point, ADBE Appears in Reflections, ADBE Bevel Direction, ADBE Exposure2, ADBE Fill, ADBE Fresnel Coefficient, ADBE Gaussian Blur 2, ADBE Geometry2, ADBE Glo2, ADBE Global Angle2, ADBE Glossiness Coefficient, ADBE HUE SATURATION, ADBE Index of Refraction, ADBE Invert, ADBE Opacity, ADBE Orientation, ADBE Position, ADBE Position_0, ADBE Position_1, ADBE Position_2, ADBE Posterize Time, ADBE Reflection Coefficient, ADBE Rotate X, ADBE Rotate Y, ADBE Rotate Z, ADBE Scale, ADBE Transp Rolloff, ADBE Transparency Coefficient, Pseudo/jnOIbb35c80eN, VISINF Grain Implant, bevelEmboss/enabled, chromeFX/enabled, dropShadow/enabled, frameFX/enabled, gradientFill/enabled, innerGlow/enabled, innerShadow/enabled, outerGlow/enabled, patternFill/enabled, solidFill/enabled
NAMES: Add Grain | Preview|Blending Matte|Final Output | Film|Multiply|Add|Screen|Overlay | Multiply|Screen | Intensity|Alpha|Inverted Intensity|Inverted Alpha | Center|Stretch to Fit | Viewing Mode | Preview Region | Tweaking | Channel Intensities | Channel Size | Color | Application | Channel Balance | Animation | Blend with Original | Color Matching | Masking Layer | Compositing Options | Glow | Alpha Channel|Color Channels | On Top|Behind|None | Original Colors|A & B Colors|Arbitrary Map | Sawtooth A>B|Sawtooth B>A|Triangle A>B>A|Triangle B>A>B | Horizontal and Vertical|Horizontal|Vertical | Glow Radius | Glow Intensity | Posterize Time | Exposure | Master|Individual Channels | Bypass Linear Light Conversion | Master | Red | Green | Blue | Transform | Uniform Scale | Use Composition’s Shutter Angle | Bilinear|Bicubic | Position | Scale Height | Gaussian Blur | Repeat Edge Pixels | Smooth|Hold | Texture  | Image | Delay | Dynamics | Enable | Type | Frequency | Hue/Saturation | Master|Reds|Yellows|Greens|Cyans|Blues|Magentas | Colorize | Channel Range | Invert | Fill | All Masks | 6ed1497e-17ad-4a5b-846f-52bb81e20104 | Solids | {"lutInterpolationMethod":1} | {} | javascript-1.0 | Glow and Flicker | Grain | Pulsing Glow | Default | Front | Left | Top | Back | Right | Bottom | Custom View 1 | Custom View 2 | Custom View 3 | Markers | Untitled | en_US | VOX Recreation_Vert2.aep | Comps | [t] Gray Solid 3 1 | comp("Map").layer("Gray Solid 3").anchorPoint; | [t] Gray Solid 3 1 - Image | Typography Layers | Texturelabs_Paper_300XL | Images | Nulls & Solids | Secret Sauce | Intensity | Glow Threshold | before | after | before 3 | Ellipse 1 | Ellipse Path 1 | Stroke 1 | Fill 1 | before 2 | 1 | Text Animators | NULL 1 | ODOMETER | Range Selector 1 | Odometer Mask | Rectangle 1 | Rectangle Path 1 | Load Up | Random Appear | Fill Animation | Graph Paper | test Layers | Marimba_Reel.aep | VOX Recreation_Vert2 auto-save 45.aep | Essential Graphics | H.264 - Match Render Settings - 15 Mbps | Text Animators.mp4 | Text Animators_1.mp4
EXPR>> wiggle(2,.2)
EXPR>> seedRandom(index + time, true);
flickerStrength = 0.04;  // adjust: 0.02 - 0.1 for subtlety
freq = 2;               // flicker frequency per second


holdTime = 1 / freq;
floorTime = Math.floor(time / holdTime) * holdTime;
randomVal = random(-flickerStrength, flickerStrength);

randomVal
EXPR>> posterizeTime(24);
x = wiggle(6,1)[0];
y = wiggle(6,1)[1];
[x,y];
EXPR>> 
		var layer = comp("Map").layer("Gray Solid 3");
		if (layer.hasParent) {
			var v = layer.toWorldVec([1,0,0]);
			radiansToDegrees(Math.atan2(v[1],v[0]))
		} else {
			layer.rotation;
		}
		
EXPR>> // Mt. Mograph - Motion 4 (3D Dynamics Expression)
var controllerLayer = comp("Map").layer("Gray Solid 3");
var effectProperty = controllerLayer.effect("Texture ");
var delayEnable = effectProperty("Pseudo/jnOIbb35c80eN-0007");
var delayAmount = effectProperty("Pseudo/jnOIbb35c80eN-0008");
var dynamicsEnable = effectProperty("Pseudo/jnOIbb35c80eN-0011");
var wiggleType = effectProperty("Pseudo/jnOIbb35c80eN-0012");
var frequency = effectProperty("Pseudo/jnOIbb35c80eN-0013");
var amount = effectProperty("Pseudo/jnOIbb35c80eN-0014");
var seperationEnabled = effectProperty("Pseudo/jnOIbb35c80eN-0017");
var seperationX = effectProperty("Pseudo/jnOIbb35c80eN-0018");
var seperationY = effectProperty("Pseudo/jnOIbb35c80eN-0019");
var seperationZ = effectProperty("Pseudo/jnOIbb35c80eN-0020");
var seedValue = effectProperty("Pseudo/jnOIbb35c80eN-0015");
var newValue;
if (dynamicsEnable > 0) {
	if (wiggleType == 1) {
		seedRandom(time + (seedValue * 1000));
		if (seperationEnabled > 0) {
			newValue = [
				wiggle(frequency, seperationX)[0],
				wiggle(frequency, seperationY)[1]
			];
			if (value.length === 3) {
				newValue.push(wiggle(frequency, seperationZ)[2]);
			}
		} else {
			newValue = wiggle(frequency, amount);
		}
	} else if (wiggleType == 2) {
		var timeVal = Math.round((time + (seedValue * 1000)) * frequency) / frequency;
		if (seperationEnabled > 0) {
			newValue = [
				wiggle(frequency, seperationX, 3, 1, timeVal)[0],
				wiggle(frequency, seperationY, 3, 1, timeVal)[1],
			];
			if (value.length === 3) {
				newValue.push(wiggle(frequency, seperationZ, 3, 1, timeVal)[2]);
			}
		} else {
			newValue = wiggle(frequency, amount, 3, 1, timeVal);
		}
	}
}
var lastValue = (newValue || value) + effectProperty("Pseudo/jnOIbb35c80eN-0002");
if (delayEnable > 0) {
	var offsetTime = time - (delayAmount / 100);
	if (dynamicsEnable > 0) {
		lastValue = (lastValue - thisLayer.position) + controllerLayer.position.valueAtTime(offsetTime);
	} else {
		lastValue = effectProperty("Pseudo/jnOIbb35c80eN-0002") + controllerLayer.position.valueAtTime(offsetTime);
	}
}
lastValue;
EXPR>> 
var controllerLayer = comp("Map").layer("Gray Solid 3");
var effectProperty = controllerLayer.effect("Texture ");
var delayEnable = effectProperty("Pseudo/jnOIbb35c80eN-0007");
var delayAmount = effectProperty("Pseudo/jnOIbb35c80eN-0008");
var scaleValue = effectProperty("Pseudo/jnOIbb35c80eN-0003");
if (delayEnable > 0) {
	var offsetTime = time - (delayAmount / 100);
	controllerLayer.scale.valueAtTime(offsetTime) * (scaleValue / 100);
} else {
	[scaleValue, scaleValue];
}
EXPR>> 
var controllerLayer = comp("Map").layer("Gray Solid 3");
var effectProperty = controllerLayer.effect("Texture ");
var delayEnable = effectProperty("Pseudo/jnOIbb35c80eN-0007");
var delayAmount = effectProperty("Pseudo/jnOIbb35c80eN-0008");
var rotationValue = effectProperty("Pseudo/jnOIbb35c80eN-0004");
if (delayEnable > 0) {
	var offsetTime = time - (delayAmount / 100);
	controllerLayer.rotation.valueAtTime(offsetTime) + rotationValue;
} else {
	rotationValue;
}
===== SpotifyWrapped_ForAudience.aep 613993
MATCHNAMES: ADBE Accepts Lights, ADBE Accepts Shadows, ADBE Ambient Coefficient, ADBE Anchor Point, ADBE Appears in Reflections, ADBE Bevel Direction, ADBE Casts Shadows, ADBE Checkbox Control, ADBE Diffuse Coefficient, ADBE Fill, ADBE Fresnel Coefficient, ADBE Geometry2, ADBE Glossiness Coefficient, ADBE Index of Refraction, ADBE Metal Coefficient, ADBE Opacity, ADBE Orientation, ADBE Position, ADBE Position_0, ADBE Position_1, ADBE Position_2, ADBE Reflection Coefficient, ADBE Rotate X, ADBE Rotate Y, ADBE Rotate Z, ADBE Scale, ADBE Shadow Color, ADBE Shininess Coefficient, ADBE Slider Control, ADBE Specular Coefficient, ADBE Transp Rolloff, ADBE Transparency Coefficient, ADBE Tritone, ADBE Turbulent Displace, ADBE Wave Warp, bevelEmboss/enabled, chromeFX/enabled, dropShadow/blur, dropShadow/enabled, frameFX/enabled, gradientFill/enabled, innerGlow/enabled, innerShadow/enabled, outerGlow/enabled, patternFill/enabled, solidFill/enabled
NAMES: Turbulent Displace | Cycle Evolution | Resize Layer | Low|High | Amount | Size | Evolution Options | Random Seed | Compositing Options | Slider Control | Trim In Duration (seconds) | Slider | Checkbox Control | Trim In Reverse Path Direction | Wave Warp | Low|Medium|High | Pinning | Fill | All Masks | Invert | Color | Tritone | Midtones | Shadows | Transform | Uniform Scale | Use Composition’s Shutter Angle | Bilinear|Bicubic | Position | Opacity | 6ed1497e-17ad-4a5b-846f-52bb81e20104 | Solids | {} | javascript-1.0 | BaseAnimation | Masks | Rectangle 1 | Rectangle Path 1 | Stroke 1 | Fill 1 | Pencil | Group 1 | Path 1 | Trim Paths 1 | Trim Paths 2 | Trim Out Duration (seconds) | Trim Out Reverse Path Direction | Checkbox | Wave | Logo | Logo BG | Ellipse 1 | Ellipse Path 1 | Color Adjustment Invert | Color Adjustment | Shape Layer 2 | White Spiral | Offset Paths 1 | Accent Spiral | Spirals | Bg | Shape Layer 1 | Shape Layer 5 | Default | Front | Left | Top | Back | Right | Bottom | Custom View 1 | Custom View 2 | Custom View 3 | Markers | Untitled | en_US | IN AE | Pencil 2 | Group 2 | Group 3 | Merge Paths 1 | HOPE YOU’RE HAVING A  GOOD DAY! -CHRIS | Range Selector 1 | Mask
EXPR>> time*8
EXPR>> var duration = effect("Trim In Duration (seconds)")(1);

var animation = ease(time, inPoint, inPoint + duration, 100, 0);

if (effect("Trim In Reverse Path Direction")(1) == 0) {

  0;

} else {

  animation;

}
EXPR>> var duration = effect("Trim In Duration (seconds)")(1);

var animation = ease(time, inPoint, inPoint + duration, 0, 100);

if (effect("Trim In Reverse Path Direction")(1) == 1) {

  100;

} else {

  animation;

}


EXPR>> var duration = effect("Trim Out Duration (seconds)")(1);

var animation = ease(time, outPoint - duration, outPoint, 0, 100);

if (effect("Trim Out Reverse Path Direction")(1) == 0) {

  0;

} else {

  animation;

}
EXPR>> var duration = effect("Trim Out Duration (seconds)")(1);

var animation = ease(time, outPoint - duration, outPoint, 100, 0);

if (effect("Trim Out Reverse Path Direction")(1) == 1) {

  100

} else {

  animation;

}


===== Waveform Template.aep 786216
MATCHNAMES: ADBE Accepts Lights, ADBE Accepts Shadows, ADBE Ambient Coefficient, ADBE Anchor Point, ADBE Appears in Reflections, ADBE AudSpect, ADBE Bevel Direction, ADBE Box Blur2, ADBE Casts Shadows, ADBE Diffuse Coefficient, ADBE Drop Shadow, ADBE Fresnel Coefficient, ADBE Gaussian Blur 2, ADBE Glo2, ADBE Glossiness Coefficient, ADBE Grid, ADBE HUE SATURATION, ADBE Index of Refraction, ADBE Metal Coefficient, ADBE Opacity, ADBE Orientation, ADBE Position, ADBE Position_0, ADBE Position_1, ADBE Position_2, ADBE Posterize Time, ADBE Reflection Coefficient, ADBE Rotate X, ADBE Rotate Y, ADBE Rotate Z, ADBE Roughen Edges, ADBE Scale, ADBE Shadow Color, ADBE Shininess Coefficient, ADBE Specular Coefficient, ADBE Transp Rolloff, ADBE Transparency Coefficient, ADBE Unsharp Mask2, VISINF Grain Implant, bevelEmboss/enabled, chromeFX/enabled, dropShadow/enabled, frameFX/enabled, gradientFill/enabled, innerGlow/enabled, innerShadow/enabled, outerGlow/blur, outerGlow/color, outerGlow/enabled, patternFill/enabled, solidFill/enabled
NAMES: Add Grain | Preview|Blending Matte|Final Output | Film|Multiply|Add|Screen|Overlay | Multiply|Screen | Intensity|Alpha|Inverted Intensity|Inverted Alpha | Center|Stretch to Fit | Viewing Mode | Preview Region | Tweaking | Channel Intensities | Channel Size | Color | Application | Channel Balance | Animation | Blend with Original | Color Matching | Masking Layer | Compositing Options | Posterize Time | Drop Shadow | Shadow Only | Opacity | Distance | Softness | Hue/Saturation | Master|Reds|Yellows|Greens|Cyans|Blues|Magentas | Colorize | Channel Range | Glow | Alpha Channel|Color Channels | On Top|Behind|None | Original Colors|A & B Colors|Arbitrary Map | Sawtooth A>B|Sawtooth B>A|Triangle A>B>A|Triangle B>A>B | Horizontal and Vertical|Horizontal|Vertical | Glow Radius | Glow Intensity | Audio Spectrum | Use Polar Path | Blend Overlapping Colors | Dynamic Hue Phase | Color Symmetry | Digital|Analog lines|Analog dots | Side A|Side B|Side A & B | Duration Averaging | Composite On Original | Audio Layer | Start Point | End Point | Path | End Frequency | Frequency bands | Maximum Height | Thickness | Inside Color | Outside Color | Display Options | Gaussian Blur | Repeat Edge Pixels | Grid | Corner Point|Width Slider|Width & Height Sliders | Invert Grid | Anchor | Corner | Border | Feather | Height | Fast Box Blur | Blur Radius | Unsharp Mask | Amount | Radius | Roughen Edges | Cycle Evolution | Scale | Evolution Options | Random Seed | 6ed1497e-17ad-4a5b-846f-52bb81e20104 | Solids | {} | javascript-1.0 | Default | Front | Left | Top | Back | Right | Bottom | Custom View 1 | Custom View 2 | Custom View 3 | Markers | Untitled | en_US | Grainy Analog | Grain | Posterize | GRAINY ANALOG | Hue Shifter | Glow Treatment | Glow 2 | Glow 3 | Accent Line | Primary Line | Playhead | Shape 1 | Path 1 | Stroke 1 | Fill 1 | Shape Layer 1 | Rectangle 1 | Rectangle Path 1 | Stacked Visualizer | Analog Crunch | Subtle Glow | Waveform Controller | Middle Dots | Start Frequency | Top Line | Audio Offset (milliseconds) | Side Options | Bottom Line | BG | H.264 - Match Render Settings - 15 Mbps | Tight Waveform.mp4 | Alpha Animation | Intro_Animation.mov | IntroAnimation_Transparent.mov | SoundMixing.mp4
EXPR>> effect("Audio Spectrum")("Outside Color")
===== FootageTreatments.aep 600047
MATCHNAMES: ADBE Anchor Point, ADBE Appears in Reflections, ADBE Bevel Direction, ADBE Easy Levels2, ADBE Exposure2, ADBE Fresnel Coefficient, ADBE Glossiness Coefficient, ADBE HUE SATURATION, ADBE Index of Refraction, ADBE Lumetri, ADBE Opacity, ADBE Orientation, ADBE Position, ADBE Position_0, ADBE Position_1, ADBE Position_2, ADBE Posterize Time, ADBE Reflection Coefficient, ADBE Rotate X, ADBE Rotate Y, ADBE Rotate Z, ADBE Scale, ADBE Transp Rolloff, ADBE Transparency Coefficient, CC Ball Action, PEQCAGL, VISINF Grain Implant, bevelEmboss/enabled, chromeFX/enabled, dropShadow/enabled, frameFX/enabled, gradientFill/enabled, innerGlow/enabled, innerShadow/enabled, outerGlow/enabled, patternFill/enabled, solidFill/enabled
NAMES: Exposure | Master|Individual Channels | Bypass Linear Light Conversion | Master | Red | Green | Blue | Compositing Options | Lumetri Color | High Dynamic Range | Active | Auto | Reset | Comparison View | Face Detection | Apply Match | Show Mask | Color/Gray|Color/Black|White/Black | Invert Mask | unused | Legacy Tone And Saturation | Auto Color Active... | Blob | Basic Correction | Color | Light | Creative | Adjustments | Split Toning | Curves | RGB Curve | Hue Saturation Curves | Hue vs Luma | Luma vs Sat | Color Wheels | Wheels | HSL Secondary | Key | HSL Sliders | Refine | Blur | Vignette | Midpoint | SpeedGrade Custom | Custom Layer | Embedded LUTs | Media Embedded LUT type | Media Embedded Lut blob | Auto Tone Analytics Data | LUTAsset | LookAsset | CC Ball Action | Grid Spacing | Ball Size | Quick Chromatic Aberration 3 | Product Page | More Free Plugins | Get Support | Apple | Apple M2 Max | 4.1 Metal - 89.3 | 4.10 | Red & Blue|Red & Green|Green & Blue | Relative %|Absolute Point | Single|(-|Auto|Fixed | Reset Transforms | Not Recommended for Text | Auto|Manual | PreProc|Output Multed|(-|Final Result | Update Shaders | About | GPU Spec: | Transform | Position | Anchor | Stylistic | Distort Uniform | Sample Count | Sample Multiplier | Compositing | Buffer Expansion | Debug | View | Output Buffer Fill | GPU Buffer Fill | Left | Top | Right | Bottom | Posterize Time | Add Grain | Preview|Blending Matte|Final Output | Film|Multiply|Add|Screen|Overlay | Multiply|Screen | Intensity|Alpha|Inverted Intensity|Inverted Alpha | Center|Stretch to Fit | Viewing Mode | Preview Region | Tweaking | Size | Channel Intensities | Channel Size | Application | Channel Balance | Animation | Blend with Original | Color Matching | Masking Layer | Camera Lens Blur | Luminance|Red|Green|Blue|Alpha | Center Map|Stretch Map to Fit | Repeat Edge Pixels | Use Linear Working Space | Blur Radius | Iris Properties | Blur Map | Layer | Highlight | Hue/Saturation | Master|Reds|Yellows|Greens|Cyans|Blues|Magentas | Colorize | Channel Range | Levels | RGB|Red|Green|Blue|Alpha | On|Off|Off for 32 bpc Color | Histogram | 6ed1497e-17ad-4a5b-846f-52bb81e20104 | Solids | {"lutInterpolationMethod":1} | {} | javascript-1.0 | Treatment 1 | Effect Stack | Mask 1 | Default | Front | Back | Custom View 1 | Custom View 2 | Custom View 3 | Markers | Untitled | en_US | Treatment 2 | Blur Mao | Intensity | Treatment 3 | Animated Felt Scan | Monochromatic
EXPR>> // Exposure flicker (subtle, random, film projection feel)
seedRandom(index + time, true);
flickerStrength = 0.02;  // adjust: 0.02 - 0.1 for subtlety
freq = 2;               // flicker frequency per second

// Generate random value at intervals
holdTime = 1 / freq;
floorTime = Math.floor(time / holdTime) * holdTime;
randomVal = random(-flickerStrength, flickerStrength);

randomVal
===== AppearRandom.ffx 38782
MATCHNAMES: ADBE 3DText Side Xparency
NAMES: Range Selector 1
===== FillAnimation.ffx 47128
MATCHNAMES: ADBE Force CPU GPU, ADBE Geometry2
NAMES: Effects | Range Selector 1 | Transform | Uniform Scale | Use Composition’s Shutter Angle | Bilinear|Bicubic | Anchor Point | Position | Scale | Skew | Skew Axis | Rotation | Opacity | Shutter Angle | Sampling | Compositing Options
===== HeavyFlicker.ffx 17094
MATCHNAMES: ADBE Exposure2, ADBE Force CPU GPU
NAMES: Exposure | Master|Individual Channels | Bypass Linear Light Conversion | Channels: | Master | Offset | Gamma Correction | Red | Red Exposure | Red Gamma Correction | Green | Green Exposure | Green Offset | Green Gamma Correction | Blue | Blue Exposure | Blue Offset | Blue Gamma Correction | Compositing Options
EXPR>> wiggle(24,.2)
===== LoadUp.ffx 73558
MATCHNAMES: ADBE 3DText Side Xparency
NAMES: Range Selector 1
===== Pencil Look.ffx 23280
MATCHNAMES: ADBE Force CPU GPU, ADBE Roughen Edges, ADBE Turbulent Displace
NAMES: Turbulent Displace 2 | Roughen Edges 2 | Turbulent Displace | Cycle Evolution | Resize Layer | Low|High | Displacement | Amount | Size | Offset (Turbulence) | Evolution | Evolution Options | Cycle (in Revolutions) | Random Seed | Pinning | Antialiasing for Best Quality | Compositing Options | Roughen Edges | Edge Type | Border | Edge Sharpness | Fractal Influence | Scale | Stretch Width or Height
===== Pen Look.ffx 23280
MATCHNAMES: ADBE Force CPU GPU, ADBE Roughen Edges, ADBE Turbulent Displace
NAMES: Turbulent Displace 2 | Roughen Edges 2 | Turbulent Displace | Cycle Evolution | Resize Layer | Low|High | Displacement | Amount | Size | Offset (Turbulence) | Evolution | Evolution Options | Cycle (in Revolutions) | Random Seed | Pinning | Antialiasing for Best Quality | Compositing Options | Roughen Edges | Edge Type | Border | Edge Sharpness | Fractal Influence | Scale | Stretch Width or Height
===== Retro Computer_Screen.ffx 70734
MATCHNAMES: ADBE CurvesCustom, ADBE Exposure2, ADBE Force CPU GPU, ADBE Geometry2, ADBE Venetian Blinds, CC Lens, PEQCAGL
NAMES: CC Lens | Venetian Blinds | Quick Chromatic Aberration 3 | Exposure | Curves | Transform | Center | Size | Convergence | Compositing Options | Transition Completion | Direction | Width | Feather | Product Page | More Free Plugins | Get Support | Apple | Apple M2 Max | 4.1 Metal - 89.3 | 4.10 | Red & Blue|Red & Green|Green & Blue | Relative %|Absolute Point | Single|(-|Auto|Fixed | Reset Transforms | Not Recommended for Text | Auto|Manual | PreProc|Output Multed|(-|Final Result | Update Shaders | About | GPU Spec: | Vendor | Renderer | OpenGL Version | Shader Version | Channels | Hue Shift | Position | Rotation | Scale | Anchor Mode | Anchor | Stylistic | Distort Uniform | Distort Aberrate | Skew X | Skew Y | Blur | Samples | Sample Count | Sample Multiplier | Compositing | Repeat Edge Pixels | Preserve Original Alpha | Unmult | Buffer Expansion | Expansion Mode | Aux Expansion | Expansion Limit | Mix With Original | Debug | View | Output Buffer Fill | GPU Buffer Fill | Left | Top | Right | Bottom | Master|Individual Channels | Bypass Linear Light Conversion | Channels: | Master | Offset | Gamma Correction | Red | Red Exposure | Red Gamma Correction | Green | Green Exposure | Green Offset | Green Gamma Correction | Blue | Blue Exposure | Blue Offset | Blue Gamma Correction | RGB|Red|Green|Blue|Alpha | Channel: | Uniform Scale | Use Composition’s Shutter Angle | Bilinear|Bicubic | Anchor Point | Skew | Skew Axis | Opacity | Shutter Angle | Sampling
EXPR>> // Exposure flicker (subtle, random, film projection feel)
seedRandom(index + time, true);
flickerStrength = 0.03;  // adjust: 0.02 - 0.1 for subtlety
freq = 2;               // flicker frequency per second

// Generate random value at intervals
holdTime = 1 / freq;
floorTime = Math.floor(time / holdTime) * holdTime;
randomVal = random(-flickerStrength, flickerStrength);

randomVal
===== Modern Laptop_Screen.ffx 70046
MATCHNAMES: ADBE CurvesCustom, ADBE Exposure2, ADBE Force CPU GPU, ADBE Geometry2, ADBE Venetian Blinds, PEQCAGL
NAMES: Venetian Blinds | Venetian Blinds 2 | Quick Chromatic Aberration 3 | Curves | Exposure | Transform | Transition Completion | Direction | Width | Feather | Compositing Options | Product Page | More Free Plugins | Get Support | Apple | Apple M2 Max | 4.1 Metal - 89.3 | 4.10 | Red & Blue|Red & Green|Green & Blue | Relative %|Absolute Point | Single|(-|Auto|Fixed | Reset Transforms | Not Recommended for Text | Auto|Manual | PreProc|Output Multed|(-|Final Result | Update Shaders | About | GPU Spec: | Vendor | Renderer | OpenGL Version | Shader Version | Channels | Hue Shift | Position | Rotation | Scale | Anchor Mode | Anchor | Stylistic | Distort Uniform | Distort Aberrate | Skew X | Skew Y | Blur | Samples | Sample Count | Sample Multiplier | Compositing | Repeat Edge Pixels | Preserve Original Alpha | Unmult | Buffer Expansion | Expansion Mode | Aux Expansion | Expansion Limit | Mix With Original | Debug | View | Output Buffer Fill | GPU Buffer Fill | Left | Top | Right | Bottom | RGB|Red|Green|Blue|Alpha | Channel: | Master|Individual Channels | Bypass Linear Light Conversion | Channels: | Master | Offset | Gamma Correction | Red | Red Exposure | Red Gamma Correction | Green | Green Exposure | Green Offset | Green Gamma Correction | Blue | Blue Exposure | Blue Offset | Blue Gamma Correction | Uniform Scale | Use Composition’s Shutter Angle | Bilinear|Bicubic | Anchor Point | Skew | Skew Axis | Opacity | Shutter Angle | Sampling
EXPR>> // Exposure flicker (subtle, random, film projection feel)
seedRandom(index + time, true);
flickerStrength = 0.03;  // adjust: 0.02 - 0.1 for subtlety
freq = 2;               // flicker frequency per second

// Generate random value at intervals
holdTime = 1 / freq;
floorTime = Math.floor(time / holdTime) * holdTime;
randomVal = random(-flickerStrength, flickerStrength);

randomVal
===== Text Jitter.ffx 69798
MATCHNAMES: ADBE Force CPU GPU, ADBE Slider Control
NAMES: Animator 1 - x | Animator 1 - y | Jitter Frequency | Jitter Amount | Expression Selector 1 | Slider Control | Slider | Compositing Options
EXPR>> var fps    = effect("Jitter Frequency")("Slider");
var jitter = effect("Jitter Amount")("Slider");

// Step the randomness and remove in-between interpolation
posterizeTime(fps);
seedRandom(textIndex + 123 + Math.floor(time * fps), true);

random(-jitter, jitter); // returns a percent; ±jitter% of 100 px => ±jitter px
EXPR>> var fps    = effect("Jitter Frequency")("Slider");
var jitter = effect("Jitter Amount")("Slider");

posterizeTime(fps);
seedRandom(textIndex + 456 + Math.floor(time * fps), true);

random(-jitter, jitter);
===== GateWeave.ffx 12240
MATCHNAMES: ADBE Force CPU GPU, ADBE Geometry2
NAMES: Transform | Uniform Scale | Use Composition’s Shutter Angle | Bilinear|Bicubic | Anchor Point | Position | Scale | Skew | Skew Axis | Rotation | Opacity | Shutter Angle | Sampling | Compositing Options
EXPR>> fps = 24; // number of moves per second
seedRandom(Math.floor(time * fps), true);

jitter = 1.5; // max pixel movement
value + [random(-jitter, jitter), random(-jitter, jitter)]
===== Jitter Object.ffx 16678
MATCHNAMES: ADBE Force CPU GPU, ADBE Geometry2, ADBE Slider Control
NAMES: Jitter Position Transform | Jitter Frequency | Jitter Amount | Transform | Uniform Scale | Use Composition’s Shutter Angle | Bilinear|Bicubic | Anchor Point | Position | Scale | Skew | Skew Axis | Rotation | Opacity | Shutter Angle | Sampling | Compositing Options | Slider Control | Slider
EXPR>> // Jitter Position Preset
var fps = effect("Jitter Frequency")("Slider");
var jitter = effect("Jitter Amount")("Slider");

seedRandom(Math.floor(time * fps), true);
value + [random(-jitter, jitter), random(-jitter, jitter)];
===== Flicker and Glow.ffx 53092
MATCHNAMES: ADBE Force CPU GPU, ADBE Glo2, VISINF Grain Implant
NAMES: Glow | Add Grain | Alpha Channel|Color Channels | On Top|Behind|None | Original Colors|A & B Colors|Arbitrary Map | Sawtooth A>B|Sawtooth B>A|Triangle A>B>A|Triangle B>A>B | Horizontal and Vertical|Horizontal|Vertical | Glow Based On | Glow Threshold | Glow Radius | Glow Intensity | Composite Original | Glow Operation | Glow Colors | Color Looping | Color Loops | Color Phase | A & B Midpoint | Color A | Color B | Glow Dimensions | Compositing Options | Preview|Blending Matte|Final Output | Film|Multiply|Add|Screen|Overlay | Multiply|Screen | Intensity|Alpha|Inverted Intensity|Inverted Alpha | Center|Stretch to Fit | Viewing Mode | Preset | Preview Region | Center | Width | Height | Show Box | Box Color | Tweaking | Intensity | Size | Softness | Aspect Ratio | Channel Intensities | Red Intensity | Green Intensity | Blue Intensity | Channel Size | Red Size | Blue Size | Color | Monochromatic | Tint Amount | Application | Blending Mode | Shadows | Midtones | Midpoint | Channel Balance | Red Shadows | Red Midtones | Red Highlights | Green Shadows | Green Midtones | Green Highlights | Blue Shadows | Blue Midtones | Blue Highlights | Animation | Animation Speed | Animate Smoothly | Random Seed | Blend with Original | Amount | Combine Match and Mask Using | Color Matching | Match Color Using | Matching Color | Matching Tolerance | Matching Softness | Invert Match | Masking Layer | Masking Mode | If Mask Size Differs
EXPR>> wiggle(2,.2)
===== Film Title Treatment.ffx 79132
MATCHNAMES: ADBE Fill, ADBE Force CPU GPU, ADBE Gaussian Blur 2, ADBE Geometry2, ADBE Glo2, ADBE Slider Control, VISINF Grain Implant, innerGlow/AEColorChoice, innerGlow/blur, innerGlow/chokeMatte, innerGlow/color, innerGlow/enabled, innerGlow/glowTechnique, innerGlow/gradient, innerGlow/gradientSmoothness, innerGlow/innerGlowSource, innerGlow/inputRange, innerGlow/mode2, innerGlow/noise, innerGlow/opacity, innerGlow/shadingNoise
NAMES: Fill | Glow | Gaussian Blur | Add Grain | film jitter | All Masks | Invert | Fill Mask | Color | Horizontal Feather | Vertical Feather | Opacity | Compositing Options | Alpha Channel|Color Channels | On Top|Behind|None | Original Colors|A & B Colors|Arbitrary Map | Sawtooth A>B|Sawtooth B>A|Triangle A>B>A|Triangle B>A>B | Horizontal and Vertical|Horizontal|Vertical | Glow Based On | Glow Threshold | Glow Radius | Glow Intensity | Composite Original | Glow Operation | Glow Colors | Color Looping | Color Loops | Color Phase | A & B Midpoint | Color A | Color B | Glow Dimensions | Repeat Edge Pixels | Blur Dimensions | Preview|Blending Matte|Final Output | Film|Multiply|Add|Screen|Overlay | Multiply|Screen | Intensity|Alpha|Inverted Intensity|Inverted Alpha | Center|Stretch to Fit | Viewing Mode | Preset | Preview Region | Center | Width | Height | Show Box | Box Color | Tweaking | Intensity | Size | Softness | Aspect Ratio | Channel Intensities | Red Intensity | Green Intensity | Blue Intensity | Channel Size | Red Size | Blue Size | Monochromatic | Tint Amount | Application | Blending Mode | Shadows | Midtones | Midpoint | Channel Balance | Red Shadows | Red Midtones | Red Highlights | Green Shadows | Green Midtones | Green Highlights | Blue Shadows | Blue Midtones | Blue Highlights | Animation | Animation Speed | Animate Smoothly | Random Seed | Blend with Original | Amount | Combine Match and Mask Using | Color Matching | Match Color Using | Matching Color | Matching Tolerance | Matching Softness | Invert Match | Masking Layer | Masking Mode | If Mask Size Differs | Slider Control | Slider | Transform | Uniform Scale | Use Composition’s Shutter Angle | Bilinear|Bicubic | Anchor Point | Position | Scale Height | Scale Width | Skew | Skew Axis | Rotation | Shutter Angle | Sampling
EXPR>> // film jitter: 12 changes/sec, up to 1.2 px at intensity 1.
var intensity = 0;
var effects = thisLayer("ADBE Effect Parade");
for (var i = 1; i <= effects.numProperties; i++) {
    var e = effects(i);
    if (e.name == "film jitter" && typeof e(1).value == "number") {
        intensity = Math.max(0, e(1).value);
        break;
    }
}
var frame = Math.floor(time * 12);
seedRandom(index * 100003 + frame, true);
var amount = 1.2 * intensity;
value + [random(-amount, amount), random(-amount, amount)];
```

## Focus.jsx (Rack-Focus)
Fast Box Blur Iterations 8, Radius-Keys f0=0, f4=8, f8=18, f13=5, f18=0 (proportional zur Dauer). Zoom: MASTER NULL, Scale 100 -> 100+Zoom, KeyframeEase(0,80) an beiden Keys, Blur startet 10/30 der Dauer nach Zoomstart.
