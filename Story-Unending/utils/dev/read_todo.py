import os

# Try to read todo.md
if os.path.exists('todo.md'):
    with open('todo.md', 'r') as f:
        content = f.read()
        print("TODO.md content:")
        print(content)
else:
    print("todo.md not found")

# List all files
files = os.listdir('.')
print("\nAll files:")
for f in files:
    print(f"  {f}")