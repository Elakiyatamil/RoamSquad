import re
import sys

def check_balance(filename):
    with open(filename, 'r') as f:
        content = f.read()

    tags = re.findall(r'<(/?)([a-zA-Z0-9.]+)', content)
    stack = []
    
    for closing, name in tags:
        if name in ['img', 'br', 'hr', 'input', 'Calendar', 'Users', 'Briefcase', 'Zap', 'Coffee', 'Sparkles', 'ChevronRight', 'MapPin', 'Trash2', 'Plus', 'TreePalm', 'SearchableSelect', 'AuthModal']:
            if not closing:
                # Likely self-closing or component without children in some styles
                # But in JSX they should ideally use />.
                # Let's skip them for now or check for />.
                pass
            continue

        if closing:
            if not stack:
                print(f"Extra closing tag: </{name}>")
                continue
            last = stack.pop()
            if last != name:
                print(f"Mismatched tag: open <{last}>, close </{name}>")
        else:
            # Check for self-closing in the original match (not easy with re.findall(r'<...'))
            # Let's just assume if it doesn't end with /> it's pushed.
            # Real parsing is harder, but let's try.
            stack.append(name)
            
    if stack:
        print(f"Unclosed tags: {stack}")
    else:
        print("Balanced (roughly)")

check_balance(sys.argv[1])
