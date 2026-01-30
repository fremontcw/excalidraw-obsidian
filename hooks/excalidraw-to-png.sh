#!/bin/bash
# PostToolUse hook: Convert Excalidraw files to PNG for visual review
#
# This hook runs after Write tool is used on .excalidraw.md files.
# It generates a PNG preview that Claude can read to iteratively improve diagrams.

# Read the tool input from stdin
INPUT=$(cat)

# Extract the file path from the tool input
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Check if this is an .excalidraw.md file
if [[ "$FILE_PATH" == *.excalidraw.md ]]; then
    # Generate PNG path
    PNG_PATH="${FILE_PATH%.excalidraw.md}.png"

    # Get the plugin root directory (where this hook lives)
    PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

    # Run the export script
    cd "$PLUGIN_ROOT/scripts"
    node excalidraw-to-png.js "$FILE_PATH" "$PNG_PATH" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "PNG preview generated: $PNG_PATH"
        echo "Review the PNG to verify the diagram renders correctly before proceeding."
    fi
fi

# Always exit 0 to not block the tool
exit 0
