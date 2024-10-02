/**
 * Test for extracting pixels from images.
 * Mocked ImageElement and CanvasElement in setup.js
 * ChatGPT was used to get help with mocking.
 */

import { ImageToPixels } from '../src/js/ImageToPixels'

describe('ImageToPixels class test', () => {
    let imageToPixels

    beforeAll(() => {
        imageToPixels = new ImageToPixels('mockUrl')
    })

    test('Extracting pixels from image', async () => {
        const pixels = await imageToPixels.getPixels()
        expect(Array.isArray(pixels)).toBe(true)
        expect(pixels.length).toBeGreaterThan(0)
    })

    test('Get image height and width', async () => {
        const height = await imageToPixels.getHeightInPx()
        const width = await imageToPixels.getWidthInPx()

        expect(typeof height).toBe('number')
        expect(typeof width).toBe('number')
    })
})