/**
 * Main module file for Color-Palette-Extractor
 */
import { ColorPaletteFromPixels } from "./ColorPaletteFromPixels.js"
import { ImageToPixels } from "./ImageToPixels.js"

console.log('Color-Palette-Extractor connected to browser')

/**
 * Color palette extractor main class.
 * Provides methods to load images, extract pixel and color data.
 */
export class ColorPaletteExtractor {
    constructor() {
        // Check if browser enviroment is available
        if (!document) {
            throw new Error('Module must be used in a browser environment')
        }
    }

    /**
    * Creates an ImageToPixels object to handle image loading.
    *
    * @param {string} url - URL to image
    * @returns {object} ImageToPixels object
    */
    loadImage(url) {
        try {
            return new ImageToPixels(url)
        } catch (error) {
            throw new Error('Loading image failed: ' + error)
        }
    }

    /**
     * Creates a ColorPaletteFromPixels object.
     *
     * @param {Array} pixels 
     * @param {number} numberOfColorsToExtract 
     * @returns {object} ColorPaletteFromPixels object.
     */
    startExtraction(pixels, numberOfColorsToExtract) {
        try {
            return new ColorPaletteFromPixels(pixels, numberOfColorsToExtract)
        } catch (error) {
            throw new Error('Extracting color palettes failed: ' + error)
        }

    }

    /**
     * Presents the color palette as colored divs.
     * Ignoring alpha channel. 
     * 
     * @param {Array} colorPalette - Array of color palette objects: { red, green, blue, alpha }
     * @param {number} colorSize - Size of each square div in px. 
     * @returns {HTMLDivElement} - Color Palette container div.
     */
    presentColorPalette(colorPalette, colorSize) {
        try {
            if (!colorSize) colorSize = 100

            const containerDiv = document.createElement('div')
            containerDiv.style.display = 'flex'
            containerDiv.style.flexDirection = 'row'

            // Create colored divs
            colorPalette.forEach((color) => {
                const div = document.createElement('div')
                div.style.backgroundColor = `rgb(${color.red}, ${color.green}, ${color.blue})`
                div.style.height = `${colorSize}px`
                div.style.width = `${colorSize}px`

                containerDiv.appendChild(div)
            })

            return containerDiv
        } catch (error) {
            throw new Error('Presenting color palettes failed: ' + error)
        }

    }
}