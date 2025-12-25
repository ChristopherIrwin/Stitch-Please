import React, { useState } from 'react';
import DesignCanvas from './components/DesignCanvas';
import Toolbar from './components/Toolbar';
import PaletteManager from './components/PaletteManager';
import AIColorAgent from './components/AIColorAgent';
import { SHAPE_TYPES } from './engine/shapes';

import LandingPage from './components/LandingPage';

function App() {
  const [view, setView] = useState('landing');

  const [gridConfig, setGridConfig] = useState({
    type: SHAPE_TYPES.HEXAGON,
    cellSize: 45,
    gridRows: 15,
    gridCols: 15
  });
  // ... (rest of state vars)
  const [activeShape, setActiveShape] = useState(SHAPE_TYPES.HEXAGON);
  const [activeColor, setActiveColor] = useState('#ffcc00');

  // Store shapes separately for each layout type
  const [layoutShapes, setLayoutShapes] = useState({
    [SHAPE_TYPES.SQUARE]: {},
    [SHAPE_TYPES.HEXAGON]: {},
    [SHAPE_TYPES.TRIANGLE]: {},
    [SHAPE_TYPES.OCTAGON]: {}
  });

  const [showAgent, setShowAgent] = useState(false);
  const [customPalettes, setCustomPalettes] = useState([]);

  const handleSavePalette = (palette) => {
    setCustomPalettes(prev => [...prev, { ...palette, id: Date.now().toString() }]);
  };

  // Derived state for current layout
  const currentShapes = layoutShapes[activeShape] || {};

  const handleShapeSelect = (type) => {
    setActiveShape(type);
    setGridConfig(prev => ({ ...prev, type: type }));
  };

  const handleShapePlace = (q, r, subType = null) => {
    const key = subType ? `${q},${r}:${subType}` : `${q},${r}`;

    setLayoutShapes(prev => {
      const currentLayoutState = { ...prev[activeShape] };

      // Toggle logic: if same color, remove. Else add/update.
      if (currentLayoutState[key] && currentLayoutState[key].color === activeColor) {
        delete currentLayoutState[key];
      } else {
        currentLayoutState[key] = { type: activeShape, color: activeColor };
      }

      return {
        ...prev,
        [activeShape]: currentLayoutState
      };
    });
  };

  const handleClearGrid = () => {
    // Direct clear without confirmation for now to fix user issue
    setLayoutShapes(prev => ({
      ...prev,
      [activeShape]: {}
    }));
  };

  const handleSaveProject = () => {
    const projectData = {
      version: 1,
      timestamp: Date.now(),
      gridConfig,
      activeShape,
      layoutShapes,
      customPalettes
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `granny_square_project_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target.result);

        // Basic validation
        if (projectData.gridConfig && projectData.layoutShapes) {
          setGridConfig(projectData.gridConfig);
          setLayoutShapes(projectData.layoutShapes);
          if (projectData.customPalettes) setCustomPalettes(projectData.customPalettes);
          if (projectData.activeShape) setActiveShape(projectData.activeShape);
          // Ensure grid type matches restored active shape/config
          if (projectData.gridConfig.type) {
            // It's already set via setGridConfig but this is redundant safety
          }
        } else {
          alert('Invalid project file structure');
        }
      } catch (err) {
        console.error('Failed to parse project file', err);
        alert('Error loading project file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('app')} />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <Toolbar
        activeShape={activeShape}
        onShapeSelect={handleShapeSelect}
        gridConfig={gridConfig}
        setGridConfig={setGridConfig}
        onClear={handleClearGrid}
        onSave={handleSaveProject}
        onLoad={handleLoadProject}
        onHome={() => setView('landing')}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <DesignCanvas
          gridConfig={gridConfig}
          activeShape={activeShape}
          placedShapes={currentShapes}
          onShapePlace={handleShapePlace}
        />
        {showAgent && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 900 }}>
            <AIColorAgent
              onColorSelect={(color) => { setActiveColor(color); setShowAgent(false); }}
              onSavePalette={handleSavePalette}
              onClose={() => setShowAgent(false)}
            />
          </div>
        )}
      </div>
      <PaletteManager
        activeColor={activeColor}
        customPalettes={customPalettes}
        onColorSelect={setActiveColor}
        onOpenAgent={() => setShowAgent(true)}
      />
    </div>
  );
}

export default App;
