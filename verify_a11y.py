import re
from pathlib import Path

file_path = Path("public/playground/index.html")
content = file_path.read_text()

# Check for ARIA attributes
has_tablist = 'role="tablist"' in content
has_tab = 'role="tab"' in content
has_aria_selected = 'aria-selected' in content
has_tabpanel = 'role="tabpanel"' in content

print(f"Has role='tablist': {has_tablist}")
print(f"Has role='tab': {has_tab}")
print(f"Has aria-selected: {has_aria_selected}")
print(f"Has role='tabpanel': {has_tabpanel}")

# Check tab buttons
tabs = re.findall(r'<button class="tab.*?".*?>', content)
print(f"Found {len(tabs)} tabs.")
for tab in tabs:
    print(f"Tab: {tab}")
