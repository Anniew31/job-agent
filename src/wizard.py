from models import *

# asks user for input for a field
def ask_field(question, validator=None, optional=False, field_type=str):
    while True:
        raw = input(f"{question}: ").strip()

        if not raw:
            if optional:
                return None
            print("This field is required")
            continue

        try:
            value = field_type(raw)
        except ValueError:
            print(f"Expected a {field_type.__name__}")
            continue

        if validator:
            try:
                value = validator(value)
            except ValueError as e:
                print(f"{e}")
                continue

        return value
    
# asks user to provide answer from choices
def ask_choice(question, options):
    formatted = "/".join(options)
    while True:
        raw = input(f"{question} ({formatted}): ").strip().lower()
        if raw not in options:
            print(f"Must be one of: {formatted}")
            continue
        return raw

# asks user to list multiple answers
def ask_list(question, optional=False):
    while True:
        raw = input(f"{question} (comma-separated): ").strip()
        if not raw:
            if optional:
                return []
            print("At least one item required")
            continue  
        items = [item.strip() for item in raw.split(",") if item.strip()]
        if not items:
            print("At least one item required")
            continue
        return items  