
import string
import random

def token_generator(size=32, chars=string.ascii_uppercase + string.digits):
    """Generates Random tokens"""

    return ''.join(random.SystemRandom().choice(chars) for _ in range(size))