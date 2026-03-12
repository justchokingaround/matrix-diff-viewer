# Feature Log Analysis

A static web application for feature log analysis to support the explainability of ML decision models using Process Mining techniques. We provide two options: analysis based on activity relationships (YAML) matrices and analysis based on directly-follow graphs (DFGs). The tool displays matrices side-by-side with color-coded highlighting and detailed hover tooltips to clearly indicate what has changed between versions. In addition, it supports the visualization of Directly-Follows Graphs (DFGs) using functionality from the [PM4JS-core repository](https://github.com/pm4js/pm4js-core), rendering the graphs side-by-side to facilitate direct comparison. The application also automatically computes distance measurements, enabling users to quickly quantify and analyze differences between the compared artifacts.

## Features

### Feature Log Analysis using Activity Relationships Matrices
- **Side-by-side comparison**: View both matrices simultaneously with aligned rows and columns
- **Color-coded changes**: Visual highlighting for different types of changes
  - **Yellow**: Temporal properties changed only
  - **Orange**: Existential properties changed only
  - **Green**: Both temporal and existential properties changed
  - **Dashed green border**: Added relationships
  - **Dashed red border**: Removed relationships
- **Detailed tooltips**: Hover over cells to see exact changes with before/after values
- **Easy file upload**: Simply upload two YAML files to compare
- **Distance measurement**: Computing matrix distance score

### Feature Log Analysis using Directly-Follows Graphs (DFGs)
- **Side-by-side comparison**: View both DFGs simultaneously
- **Overview of activities**: Immediately get an overview of the number of activities, paths, and start and end activities
- **Distance measurement**: Computing graph distance score

### General
- **GitHub Pages ready**: Can be hosted for free on GitHub Pages

## YAML Format

Fo feature log analysis based on activity relationships matrices, the application expects YAML files containing an array of relationships between nodes, where each relationship has temporal and existential properties:

```yaml
- from: 'Node A'
  to: 'Node B'
  temporal:
    type: eventual
    symbol: ≻t
    direction: backward
  existential:
    type: implication
    symbol: =>
    direction: forward

- from: 'Node A'
  to: 'Node C'
  existential:
    type: nand
    symbol: ⊼
    direction: both
```

### Properties

- `from`: Source node name
- `to`: Destination node name
- `temporal`: (optional) Temporal properties
  - `type`: Type of temporal relationship
  - `symbol`: Symbol representing the relationship
  - `direction`: Direction of the relationship (forward, backward, both)
- `existential`: (optional) Existential properties
  - `type`: Type of existential relationship
  - `symbol`: Symbol representing the relationship
  - `direction`: Direction of the relationship (forward, backward, both)

## How to Use

### Online (GitHub Pages)

1. Visit the hosted version at: `https://YOUR-USERNAME.github.io/matrix-diff-viewer/`
2. Click "Choose File" for Matrix 1 (Before) and select your first YAML file
3. Click "Choose File" for Matrix 2 (After) and select your second YAML file
4. Click "Compare Matrices"
5. View the side-by-side comparison with color-coded changes
6. Hover over any cell to see detailed change information

### Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/matrix-diff-viewer.git
   cd matrix-diff-viewer
   ```

2. Open `index.html` in your web browser:
   ```bash
   # On Linux/Mac
   open index.html

   # On Windows
   start index.html

   # Or use a local server (recommended)
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

3. Try the example files in the `examples/` directory to see how it works

## Example Files

The `examples/` directory contains sample YAML files demonstrating different types of changes:

- `matrix1.yaml`: Initial matrix state
- `matrix2.yaml`: Modified matrix with various changes

These files demonstrate:
- Temporal-only changes
- Existential-only changes
- Both properties changing
- Added relationships
- Removed relationships

## Project Structure

```
matrix-diff-viewer/
├── index.html              # Main HTML page
├── style.css              # Styling and color coding
├── app.js                 # Main application logic
├── yaml-parser.js         # YAML parsing and matrix construction
├── diff-engine.js         # Change detection and comparison
├── matrix-renderer.js     # Matrix rendering and visualization
├── examples/              # Example YAML files
│   ├── matrix1.yaml
│   └── matrix2.yaml
└── README.md             # This file
```

## Technology Stack

- **HTML5**: Structure and layout
- **CSS3**: Styling and animations
- **Vanilla JavaScript**: Application logic (no frameworks required)
- **js-yaml**: YAML parsing library (loaded from CDN)

## Deploying to GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/matrix-diff-viewer.git
   git push -u origin main
   ```

2. Enable GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select the `main` branch
   - Click "Save"
   - Your site will be available at `https://YOUR-USERNAME.github.io/matrix-diff-viewer/`

## Change Detection Logic

The application classifies changes as follows:

1. **Temporal Only**: The temporal properties (type, symbol, or direction) changed, but existential properties remained the same
2. **Existential Only**: The existential properties changed, but temporal properties remained the same
3. **Both Changed**: Both temporal and existential properties changed
4. **Added**: A relationship exists in matrix 2 but not in matrix 1
5. **Removed**: A relationship exists in matrix 1 but not in matrix 2
6. **No Change**: The relationship exists in both matrices with identical properties

## Browser Compatibility

- Chrome/Edge: ✓ Fully supported
- Firefox: ✓ Fully supported
- Safari: ✓ Fully supported
- Internet Explorer: ✗ Not supported (requires modern JavaScript features)

## License

MIT License - Feel free to use, modify, and distribute this tool.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
