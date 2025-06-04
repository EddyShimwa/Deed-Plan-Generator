from shapely.geometry import Polygon
import matplotlib.pyplot as plt
import io
import base64
from PIL import Image

def calculate_area_and_plot(data):
    point_dict = {p.name: (p.easting, p.northing) for p in data.points}
    coordinates = [point_dict[seg.from_point] for seg in data.segments]

    # Ensure the polygon is closed
    if coordinates[0] != coordinates[-1]:
        coordinates.append(coordinates[0])

    polygon = Polygon(coordinates)
    area = polygon.area

    # Generate plot
    x, y = zip(*coordinates)
    plt.figure()
    plt.plot(x, y, 'k-', marker='o')
    plt.fill(x, y, alpha=0.3)
    plt.title(f"Area: {area:.3f} sqm")
    plt.axis('equal')

    # Add point labels
    for i, point in enumerate(data.points):
        plt.annotate(point.name, (point.easting, point.northing), 
                    xytext=(5, 5), textcoords='offset points')

    # Save plot to buffer
    try:
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
        buf.seek(0)
        # Convert to base64 with proper MIME type prefix
        img_data = base64.b64encode(buf.getvalue()).decode('utf-8')
        img_base64 = f"data:image/png;base64,{img_data}"
        plt.close()
    except Exception as e:
        plt.close()
        return {"error": f"Failed to generate plot: {str(e)}"}

    return {
        "area_sqm": round(area, 3),
        "image_base64": img_base64
    }

def save_image(base64_string, filename="boundary_plot.png"):
    # Remove the data URL prefix if present
    if "base64," in base64_string:
        base64_string = base64_string.split("base64,")[1]
    
    # Decode base64 string to bytes
    image_data = base64.b64decode(base64_string)
    
    # Write bytes to file
    with open(filename, "wb") as f:
        f.write(image_data)

def preview_image(base64_string):
    # Remove the data URL prefix if present
    if "base64," in base64_string:
        base64_string = base64_string.split("base64,")[1]
    
    # Decode base64 string to bytes
    image_data = base64.b64decode(base64_string)
    
    # Create image from bytes
    image = Image.open(io.BytesIO(image_data))
    
    # Display the image
    image.show()
    
    return image
