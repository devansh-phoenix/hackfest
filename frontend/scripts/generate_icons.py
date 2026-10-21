import os
from PIL import Image, ImageDraw, ImageFont

public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public'))
os.makedirs(public_dir, exist_ok=True)

def create_pwa_icon(size, is_maskable=False):
    # Create image with saffron brand background
    img = Image.new('RGBA', (size, size), (234, 88, 12, 255))
    draw = ImageDraw.Draw(img)

    # If not maskable, round corners or keep solid
    # Center circle badge
    padding = size * 0.15 if is_maskable else size * 0.1
    cx = size / 2
    cy = size / 2
    r = (size - 2 * padding) / 2

    # Draw inner circle badge (White)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 255), outline=(254, 215, 170, 255), width=int(size * 0.02))

    # Draw store bag icon / symbol in Saffron
    bag_w = r * 1.05
    bag_h = r * 1.0
    bx0 = cx - bag_w / 2
    by0 = cy - bag_h / 2 + (r * 0.12)
    bx1 = cx + bag_w / 2
    by1 = cy + bag_h / 2 + (r * 0.12)

    # Bag body
    draw.rounded_rectangle([bx0, by0, bx1, by1], radius=int(size * 0.04), fill=(234, 88, 12, 255))

    # Bag handle
    handle_r = bag_w * 0.32
    hx0 = cx - handle_r
    hy0 = by0 - handle_r * 0.85
    hx1 = cx + handle_r
    hy1 = by0 + handle_r * 0.65
    draw.arc([hx0, hy0, hx1, hy1], start=180, end=360, fill=(234, 88, 12, 255), width=int(size * 0.04))

    # Inner emblem (Rupee / Stock check in gold/white)
    check_r = bag_w * 0.22
    draw.ellipse([cx - check_r, cy + (r*0.1) - check_r, cx + check_r, cy + (r*0.1) + check_r], fill=(22, 163, 74, 255))
    
    # Checkmark inside bag badge
    cw = int(size * 0.025)
    p1 = (cx - check_r * 0.45, cy + (r*0.1))
    p2 = (cx - check_r * 0.1, cy + (r*0.1) + check_r * 0.4)
    p3 = (cx + check_r * 0.5, cy + (r*0.1) - check_r * 0.35)
    draw.line([p1, p2, p3], fill=(255, 255, 255, 255), width=cw, joint='curve')

    return img

# Generate icons
icon_192 = create_pwa_icon(192, is_maskable=False)
icon_192.save(os.path.join(public_dir, 'pwa-192x192.png'))

icon_512 = create_pwa_icon(512, is_maskable=False)
icon_512.save(os.path.join(public_dir, 'pwa-512x512.png'))

icon_maskable = create_pwa_icon(512, is_maskable=True)
icon_maskable.save(os.path.join(public_dir, 'maskable-icon-512x512.png'))

apple_icon = create_pwa_icon(180, is_maskable=False)
apple_icon.save(os.path.join(public_dir, 'apple-touch-icon-180x180.png'))

print("All PWA icons generated successfully in public/")
