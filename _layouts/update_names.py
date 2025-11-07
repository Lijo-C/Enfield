import yaml
import os

# --- Configuration ---
# This script will read from INPUT_FILE and create OUTPUT_FILE
# Make sure this script is in the SAME folder as bikes.yml
INPUT_FILE = 'bikes.yml'      
OUTPUT_FILE = 'bikes_updated.yml' 

print(f"Script started. Input: '{INPUT_FILE}', Output: '{OUTPUT_FILE}'")
# --- Part 2: The List of New Image Names ---

# This is the full list of new image names you provided.
# The script will use this list to update the YAML file in order.
NEW_IMAGE_NAMES = [
    "Royal Enfield-1898-269-quadricycle_1.jpg",
    "Royal Enfield-1901-150-first-motorcycle-1901_1.jpg",
    "Royal Enfield-1910-297-model-150-motosacoche_1.jpg",
    "Royal Enfield-1911-344-model-160-motosacoche_1.jpg",
    "Royal Enfield-1913-425-model-140-v-twin_1.jpg",
    "Royal Enfield-1913-770-model-180-v-twin_1.jpg",
    "Royal Enfield-1914-770-model-180-wwi_1.jpg",
    "Royal Enfield-1915-976-8hp-v-twin-wwi_1.jpg",
    "Royal Enfield-1920-976-model-100-v-twin_1.jpg",
    "Royal Enfield-1920-976-model-110-v-twin_1.jpg",
    "Royal Enfield-1920-225-model-200-2-stroke_1.jpg",
    "Royal Enfield-1922-225-model-201-2-stroke_1.jpg",
    "Royal Enfield-1923-225-model-201-ladies_1.jpg",
    "Royal Enfield-1923-346-model-350-sv-1923_1.jpg",
    "Royal Enfield-1924-976-model-182-v-twin-1924_1.jpg",
    "Royal Enfield-1924-225-ladies-model-225_1.jpg",
    "Royal Enfield-1924-346-model-350-sv-1924_1.jpg",
    "Royal Enfield-1924-346-model-352-ohv-1924_1.jpg",
    "Royal Enfield-1924-346-sports-model-351_1.jpg",
    "Royal Enfield-1924-346-sports-model-351-ohv_1.jpg",
    "Royal Enfield-1925-896-model-190-v-twin_1.jpg",
    "Royal Enfield-1925-346-model-350-sv-1925_1.jpg",
    "Royal Enfield-1926-225-model-201-1926-2s_1.jpg",
    "Royal Enfield-1926-346-model-350-sv-1926_1.jpg",
    "Royal Enfield-1926-346-model-351-ohv-1926_1.jpg",
    "Royal Enfield-1926-488-model-500-sv-1926_1.jpg",
    "Royal Enfield-1926-488-model-501-1926-ohv_1.jpg",
    "Royal Enfield-1927-488-model-500-sv-1927_1.jpg",
    "Royal Enfield-1927-346-model-351-ohv-1927_1.jpg",
    "Royal Enfield-1927-488-model-505_1.jpg",
    "Royal Enfield-1928-346-model-354-ohv_1.jpg",
    "Royal Enfield-1928-488-model-504-ohv_1.jpg",
    "Royal Enfield-1928-488-model-488-ohv-1928-4v_1.jpg",
    "Royal Enfield-1928-346-model-346-ohv-1928-4v_1.jpg",
    "Royal Enfield-1928-225-model-201-1928-2s_1.jpg",
    "Royal Enfield-1928-346-model-353-1928-ohv_1.jpg",
    "Royal Enfield-1928-488-model-488-ohv-1928_1.jpg",
    "Royal Enfield-1928-488-model-502-1928-sv_1.jpg",
    "Royal Enfield-1928-488-model-505-sv-1928_1.jpg",
    "Royal Enfield-1929-488-model-501-1929-ohv_1.jpg",
    "Royal Enfield-1929-346-model-352-1929-sv_1.jpg",
    "Royal Enfield-1929-225-model-201a-1929-2s_1.jpg",
    "Royal Enfield-1930-225-model-a-225-1930_1.jpg",
    "Royal Enfield-1930-225-model-b-225-sv_1.jpg",
    "Royal Enfield-1930-346-model-350-sv-1930_1.jpg",
    "Royal Enfield-1930-346-model-f-346-sv_1.jpg",
    "Royal Enfield-1930-346-model-350-ohv-1930_1.jpg",
    "Royal Enfield-1930-346-model-g-346-ohv_1.jpg",
    "Royal Enfield-1930-976-model-k-v-twin_1.jpg",
    "Royal Enfield-1930-976-model-k-976-v-twin-1930_1.jpg",
    "Royal Enfield-1930-488-model-l-500-sv_1.jpg",
    "Royal Enfield-1930-488-model-d-488-sv_1.jpg",
    "Royal Enfield-1930-488-model-500-sv-1930_1.jpg",
    "Royal Enfield-1930-488-model-e-488-ohv_1.jpg",
    "Royal Enfield-1930-488-model-j-488-ohv_1.jpg",
    "Royal Enfield-1930-488-model-ha-488-sv_1.jpg",
    "Royal Enfield-1930-488-model-t-500-ohv_1.jpg",
    "Royal Enfield-1930-488-model-ja-488-ohv_1.jpg",
    "Royal Enfield-1930-976-model-m-976-sv_1.jpg",
    "Royal Enfield-1931-248-model-b-250-sv-1931_1.jpg",
    "Royal Enfield-1931-346-model-g-31-ohv-sloper_1.jpg",
    "Royal Enfield-1931-488-model-h-500-sv-1931_1.jpg",
    "Royal Enfield-1931-488-model-j-31-ohv-sloper_1.jpg",
    "Royal Enfield-1931-488-model-ja-500-ohv_1.jpg",
    "Royal Enfield-1932-350-first-bullet-1932_1.jpg",
    "Royal Enfield-1932-248-bullet-250-1932_1.jpg",
    "Royal Enfield-1932-248-bullet-250-4v_1.jpg",
    "Royal Enfield-1932-346-bullet-350-4v_1.jpg",
    "Royal Enfield-1932-488-bullet-500-1932_1.jpg",
    "Royal Enfield-1932-488-bullet-500-4v_1.jpg",
    "Royal Enfield-1932-148-model-z-cycar_1.jpg",
    "Royal Enfield-1933-248-model-b-250-sv_1.jpg",
    "Royal Enfield-1933-499-model-i-499-sv_1.jpg",
    "Royal Enfield-1933-225-model-sk-225_1.jpg",
    "Royal Enfield-1933-148-model-z-148-2s-cycar_1.jpg",
    "Royal Enfield-1934-346-bullet-350-1934-2v_1.jpg",
    "Royal Enfield-1934-488-bullet-500-1934-2v_1.jpg",
    "Royal Enfield-1934-346-model-e-350-ohv_1.jpg",
    "Royal Enfield-1934-346-model-lf-350-ohv_1.jpg",
    "Royal Enfield-1934-346-model-lo-350-3v_1.jpg",
    "Royal Enfield-1934-248-model-s-250-ohv_1.jpg",
    "Royal Enfield-1934-148-model-t-148-ohv_1.jpg",
    "Royal Enfield-1935-150-model-150-single-1935_1.jpg",
    "Royal Enfield-1935-148-model-t-148-ohv-1935_1.jpg",
    "Royal Enfield-1935-225-model-225-single-1935_1.jpg",
    "Royal Enfield-1935-248-model-b-250-sv-1935_1.jpg",
    "Royal Enfield-1935-248-model-s-250-ohv-1935_1.jpg",
    "Royal Enfield-1935-346-bullet-350-1935-2v_1.jpg",
    "Royal Enfield-1935-488-model-h-500-sv-1935_1.jpg",
    "Royal Enfield-1935-488-bullet-500-1935-2v_1.jpg",
    "Royal Enfield-1936-499-model-jf-500-4v_1.jpg",
    "Royal Enfield-1936-346-model-g-350-ohv-vertical_1.jpg",
    "Royal Enfield-1936-346-model-s-350-ohv-1936_1.jpg",
    "Royal Enfield-1936-499-model-h-500-sv-1936_1.jpg",
    "Royal Enfield-1936-499-model-j-500-ohv-vertical_1.jpg",
    "Royal Enfield-1936-488-model-jf-500-ohv_1.jpg",
    "Royal Enfield-1936-248-model-bf-250-ohv_1.jpg",
    "Royal Enfield-1937-1140-model-kx-v-twin_1.jpg",
    "Royal Enfield-1937-148-model-r-148-2-stroke_1.jpg",
    "Royal Enfield-1937-346-bullet-350-1937-2p_1.jpg",
    "Royal Enfield-1937-499-bullet-500-1937-4v_1.jpg",
    "Royal Enfield-1937-346-model-c-350-sv-1937_1.jpg",
    "Royal Enfield-1937-248-model-d-250-sv-1937_1.jpg",
    "Royal Enfield-1937-248-model-s-250-ohv-1937_1.jpg",
    "Royal Enfield-1937-148-model-t-148-2s-1937_1.jpg",
    "Royal Enfield-1938-346-bullet-350-1938-2p_1.jpg",
    "Royal Enfield-1938-499-bullet-500-1938-4v_1.jpg",
    "Royal Enfield-1938-499-model-js-500-ohv_1.jpg",
    "Royal Enfield-1938-569-model-l-570-sv_1.jpg",
    "Royal Enfield-1938-248-model-s2-250-ohv-1938_1.jpg",
    "Royal Enfield-1939-346-model-c-350-sv_1.jpg",
    "Royal Enfield-1939-346-model-co-350-ohv_1.jpg",
    "Royal Enfield-1939-248-model-d-250-sv_1.jpg",
    "Royal Enfield-1939-346-model-g-350-ohv-1939_1.jpg",
    "Royal Enfield-1939-346-wd-c-350-sv_1.jpg",
    "Royal Enfield-1939-346-wd-co-350-ohv_1.jpg",
    "Royal Enfield-1939-248-wd-d-250-sv_1.jpg",
    "Royal Enfield-1939-346-wd-g-350-ohv_1.jpg",
    "Royal Enfield-1939-570-wd-l-570-sv_1.jpg",
    "Royal Enfield-1939-125-flying-flea_1.jpg",
    "Royal Enfield-1946-346-model-g-350_1.jpg",
    "Royal Enfield-1946-499-model-j-500-sv_1.jpg",
    "Royal Enfield-1947-499-model-j2-500-ohv_1.jpg",
    "Royal Enfield-1948-346-bullet-350-swing-arm_1.jpg",
    "Royal Enfield-1948-346-bullet-350-trials_1.jpg",
    "Royal Enfield-1948-125-model-re-125_1.jpg",
    "Royal Enfield-1949-495-sports-twin-500_1.jpg",
    "Royal Enfield-1953-692-700-meteor_1.jpg",
    "Royal Enfield-1953-499-500-bullet-british_1.jpg",
    "Royal Enfield-1954-125-model-125-swing-arm_1.jpg",
    "Royal Enfield-1954-248-clipper-250-pre-unit_1.jpg",
    "Royal Enfield-1954-148-ensign-150_1.jpg",
    "Royal Enfield-1955-499-indian-woodsman_1.jpg",
    "Royal Enfield-1955-692-indian-trailblazer_1.jpg",
    "Royal Enfield-1955-692-indian-apache_1.jpg",
    "Royal Enfield-1955-692-indian-chief-700_1.jpg",
    "Royal Enfield-1955-499-model-j2-500-ohv-rigid_1.jpg",
    "Royal Enfield-1956-499-bullet-500-scrambler_1.jpg",
    "Royal Enfield-1956-692-super-meteor-700_1.jpg",
    "Royal Enfield-1958-346-airflow-bullet_1.jpg",
    "Royal Enfield-1958-692-constellation-700_1.jpg",
    "Royal Enfield-1958-346-clipper-350_1.jpg",
    "Royal Enfield-1958-248-model-250-2-stroke_1.jpg",
    "Royal Enfield-1959-148-airflow-150_1.jpg",
    "Royal Enfield-1959-248-airflow-250_1.jpg",
    "Royal Enfield-1959-499-500-bullet-big-head_1.jpg",
    "Royal Enfield-1959-248-crusader-sports-250_1.jpg",
    "Royal Enfield-1959-499-fury-500_1.jpg",
    "Royal Enfield-1959-148-prince-150_1.jpg",
    "Royal Enfield-1960-173-sherpa-175_1.jpg",
    "Enfield India-1960-173-crusader-175-india_1.jpg",
    "Royal Enfield-1962-736-interceptor-750-s1_1.jpg",
    "Enfield India-1962-173-fantabulus-scooter_1.jpg",
    "Royal Enfield-1962-692-interceptor-s-692_1.jpg",
    "Royal Enfield-1963-248-continental-250_1.jpg",
    "Royal Enfield-1963-248-crusader-super-5_1.jpg",
    "Royal Enfield-1963-346-new-bullet-350-uc_1.jpg",
    "Royal Enfield-1963-248-clipper-250-unit_1.jpg",
    "Royal Enfield-1964-248-olympic-250_1.jpg",
    "Royal Enfield-1964-247-turbo-twin-2-stroke_1.jpg",
    "Royal Enfield-1964-736-interceptor-750-tt_1.jpg",
    "Royal Enfield-1964-736-interceptor-750-gp_1.jpg",
    "Royal Enfield-1967-736-interceptor-750-s1a_1.jpg",
    "Royal Enfield-1969-736-interceptor-750-s2_1.jpg",
    "Royal Enfield-1970-736-rickman-interceptor_1.jpg",
    "Royal Enfield-1970-778-interceptor-800-prototype_1.jpg",
    "Enfield India-1980-197-mini-bullet-200_1.jpg",
    "Enfield India-1980-22-mofa-moped_1.jpg",
    "Enfield India-1980-61.5-silver-plus_1.jpg",
    "Enfield India-1980-49-explorer-50_1.jpg",
    "Enfield India-1984-163-fury-175-dx_1.jpg",
    "Enfield India-1989-499-bullet-500-ci_1.jpg",
    "Enfield India-1993-325-taurus-diesel_1.jpg",
    "Enfield India-1997-499-lightning-500_1.jpg",
    "Enfield India-2000-499-machismo-500-avl_1.jpg",
    "Enfield India-2001-346-electra-350-ci_1.jpg",
    "Enfield India-2002-346-thunderbird-350-avl_1.jpg",
    "Enfield India-2004-499-electra-x-500_1.jpg",
    "Royal Enfield-2009-499-classic-500-uce_1.jpg",
    "Royal Enfield-2009-346-thunderbird-350-uce_1.jpg",
    "Royal Enfield-2010-346-bullet-350-uce_1.jpg",
    "Royal Enfield-2011-499-bullet-500-uce_1.jpg",
    "Royal Enfield-2012-499-thunderbird-500-uce_1.jpg",
    "Royal Enfield-2013-535-continental-gt-535_1.jpg",
    "Royal Enfield-2016-411-himalayan-411_1.jpg",
    "Royal Enfield-2018-648-interceptor-650_1.jpg",
    "Royal Enfield-2018-648-continental-gt-650_1.jpg",
    "Royal Enfield-2019-346-bullet-trials-350_1.jpg",
    "Royal Enfield-2019-499-bullet-trials-500_1.jpg",
    "Royal Enfield-2020-349-meteor-350_1.jpg",
    "Royal Enfield-2021-349.34-classic-350_1.jpg",
    "Royal Enfield-2022-349.34-hunter-350_1.jpg",
    "Royal Enfield-2022-411-scram-411_1.jpg",
    "Royal Enfield-2023-452-himalayan-450_1.jpg",
    "Royal Enfield-2023-349-bullet-350_1.jpg",
    "Royal Enfield-2023-648-super-meteor-650_1.jpg",
    "Royal Enfield-2024-648-shotgun-650_1.jpg",
    "Royal Enfield-2024-452-guerrilla-450_1.jpg",
    "Royal Enfield-2024-648-classic-650_1.jpg",
    "Royal Enfield-2025-648-bear-650_1.jpg"
]
# --- Part 3: Main Function and Reading the File ---

