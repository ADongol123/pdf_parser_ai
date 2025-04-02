import textwrap

def print_wrapped(text: str, wrap_length: int = 80):
    """Print text with wrapping."""
    wrapped_text = textwrap.fill(text, wrap_length)
    print(wrapped_text)