---
name: excalidraw
description: Create professional Excalidraw diagrams for Obsidian. Generate flow diagrams, architecture charts, and visual documentation with a cohesive, clean style. Outputs .excalidraw.md files viewable in Obsidian's Excalidraw plugin.
---

<essential_principles>
## How Excalidraw for Obsidian Works

### 1. File Format Requirements

Excalidraw files for Obsidian MUST use the `.excalidraw.md` extension and follow this exact structure:

```markdown
---
excalidraw-plugin: parsed
tags: [excalidraw]
---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠==

# Excalidraw Data
## Text Elements
[Text content with ^uniqueIDs]

## Drawing
```json
{"type":"excalidraw","version":2,"source":"obsidian","elements":[...],"appState":{...},"files":{}}
```
```

The JSON block contains all visual elements. Text Elements section provides searchable text for Obsidian.

### 2. Professional Color Palette (Limited, Cohesive)

Use these colors consistently:
- **Primary (Navy)**: `#1e3a5f` - Titles, main borders, key actions
- **Accent (Teal)**: `#0d9488` - Key sections, highlights, processing steps
- **Neutral Dark (Slate)**: `#64748b` - Secondary elements, labels
- **Neutral Light (Slate)**: `#94a3b8` - Tertiary elements, notes
- **Background Light**: `#f8fafc` - Default element backgrounds
- **Background Accent**: `#f0fdfa` - Highlighted section backgrounds
- **Background Neutral**: `#e2e8f0` - Container backgrounds

**Never use**: Bright reds, oranges, yellows, or saturated colors unless representing errors/warnings.

### 3. Balanced Style: Hand-drawn Text + Clean Shapes

