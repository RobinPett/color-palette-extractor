export class ImageToPixels {
    /**
     * Image to be loaded.
     */
    #imageURL

    /**
     * Image to be loaded.
     */
    #imageWidthInPx

    /**
     * Image to be loaded.
     */
    #imageHeightInPx

    /**
     * Image to be loaded.
     */
    #imageElement

    /**
     * Image to be loaded.
     */
    #canvasElement

    /**
     * Raw rgba values in an 8Bit array
     */
    #rgbaValues

    /**
     * A promise to see if image has loaded
     */
    #imageLoadPromise



    constructor (imageUrl) {
        this.#imageURL = imageUrl
        this.#imageLoadPromise = this.#startImageExtraction()
    }

    async #startImageExtraction() {
        this.#imageElement = await this.createImage(this.#imageURL)
        this.#imageWidthInPx = this.#imageElement.width
        this.#imageHeightInPx = this.#imageElement.height

        this.#canvasElement = this.createCanvasElement(this.#imageElement)
        this.#rgbaValues = this.#extractRgbaValues(this.#canvasElement)
    }

    /**
     * Create an image element based on image url.
     */
    createImage() {
        return new Promise((resolve, reject) => {
            let imageElement = document.createElement('img')
            this.#imageElement = imageElement

            imageElement.src = this.#imageURL
            imageElement.crossOrigin = 'Anonymous' // To allow loading images from cross origin sources
            imageElement.alt = 'Image'

            imageElement.onload = (() => {
                resolve(imageElement)
            })

            imageElement.onerror = (error) => {
                reject(new Error('Failed to load image' + error))
            }
        })
    }

    createCanvasElement(imageElement) {
        const canvas = document.createElement('canvas')
        canvas.width = this.#imageWidthInPx
        canvas.height = this.#imageHeightInPx
        const context = canvas.getContext('2d')
        context.drawImage(imageElement, 0, 0)
        return context
    }

    /**
     * Extracts the red, green, blue and alpha values from an image.
     *
     * @param {CanvasRenderingContext2D} context 
     */
    async #extractRgbaValues(context) {
        const imageData = context.getImageData(0, 0, this.#imageWidthInPx, this.#imageHeightInPx)
        const data = imageData.data
        const extractedRgbaValues = []

        // Loop through rgba values in image data
        for (let i = 0; i < data.length; i += 4) {
            const red = data[i]
            const green = data[i + 1]
            const blue = data[i + 2]
            const alpha = data[i + 3]

            // Seperate pixel values and move to new array
            const pixel = [red, green, blue, alpha]
            extractedRgbaValues.push(pixel)
        }
        return extractedRgbaValues
    }

    /**
     * Gets image data as an array of pixels.
     * Pixels are structured like this: [red, green, blue, alpha].
     * 
     * @returns {Array} pixels.
     */
    async getPixels() {
        await this.#imageLoadPromise
        return await this.#rgbaValues
    }

    /**
     * Gets image width in px.
     * 
     * @returns {number} - Width in px.
     */
    async getWidthInPx() {
        await this.#imageLoadPromise
        return await this.#imageWidthInPx
    }

    /**
     * Gets image height in pixels.
     * 
     * @returns {number} - Height in px.
     */
    async getHeightInPx() {
        await this.#imageLoadPromise
        return await this.#imageHeightInPx
    }
}