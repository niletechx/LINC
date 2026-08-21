import re

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

bug_count = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find blocks of Container(...)
    # We will search for Container(\s*.*?)(?=\n\s*child:|\n\s*\)) non greedy
    # It's better to just search for the exact lines that have color: and decoration: 
    # as siblings
    matches = re.finditer(r'Container\(\s*(?:[a-zA-Z]+:\s*[^,]+,\s*)*?(color:\s*[^,]+,)\s*(?:[a-zA-Z]+:\s*[^,]+,\s*)*?(decoration:\s*(?:const\s*)?BoxDecoration\([^)]*\),)', content, re.DOTALL)
    for m in matches:
        print(f"BUG1 in {filepath}: {m.group(0)}")
        bug_count += 1
        
    matches2 = re.finditer(r'Container\(\s*(?:[a-zA-Z]+:\s*[^,]+,\s*)*?(decoration:\s*(?:const\s*)?BoxDecoration\([^)]*\),)\s*(?:[a-zA-Z]+:\s*[^,]+,\s*)*?(color:\s*[^,]+,)', content, re.DOTALL)
    for m in matches2:
        print(f"BUG2 in {filepath}: {m.group(0)}")
        bug_count += 1

print(f"Total real bugs found: {bug_count}")
