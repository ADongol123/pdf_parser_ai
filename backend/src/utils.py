import textwrap

def print_wrapped(text: str, wrap_length: int = 80):
    """Print text with wrapping."""
    wrapped_text = textwrap.fill(text, wrap_length)
    print(wrapped_text)
    
    


def is_meta_question(query:str):
    lowered = query.lower()
    return any(
        phrase in lowered for phrase in [
            "first question i asked",
            "previous question",
            "last question",
            "what did i ask"
        ]
    )