import React from 'react';
import { ArrowRight, Grid, Wand2, Download, Smartphone, Share2 } from 'lucide-react';

const LandingPage = ({ onStart }) => {
    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Whimsical Background Shapes */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                left: '-10%',
                width: '60vw',
                height: '60vw',
                background: 'var(--accent-color)',
                opacity: 0.1,
                borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                zIndex: 0,
                animation: 'float 20s infinite ease-in-out'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-5%',
                width: '50vw',
                height: '50vw',
                background: 'var(--primary-color)',
                opacity: 0.1,
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                zIndex: 0,
                animation: 'float 25s infinite ease-in-out reverse'
            }} />
            <div style={{
                position: 'absolute',
                top: '20%',
                right: '15%',
                width: '20vw',
                height: '20vw',
                background: 'var(--highlight-color)',
                opacity: 0.15,
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px',
                        background: 'var(--primary-color)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
                        fontFamily: 'var(--font-heading)',
                        boxShadow: '0 4px 0 rgba(0,0,0,0.1)'
                    }}>Y</div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--text-color)',
                        letterSpacing: '0.5px'
                    }}>
                        Yarn Whimsy
                    </h1>
                </div>
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
                    fontSize: '5rem',
                    fontFamily: 'var(--font-heading)',
                    marginBottom: '1rem',
                    lineHeight: 1,
                    color: 'var(--text-color)'
                }}>
                    Design. Visualize.<br />
                    <span style={{ color: 'var(--primary-color)' }}>
                        Crochet.
                    </span>
                </h2>

                <p style={{
                    fontSize: '1.3rem',
                    fontFamily: 'var(--font-body)',
                    color: '#666',
                    maxWidth: '600px',
                    marginBottom: '3rem',
                    lineHeight: 1.6,
                    fontWeight: 500
                }}>
                    The playful grid tool for granny square lovers.
                    Plan layouts, mix colors, and bring your whimsy to life.
                </p>

                <button
                    onClick={onStart}
                    style={{
                        padding: '18px 56px',
                        fontSize: '1.4rem',
                        fontFamily: 'var(--font-heading)',
                        background: 'var(--primary-color)',
                        border: 'none',
                        borderRadius: '50px',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 6px 0 #E05555, 0 15px 20px rgba(255, 107, 107, 0.3)',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    onMouseDown={e => {
                        e.currentTarget.style.transform = 'translateY(4px)';
                        e.currentTarget.style.boxShadow = '0 2px 0 #E05555';
                    }}
                    onMouseUp={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 0 #E05555, 0 15px 20px rgba(255, 107, 107, 0.3)';
                    }}
                >
                    Start Designing
                    <ArrowRight size={24} strokeWidth={3} />
                </button>

                {/* Feature Pills */}
                <div style={{
                    marginTop: '5rem',
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <FeaturePill icon={<Grid size={20} />} text="Infinite Grid" color="var(--accent-color)" />
                    <FeaturePill icon={<Wand2 size={20} />} text="AI Palettes" color="var(--highlight-color)" />
                    <FeaturePill icon={<Smartphone size={20} />} text="Mobile Ready" color="var(--primary-color)" />
                    <FeaturePill icon={<Share2 size={20} />} text="Export Plan" color="#A8A8A8" />
                </div>
            </main>

            <footer style={{ padding: '2rem', textAlign: 'center', color: '#888', fontFamily: 'var(--font-body)', fontSize: '0.9rem', zIndex: 10 }}>
                © 2025 Yarn Whimsy. Made with 🧶 & ❤️.
            </footer>

            <style>{`
                @keyframes float {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(30px, -50px) rotate(10deg); }
                    66% { transform: translate(-20px, 20px) rotate(-5deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
            `}</style>
        </div>
    );
};

const FeaturePill = ({ icon, text, color }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 24px',
        background: 'white',
        borderRadius: '50px',
        border: `2px solid ${color}`,
        fontSize: '1rem',
        fontWeight: 'bold',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-color)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    }}>
        <span style={{ color: color, display: 'flex' }}>{icon}</span>
        {text}
    </div>
);

export default LandingPage;
