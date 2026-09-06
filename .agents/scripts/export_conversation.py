#!/usr/bin/env python3
import glob
import json
import os
import re
import sys
from datetime import datetime

def get_latest_transcript():
    home = os.path.expanduser("~")
    logs = glob.glob(f"{home}/.gemini/antigravity/brain/*/.system_generated/logs/transcript.jsonl")
    if not logs:
        return None
    # Sort by modification time, newest first
    logs.sort(key=lambda p: os.path.getmtime(p), reverse=True)
    return logs[0]

def clean_user_content(content):
    if not content:
        return ""
    # Extract <USER_REQUEST> if present
    match = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", content, re.DOTALL)
    if match:
        content = match.group(1).strip()
    else:
        # Strip other system/metadata tags
        content = re.sub(r"<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>", "", content, flags=re.DOTALL)
        content = re.sub(r"<USER_SETTINGS_CHANGE>.*?</USER_SETTINGS_CHANGE>", "", content, flags=re.DOTALL)
        content = content.strip()
    return content

def export_conversation(dest_dir="/Users/amol/Downloads"):
    transcript_path = get_latest_transcript()
    if not transcript_path or not os.path.exists(transcript_path):
        print("No transcript file found.")
        return False

    conv_id = transcript_path.split("/")[-4]
    os.makedirs(dest_dir, exist_ok=True)
    
    md_output_path = os.path.join(dest_dir, "conversation_history.md")
    jsonl_output_path = os.path.join(dest_dir, "conversation_transcript.jsonl")

    messages = []
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                entry = json.loads(line)
            except Exception:
                continue

            msg_type = entry.get("type")
            source = entry.get("source")
            created_at = entry.get("created_at", "")
            content = entry.get("content", "")
            tool_calls = entry.get("tool_calls", [])

            if msg_type == "USER_INPUT" and source == "USER_EXPLICIT":
                cleaned = clean_user_content(content)
                if cleaned:
                    messages.append({
                        "role": "User",
                        "time": created_at,
                        "content": cleaned
                    })
            elif msg_type == "PLANNER_RESPONSE":
                if content:
                    messages.append({
                        "role": "Assistant",
                        "time": created_at,
                        "content": content.strip()
                    })

    # Write Markdown
    with open(md_output_path, "w", encoding="utf-8") as f:
        f.write(f"# Conversation Export\n\n")
        f.write(f"- **Conversation ID**: `{conv_id}`\n")
        f.write(f"- **Exported At**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"- **Total Messages**: {len(messages)}\n\n")
        f.write("---\n\n")

        for msg in messages:
            f.write(f"### {msg['role']} ({msg['time']})\n\n")
            f.write(f"{msg['content']}\n\n")
            f.write("---\n\n")

    # Also copy raw jsonl
    import shutil
    shutil.copyfile(transcript_path, jsonl_output_path)

    print(f"Exported markdown to: {md_output_path}")
    print(f"Exported raw transcript to: {jsonl_output_path}")
    return True

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "/Users/amol/Downloads"
    export_conversation(out_dir)
