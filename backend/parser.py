import re
from typing import Dict, Any

def parse_quick_add(text: str) -> Dict[str, Any]:
    """
    Parses a natural language string for task creation.
    Extracts priority (!high, !medium, !low) and due date (due:YYYY-MM-DD or due:tomorrow).
    """
    priority = "medium"  # default
    due_date = None

    # Extract priority using regex
    priority_match = re.search(r'!(high|medium|low)', text, re.IGNORECASE)
    if priority_match:
        priority = priority_match.group(1).lower()
        # Remove the priority token from the title text
        text = re.sub(r'!(high|medium|low)', '', text, flags=re.IGNORECASE)

    # Extract due date using regex (e.g., due:2026-06-10 or due:tomorrow)
    due_match = re.search(r'due:([^\s]+)', text, re.IGNORECASE)
    if due_match:
        due_date = due_match.group(1)
        # Remove the due date token from the title text
        text = re.sub(r'due:[^\s]+', '', text, flags=re.IGNORECASE)

    # Clean up remaining whitespace for the final task title
    clean_title = " ".join(text.split())

    return {
        "title": clean_title if clean_title else "Untitled Task",
        "priority": priority,
        "due_date": due_date
    }