import os

base_dir = r'C:\Users\user\Desktop\E-Pos\Pos-system-Knowledge'

dirs_to_check = [
    r'00_START_HERE',
    r'03_USER_JOURNEYS',
    r'04_MODULE_KNOWLEDGE',
    r'13_DECISIONS_AND_CHANGES',
    r'15_IMPLEMENTATION_TRACKING'
]

replacements = {
    "QTY[Opening Stock > 0]": "QTY[Opening Quantity >= 0]",
    "- Opening Stock > 0 is required if Quantity tracking is selected.": "- Opening Quantity = 0 is valid.",
    "- **Performance:** Save < 100ms; resume < 200ms": "Reuse existing system NFRs",
    "(Quantity requires Opening Stock > 0 and full outlet allocation with total = opening quantity)": "(Quantity tracked Product configuration is COMPLETE)",
    "draft save < 100ms, publish < 500ms": "Reuse existing system NFRs",
    "Draft save < 100ms, outlet lookup < 200ms, resume < 200ms": "Reuse existing system NFRs",
    "Draft save < 100ms; publish < 500ms; resume < 200ms": "Reuse existing system NFRs",
    "opening stock > 0": "opening quantity >= 0"
}

modified_files = []

for d in dirs_to_check:
    target_dir = os.path.join(base_dir, d)
    for root, _, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.md'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    for old, new in replacements.items():
                        content = content.replace(old, new)
                        
                    if original_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        modified_files.append(path)
                except Exception as e:
                    pass

print("Modified files:")
for m in modified_files:
    print(m)
