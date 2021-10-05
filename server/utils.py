
import socket
import string
import random


def get_local_ip_address():
    """Returns the private IP address of the system"""

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
    except OSError:
        return "127.0.0.1" # Localhost
        
    return s.getsockname()[0] 


def token_generator(size=32, chars=string.ascii_uppercase + string.digits):
    """Generates Random tokens"""
    return ''.join(random.SystemRandom().choice(chars) for _ in range(size))
