import yaml
import os

# Path to your YAML file
yaml_file_path = "bikes.yml"
# Output directory for Markdown files
output_dir = "md_files"

os.makedirs(output_dir, exist_ok=True)

def to_markdown(bike_data):
    md_lines = []
    for key, value in bike_data.items():
        if isinstance(value, dict):
            md_lines.append(f"## {key}")
            for subkey, subval in value.items():
                md_lines.append(f"- **{subkey}:** {subval}")
        elif isinstance(value, list):
            md_lines.append(f"## {key}")
            for item in value:
                md_lines.append(f"- {item}")
        else:
            md_lines.append(f"- **{key}:** {value}")
    return "\n".join(md_lines)

with open(yaml_file_path, 'r') as f:
    bikes_list = yaml.safe_load(f)

# bikes_list is a list of dicts, create one md file per bike
for bike in bikes_list:
    # Use 'model' or 'name' field for filename, fallback to index
    filename_key = bike.get('model') or bike.get('name') or 'bike'
    filename = f"{filename_key.replace(' ', '_').replace('/', '_')}.md"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w') as md_file:
        # Title for the bike
        title = filename_key if filename_key else 'Bike Details'
        md_file.write(f"# {title}\n\n")
        md_file.write(to_markdown(bike))
    print(f"Generated {filepath}")
