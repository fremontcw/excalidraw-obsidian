# Excalidraw for Obsidian - Claude Code Plugin

Create professional Excalidraw diagrams directly from Claude Code, with automatic PNG preview generation for iterative refinement.

## Features

- **`/excalidraw` skill** - Generate flow diagrams, architecture charts, and visual documentation
- **Professional styling** - Clean lines, cohesive color palette (navy/teal), consistent spacing
- **Auto PNG preview** - PostToolUse hook generates PNG whenever you write `.excalidraw.md` files
- **Iterative refinement** - Read the PNG to verify rendering, fix issues, repeat

## Installation

### Option 1: Copy to plugins directory

```bash
# Copy plugin to your plugins directory
cp -r excalidraw-obsidian ~/.claude/plugins/

# Install dependencies
cd ~/.claude/plugins/excalidraw-obsidian
npm install
```

### Option 2: Enable from Claude Code

```bash
# If installed in the official plugins location
claude plugins enable excalidraw-obsidian
```

## Usage

### Basic Usage

Just ask Claude to create a diagram:

```
/excalidraw Create a flow diagram showing: Input → Process → Output
```

Or use the intake menu:

```
/excalidraw
```

### Diagram Types

1. **Flow Diagram** - Process flows, user journeys, data pipelines
2. **Architecture Diagram** - System components, layers, integrations
3. **Sequence Diagram** - Step-by-step interactions between entities
4. **Concept Map** - Ideas and relationships, brainstorming visualization
5. **Component Diagram** - UI components, module structure

### Iterative Refinement

1. Claude writes the `.excalidraw.md` file
2. PostToolUse hook automatically generates a PNG preview
3. Claude reads the PNG to verify rendering
4. If issues found, Claude edits and regenerates
5. Repeat until diagram looks correct

## File Structure

```
excalidraw-obsidian/
├── plugin.json          # Plugin manifest
├── package.json         # Node.js dependencies
├── README.md            # This file
├── skills/
│   └── excalidraw.md    # The /excalidraw skill
├── hooks/
│   └── excalidraw-to-png.sh  # PostToolUse hook
└── scripts/
    └── excalidraw-to-png.js  # PNG converter
```

## Dependencies

- **lz-string** - Decompress Obsidian's compressed Excalidraw format
- **sharp** - SVG to PNG conversion

## Manual PNG Generation

```bash
node scripts/excalidraw-to-png.js <file.excalidraw.md> [output.png]
```

Options:
- `--save-svg` - Also save intermediate SVG
- `--padding=N` - Padding around content (default: 40)
- `--bg=COLOR` - Background color (default: #ffffff)

## Output Format

Creates `.excalidraw.md` files compatible with the [Obsidian Excalidraw plugin](https://github.com/zsviczian/obsidian-excalidraw-plugin).

To view in Obsidian:
1. Open the `.excalidraw.md` file
2. Click "More Options" (⋮)
3. Select "Switch to Excalidraw View"

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Navy) | `#1e3a5f` | Titles, main borders |
| Accent (Teal) | `#0d9488` | Key sections, highlights |
| Neutral Dark | `#64748b` | Secondary elements |
| Neutral Light | `#94a3b8` | Tertiary elements |
| Background Light | `#f8fafc` | Element backgrounds |
| Background Accent | `#f0fdfa` | Highlighted sections |

## License

MIT
