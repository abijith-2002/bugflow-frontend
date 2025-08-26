import React from 'react';
import './ThemeDemo.css';

const ThemeDemo = () => {
  return (
    <div className="theme-demo">
      <div className="demo-header">
        <h1 className="demo-title">Nord Theme & Reddit Sans Font Demo</h1>
        <p className="demo-subtitle">Bug Tracking Application Design System</p>
      </div>

      <div className="demo-grid">
        {/* Color Palette Section */}
        <div className="demo-section">
          <h2>Color Palette</h2>
          
          <div className="color-group">
            <h3>Polar Night (Dark Base)</h3>
            <div className="color-row">
              <div className="color-swatch bg-nord0">
                <span className="color-label">Nord 0</span>
                <span className="color-hex">#2e3440</span>
              </div>
              <div className="color-swatch bg-nord1">
                <span className="color-label">Nord 1</span>
                <span className="color-hex">#3b4252</span>
              </div>
              <div className="color-swatch bg-nord2">
                <span className="color-label">Nord 2</span>
                <span className="color-hex">#434c5e</span>
              </div>
              <div className="color-swatch bg-nord3">
                <span className="color-label">Nord 3</span>
                <span className="color-hex">#4c566a</span>
              </div>
            </div>
          </div>

          <div className="color-group">
            <h3>Snow Storm (Light)</h3>
            <div className="color-row">
              <div className="color-swatch bg-nord4 text-dark">
                <span className="color-label">Nord 4</span>
                <span className="color-hex">#d8dee9</span>
              </div>
              <div className="color-swatch bg-nord5 text-dark">
                <span className="color-label">Nord 5</span>
                <span className="color-hex">#e5e9f0</span>
              </div>
              <div className="color-swatch bg-nord6 text-dark">
                <span className="color-label">Nord 6</span>
                <span className="color-hex">#eceff4</span>
              </div>
            </div>
          </div>

          <div className="color-group">
            <h3>Frost (Blue Accents)</h3>
            <div className="color-row">
              <div className="color-swatch bg-nord7">
                <span className="color-label">Nord 7</span>
                <span className="color-hex">#8fbcbb</span>
              </div>
              <div className="color-swatch bg-nord8">
                <span className="color-label">Nord 8</span>
                <span className="color-hex">#88c0d0</span>
              </div>
              <div className="color-swatch bg-nord9">
                <span className="color-label">Nord 9</span>
                <span className="color-hex">#81a1c1</span>
              </div>
              <div className="color-swatch bg-nord10">
                <span className="color-label">Nord 10</span>
                <span className="color-hex">#5e81ac</span>
              </div>
            </div>
          </div>

          <div className="color-group">
            <h3>Aurora (Colorful Accents)</h3>
            <div className="color-row">
              <div className="color-swatch bg-nord11">
                <span className="color-label">Nord 11</span>
                <span className="color-hex">#bf616a</span>
              </div>
              <div className="color-swatch bg-nord12">
                <span className="color-label">Nord 12</span>
                <span className="color-hex">#d08770</span>
              </div>
              <div className="color-swatch bg-nord13 text-dark">
                <span className="color-label">Nord 13</span>
                <span className="color-hex">#ebcb8b</span>
              </div>
              <div className="color-swatch bg-nord14">
                <span className="color-label">Nord 14</span>
                <span className="color-hex">#a3be8c</span>
              </div>
              <div className="color-swatch bg-nord15">
                <span className="color-label">Nord 15</span>
                <span className="color-hex">#b48ead</span>
              </div>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="demo-section">
          <h2>Typography (Reddit Sans)</h2>
          <div className="typography-samples">
            <div className="text-4xl font-bold">Heading 1 - Bold</div>
            <div className="text-3xl font-semibold">Heading 2 - Semibold</div>
            <div className="text-2xl font-medium">Heading 3 - Medium</div>
            <div className="text-xl font-normal">Heading 4 - Normal</div>
            <div className="text-lg">Large Text</div>
            <div className="text-base">Body Text - Base Size</div>
            <div className="text-sm">Small Text</div>
            <div className="text-xs">Extra Small Text</div>
          </div>
        </div>

        {/* Form Elements Section */}
        <div className="demo-section">
          <h2>Form Elements</h2>
          <div className="form-demo">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Enter your password"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Bug Description</label>
              <textarea 
                className="form-input" 
                rows="3"
                placeholder="Describe the bug..."
              ></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="demo-section">
          <h2>Buttons</h2>
          <div className="button-demo">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
            <button className="btn btn-primary" style={{backgroundColor: 'var(--color-success)'}}>Success</button>
            <button className="btn btn-primary" style={{backgroundColor: 'var(--color-warning)'}}>Warning</button>
            <button className="btn btn-primary" style={{backgroundColor: 'var(--color-error)'}}>Error</button>
          </div>
        </div>

        {/* Cards Section */}
        <div className="demo-section">
          <h2>Cards & Components</h2>
          <div className="card">
            <h3>Bug Report Card</h3>
            <p>This is an example of a card component using the Nord theme. It demonstrates the background, border, and text colors.</p>
            <div className="card-actions">
              <button className="btn btn-primary">View Details</button>
              <button className="btn btn-secondary">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
