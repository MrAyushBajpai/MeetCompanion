import re

ACTION_WORDS = ["will", "needs to", "should", "must", "has to"]

def extract_tasks(text: str):
    sentences = text.split(".")
    tasks = []

    for s in sentences:
        s = s.strip()
        if any(word in s.lower() for word in ACTION_WORDS):

            name_match = re.search(r'\b[A-Z][a-z]+\b', s)
            owner = name_match.group(0) if name_match else None

            date_match = re.search(
                r'\b(\d{1,2}\s?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|tomorrow|next week|Monday|Tuesday|Friday)\b',
                s
            )
            deadline = date_match.group(0) if date_match else None

            if "fix" in s.lower():
                priority = "High"
            elif "should" in s.lower():
                priority = "Medium"
            else:
                priority = "Low"

            tasks.append({
                "description": s,
                "owner": owner,
                "deadline": deadline,
                "priority": priority
            })

    return tasks
