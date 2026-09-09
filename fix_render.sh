#!/bin/bash
# Extract the drawing block from update
sed -n '1969,2228p' src/components/game/RunnerGame.tsx > /tmp/draw_block.txt

# Delete lines 1969 to 2228 from the file
sed -i '1969,2228d' src/components/game/RunnerGame.tsx

# The line numbers will have shifted!
# We need to find the new line number for "// ---- shuriken ----" in draw()
# Previously it was 2553. Since we deleted 260 lines (2228 - 1969 + 1 = 260),
# the new line number should be 2553 - 260 = 2293.
# Let's dynamically find the exact line in draw().
# We'll look for "// ---- shuriken ----" after "const draw = () => {"
DRAW_START=$(grep -n "^    const draw =" src/components/game/RunnerGame.tsx | cut -d: -f1)
SHURIKEN_LINE=$(tail -n +$DRAW_START src/components/game/RunnerGame.tsx | grep -n "^      // ---- shuriken ----" | head -n 1 | cut -d: -f1)
REAL_SHURIKEN_LINE=$((DRAW_START + SHURIKEN_LINE - 1))

# Insert the block before REAL_SHURIKEN_LINE
sed -i "${REAL_SHURIKEN_LINE}r /tmp/draw_block.txt" src/components/game/RunnerGame.tsx

echo "Done. Lines moved."
