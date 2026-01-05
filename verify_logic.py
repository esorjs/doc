import re
from pathlib import Path

file_path = Path("public/playground/index.html")
content = file_path.read_text()

# Check keydown listener
has_listener = "document.querySelector('.tabs').addEventListener('keydown'" in content
print(f"Has keydown listener: {has_listener}")

# Check switchExample update
has_aria_update = "t.setAttribute('aria-selected', 'false')" in content
print(f"Has aria-selected update: {has_aria_update}")
