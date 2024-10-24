/**
 * Extract prominent colors from a set of pixels.
 * Iterates over pixels and sorts into clusters of similar colors. 
 * Pixels are read as values of red, green, blue and alpha
 * https://en.wikipedia.org/wiki/RGBA_color_model
 */

const PALETTE_TYPES = {
    DEFAULT: 'default',
    BRIGHT: 'bright',
    DARK: 'dark',
    MUTED: 'muted'
}

export class ColorPaletteFromPixels {
    /**
     * Array of pixels - Representing RGBA values
     * [red, green, blue, alpha]
     */
    #pixels

    #numberOfColorsToExtract

    #originalPaletteLength

    /**
     * Pixel to reference for clusters
     */
    #referencePixels

    /**
     * Collection of similar pixels
     */
    #colorClusters

    /**
     * Default, Bright, Dark, Muted
     */
    #colorPaletteType

    /**
     * Holds number of missing colors in a complete palette
     */
    #numberOfMissingColors
    

    constructor(rgbaValues, numberOfColorsToExtract) {
        this.#checkNumbersOfColors(numberOfColorsToExtract)
        this.#checkRgbaValues(rgbaValues)
    }

    #checkNumbersOfColors(numberOfColorsToExtract) {
        if (numberOfColorsToExtract < 1 || numberOfColorsToExtract > 10) {
            throw new Error('A palette must be between 1 and 10 colors')
        } else {
            this.#numberOfColorsToExtract = numberOfColorsToExtract
            this.#originalPaletteLength = numberOfColorsToExtract
        }
    }

    #checkRgbaValues(pixels) {
        if (pixels.length < 100) {
            throw new Error('Pixel data must be above 100 pixels - 10x10px')
        }

        if (pixels.length > 100000) {
            this.#pixels = this.#reducePixels(pixels)
        } else {
            this.#pixels = pixels
        }
    }

    /**
     * Using K-Clustering algorithm to find prominent clusters of similar colors.
     * Reference: https://en.wikipedia.org/wiki/K-means_clustering#Algorithms
     */
    #extractProminentColors() {
        this.#colorClusters = this.#createColorClusters(this.#numberOfColorsToExtract)

        this.#referencePixels = this.#getInitialReferencePixels()

        // Cluster together pixel to reference pixels
        this.#addToColorCluster()

        // Loop over pixels to get more accurate colors
        this.#refineColorClusters()
    }

    /**
     * Reduce amount of pixels for efficiency.
     * @param {Array} pixels 
     * @returns {Array} - Reduced pixels
     */
    #reducePixels(pixels) {
        const reducedPixels = []
        const targetPixelCount = 5000
        const skipFactor = Math.ceil(pixels.length / targetPixelCount)

        // Skip pixels  based on skipFactor
        for (let i = 0; i < pixels.length; i+=skipFactor) {
            const pixel = pixels[i]
            reducedPixels.push(pixel)
        }

        return reducedPixels
    }

    /**
     * Creates an empty cluster (array) for each color to extract.
     */
    #createColorClusters() {
        const colorClustersCollection = []
        for (let i = 0; i < this.#numberOfColorsToExtract; i++) {
            const newCluster = []
            colorClustersCollection.push(newCluster)
        }
        return colorClustersCollection
    }

    #addToColorCluster() {
        this.#pixels.forEach((pixel) => {
            const threshold = 30
            const meassuredDistances = this.#getDistancesBetweenPixelAndReferences(pixel)
            const minDistance = Math.min(...meassuredDistances)
            const closestIndex = meassuredDistances.indexOf(minDistance)

            // Assign closet pixel to cluster
            if (minDistance < threshold) {
                this.#colorClusters[closestIndex].push(pixel)
            }

        })
    }

    #getDistancesBetweenPixelAndReferences(pixel) {
        return this.#referencePixels.map(referencePixel => 
            this.#calculateDistanceToReferencePixel(pixel, referencePixel)
        )
    }

    #clearClusters() {
        this.#colorClusters.forEach(cluster => {
            cluster.length = 0
        })
    }

    #getInitialReferencePixels() {
        const referencePixels = []

        const frequentPixels = this.getFrequentPixels()

        if (frequentPixels.length < this.#numberOfColorsToExtract) {
            this.#numberOfMissingColors = this.#numberOfColorsToExtract - frequentPixels.length
            this.#numberOfColorsToExtract = frequentPixels.length

            this.#clearClusters()
            this.#colorClusters = this.#createColorClusters()
        }

        // Extract most frequent colors as initial reference
        for (let i = 0; i < this.#numberOfColorsToExtract; i++) {
            referencePixels.push(frequentPixels[i].pixel)
        }

        return referencePixels
    }

    getFrequentPixels() {
        const frequentPixels = []

        this.#pixels.forEach((pixel) => {
            const pixelValues = this.#getPixelLuminanceAndBrightness(pixel)
            
            if (!this.#isPixelBrightAndSaturatedEnough(pixelValues)) return
            
            const foundSimilarPixel = this.#updatePixelGroup(pixel, frequentPixels)
    
            if (!foundSimilarPixel) {
                frequentPixels.push({ pixel: pixel, count: 1 })
            }
        })

        return this.#sortPixels(frequentPixels) 
    }

    #sortPixels(frequentPixels) {
        return frequentPixels.sort((a, b) => b.count - a.count)
    }

    #updatePixelGroup(pixel, frequentPixels) {
        const threshold = 50
        let foundSimilarPixel = false

        frequentPixels.forEach(pixelGroup => {
            const frequentPixel = pixelGroup.pixel
            const distance = this.#calculateDistanceToReferencePixel(pixel, frequentPixel)
            
            if (distance < threshold) {
                pixelGroup.count++
                foundSimilarPixel = true
            }
        })

        return foundSimilarPixel
    }

    /**
     * Calculate luminance (brightness) and saturation from rgb
     * Refernce:https://en.wikipedia.org/wiki/Luma_(video)
     *
     * @param {Array} pixel 
     * @returns {object} brightness and saturation
     */
    #getPixelLuminanceAndBrightness(pixel) {
        const [red, green, blue ] = pixel 

        const pixelBrightness = (red * 0.299 + green * 0.587 + blue * 0.114) / 255
        const pixelSaturation = (Math.max(red, green, blue) - Math.min(red, green, blue)) / 255
        return { pixelBrightness, pixelSaturation }
    }

    #isPixelBrightAndSaturatedEnough(pixelValues) {
        const {pixelBrightness, pixelSaturation} = pixelValues

        const paletteConditions = {
            [PALETTE_TYPES.DEFAULT]: { brightness: 0, saturation: 0.3 },
            [PALETTE_TYPES.BRIGHT]: { brightness: 0.5, saturation: 0.5 },
            [PALETTE_TYPES.DARK]: { brightnessMax: 0.4, saturation: 0.1 },
            [PALETTE_TYPES.MUTED]: { brightness: 0.2, saturationMax: 0.4 }
        }

        const conditions = paletteConditions[this.#colorPaletteType || PALETTE_TYPES.DEFAULT]

        if (pixelBrightness < conditions.brightness) return false
        if (pixelBrightness > conditions.brightnessMax) return false
        if (pixelSaturation < conditions.saturation) return false
        if (pixelSaturation > conditions.saturationMax) return false

        return true // Pixel is bright and saturated enough
    }

    #calculateDistanceToReferencePixel(pixel, referencePixel) {
        const [ red, green, blue, alpha ] = pixel
        const [ referenceRed, referenceGreen, referenceBlue, referenceAlpha ] = referencePixel

        const powerOfTwo = 2
        const redCalculation = (red - referenceRed) **powerOfTwo
        const greenCalculation = (green - referenceGreen) **powerOfTwo
        const blueCalculation = (blue - referenceBlue)** powerOfTwo
        const alphaCalculation = (alpha - referenceAlpha) **powerOfTwo

        const distanceCalculation = Math.sqrt((redCalculation + greenCalculation + blueCalculation + alphaCalculation))

        return distanceCalculation
    }

    #getUpdatedReferencePixels() {
        const updatedReferencePixels = []

        this.#colorClusters.forEach(colorCluster => {
            const clusterLength = colorCluster.length

            const rgbaSums = this.#calculateRgbaSums(colorCluster)
            const { redMean, greenMean, blueMean, alphaMean } = this.#calculateRgbaMeans(rgbaSums, clusterLength)
            const newReferencePixel = [redMean, greenMean, blueMean, alphaMean]
            updatedReferencePixels.push(newReferencePixel)
        })

        return updatedReferencePixels
    }

    #calculateRgbaSums(colorCluster) {
        let redSum = 0, greenSum = 0, blueSum = 0, alphaSum = 0

        colorCluster.forEach(pixel => {
            redSum += pixel[0]
            greenSum += pixel[1]
            blueSum += pixel[2]
            alphaSum += pixel[3]
        })

        return { redSum, greenSum, blueSum, alphaSum }
    }

    #calculateRgbaMeans(rgbaSums, clusterLength) {
        const { redSum, greenSum, blueSum, alphaSum } = rgbaSums

        const redMean = Math.max(0, Math.min(255, redSum / clusterLength))
        const greenMean = Math.max(0, Math.min(255, greenSum / clusterLength))
        const blueMean = Math.max(0, Math.min(255, blueSum / clusterLength))
        const alphaMean = Math.max(0, Math.min(255, alphaSum / clusterLength))

        return { redMean, greenMean, blueMean, alphaMean }
    }

    #refineColorClusters() {
        let convergence = false
        let iterations = 0
        const maxIterations = 100
        
        do {
            iterations++
            const updatedReferencePixels = this.#getUpdatedReferencePixels()

            // Check if pixels don't change no more - Convergence
            convergence = this.#checkConvergence(updatedReferencePixels, this.#referencePixels)

            this.#referencePixels = updatedReferencePixels

            this.#clearClusters()

            // Create Color clusters based on amountOfColorsToExtract
            this.#colorClusters = this.#createColorClusters()

            // Cluster together pixel to reference pixels
            this.#addToColorCluster()
        } while (!convergence && iterations < maxIterations)
    }

    #checkConvergence(updatedReferencePixels, referencePixels) {
        let totalDistanceMoved = 0
        const threshold = 0.001

        updatedReferencePixels.forEach((pixel, index) => {
            const distance = this.#calculateDistanceToReferencePixel(pixel, referencePixels[index])
            totalDistanceMoved += distance

            if (distance <= threshold) return false
        })
        return totalDistanceMoved < threshold
    }

    #getColorPalette() {
        this.#numberOfColorsToExtract = this.#originalPaletteLength
        this.#numberOfMissingColors = 0 // Reset for this extraction
        this.#extractProminentColors()

        const colors = this.#getExtractedColors()

        if (colors.length === 0) {
            throw new Error('Could not extract any colors from this image')
        }

        if (this.#numberOfMissingColors) {
            const lastColor = colors[colors.length - 1]

            for (let i = 0; i < this.#numberOfMissingColors; i++) {
                colors.push(lastColor)
            }
        }

        return colors
    }

    #getExtractedColors() {
        return this.#colorClusters.map((cluster, index) => {
            const color = cluster[index]
            const [red, green, blue, alpha] = color
            return { red, green, blue, alpha }
        })
    }

    /**
     * Returns an array of prominent colors as objects:
     * [ {red, green, blue, alpha } ]
    */
    getPalette() {
        this.#colorPaletteType = PALETTE_TYPES.DEFAULT
        return this.#getColorPalette()
    }

    /**
     * Returns an array of muted colors as objects:
     * [ {red, green, blue, alpha } ]
    */
    getMutedPalette() {
        this.#colorPaletteType = PALETTE_TYPES.MUTED
        return this.#getColorPalette()
    }

    /**
     * Returns an array of dark colors as objects:
     * [ {red, green, blue, alpha } ]
     */
    getDarkPalette() {
        this.#colorPaletteType = PALETTE_TYPES.DARK
        return this.#getColorPalette()
    }

    /**
     * Returns an array of dark colors as objects:
     * [ {red, green, blue, alpha } ]
     */
    getBrightPalette() {
        this.#colorPaletteType = PALETTE_TYPES.BRIGHT
        return this.#getColorPalette()
    }

    /**
     * Returns an array of RGBA values from image
     * [ [ red, green, blue, alpha ] ]
     */
    getPixels() {
        return this.#pixels
    }
}