from bing_image_downloader import downloader

# Path to your bikes.txt
bikes_txt_path = "/Users/LijoC/Documents/GitHub/Enfield/images/bikes.txt"

# Folder where images will be saved
output_dir = "/Users/LijoC/Documents/GitHub/Enfield/images"

# Read bike names from bikes.txt
with open(bikes_txt_path, "r") as file:
    bike_names = [line.strip() for line in file if line.strip()]

# Download images for each bike
for bike in bike_names:
    print(f"Downloading images for: {bike}")
    downloader.download(
        bike,
        limit=5,  # Number of images per bike
        output_dir=output_dir,
        adult_filter_off=True,
        force_replace=False,
        timeout=60
    )
