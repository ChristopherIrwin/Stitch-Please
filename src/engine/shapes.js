export const SHAPE_TYPES = {
    SQUARE: 'SQUARE',
    HEXAGON: 'HEXAGON',
    OCTAGON: 'OCTAGON',
    TRIANGLE: 'TRIANGLE',
};

export const SHAPE_CONFIG = {
    [SHAPE_TYPES.SQUARE]: {
        id: SHAPE_TYPES.SQUARE,
        name: 'Classic Square',
        sides: 4,
        angle: 90,
        baseSize: 60, // Width in pixels
    },
    [SHAPE_TYPES.HEXAGON]: {
        id: SHAPE_TYPES.HEXAGON,
        name: 'Honeycomb Hex',
        sides: 6,
        angle: 60,
        baseSize: 40, // Outer radius in pixels
    },
    [SHAPE_TYPES.OCTAGON]: {
        id: SHAPE_TYPES.OCTAGON,
        name: 'Octagon',
        sides: 8,
        angle: 45,
        baseSize: 40, // Outer radius
    },
    [SHAPE_TYPES.TRIANGLE]: {
        id: SHAPE_TYPES.TRIANGLE,
        name: 'Triangle',
        sides: 3,
        angle: 60,
        baseSize: 60, // Side length
    },
};
