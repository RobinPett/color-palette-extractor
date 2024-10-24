export class ImageToPixels {
    #imageURL
    #imageWidthInPx
    #imageHeightInPx
    #imageElement

    #canvasElement

    #pixels

    #imageLoadPromise

    constructor (imageUrl) {
        this.#imageURL = imageUrl
        this.#imageLoadPromise = this.#startImageExtraction()
    }

    async #startImageExtraction() {
        this.#imageElement = await this._createImage(this.#imageURL)
        this.#imageWidthInPx = this.#imageElement.width
        this.#imageHeightInPx = this.#imageElement.height

        this.#canvasElement = this._createCanvasElement(this.#imageElement)
        this.#pixels = this.#extractPixels(this.#canvasElement)
    }

    /**
     * Create an image element based on image url.
     */
    _createImage() {
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

    _createCanvasElement(imageElement) {
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
    async #extractPixels(context) {
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
        return await this.#pixels
    }

    /**
     * @returns {number} - Width in px.
     */
    async getWidthInPx() {
        await this.#imageLoadPromise
        return await this.#imageWidthInPx
    }

    /**
     * @returns {number} - Height in px.
     */
    async getHeightInPx() {
        await this.#imageLoadPromise
        return await this.#imageHeightInPx
    }
}