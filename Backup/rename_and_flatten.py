import os
import shutil

root_dir = "/Users/LijoC/Documents/GitHub/Enfield/images"  # Your root folder path
valid_extensions = {".jpg", ".jpeg", ".png", ".webp"}

for subfolder in os.listdir(root_dir):
    folder_path = os.path.join(root_dir, subfolder)
    if os.path.isdir(folder_path):
        files = [f for f in os.listdir(folder_path) if os.path.splitext(f)[1].lower() in valid_extensions]
        for idx, filename in enumerate(files, start=1):
            ext = os.path.splitext(filename)[1].lower()
            new_name = f"{subfolder.replace(' ', '_')}_{idx}{ext}"
            src_path = os.path.join(folder_path, filename)
            dst_path = os.path.join(root_dir, new_name)
            shutil.move(src_path, dst_path)
        # Remove folder if empty
        if not os.listdir(folder_path):
            os.rmdir(folder_path)

print("All images renamed and moved to root folder successfully.")