def process_bike_data():
    """
    Reads the YAML file, updates the image names,
    and saves a new file.
    """
    print(f"Loading bike data from: {INPUT_FILE}...")
    
    # --- 1. Read the input YAML file ---
    try:
        with open(INPUT_FILE, 'r') as f:
            data = yaml.safe_load(f)
            if not isinstance(data, list):
                print(f"Error: {INPUT_FILE} does not seem to contain a list of bikes.")
                return
    except FileNotFoundError:
        print(f"ERROR: Cannot find file {INPUT_FILE}.")
        print("Please make sure 'update_names.py' is in the SAME folder as 'bikes.yml'.")
        return
    except Exception as e:
        print(f"Error reading YAML file: {e}")
        return

    print(f"Successfully loaded {len(data)} bike entries.")

# --- Part 4: Processing Loop and Error Checking ---

    # Check for a mismatch in list lengths
    if len(data) != len(NEW_IMAGE_NAMES):
        print("\n--- WARNING! ---")
        print(f"The YAML file has {len(data)} bikes.")
        print(f"The list of new names has {len(NEW_IMAGE_NAMES)} entries.")
        print("These numbers do not match. The script will try to proceed but may fail or produce incorrect results.")
        print("------------------\n")

    updated_bikes_list = []
    print("Processing bikes and updating image names...")

    # We use enumerate to get an index (i) and the bike data
    for i, bike in enumerate(data):
        try:
            # Check if we have a new name for this index
            if i < len(NEW_IMAGE_NAMES):
                new_image_name = NEW_IMAGE_NAMES[i]
                
                # Get the original name for logging purposes
                original_name = bike.get('image', 'N/A')
                
                # Update the bike's image field with the new name
                bike['image'] = new_image_name
                
                # print(f"Updated '{original_name}' to '{new_image_name}'") # Optional: Uncomment for detailed progress
                
                # Add the modified bike data to our new list
                updated_bikes_list.append(bike)
            else:
                # This happens if the YAML is longer than the name list
                print(f"Warning: No new name found for bike index {i}. Appending original data.")
                updated_bikes_list.append(bike)

        except Exception as e:
            print(f"Error processing bike {bike.get('name', 'Unknown')} at index {i}: {e}")
            # Add the original bike data to avoid losing it
            updated_bikes_list.append(bike)

# --- Part 5: Writing the New File and Running the Script ---

    # --- 7. Write the new updated file ---
    try:
        with open(OUTPUT_FILE, 'w') as f:
            # Dumps the data in a clean YAML format, preserving order
            # and preventing lines from wrapping in the middle.
            yaml.dump(updated_bikes_list, f, sort_keys=False, default_flow_style=False, width=1000)
        
        print("\n-------------------------------------------------")
        print("Success! All bike image names have been updated.")
        print(f"Your new file is saved as: {OUTPUT_FILE}")
        print("You can now check 'bikes_updated.yml' for the results.")
        print("-------------------------------------------------")

    except Exception as e:
        print(f"\nError writing new YAML file: {e}")

# --- This line tells Python to run the main function ---
if __name__ == "__main__":
    process_bike_data()
