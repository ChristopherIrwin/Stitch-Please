import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import ColorThief from 'colorthief';
import { Camera, Image as ImageIcon, X, Sparkles, MessageSquare, Send, Key } from 'lucide-react';

const AIColorAgent = ({ onColorSelect, onSavePalette, onClose }) => {
    const [mode, setMode] = useState('initial'); // initial, camera, upload, chat, apikey
    const [imageSrc, setImageSrc] = useState(null);
    const [colors, setColors] = useState([]);
    const [generatedPalette, setGeneratedPalette] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');

    // Check local storage for key if env not present
    useEffect(() => {
        if (!apiKey) {
            const storedKey = localStorage.getItem('gemini_api_key');
            if (storedKey) setApiKey(storedKey);
        }
    }, []);

    const saveApiKey = (key) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
        setMode('initial');
    };

    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);
        setMode('analyze');
    }, [webcamRef]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target.result);
                setMode('analyze');
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeColors = () => {
        setAnalyzing(true);
        setTimeout(() => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageSrc;
            img.onload = () => {
                const colorThief = new ColorThief();
                const palette = colorThief.getPalette(img, 6);
                const hexPalette = palette.map(rgb => `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`);
                setColors(hexPalette);
                setAnalyzing(false);
            };
        }, 800);
    };

    const handlePromptSubmit = async () => {
        if (!prompt.trim()) return;
        if (!apiKey) {
            setMode('apikey');
            return;
        }

        const userMsg = prompt;
        setPrompt('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setAnalyzing(true);

        const systemInstruction = "You are a color theory expert. Generate a specific, harmonious color palette suitable for a granny square crochet project based on the user's description. You MUST output a JSON object with two fields: 'name' (a creative name for the palette) and 'colors' (an array of 5-8 HEX color strings). Example: { \"name\": \"Ocean Breeze\", \"colors\": [\"#00AABB\", \"#ffffff\"] }. Do not include markdown code blocks, just the raw JSON string.";

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${systemInstruction}\nUser Request: ${userMsg}` }]
                    }]
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("API Error", data.error);
                throw new Error(data.error.message);
            }

            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) throw new Error("No response from Gemini");

            // Parse response
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.colors) {
                    setColors(parsed.colors);
                    setGeneratedPalette(parsed);
                    setChatHistory(prev => [...prev, { role: 'model', text: `Generated "${parsed.name}" palette!` }]);
                }
            } else {
                setChatHistory(prev => [...prev, { role: 'model', text: "I couldn't generate a valid palette format. Try again?" }]);
            }

        } catch (error) {
            console.error("Gemini API Error", error);
            setChatHistory(prev => [...prev, { role: 'model', text: `API Error: ${error.message}. Check your API Key.` }]);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--panel-bg)',
            padding: '30px',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            width: '600px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            border: '1px solid var(--grid-line-color)',
            color: 'var(--text-color)'
        }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={24} /></button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'var(--primary-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(255, 107, 107, 0.3)'
                }}>
                    <Sparkles size={20} color="white" />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--font-heading)', color: 'var(--text-color)' }}>Whimsy AI Agent</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#888', fontFamily: 'var(--font-body)' }}>Powered by Google Gemini API</p>
                </div>
            </div>

            {/* API Key Mode */}
            {mode === 'apikey' && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0, color: 'var(--text-color)' }}>Enter Gemini API Key</h3>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>This feature uses the Gemini API. Please enter your API Key to continue.</p>
                    <input
                        type="password"
                        placeholder="AIzaSy..."
                        onChange={(e) => setApiKey(e.target.value)}
                        value={apiKey}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px', background: '#fff', color: '#333' }}
                    />
                    <button
                        onClick={() => { localStorage.setItem('gemini_api_key', apiKey); setMode('initial'); }}
                        style={{ width: '100%', padding: '12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Save & Continue
                    </button>
                    <p style={{ fontSize: '11px', color: '#aaa', marginTop: '10px' }}>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" style={{ color: 'var(--primary-color)' }}>Get a key here</a>
                    </p>
                </div>
            )}

            {mode === 'initial' && (
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', padding: '20px 0' }}>
                    <button
                        onClick={() => apiKey ? setMode('chat') : setMode('apikey')}
                        style={{
                            flex: 1, padding: '20px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--primary-color)', borderRadius: '8px',
                            color: 'var(--text-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <MessageSquare size={32} color="var(--primary-color)" />
                        Prompt Gemini
                    </button>
                    <button
                        onClick={() => setMode('camera')}
                        style={{
                            flex: 1, padding: '20px', backgroundColor: 'var(--bg-color)', border: '1px dashed #ccc', borderRadius: '8px',
                            color: 'var(--text-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <Camera size={32} color="#888" />
                        Scan via Webcam
                    </button>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            flex: 1, padding: '20px', backgroundColor: 'var(--bg-color)', border: '1px dashed #ccc', borderRadius: '8px',
                            color: 'var(--text-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <ImageIcon size={32} color="#888" />
                        Upload Photo
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
                    </button>
                </div>
            )}

            {mode === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}>
                        {chatHistory.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: '50px' }}>Ask me for any color palette! <br /> e.g. "Ocean vibes" or "Retro 70s"</p>}
                        {chatHistory.map((msg, i) => (
                            <div key={i} style={{ marginBottom: '10px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    background: msg.role === 'user' ? 'var(--primary-color)' : '#eee',
                                    color: msg.role === 'user' ? 'white' : '#333'
                                }}>
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
                            disabled={analyzing}
                            placeholder="Describe a palette..."
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', color: '#333' }}
                        />
                        <button
                            onClick={handlePromptSubmit}
                            disabled={analyzing}
                            style={{ padding: '0 20px', borderRadius: '8px', background: analyzing ? '#ccc' : 'var(--primary-color)', color: 'white', border: 'none', cursor: analyzing ? 'default' : 'pointer' }}
                        >
                            {analyzing ? 'Thinking...' : <Send size={20} />}
                        </button>
                    </div>
                </div>
            )}

            {mode === 'camera' && (
                <div>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            facingMode: "environment"
                        }}
                        style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }}
                    />
                    <button
                        onClick={capture}
                        style={{ width: '100%', padding: '12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                    >
                        Capture
                    </button>
                </div>
            )}

            {(mode === 'analyze' || mode === 'done' || (mode === 'chat' && colors.length > 0)) && (mode !== 'chat' || colors.length > 0) && (
                <div style={{ marginTop: '20px' }}>
                    {(mode === 'analyze' || mode === 'done') && imageSrc && (
                        <div style={{ width: '100%', height: '150px', backgroundColor: '#f0f0f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px', position: 'relative' }}>
                            <img src={imageSrc} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Analysis Target" />
                            {analyzing && (<div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#333', fontWeight: 'bold' }}>Analyzing...</span></div>)}
                        </div>
                    )}

                    {!analyzing && (mode === 'analyze' || mode === 'done') && colors.length === 0 && (
                        <button
                            onClick={analyzeColors}
                            style={{ width: '100%', padding: '12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            Analyze
                        </button>
                    )}

                    {colors.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h3 style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                                    {generatedPalette?.name || "Generated Palette"}
                                </h3>
                                <button
                                    onClick={() => {
                                        const paletteToSave = generatedPalette || { name: `Analyzed Palette ${new Date().toLocaleTimeString()}`, colors: colors };
                                        onSavePalette(paletteToSave);
                                        alert(`Saved "${paletteToSave.name}" to Library!`);
                                    }}
                                    style={{
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        backgroundColor: '#eee',
                                        border: '1px solid #ccc',
                                        color: '#333',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save to Library
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {colors.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { onColorSelect(color); onClose(); }}
                                        style={{
                                            width: '50px', height: '50px', borderRadius: '50%', backgroundColor: color, border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                            cursor: 'pointer', transition: 'transform 0.2s', position: 'relative'
                                        }}
                                        title={`Select ${color}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIColorAgent;
