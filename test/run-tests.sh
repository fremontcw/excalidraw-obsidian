#!/bin/bash
# Test script for excalidraw-obsidian plugin
# Run from plugin root: ./test/run-tests.sh

set -e

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEST_DIR="$PLUGIN_ROOT/test/output"

echo "=== Excalidraw Plugin Test Suite ==="
echo "Plugin root: $PLUGIN_ROOT"
echo ""

# Setup
mkdir -p "$TEST_DIR"
cd "$PLUGIN_ROOT"

# Test 1: Check dependencies
echo "Test 1: Checking dependencies..."
if ! node -e "require('lz-string'); require('sharp');" 2>/dev/null; then
    echo "  FAIL: Missing npm dependencies. Run 'npm install' first."
    exit 1
fi
echo "  PASS: Dependencies installed"

# Test 2: Check Virgil font exists
echo "Test 2: Checking Virgil font..."
if [ ! -f "$PLUGIN_ROOT/scripts/Virgil.woff2" ]; then
    echo "  FAIL: Virgil.woff2 not found"
    exit 1
fi
echo "  PASS: Virgil font found"

# Test 3: Create a test diagram (raw JSON format)
echo "Test 3: Creating test diagram..."
cat > "$TEST_DIR/test-input.excalidraw.md" << 'EOF'
---
excalidraw-plugin: parsed
tags: [excalidraw, test]
---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠==

# Excalidraw Data
## Text Elements
Test ^test

## Drawing
```json
{"type":"excalidraw","version":2,"source":"obsidian","elements":[{"type":"rectangle","version":1,"id":"box1","x":50,"y":50,"width":100,"height":60,"strokeColor":"#1e3a5f","backgroundColor":"#f0fdfa","fillStyle":"solid","strokeWidth":2,"roughness":0,"roundness":{"type":3}},{"type":"text","version":1,"id":"label1","x":70,"y":70,"width":60,"height":20,"text":"Hello","fontSize":14,"fontFamily":1,"textAlign":"center","strokeColor":"#1e3a5f","backgroundColor":"transparent","fillStyle":"solid","strokeWidth":1,"roughness":0},{"type":"arrow","version":1,"id":"arrow1","x":150,"y":80,"width":50,"height":0,"strokeColor":"#0d9488","backgroundColor":"transparent","fillStyle":"solid","strokeWidth":2,"roughness":0,"points":[[0,0],[50,0]],"startArrowhead":null,"endArrowhead":"arrow"},{"type":"ellipse","version":1,"id":"circle1","x":220,"y":50,"width":60,"height":60,"strokeColor":"#0d9488","backgroundColor":"#f8fafc","fillStyle":"solid","strokeWidth":2,"roughness":0,"roundness":{"type":2}},{"type":"text","version":1,"id":"label2","x":230,"y":70,"width":40,"height":20,"text":"World","fontSize":14,"fontFamily":1,"textAlign":"center","strokeColor":"#0d9488","backgroundColor":"transparent","fillStyle":"solid","strokeWidth":1,"roughness":0}],"appState":{"viewBackgroundColor":"#ffffff","gridSize":null},"files":{}}
```
EOF
echo "  PASS: Test diagram created"

# Test 4: Convert to PNG
echo "Test 4: Converting to PNG..."
node "$PLUGIN_ROOT/scripts/excalidraw-to-png.js" "$TEST_DIR/test-input.excalidraw.md" "$TEST_DIR/test-output.png"
if [ ! -f "$TEST_DIR/test-output.png" ]; then
    echo "  FAIL: PNG not generated"
    exit 1
fi
echo "  PASS: PNG generated"

# Test 5: Verify PNG has content (not empty)
echo "Test 5: Verifying PNG..."
PNG_SIZE=$(wc -c < "$TEST_DIR/test-output.png")
if [ "$PNG_SIZE" -lt 1000 ]; then
    echo "  FAIL: PNG too small ($PNG_SIZE bytes)"
    exit 1
fi
echo "  PASS: PNG has content ($PNG_SIZE bytes)"

# Test 6: Test hook script (simulated)
echo "Test 6: Testing hook script..."
echo '{"file_path":"'"$TEST_DIR/test-input.excalidraw.md"'"}' | "$PLUGIN_ROOT/hooks/excalidraw-to-png.sh" > /dev/null
echo "  PASS: Hook executed without error"

# Summary
echo ""
echo "=== All tests passed! ==="
echo ""
echo "Output files:"
ls -la "$TEST_DIR"
echo ""
echo "To view the test PNG:"
echo "  open $TEST_DIR/test-output.png"
