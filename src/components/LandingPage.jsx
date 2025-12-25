import React from 'react';
import { ArrowRight, Grid, Wand2, Download, Smartphone, Share2 } from 'lucide-react';

const LandingPage = ({ onStart }) => {
    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0f0f13 0%, #1a1a2e 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Background Ambience */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '50vw',
                height: '50vw',
                background: 'radial-gradient(circle, rgba(100, 108, 255, 0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '60vw',
                height: '60vw',
                background: 'radial-gradient(circle, rgba(156, 39, 176, 0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            {/* Navbar */}
            <nav style={{
                padding: '2rem 4rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'linear-gradient(45deg, #646cff, #9c27b0)',
                        borderRadius: '8px'
                    }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                        Stitch Please
                    </h1>
                </div>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onStart(); }}
                    style={{ textDecoration: 'none', color: '#aaa', fontSize: '0.9rem' }}
                >
                    Login
                </a>
            </nav>

            {/* Hero Section */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '0 2rem',
                zIndex: 10
            }}>
                <h2 style={{
                    fontSize: '4rem',
                    fontWeight: '800',
                    marginBottom: '1.5rem',
                    lineHeight: 1.1,
                    background: 'linear-gradient(to right, #fff, #a5a5a5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Design. Visualize.<br />
                    <span style={{
                        background: 'linear-gradient(45deg, #646cff, #9c27b0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Crochet.
                    </span>
                </h2>

                <p style={{
                    fontSize: '1.1rem',
                    color: '#888',
                    maxWidth: '600px',
                    marginBottom: '3rem',
                    lineHeight: 1.6
                }}>
                    The ultimate grid tool for granny square enthusiasts.
                    Plan intricate layouts, extract color palettes with AI,
                    and export your patterns—all in one place.
                </p>

                <button
                    onClick={onStart}
                    style={{
                        padding: '16px 48px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        background: 'linear-gradient(90deg, #646cff, #9c27b0)',
                        border: 'none',
                        borderRadius: '30px',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 10px 30px rgba(100, 108, 255, 0.4)',
                        transition: 'transform 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Start Designing
                    <ArrowRight size={20} />
                </button>

                {/* Feature Pills */}
                <div style={{
                    marginTop: '5rem',
                    display: 'flex',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <FeaturePill icon={<Grid size={18} />} text="Infinite Grid" />
                    <FeaturePill icon={<Wand2 size={18} />} text="AI Palettes" />
                    <FeaturePill icon={<Smartphone size={18} />} text="Mobile Ready" />
                    <FeaturePill icon={<Share2 size={18} />} text="Export Plan" />
                </div>
            </main>

            <footer style={{ padding: '2rem', textAlign: 'center', color: '#444', fontSize: '0.8rem', zIndex: 10 }}>
                © 2025 Stitch Please. Made for makers.
            </footer>
        </div>
    );
};

const FeaturePill = ({ icon, text }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '0.9rem',
        color: '#ccc',
        backdropFilter: 'blur(10px)'
    }}>
        <span style={{ color: '#646cff' }}>{icon}</span>
        {text}
    </div>
);

export default LandingPage;
