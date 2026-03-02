#!/usr/bin/env python3

# Read the original file
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line numbers for the sections to replace
start_speed = None
end_speed = None
start_control = None
end_control = None

for i, line in enumerate(lines):
    if 'Chapter Generation Speed' in line:
        start_speed = i - 1  # Include the opening director-section div
    if start_speed is not None and end_speed is None and 'Story Directive' in line:
        end_speed = i - 2  # Exclude the pause button and speed display
    if 'Story Control' in line:
        start_control = i - 1  # Include the opening director-section div
    if start_control is not None and end_control is None and 'FLOATING' in line:
        end_control = i - 2  # Exclude the closing divs

print(f"Speed section: lines {start_speed} to {end_speed}")
print(f"Control section: lines {start_control} to {end_control}")

# Read the merged section
with open('merged_section.txt', 'r', encoding='utf-8') as f:
    merged_content = f.read()

# Create new content
new_lines = []
new_lines.extend(lines[:start_speed])
new_lines.append(merged_content + '\n')
new_lines.extend(lines[end_speed+1:start_control])
new_lines.extend(lines[end_control+1:])

# Write the new file
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("File updated successfully!")