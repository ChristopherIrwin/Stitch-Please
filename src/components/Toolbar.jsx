import { SHAPE_TYPES, SHAPE_CONFIG } from '../engine/shapes';
import { Square, Hexagon, Triangle, Octagon, Trash2, Download, FolderOpen, Home } from 'lucide-react';

const Toolbar = ({ activeShape, onShapeSelect, gridConfig, setGridConfig, onClear, onSave, onLoad, onHome }) => {

    const getIcon = (type) => {
        switch (type) {
            case SHAPE_TYPES.SQUARE: return <Square size={20} />;
            case SHAPE_TYPES.HEXAGON: return <Hexagon size={20} />;
            case SHAPE_TYPES.TRIANGLE: return <Triangle size={20} />;
            case SHAPE_TYPES.OCTAGON: return <Octagon size={20} />;
            default: return <Square size={20} />;
        }
    };

    const ShapeButton = ({ type }) => (
        <button
            onClick={() => onShapeSelect(type)}
            title={`Switch to ${SHAPE_CONFIG[type].name} Grid`}
            style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: activeShape === type ? '2px solid #646cff' : '1px solid #444',
                backgroundColor: activeShape === type ? 'rgba(100, 108, 255, 0.2)' : '#333',
                color: activeShape === type ? '#646cff' : '#ccc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
            }}
        >
            {getIcon(type)}
        </button>
    );

    return (
        <div style={{
            position: 'absolute',
            left: 20,
            top: 20,
            bottom: 20,
            width: '60px',
            backgroundColor: '#242424',
            borderRight: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 0',
            gap: '20px',
            borderRadius: '8px',
            boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
            zIndex: 100
        }}>
            <div style={{ marginBottom: '10px' }}>
                <h3 style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888', textAlign: 'center', margin: 0 }}>Layout</h3>
                <h4 style={{ fontSize: '9px', color: '#666', textAlign: 'center', margin: '4px 0 0 0' }}>Mode</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 5px' }}>
                <div title="Grid Columns (Width)">
                    <label style={{ fontSize: '9px', color: '#666', display: 'block', textAlign: 'center' }}>Cols</label>
                    <input
                        type="number"
                        value={gridConfig.gridCols}
                        onChange={(e) => setGridConfig({ ...gridConfig, gridCols: parseInt(e.target.value) || 10 })}
                        style={{
                            width: '100%',
                            background: '#333',
                            border: '1px solid #444',
                            color: '#ccc',
                            fontSize: '10px',
                            padding: '2px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}
                    />
                </div>
                <div title="Grid Rows (Height)">
                    <label style={{ fontSize: '9px', color: '#666', display: 'block', textAlign: 'center' }}>Rows</label>
                    <input
                        type="number"
                        value={gridConfig.gridRows}
                        onChange={(e) => setGridConfig({ ...gridConfig, gridRows: parseInt(e.target.value) || 10 })}
                        style={{
                            width: '100%',
                            background: '#333',
                            border: '1px solid #444',
                            color: '#ccc',
                            fontSize: '10px',
                            padding: '2px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}
                    />
                </div>
                <div title="Cell Size (Zoom/Scale)">
                    <label style={{ fontSize: '9px', color: '#666', display: 'block', textAlign: 'center' }}>Size</label>
                    <input
                        type="number"
                        value={gridConfig.cellSize}
                        onChange={(e) => setGridConfig({ ...gridConfig, cellSize: parseInt(e.target.value) || 10 })}
                        style={{
                            width: '100%',
                            background: '#333',
                            border: '1px solid #444',
                            color: '#ccc',
                            fontSize: '10px',
                            padding: '2px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}
                    />
                </div>
            </div>

            <div style={{ width: '40px', height: '1px', backgroundColor: '#444', margin: '5px 0' }} />

            {Object.values(SHAPE_TYPES).map((type) => (
                <ShapeButton key={type} type={type} />
            ))}

            <div style={{ width: '40px', height: '1px', backgroundColor: '#444', margin: '10px 0' }} />

            <div style={{ width: '40px', height: '1px', backgroundColor: '#444' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                    onClick={onSave}
                    title="Save Project"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        backgroundColor: '#333',
                        color: '#ccc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    <Download size={20} />
                </button>

                <button
                    onClick={() => document.getElementById('project-upload').click()}
                    title="Open Project"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        backgroundColor: '#333',
                        color: '#ccc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    <FolderOpen size={20} />
                </button>
                <input
                    type="file"
                    id="project-upload"
                    accept=".json"
                    onChange={onLoad}
                    style={{ display: 'none' }}
                />
            </div>

            <div style={{ width: '40px', height: '1px', backgroundColor: '#444' }} />

            <button
                onClick={onClear}
                title="Clear Grid"
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#333',
                    color: '#ff4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
            >
                <Trash2 size={20} />
            </button>
            <button
                onClick={onHome}
                title="Back to Home"
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#333',
                    color: '#aaa',
                    cursor: 'pointer',
                    marginTop: 'auto', // Push to bottom if flex container
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
            >
                <Home size={20} />
            </button>
        </div>
    );
};

export default Toolbar;
