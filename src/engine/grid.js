import { SHAPE_TYPES } from './shapes';

export class GridSystem {
    constructor(config = {}) {
        this.type = config.type || SHAPE_TYPES.SQUARE;
        this.cellSize = config.cellSize || 60;
        this.gap = config.gap ?? 0; // Default no gap
    }

    // Convert grid coordinates to pixel coordinates
    getPixelCoordinates(q, r, s = 0) {
        if (this.type === SHAPE_TYPES.SQUARE) {
            return {
                x: q * (this.cellSize + this.gap),
                y: r * (this.cellSize + this.gap),
            };
        } else if (this.type === SHAPE_TYPES.HEXAGON) {
            const x = this.cellSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
            const y = this.cellSize * ((3 / 2) * r);
            return { x, y };
        } else if (this.type === SHAPE_TYPES.TRIANGLE) {
            // Triangle logic:
            // Side length = cellSize. Height = side * sqrt(3)/2.
            // We use a row/col system.
            // Odd/Even logic handled in renderer, here we just return 'centers' or 'origins'.
            // Simple approach: Tilted axes?
            // Let's stick to Cartesian-like for simplicity of placement.
            // q = x-index (half-widths), r = y-index (full heights).
            // q = x-index (half-widths), r = y-index (full heights).
            const side = this.cellSize;
            const radius = side / Math.sqrt(3);
            const height = side * (Math.sqrt(3) / 2); // This is 1.5 * radius

            let y = r * height;
            // Shift down-pointing triangles (odd sum parity) up by half a radius to interlock
            if ((Math.abs(q) + Math.abs(r)) % 2 !== 0) {
                y -= 0.5 * radius;
            }

            return { x: q * (side / 2), y };
        } else if (this.type === SHAPE_TYPES.OCTAGON) {
            // Octagon grid with squares in gaps (truncated square tiling)
            // cellSize is the diameter (flat-to-flat width would be diameter * cos(22.5))
            // Actually usually cellSize is outer diameter/radius.
            // Let's assume cellSize = Diameter (2*Radius).
            // Width (flat-to-flat) = cellSize * cos(22.5 degrees)
            const width = this.cellSize * Math.cos(Math.PI / 8);
            return {
                x: q * width,
                y: r * width,
            };
        }
        return { x: 0, y: 0 };
    }

    // Convert pixel to grid coordinates (picking)
    getGridCoordinates(x, y) {
        if (this.type === SHAPE_TYPES.SQUARE || this.type === SHAPE_TYPES.OCTAGON) {
            const q = Math.round(x / (this.cellSize + this.gap));
            const r = Math.round(y / (this.cellSize + this.gap));
            return { q, r };
        } else if (this.type === SHAPE_TYPES.HEXAGON) {
            const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / this.cellSize;
            const r = ((2 / 3) * y) / this.cellSize;
            return this.axialRound(q, r);
        } else if (this.type === SHAPE_TYPES.TRIANGLE) {
            const side = this.cellSize;
            const height = side * (Math.sqrt(3) / 2);
            // Rough picking
            const r = Math.round(y / height);
            const q = Math.round(x / (side / 2));
            return { q, r };
        } else if (this.type === SHAPE_TYPES.OCTAGON) {
            const width = this.cellSize * Math.cos(Math.PI / 8);
            const q = Math.round(x / width);
            const r = Math.round(y / width);

            // Check if point is inside the Octagon or the Diamond
            // Local coords relative to center
            const cx = q * width;
            const cy = r * width;
            const dx = Math.abs(x - cx);
            const dy = Math.abs(y - cy);

            // Octagon radius (apothem) is width/2
            // Cut corners: dx + dy <= radius / cos(22.5)? 
            // Easier: Compare distance to Octagon Center vs Diamond Center

            // The bottom-right diamond center for (q,r) is at (cx + width/2, cy + width/2)
            // But there are 4 corners. We want to know if we are in *any* corner.
            // Since we rounded q,r, we are in the box centered at q,r.
            // The "corners" of this box are shared with neighbors.

            // A simple metric: The visual boundary is the octagon side.
            // Octagon is defined by intersections of |x| < W/2, |y| < W/2, |x|+|y| < R_outer
            // If we fall outside the octagon, we are in a diamond.

            // Octagon Inner Radius = width / 2.
            // Outer Radius = cellSize / 2.
            // Side equation: |x| + |y| < 2 * (cellSize/2) * cos(pi/8)? No.

            // Let's use the exact boundary.
            // The line connecting (W/2, s/2) and (s/2, W/2) is the cut.
            // where s is the octagon side length = 2 * (cellSize/2) * sin(pi/8).

            const R = this.cellSize / 2;
            const s = 2 * R * Math.sin(Math.PI / 8);
            const W_half = width / 2;
            const s_half = s / 2;

            // The corner cut is a line. The distance from center to that line is W_half.
            // Wait, W_half IS the apothem. The line is vertical/horizontal? No, diagonal.
            // The octagonal lines are: x=±W/2, y=±W/2, and ±x±y = R_outer * cos(pi/8)?

            // Simpler check:
            // Calculate Manhattan distance?
            // Max extent of Octagon is W_half along axes.
            // But diagonals cut it.
            // The cut line passes through (s/2, W/2) and (W/2, s/2).
            // Line eqn: Y - W/2 = ( (s/2 - W/2) / (W/2 - s/2) ) * (X - s/2)
            // Slope = -1. 
            // Y - W/2 = -1 * (X - s/2) => X + Y = W/2 + s/2.

            const limit = W_half + s_half;

            if (dx + dy > limit) {
                // It is in the corner -> Diamond
                // We need to associate it with a specific diamond ID.
                // The logical diamonds are at (q+0.5, r+0.5).
                // If x > cx, qD = q. If x < cx, qD = q-1.
                // If y > cy, rD = r. If y < cy, rD = r-1.
                // Note: My render logic attached the diamond to (q,r) using `offset, offset` (Bottom Right).
                // So if we are in Top-Left corner, that's (q-1, r-1)'s diamond.
                // If Bottom-Right, it's (q,r)'s diamond.

                const qD = x > cx ? q : q - 1;
                const rD = y > cy ? r : r - 1;

                return { q: qD, r: rD, subType: 'DIAMOND' };
            }

            return { q, r };
        }
        return { q: 0, r: 0 };
    }

    // Hexagon rounding
    axialRound(q, r) {
        let s = -q - r;
        let roundQ = Math.round(q);
        let roundR = Math.round(r);
        let roundS = Math.round(s);

        const qDiff = Math.abs(roundQ - q);
        const rDiff = Math.abs(roundR - r);
        const sDiff = Math.abs(roundS - s);

        if (qDiff > rDiff && qDiff > sDiff) {
            roundQ = -roundR - roundS;
        } else if (rDiff > sDiff) {
            roundR = -roundQ - roundS;
        }

        return { q: roundQ, r: roundR };
    }
}
