import subprocess
import sys

def install():
    print("Installing backend dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
    print("Backend dependencies installed.")

if __name__ == "__main__":
    install()
