import re
import sys

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find Container( ... ) blocks
    # This is a simple regex that just looks for Container( and the matching closing parenthesis
    # It might be too simple, let's just find Container( followed by color: and decoration: before the next widget
    
    count = 0
    for match in re.finditer(r'Container\s*\([^;]*?\)', content, re.DOTALL):
        block = match.group(0)
        # check if it has both decoration: and color: as direct children
        # simple check: does it contain 'color:' and 'decoration:' ?
        if 'color:' in block and 'decoration:' in block:
            print(f"Found in {filepath}:")
            print(block)
            count += 1
    return count

files = [
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\ai\ai_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\auth\forgot_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\auth\login_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\auth\signup_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\auth\welcome_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\booking\bookings_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\booking\booking_flow_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\home\home_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\home\provider_dashboard.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\messages\dm_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\messages\messages_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\profile\profile_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\profile\verification_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\provider\provider_profile_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\screens\search\search_screen.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\widgets\bottom_nav.dart',
    r'c:\Users\hp\Desktop\INSA_2026\LINC\client\mobile\lib\widgets\provider_card.dart',
]

total = 0
for f in files:
    total += check_file(f)
print(f"Total found: {total}")
