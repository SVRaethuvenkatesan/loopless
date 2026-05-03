import re

with open(r'e:\loopless\loopless\src\app\(app)\onboarding\page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

replacements = [
    ('#1a1208', 'var(--text1)'),
    ('#6b5c3e', 'var(--text2)'),
    ('#a8936a', 'var(--text3)'),
    ('background:white', 'background:var(--bg1)'),
    ('background:"white"', 'background:"var(--bg1)"'),
    ('background: white', 'background: var(--bg1)'),
    ('"white"', '"var(--bg1)"'),
    ('#fef9f0', 'var(--bg0)'),
    ('#fde8c8', 'var(--bg4)'),
    ('#e0d8c8', 'var(--bg3)'),
    ('rgba(26,18,8,.12)', 'var(--border3)'),
    ('rgba(26,18,8,.15)', 'var(--border3)'),
    ('rgba(26,18,8,.1)', 'var(--border2)'),
    ('rgba(26,18,8,.07)', 'var(--border)'),
]

for old, new in replacements:
    text = text.replace(old, new)

with open(r'e:\loopless\loopless\src\app\(app)\onboarding\page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done!')
