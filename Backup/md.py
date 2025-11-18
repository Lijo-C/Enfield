import yaml
import os

# Path to your YAML file
yaml_file_path = "bikes.yml"
# Output directory for Jekyll (must be _bikes)
output_dir = "_bikes" 

os.makedirs(output_dir, exist_ok=True)

print(f"Reading from {yaml_file_path}...")
with open(yaml_file_path, 'r') as f:
    bikes_list = yaml.safe_load(f)

if not bikes_list:
    print("Warning: bikes.yml is empty or not loaded correctly.")
    exit()

print(f"Found {len(bikes_list)} bikes. Generating files in {output_dir}/...")

for bike in bikes_list:
    
    # --- 1. Get and Clean the Year ---
    # Get the year string, e.g., "2023-Present" or "2021"
    year_string = str(bike.get('year', '')) 
    # Get just the first part (e.g., "2023") and remove spaces
    year_prefix = year_string.split('-')[0].strip() 
    
    # Add a fallback for missing or invalid years to ensure sorting
    if not (year_prefix.isdigit() and len(year_prefix) == 4):
        year_prefix = "0000" # This will sort to the top
        
    # --- 2. Get the Slug (same as before) ---
    slug = bike.get('slug')
    if not slug:
        name = bike.get('name', 'unknown-bike')
        slug = name.lower().replace(' ', '-').replace('/', '-')
    
    # --- 3. Create the New Filename ---
    filename = f"{year_prefix}-{slug}.md" # e.g., "2023-super-meteor-650.md"
    filepath = os.path.join(output_dir, filename)
    
    # --- 4. Write the file (same as before) ---
    with open(filepath, 'w') as md_file:
        md_file.write("---\n")
        yaml.dump(bike, md_file, sort_keys=False, default_flow_style=False)
        md_file.write("---\n")
    
    print(f"Generated {filepath}")

print("Done.")