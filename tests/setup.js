/**
 * Setup file for tests
 */

import { mockImageData } from "./img/mockImageData"
import { ImageToPixels } from "../src/js/ImageToPixels"

// Mock element since they do not load in a real DOM
const mockImage = {
    width: 100,
    height: 100,
    src: 'mockUrl',
    onload: jest.fn(),
    onerror: jest.fn()
}

const mockCanvasContext = {
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({
        data: mockImageData
    }))
}

jest.spyOn(ImageToPixels.prototype, '_createImage').mockImplementation(() => {
    return new Promise((resolve) => {
        mockImage.onload()
        resolve(mockImage)
    })
})

jest.spyOn(ImageToPixels.prototype, '_createCanvasElement').mockReturnValue(mockCanvasContext)