import sys
import time
import subprocess
import os
from playwright.sync_api import sync_playwright

def run_visual_verification():
    # Start server
    server = subprocess.Popen([sys.executable, "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2) # Wait for server to start

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto("http://localhost:8000/public/playground/index.html")

            # Focus the tabs and move to the second one
            page.locator(".tab").nth(0).focus()
            page.keyboard.press("ArrowRight")

            # Wait a bit for any transition
            time.sleep(0.5)

            # Take screenshot of the tabs container
            tabs_locator = page.locator(".tabs")

            screenshot_path = "/app/verification/tabs_focus.png"
            # Ensure directory exists
            os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)

            tabs_locator.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

            browser.close()
    finally:
        server.terminate()

if __name__ == "__main__":
    run_visual_verification()
