import io

# 1. Fix LandingPage.jsx
path_jsx = r"c:\Users\Yash\Desktop\Team collaboration\frontend\src\pages\LandingPage.jsx"
with io.open(path_jsx, "r", encoding="utf-8", errors="ignore") as f:
    jsx_content = f.read()

# Replace broken symbols in JSX
# The compare table has "??? 5 members free" -> "✓ 5 members free"
jsx_content = jsx_content.replace('??? 5 members free', '✓ 5 members free')
jsx_content = jsx_content.replace('??? pricing (India)', '₹ pricing (India)')
jsx_content = jsx_content.replace('??? Razorpay', '✓ Razorpay')
jsx_content = jsx_content.replace('??? &lt;50ms', '✓ &lt;50ms')
jsx_content = jsx_content.replace('className="c-check">???<', 'className="c-check">✓<')
jsx_content = jsx_content.replace('??? Built-in', '✓ Built-in')
jsx_content = jsx_content.replace('??? Flat rate', '✓ Flat rate')
jsx_content = jsx_content.replace('??? FastAPI docs', '✓ FastAPI docs')

jsx_content = jsx_content.replace('India Pricing (???)', 'India Pricing (₹)')
jsx_content = jsx_content.replace('???0', '₹0')
jsx_content = jsx_content.replace('???1,499', '₹1,499')
jsx_content = jsx_content.replace('???3,999', '₹3,999')
jsx_content = jsx_content.replace('globe">????<', 'globe">🌍<')

# The quick start has "???" for em-dash and "????" for something else
jsx_content = jsx_content.replace('seconds ??? no setup', 'seconds — no setup')
jsx_content = jsx_content.replace('click ??? no account', 'click — no account')
jsx_content = jsx_content.replace('???? Create your', '🚀 Create your')
jsx_content = jsx_content.replace('workspace ??? it\'s free', 'workspace — it\'s free')
jsx_content = jsx_content.replace('card ?? Free', 'card · Free')
jsx_content = jsx_content.replace('teams ?? Built', 'teams · Built')
jsx_content = jsx_content.replace('TeamCollab ?? Made', 'TeamCollab · Made')
jsx_content = jsx_content.replace('?? 2025', '© 2025')
jsx_content = jsx_content.replace('SaaS ??? v1.0', 'SaaS — v1.0')
jsx_content = jsx_content.replace('management ??? all in', 'management — all in')
jsx_content = jsx_content.replace('demo ???<', 'demo →<')
jsx_content = jsx_content.replace('free ???<', 'free →<')
jsx_content = jsx_content.replace('TeamCollab ???<', 'TeamCollab ✓<')
jsx_content = jsx_content.replace('messaging ??? under', 'messaging — under')
jsx_content = jsx_content.replace('Do ??? In Progress ??? Done', 'Do → In Progress → Done')
jsx_content = jsx_content.replace('dates ??? all in', 'dates — all in')

with io.open(path_jsx, "w", encoding="utf-8") as f:
    f.write(jsx_content)

# 2. Fix backend subscription.py
path_sub = r"c:\Users\Yash\Desktop\Team collaboration\backend\app\models\subscription.py"
with io.open(path_sub, "r", encoding="utf-8", errors="ignore") as f:
    sub_content = f.read()

sub_content = sub_content.replace('India Pricing (???)', 'India Pricing (₹)')
sub_content = sub_content.replace('???0', '₹0')
sub_content = sub_content.replace('???1,499', '₹1,499')
sub_content = sub_content.replace('???3,999', '₹3,999')
sub_content = sub_content.replace('badge": "????",', 'badge": "🌍",')
sub_content = sub_content.replace('badge": "??",', 'badge": "🌍",')

with io.open(path_sub, "w", encoding="utf-8") as f:
    f.write(sub_content)

print("Fixed encoding issues using Python utf-8 write.")