The default style uses **Virgil font** (Excalidraw's signature hand-drawn typeface) with clean, precise shapes. This creates a warm, approachable look that's still professional.

All elements should use these properties:

```json
{
  "roughness": 0,        // Clean lines (shapes stay precise)
  "strokeWidth": 1,      // Thin borders (use 2 for emphasis)
  "roundness": {"type": 3},  // Rounded corners on rectangles
  "fontFamily": 1,       // Virgil (hand-drawn) - rendered automatically
  "fontSize": 12         // Standard text (11-14 range)
}
```

The PNG converter automatically embeds the Virgil font, so text renders with that distinctive Excalidraw feel while shapes remain crisp and technical.

### 4. Layout Principles

- **Clear hierarchy**: Title at top, flow top-to-bottom or left-to-right
- **Consistent spacing**: Align elements on a mental grid (40-60px gaps)
- **Labeled sections**: Use UPPERCASE for section labels, 11-14px
- **Arrows with flow**: Show direction clearly, use strokeWidth 2 for main flow
- **Dashed borders**: Use `"strokeStyle": "dashed"` for optional/infrastructure elements
- **Group related items**: Contain related elements in larger rectangles

### 5. Text Style

- **Section labels**: UPPERCASE, 11-14px, strokeColor (not fill)
- **Content text**: Sentence case, 11-12px
- **Important labels**: 14px, navy or teal color
- **Notes/annotations**: 10-11px, slate colors, often in dashed boxes

### 6. Common Element Types

**Rectangles** (boxes, containers):
```json
{"type":"rectangle","x":100,"y":100,"width":120,"height":60,
 "strokeColor":"#1e3a5f","backgroundColor":"#f8fafc",
 "fillStyle":"solid","strokeWidth":1,"roughness":0,
 "roundness":{"type":3}}
```

**Ellipses** (actors, start/end points):
```json
{"type":"ellipse","x":100,"y":100,"width":80,"height":60,
 "strokeColor":"#1e3a5f","backgroundColor":"#f8fafc",
 "fillStyle":"solid","strokeWidth":2,"roughness":0,
 "roundness":{"type":2}}
```

**Arrows** (connections, flow):
```json
{"type":"arrow","x":200,"y":130,"width":50,"height":0,
 "strokeColor":"#0d9488","strokeWidth":2,"roughness":0,
 "points":[[0,0],[50,0]],
 "startArrowhead":null,"endArrowhead":"arrow"}
```

**Text** (labels):
```json
{"type":"text","x":110,"y":120,"width":100,"height":20,
 "strokeColor":"#1e3a5f","text":"Label Text",
 "fontSize":12,"fontFamily":1,"textAlign":"center"}
```
</essential_principles>

<intake>
**Excalidraw Diagram Generator**

What would you like to create?

1. **Flow Diagram** - Process flows, user journeys, data pipelines
2. **Architecture Diagram** - System components, layers, integrations
3. **Sequence Diagram** - Step-by-step interactions between entities
4. **Concept Map** - Ideas and relationships, brainstorming visualization
5. **Component Diagram** - UI components, module structure
6. **Something else** - Describe your diagram need

**Provide:**
- Source material (CLAUDE.md, code, description, etc.)
- Desired filename (will be saved as `<name>.excalidraw.md`)
- Target directory (defaults to current project)
</intake>

<workflow>
## Diagram Generation Process

### Step 1: Analyze Source
- Read the source material (file, description, code)
- Identify key entities, relationships, and flow
- Determine diagram type and orientation (horizontal/vertical)

### Step 2: Plan Layout
- List all elements needed
- Determine groupings and containers
- Plan arrow connections and flow direction
- Estimate canvas size (typically 700x500 for simple, 900x700 for complex)

### Step 3: Generate Elements
For each element, create JSON with:
- Unique `id` (descriptive, like "user-box" or "arrow-to-api")
- Correct coordinates (`x`, `y`) for proper spacing
- Appropriate colors from the palette
- Consistent properties (roughness: 0, proper roundness)

### Step 4: Create Text Elements Section
- Extract all text content
- Assign unique IDs with `^` prefix (e.g., `^title`, `^step1`)
- This enables Obsidian search

### Step 5: Assemble File
- Use exact file format template
- Combine all elements in the JSON array
- Set appState with white background: `"viewBackgroundColor":"#ffffff"`

### Step 6: Write File
- Save as `<name>.excalidraw.md`
- PostToolUse hook automatically generates PNG preview

### Step 7: Visual Verification
- **Read the generated PNG** to verify rendering
- Check for: text overlap, missing arrows, alignment issues
- If issues found → edit file and repeat

### Step 8: Report to User
- Confirm file location
- Show PNG preview path
- Note any issues found and fixed
</workflow>

<verification>
## After Creating Diagram

1. **File format check**: Confirm `.excalidraw.md` extension
2. **Structure check**: Verify frontmatter, warning banner, Text Elements, Drawing sections all present
3. **JSON validity**: Ensure JSON block is valid
4. **PNG Preview**: A PostToolUse hook automatically generates a PNG when you write `.excalidraw.md` files
5. **Visual Review**: Read the generated PNG to verify the diagram renders correctly
6. **Report to user**:
   - "Created: `<filepath>`"
   - "PNG preview: `<filepath>.png`"
   - "Elements: {N} shapes, {M} arrows, {P} text labels"
   - "View in Obsidian: Open file → More Options (⋮) → Switch to Excalidraw View"
</verification>

<iterative_improvement>
## Iterative Diagram Refinement

When the PostToolUse hook generates a PNG, **immediately read it** to check for issues:

```
Read the PNG at: <filepath>.png
```

### Common Issues to Check

1. **Text overlap** - Elements too close together, increase spacing
2. **Missing arrows** - Arrow points array malformed or missing
3. **Cutoff content** - Canvas too small, expand bounds
4. **Color contrast** - Text hard to read, adjust strokeColor
5. **Alignment issues** - Elements not on grid, adjust coordinates

### Improvement Loop

1. Write `.excalidraw.md` file
2. Hook generates PNG automatically
3. Read PNG to inspect rendering
4. Identify issues from visual inspection
5. Edit the file to fix issues
6. Repeat until diagram looks correct

### Manual PNG Generation

If needed, generate PNG manually:
```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/excalidraw-to-png.js <file.excalidraw.md> [output.png]
```

Options:
- `--save-svg` - Also save intermediate SVG
- `--padding=N` - Padding around content (default: 40)
</iterative_improvement>

<text_elements_warning>
## Text Elements Section - IMPORTANT

The Text Elements section (with `^id` markers) is for **Obsidian search indexing only**.

**DO NOT** duplicate visual text as Text Elements entries - this causes:
- Duplicate text appearing in renders
- `^id` markers showing up in diagrams
- Cluttered, unreadable output

**Correct approach:**
- Text in the JSON `elements` array = visual text (no ^id)
- Text Elements section = search index only (with ^id)

The PNG export script automatically filters out Text Elements entries.
</text_elements_warning>

<templates>
## Quick Reference Templates

### Basic Flow (3 steps)
```
[Start] → [Process] → [End]
```
Canvas: 500x200, elements spaced 150px apart

### Vertical Pipeline
```
[Input]
   ↓
[Transform]
   ↓
[Output]
```
Canvas: 300x400, elements spaced 100px vertically

### Architecture with Layers
```
┌─────────────────────────────┐
│         FRONTEND            │
├─────────────────────────────┤
│          API                │
├─────────────────────────────┤
│        DATABASE             │
└─────────────────────────────┘
```
Canvas: 400x350, layers 80px height each
</templates>
