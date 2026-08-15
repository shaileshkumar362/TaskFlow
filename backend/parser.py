from datetime import datetime, timedelta
import random

def parse_quick_add(raw_text: str, ai_description: str = None):
    text_lower = raw_text.lower()
    
    # 1. Priority डिटेक्ट करना (!high, !urgent, !low)
    priority = "medium"
    if "!high" in text_lower or "!urgent" in text_lower:
        priority = "high"
        raw_text = raw_text.replace("!high", "").replace("!urgent", "")
    elif "!low" in text_lower:
        priority = "low"
        raw_text = raw_text.replace("!low", "")

    # 2. आज या कल की तारीख सेट करना
    today = datetime.now()
    due_date = today.strftime("%Y-%m-%d") 
    
    if "tomorrow" in text_lower:
        tomorrow_date = today + timedelta(days=1)
        due_date = tomorrow_date.strftime("%Y-%m-%d")
        raw_text = raw_text.replace("tomorrow", "")

    # 3. टाइटल को साफ़ करना
    clean_title = raw_text.strip()
    if not clean_title:
        clean_title = "Untitled Task"

    # 4. स्मार्ट लोकल AI जैसी डाइनैमिक जनरेशन (रैंडम टेम्पलेट्स)
    templates = [
        f"🚀 Execution Objective: Focus on completing '{clean_title}' successfully by {due_date}.",
        f"💡 Strategy: Break down '{clean_title}' into smaller steps and track daily progress.",
        f"🎯 Key Focus Area: Prioritize '{clean_title}' under {priority.upper()} priority guidelines.",
        f"📌 Action Item: Keep all necessary resources ready for executing '{clean_title}'."
    ]

    # डिस्क्रिप्शन लॉजिक (अगर बाहर से AI डिस्क्रिप्शन आया है तो वो, वरना रैंडम स्मार्ट टेम्पलेट)
    if ai_description:
        final_description = ai_description
    else:
        final_description = random.choice(templates)

    return {
        "title": clean_title,
        "priority": priority,
        "due_date": due_date,
        "description": final_description
    }