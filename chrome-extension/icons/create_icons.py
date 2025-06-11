#!/usr/bin/env python3
"""Create simple placeholder icons for Chrome extension"""

import os

# Minimal valid PNG data (1x1 green pixel)
minimal_png = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc`\xf8\x0f\x00\x00\x01\x00\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82'

sizes = [16, 48, 128]

for size in sizes:
    filename = f'icon{size}.png'
    with open(filename, 'wb') as f:
        f.write(minimal_png)
    print(f'Created {filename}')

print('All icons created successfully!') 