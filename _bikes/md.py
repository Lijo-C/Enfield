import yaml
import os

# Path to your YAML file
yaml_file_path = "bikes.yml"
# Output directory for Jekyll (must be _bikes)
output_dir = "_bikes" 

os.makedirs(output_dir, exist_ok=True)

# --- No 'to_markdown' function is needed ---

print(f"Reading from {yaml_file_path}...")
with open(yaml_file_path, 'r') as f:
    bikes_list = yaml.safe_load(f)

if not bikes_list:
    print("Warning: bikes.yml is empty or not loaded correctly.")
    exit()

print(f"Found {len(bikes_list)} bikes. Generating files in {output_dir}/...")

# bikes_list is a list of dicts, create one md file per bike
for bike in bikes_list:
    
    # --- New Filename Logic ---
    # Use 'slug' for the filename, just like your example.
    # Fallback to 'name' if 'slug' doesn't exist.
    slug = bike.get('slug')
    if not slug:
        # Create a basic slug from the name if 'slug' is missing
        name = bike.get('name', 'unknown-bike')
        slug = name.lower().replace(' ', '-').replace('/', '-')
    
    filename = f"{slug}.md"
    filepath = os.path.join(output_dir, filename)
    
    # --- New File Writing Logic ---
    with open(filepath, 'w') as md_file:
        # 1. Write the starting '---'
        md_file.write("---\n")
        
        # 2. Dump the entire bike dictionary as YAML
        #    This is the key fix. We are not creating markdown,
        #    we are re-writing the YAML data.
        yaml.dump(bike, md_file, sort_keys=False, default_flow_style=False)
        
        # 3. Write the ending '---'
        md_file.write("---\n")
    
    print(f"Generated {filepath}")

print("Done.")