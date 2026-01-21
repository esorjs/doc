import threading
import time
from http.server import SimpleHTTPRequestHandler
import socketserver
import os
import sys
from playwright.sync_api import sync_playwright

PORT = 8080

def start_server():
    os.chdir('public')
    handler = SimpleHTTPRequestHandler
    # Allow reuse address to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto(f"http://localhost:{PORT}/playground/index.html")

            # Wait for tabs to be visible
            page.wait_for_selector(".tabs")

            tabs = page.query_selector_all(".tab")
            print(f"Found {len(tabs)} tabs.")

            # Test 1: Check initial tabindex (should be improper for roving tabindex pattern currently)
            # In roving tabindex, inactive tabs should be -1.
            # Currently they are likely 0 (default for button) or not set.
            t1_tabindex = tabs[0].get_attribute("tabindex")
            t2_tabindex = tabs[1].get_attribute("tabindex")
            print(f"Initial tabindex: Tab 1='{t1_tabindex}', Tab 2='{t2_tabindex}'")

            # Test 2: Arrow key navigation
            print("Focusing first tab...")
            tabs[0].focus()

            print("Pressing ArrowRight...")
            page.keyboard.press("ArrowRight")

            focused_id = page.evaluate("document.activeElement.id")
            print(f"Focused element ID: {focused_id}")

            if focused_id == "tab-todo":
                print("SUCCESS: Focus moved to next tab.")
            else:
                print("FAILURE: Focus did not move to next tab.")

            # Test 3: Home/End
            print("Pressing End...")
            page.keyboard.press("End")
            focused_id = page.evaluate("document.activeElement.id")
            print(f"Focused element ID: {focused_id}")

            if focused_id == "tab-fetch":
                print("SUCCESS: Focus moved to last tab.")
            else:
                print("FAILURE: Focus did not move to last tab.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    # Start server in thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Give server a moment to start
    time.sleep(2)

    verify()
