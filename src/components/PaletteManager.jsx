import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Sparkles, Pipette, Palette } from 'lucide-react';

const DEFAULT_PALETTE = [
    { id: '1', name: 'Mustard', color: '#ffcc00' },
    { id: '2', name: 'Navy', color: '#001f3f' },
    { id: '3', name: 'Cream', color: '#f0f0f0' },
    { id: '4', name: 'Rust', color: '#8b4513' },
    { id: '5', name: 'Teal', color: '#008080' },
    { id: '6', name: 'Charcoal', color: '#333333' }
];

const PaletteManager = ({ activeColor, onColorSelect, onOpenAgent, customPalettes = [] }) => {
    const [showPicker, setShowPicker] = useState(false);
    // State to hold the currently displayed colors (yarns)
    const [currentPaletteColors, setCurrentPaletteColors] = useState(DEFAULT_PALETTE);
    const [expandedPaletteId, setExpandedPaletteId] = useState(null);

    const handleEyeDropper = async () => {
        if (!window.EyeDropper) {
            alert('Your browser does not support the EyeDropper API');
            return;
        }
        try {
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            onColorSelect(result.sRGBHex);
        } catch (e) {
            console.error('EyeDropper failed', e);
        }
    };

    return (
        <div style={{
            position: 'absolute',
            right: 20,
            top: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 100
        }}>
            {/* Expanded Custom Palette View */}
            {expandedPaletteId && (
                <div style={{
                    position: 'absolute',
                    right: '70px',
                    top: '200px', // Adjust based on position approx
                    padding: '10px',
                    backgroundColor: '#242424',
                    borderRadius: '8px',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
                    border: '1px solid #444',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '5px',
                    width: '120px',
                    zIndex: 102
                }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>
                            {customPalettes.find(p => p.id === expandedPaletteId)?.name}
                        </span>
                        <button onClick={() => setExpandedPaletteId(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0 }}>×</button>
                    </div>
                    {customPalettes.find(p => p.id === expandedPaletteId)?.colors.map((color, idx) => (
                        <button
                            key={idx}
                            onClick={() => onColorSelect(color)}
                            title={color}
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                backgroundColor: color,
                                border: activeColor === color ? '2px solid white' : '1px solid #333',
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Color Wheel Popover */}
            {showPicker && (
                <div style={{
                    position: 'absolute',
                    right: '70px',
                    top: '0',
                    padding: '15px',
                    backgroundColor: '#242424',
                    borderRadius: '12px',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
                    border: '1px solid #444',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <HexColorPicker color={activeColor} onChange={onColorSelect} />
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <span style={{ color: '#888', fontSize: '12px', width: '30px' }}>HEX</span>
                        <input
                            type="text"
                            value={activeColor}
                            onChange={(e) => onColorSelect(e.target.value)}
                            style={{
                                background: '#333',
                                border: '1px solid #555',
                                color: '#eee',
                                width: '100%',
                                padding: '4px',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Main Palette Bar */}
            <div style={{
                width: '60px',
                backgroundColor: '#242424',
                borderLeft: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 0',
                gap: '15px',
                borderRadius: '8px',
                boxShadow: '-2px 0 10px rgba(0,0,0,0.3)',
            }}>
                <h3 style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888', textAlign: 'center', margin: 0 }}>Yarn</h3>

                {currentPaletteColors.map((yarn, idx) => {
                    // Handle both object (default) and string (custom) color formats
                    const colorHex = typeof yarn === 'string' ? yarn : yarn.color;
                    const colorName = typeof yarn === 'string' ? colorHex : yarn.name;
                    const key = typeof yarn === 'string' ? idx : yarn.id;

                    return (
                        <button
                            key={key}
                            onClick={() => onColorSelect(colorHex)}
                            title={`Select Yarn: ${colorName}`}
                            style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                border: activeColor === colorHex ? '2px solid white' : '2px solid transparent',
                                backgroundColor: colorHex,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                transition: 'transform 0.1s',
                                transform: activeColor === colorHex ? 'scale(1.1)' : 'scale(1)'
                            }}
                        />
                    );
                })}

                <div style={{ width: '40px', height: '1px', backgroundColor: '#444', margin: '5px 0' }} />

                {/* Default Reset Button */}
                <button
                    onClick={() => setCurrentPaletteColors(DEFAULT_PALETTE)}
                    title="Reset to Default Colors"
                    style={{
                        padding: '5px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: 0.5,
                        transition: 'opacity 0.2s',
                        ':hover': { opacity: 1 }
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', width: '28px' }}>
                        {DEFAULT_PALETTE.slice(0, 4).map((c, i) => (
                            <div key={i} style={{ width: '12px', height: '12px', backgroundColor: c.color, borderRadius: '2px' }} />
                        ))}
                    </div>
                </button>

                {/* Custom Palettes */}
                {customPalettes.map((palette) => (
                    <button
                        key={palette.id}
                        onClick={() => {
                            setCurrentPaletteColors(palette.colors);
                        }}
                        title={`Switch to: ${palette.name}`}
                        style={{
                            padding: '5px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: 0.8,
                            transition: 'all 0.2s',
                            transform: currentPaletteColors === palette.colors ? 'scale(1.1)' : 'scale(1)',
                            border: currentPaletteColors === palette.colors ? '1px solid #666' : '1px solid transparent',
                            borderRadius: '8px'
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', width: '28px' }}>
                            {palette.colors.slice(0, 4).map((c, i) => (
                                <div key={i} style={{ width: '12px', height: '12px', backgroundColor: c, borderRadius: '2px' }} />
                            ))}
                        </div>
                    </button>
                ))}

                <div style={{ width: '40px', height: '1px', backgroundColor: '#444', margin: '5px 0' }} />

                {/* Custom Color Tools */}
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    title="Custom Color Wheel"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: showPicker ? '1px solid #646cff' : '1px solid #444',
                        background: showPicker ? 'rgba(100, 108, 255, 0.2)' : '#333',
                        color: showPicker ? '#646cff' : '#ccc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Palette size={20} />
                </button>

                <button
                    onClick={handleEyeDropper}
                    title="Pipette / Eye Dropper"
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
                        justifyContent: 'center'
                    }}
                >
                    <Pipette size={20} />
                </button>

                <div style={{ width: '40px', height: '1px', backgroundColor: '#444', margin: '5px 0' }} />

                <button
                    onClick={onOpenAgent}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid rgba(100, 108, 255, 0.5)',
                        background: 'rgba(100, 108, 255, 0.1)',
                        color: '#646cff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                    title="Ask Gemma Agent for Colors"
                >
                    <Sparkles size={20} />
                </button>

            </div>
        </div>
    );
};

export default PaletteManager;
