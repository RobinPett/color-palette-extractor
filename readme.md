# Color-Palette-Extractor
### ⚠️ Disclaimer - Developed for a school project - Module will not be maintained

## Description
Extracts color palettes from images to be used in a browser environment.
- Enter a image URL, extract the pixels and generate color palettes in various styles.


## Installation
 > $ npm install color-palette-extractor
  

 ## Dependencies
 Color Palette Extractor is not dependent on any other modules to run.
 It must howerver run in a browser environment to have access to the DOM to create Image and Canvas elements.

## Usage examples

```javascript
  import { colorPaletteExtractor } from "color-palette-extractor"

  const paletteExtractor = new ColorPaletteExtractor()

  const image = paletteExtractor.loadImage('image.jpg')
  const pixels = await image.getPixels()
  
  // Specify pixel data and number of colors
  const palette = paletteExtractor.startExtraction(pixels, 10)

  const extraxtedPalette = palette.getColorPalette()
```
To get diffent palettes you can use:

```javascript
const darkPalette = palette.getDarkPalette()
const brightPalette = palette.getBrightPalette()
const mutedPalette = palette.getMutedPalette()
```

To present the color palette you can use:

```javascript
// Get a div with the palette. Set size of each colored div
const paletteDiv = paletteExtractor.presentPalette(palette, 100)

// Present in your own html document
const body = document.querySelector('body')
body.append(paletteDiv)
```

## Example
![example](.readme/example.PNG)

## Known issues
- Generating palettes can be slow - optimizing needed
- Image links can fail if the server has origin controll

## Upcoming Features
- Allow users to manually set brightness and saturation levels for palettes

## License
GNU GENERAL PUBLIC LICENSE
@Robin Pettersson 2024


