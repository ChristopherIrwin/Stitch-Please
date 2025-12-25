import React, { useRef, useState, useMemo } from 'react';
import { GridSystem } from '../engine/grid';
import { SHAPE_TYPES } from '../engine/shapes';

const DesignCanvas = ({ gridConfig, activeShape, placedShapes, onShapePlace }) => {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    const containerRef = useRef(null);
    const grid = useMemo(() => new GridSystem(gridConfig), [gridConfig]);

    // Standard interactive handlers (Zoom/Pan/Click)
    const handleWheel = (e) => {
        e.preventDefault();
        const scaleFactor = 1.1;
        const newZoom = e.deltaY > 0 ? zoom / scaleFactor : zoom * scaleFactor;
        setZoom(Math.max(0.1, Math.min(newZoom, 5)));
    };

    const handleMouseDown = (e) => {
        // Middle mouse or check generic drag
        setIsDragging(true);
        setIsPanning(false);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            const dx = e.clientX - (dragStart.x + pan.x);
            const dy = e.clientY - (dragStart.y + pan.y);
            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                setIsPanning(true);
                setPan({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                });
            }
        }
    };

    const handleMouseUp = (e) => {
        if (!isPanning && isDragging) {
            handleClick(e);
        }
        setIsDragging(false);
    };

    const handleClick = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const visualX = (mouseX - pan.x) / zoom;
        const visualY = (mouseY - pan.y) / zoom;

        const { q, r, subType } = grid.getGridCoordinates(visualX, visualY);
        onShapePlace(q, r, subType);
    };

    // --- Geometry Helpers ---

    const getHexPoints = (size) => {
        const angles = [0, 60, 120, 180, 240, 300];
        return angles.map(deg => {
            const rad = (deg + 30) * Math.PI / 180;
            return `${size * Math.cos(rad)},${size * Math.sin(rad)}`;
        }).join(' ');
    };

    const getSquarePoints = (size) => {
        const half = size / 2;
        return `${-half},${-half} ${half},${-half} ${half},${half} ${-half},${half}`;
    };

    const getTrianglePoints = (size, isDown = false) => {
        // Equilateral triangle centered at 0,0
        // Radius from center to vertex = side / sqrt(3)
        const r = size / Math.sqrt(3);

        const angles = isDown ? [90, 210, 330] : [270, 30, 150];
        return angles.map(deg => {
            const rad = deg * Math.PI / 180;
            return `${r * Math.cos(rad)},${r * Math.sin(rad)}`;
        }).join(' ');
    };

    const getOctagonPoints = (size) => {
        const r = size * 0.5; // If size is full width, radius is half
        const angles = [];
        const offset = 22.5;
        for (let i = 0; i < 8; i++) angles.push(i * 45 + offset);
        return angles.map(deg => {
            const rad = deg * Math.PI / 180;
            return `${r * Math.cos(rad)},${r * Math.sin(rad)}`;
        }).join(' ');
    };

    // --- Grid Rendering Logic ---

    const gridShapes = useMemo(() => {
        const shapes = [];
        const { type, cellSize, gridRows = 15, gridCols = 15 } = gridConfig;

        // Calculate ranges to center the grid
        const rHeight = gridRows;
        const qWidth = gridCols;

        const rMid = Math.floor(rHeight / 2);
        const qMid = Math.floor(qWidth / 2);

        // Standard bounds
        let rMin = -rMid;
        let rMax = rHeight - rMid;

        // Adjust for 0-index vs centered logic if needed, but this gives ~ centered.
        // Let's iterate exact count.

        for (let r = -rMid; r < rHeight - rMid; r++) {
            let qMin = -qMid;
            let qMax = qWidth - qMid;

            // For Hexagon, shift q to maintain rectangular shape
            if (type === SHAPE_TYPES.HEXAGON) {
                const offset = Math.floor(r / 2);
                qMin -= offset;
                qMax -= offset;
            }

            for (let q = qMin; q < qMax; q++) {
                const { x, y } = grid.getPixelCoordinates(q, r);
                const key = `${q},${r}`;
                const placed = placedShapes[key];

                const isTriangle = type === SHAPE_TYPES.TRIANGLE;
                const isDown = isTriangle && ((Math.abs(q) + Math.abs(r)) % 2 !== 0);

                let shapePath;
                let shapeFill = placed ? placed.color : "none";
                let stroke = "#333";

                if (type === SHAPE_TYPES.HEXAGON) {
                    shapePath = <polygon points={getHexPoints(cellSize)} fill={shapeFill} stroke={stroke} vectorEffect="non-scaling-stroke" />;
                }
                else if (type === SHAPE_TYPES.TRIANGLE) {
                    shapePath = <polygon points={getTrianglePoints(cellSize, isDown)} fill={shapeFill} stroke={stroke} vectorEffect="non-scaling-stroke" />;
                }
                else if (type === SHAPE_TYPES.OCTAGON) {
                    shapePath = <polygon points={getOctagonPoints(cellSize)} fill={shapeFill} stroke={stroke} vectorEffect="non-scaling-stroke" />;

                    // Render Diamond for Octagon gaps
                    const r_oct = cellSize / 2;
                    const s_oct = 2 * r_oct * Math.sin(Math.PI / 8);
                    const w_oct = cellSize * Math.cos(Math.PI / 8);
                    const s_half = s_oct / 2;
                    const offset = w_oct / 2;
                    const diamondPoints = [
                        `${offset},${offset - s_half * Math.sqrt(2)}`,
                        `${offset + s_half * Math.sqrt(2)},${offset}`,
                        `${offset},${offset + s_half * Math.sqrt(2)}`,
                        `${offset - s_half * Math.sqrt(2)},${offset}`
                    ].join(' ');

                    const diamondKey = `${q},${r}:DIAMOND`;
                    const diamondPlaced = placedShapes[diamondKey];
                    const diamondFill = diamondPlaced ? diamondPlaced.color : "none";

                    shapePath = (
                        <>
                            <polygon points={getOctagonPoints(cellSize)} fill={shapeFill} stroke={stroke} vectorEffect="non-scaling-stroke" />
                            <polygon points={diamondPoints} fill={diamondFill} stroke={stroke} vectorEffect="non-scaling-stroke" />
                        </>
                    );
                }
                else {
                    shapePath = (
                        <rect
                            x={-cellSize / 2}
                            y={-cellSize / 2}
                            width={cellSize}
                            height={cellSize}
                            fill={shapeFill}
                            stroke={stroke}
                            vectorEffect="non-scaling-stroke"
                        />
                    );
                }

                shapes.push(
                    <g key={key} transform={`translate(${x}, ${y})`}>
                        {shapePath}
                        {!placed && <text fontSize="6" fill="#333" textAnchor="middle" dy="2" style={{ userSelect: 'none', pointerEvents: 'none', opacity: 0.1 }}>
                            {q},{r}
                        </text>}
                    </g>
                );
            }
        }
        return shapes;
    }, [gridConfig, placedShapes, grid]);

    // --- Touch Handlers ---
    const touchRef = useRef({
        lastDist: null,
        startPan: { x: 0, y: 0 },
        startPinch: null,
        isZooming: false,
        isPanning: false,
        touchStartTime: 0
    });

    const getTouchDist = (touches) => {
        return Math.hypot(
            touches[0].clientX - touches[1].clientX,
            touches[0].clientY - touches[1].clientY
        );
    };

    const handleTouchStart = (e) => {
        // Prevent default to stop scrolling the page
        // e.preventDefault(); // React synthetic events might complain, handle via style touch-action: none

        if (e.touches.length === 1) {
            touchRef.current.isPanning = true;
            touchRef.current.isZooming = false;
            touchRef.current.startPan = {
                x: e.touches[0].clientX - pan.x,
                y: e.touches[0].clientY - pan.y
            };
            touchRef.current.touchStartTime = Date.now();
        } else if (e.touches.length === 2) {
            touchRef.current.isZooming = true;
            touchRef.current.isPanning = false;
            touchRef.current.lastDist = getTouchDist(e.touches);
        }
    };

    const handleTouchMove = (e) => {
        if (touchRef.current.isZooming && e.touches.length === 2) {
            const newDist = getTouchDist(e.touches);
            if (touchRef.current.lastDist) {
                const scale = newDist / touchRef.current.lastDist;
                const newZoom = Math.max(0.1, Math.min(zoom * scale, 5));
                setZoom(newZoom);
                touchRef.current.lastDist = newDist;
            }
        } else if (touchRef.current.isPanning && e.touches.length === 1) {
            setPan({
                x: e.touches[0].clientX - touchRef.current.startPan.x,
                y: e.touches[0].clientY - touchRef.current.startPan.y
            });
        }
    };

    const handleTouchEnd = (e) => {
        if (touchRef.current.isPanning && !touchRef.current.isZooming) {
            // Check for tap (short duration, small movement handled naturally by click logic if we didn't prevent default)
            // But if we are panning, we might want to distinguish tap.

            const duration = Date.now() - touchRef.current.touchStartTime;
            if (duration < 200) {
                // It was a quick tap. Trigger logic similar to click.
                // We need the changed touch or the last known position.
                // touchEnd event doesn't have touches[0].
                const touch = e.changedTouches[0];
                handleClick({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            }
        }

        if (e.touches.length === 0) {
            touchRef.current.isPanning = false;
            touchRef.current.isZooming = false;
            touchRef.current.lastDist = null;
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1a1a1a',
                position: 'relative',
                fontFamily: 'sans-serif',
                overscrollBehavior: 'none',
                overflow: 'hidden',
                touchAction: 'none',
                perspective: '1000px', // Force 3D context
                backfaceVisibility: 'hidden', // Hide backface
                WebkitFontSmoothing: 'antialiased'
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <svg
                width="100%"
                height="100%"
                style={{
                    cursor: isDragging ? 'grabbing' : 'crosshair',
                    display: 'block',
                    touchAction: 'none',
                    transform: 'translateZ(0)' // Promote SVG to layer
                }}
            >
                <g
                    transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} // Reverted to valid SVG transform
                    style={{
                        willChange: 'transform',
                        backfaceVisibility: 'hidden'
                    }}
                >
                    backfaceVisibility: 'hidden' // Important for iOS
                    }}
                >
                    {gridShapes}
                </g>
            </svg>

            <div style={{ position: 'absolute', bottom: 20, right: 20, color: '#666', fontSize: '12px', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: 4 }}>
                Zoom: {zoom.toFixed(2)}x
            </div>
        </div>
    );
};

export default DesignCanvas;
