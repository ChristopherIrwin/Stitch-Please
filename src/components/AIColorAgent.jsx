import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import ColorThief from 'colorthief';
import { Camera, Image as ImageIcon, X, Sparkles, MessageSquare, Send } from 'lucide-react';
import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';

const AIColorAgent = ({ onColorSelect, onSavePalette, onClose }) => {
    const [mode, setMode] = useState('initial'); // initial, camera, upload, chat
    const [imageSrc, setImageSrc] = useState(null);
    const [colors, setColors] = useState([]);
    const [generatedPalette, setGeneratedPalette] = useState(null); // { name: '', colors: [] }
    const [analyzing, setAnalyzing] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [chatHistory, setChatHistory] = useState([]); // {role: 'user'|'model', text: ''}
    const [modelLoading, setModelLoading] = useState(false);
    const [llmEngine, setLlmEngine] = useState(null);

    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize Gemma Model with Progress Tracking
    useEffect(() => {
        const initModel = async () => {
            if (mode === 'chat' && !llmEngine && !modelLoading) {
                setModelLoading(true);
                try {
                    // Step 1: Initialize FilesetResolver (WASM)
                    const genai = await FilesetResolver.forGenAiTasks(
                        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm"
                    );

                    // Step 2: Manually fetch the model to track progress
                    const modelUrl = "https://storage.googleapis.com/gemma3ne4bitint4web/gemma-3n-E4B-it-int4-Web.litertlm";
                    const response = await fetch(modelUrl);
                    if (!response.ok) throw new Error(`Model fetch failed: ${response.statusText}`);

                    const contentLength = response.headers.get('content-length');
                    const total = contentLength ? parseInt(contentLength, 10) : 0;
                    let loaded = 0;

                    const reader = response.body.getReader();
                    const chunks = [];

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        chunks.push(value);
                        loaded += value.length;
                        if (total) {
                            setDownloadProgress(Math.round((loaded / total) * 100)); // Update progress
                        }
                    }

                    const blob = new Blob(chunks);
                    const objectUrl = URL.createObjectURL(blob);

                    // Step 3: Initialize LLM with the local object URL
                    const llm = await LlmInference.createFromOptions(genai, {
                        baseOptions: {
                            modelAssetPath: objectUrl,
                            delegate: "GPU"
                        },
                        maxTokens: 512,
                        topK: 40,
                        temperature: 0.8,
                        randomSeed: 101
                    });

                    setLlmEngine(llm);
                    setModelLoading(false);
                    console.log("Gemma Model Loaded Successfully");
                } catch (error) {
                    console.error("Failed to load Gemma model:", error);
                    setModelLoading(false);
                    setChatHistory(prev => [...prev, { role: 'model', text: `Error: ${error.message || error.toString()}. \nRequest failed? Check CORS.` }]);
                }
            }
        };
        initModel();
    }, [mode, llmEngine, modelLoading]);

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
        }, 1500);
    };

    const handlePromptSubmit = async () => {
        if (!prompt.trim() || !llmEngine) return;

        const userMsg = prompt;
        setPrompt('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setAnalyzing(true);

        // Construct a structured prompt for Gemma to output valid specific hex codes
        const systemInstruction = "You are a color theory expert. Generate a specific, harmonious color palette suitable for a granny square crochet project based on the user's description. You MUST output a JSON object with two fields: 'name' (a creative name for the palette) and 'colors' (an array of 5-8 HEX color strings). Example: { \"name\": \"Ocean Breeze\", \"colors\": [\"#00AABB\", \"#ffffff\"] }. Do not include markdown code blocks, just the raw JSON string.";
        const fullPrompt = `${systemInstruction}\nUser: ${userMsg}\nModel:`;

        try {
            const response = await llmEngine.generateResponse(fullPrompt);
            setChatHistory(prev => [...prev, { role: 'model', text: response }]);

            // Attempt to parse JSON from response (handling potential markdown wrapping)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.colors && Array.isArray(parsed.colors)) {
                        setColors(parsed.colors);
                        setGeneratedPalette(parsed);
                    }
                } catch (e) {
                    console.error("Failed to parse JSON", e);
                    // Fallback regex extraction if JSON fails
                    const hexMatches = response.match(/#[0-9A-Fa-f]{6}/g);
                    if (hexMatches && hexMatches.length > 0) {
                        const fallbackColors = hexMatches.slice(0, 8);
                        setColors(fallbackColors);
                        setGeneratedPalette({ name: userMsg, colors: fallbackColors });
                    }
                }
            } else {
                // Fallback regex extraction
                const hexMatches = response.match(/#[0-9A-Fa-f]{6}/g);
                if (hexMatches && hexMatches.length > 0) {
                    const fallbackColors = hexMatches.slice(0, 8);
                    setColors(fallbackColors);
                    setGeneratedPalette({ name: userMsg, colors: fallbackColors });
                }
            }
        } catch (error) {
            console.error("Gemma generation error:", error);
            setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I had trouble generating that palette." }]);
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
                    <p style={{ margin: 0, fontSize: '13px', color: '#888', fontFamily: 'var(--font-body)' }}>Powered by Google Gemma 3</p>
                </div>
            </div>

            {/* Mobile Warning */}
            {mode === 'chat' && !llmEngine && !modelLoading && (
                <div style={{
                    backgroundColor: '#FFF4E5',
                    borderLeft: '4px solid #FF9800',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    marginBottom: '15px',
                    color: '#663C00'
                }}>
                    <strong>⚠️ Large Download (4GB):</strong> This AI feature runs entirely in your browser. It requires a stable Wi-Fi connection and may time out on mobile devices.
                </div>
            )}

            {mode === 'initial' && (
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', padding: '20px 0' }}>
                    <button
                        onClick={() => setMode('chat')}
                        style={{
                            flex: 1, padding: '20px', backgroundColor: '#333', border: '1px solid #646cff', borderRadius: '8px',
                            color: '#ccc', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <MessageSquare size={32} color="#646cff" />
                        Prompt Gemma
                    </button>
                    <button
                        onClick={() => setMode('camera')}
                        style={{
                            flex: 1, padding: '20px', backgroundColor: '#333', border: '1px dashed #555', borderRadius: '8px',
                            color: '#ccc', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <Camera size={32} />
                        Scan via Webcam
                    </button>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            flex: 1, padding: '20px', backgroundColor: '#333', border: '1px dashed #555', borderRadius: '8px',
                            color: '#ccc', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <ImageIcon size={32} />
                        Upload Photo
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
                    </button>
                </div>
            )}

            {mode === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>

                    {modelLoading && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#888' }}>
                            <div className="spinner" style={{
                                width: '40px', height: '40px',
                                border: '4px solid #f3f3f3',
                                borderTopColor: 'var(--primary-color)',
                                borderRadius: '50%',
                                marginBottom: '15px',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'bold' }}>
                                Downloading AI Model... {downloadProgress}%
                            </p>
                            <p style={{ fontSize: '12px', marginTop: '5px' }}> (~4GB, first time only)</p>
                            <div style={{ width: '200px', height: '6px', background: '#eee', borderRadius: '3px', marginTop: '10px' }}>
                                <div style={{ width: `${downloadProgress}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '3px', transition: 'width 0.2s' }} />
                            </div>
                        </div>
                    )}

                    {!modelLoading && (
                        <>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', background: '#222', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}>
                                {chatHistory.length === 0 && <p style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>Ask me for any color palette! <br /> e.g. "Ocean vibes" or "Retro 70s"</p>}
                                {chatHistory.map((msg, i) => (
                                    <div key={i} style={{ marginBottom: '10px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '8px 12px',
                                            borderRadius: '12px',
                                            background: msg.role === 'user' ? '#646cff' : '#444',
                                            color: '#fff'
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
                                    placeholder="Describe a palette..."
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #555', background: '#333', color: 'white' }}
                                />
                                <button
                                    onClick={handlePromptSubmit}
                                    disabled={analyzing}
                                    style={{ padding: '0 20px', borderRadius: '8px', background: analyzing ? '#444' : '#646cff', color: 'white', border: 'none', cursor: analyzing ? 'default' : 'pointer' }}
                                >
                                    {analyzing ? 'Thinking...' : <Send size={20} />}
                                </button>
                            </div>
                        </>
                    )}
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
                        style={{ width: '100%', padding: '12px', background: '#646cff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                    >
                        Capture
                    </button>
                </div>
            )}

            {(mode === 'analyze' || mode === 'done' || (mode === 'chat' && colors.length > 0)) && (mode !== 'chat' || colors.length > 0) && (
                <div style={{ marginTop: '20px' }}>
                    {(mode === 'analyze' || mode === 'done') && imageSrc && (
                        <div style={{ width: '100%', height: '150px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px', position: 'relative' }}>
                            <img src={imageSrc} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Analysis Target" />
                            {analyzing && (<div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white' }}>Analyzing...</span></div>)}
                        </div>
                    )}

                    {!analyzing && (mode === 'analyze' || mode === 'done') && colors.length === 0 && (
                        <button
                            onClick={analyzeColors}
                            style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #646cff, #9c27b0)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            Analyze
                        </button>
                    )}

                    {colors.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h3 style={{ fontSize: '14px', color: '#ccc', margin: 0 }}>
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
                                        backgroundColor: '#333',
                                        border: '1px solid #666',
                                        color: '#eee',
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
                                            width: '50px', height: '50px', borderRadius: '50%', backgroundColor: color, border: '2px solid #444',
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
