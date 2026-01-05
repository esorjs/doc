from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the playground
            page.goto("http://localhost:3000/playground/")

            # Wait for tabs to appear
            page.wait_for_selector(".tabs")

            # Check for ARIA roles
            tabs_container = page.locator(".tabs")
            expect(tabs_container).to_have_attribute("role", "tablist")

            # Check first tab
            counter_tab = page.locator("#tab-counter")
            expect(counter_tab).to_have_attribute("role", "tab")
            expect(counter_tab).to_have_attribute("aria-selected", "true")
            expect(counter_tab).to_have_attribute("aria-controls", "counter")

            # Check second tab
            todo_tab = page.locator("#tab-todo")
            expect(todo_tab).to_have_attribute("role", "tab")
            expect(todo_tab).to_have_attribute("aria-selected", "false")

            # Test Interaction: Click Todo tab
            todo_tab.click()
            expect(todo_tab).to_have_attribute("aria-selected", "true")
            expect(counter_tab).to_have_attribute("aria-selected", "false")
            expect(todo_tab).to_have_class(re.compile(r"active"))

            # Test Keyboard Navigation
            # Focus on Todo tab (currently active)
            todo_tab.focus()
            # Press Right Arrow -> User Card
            page.keyboard.press("ArrowRight")

            user_card_tab = page.locator("#tab-user-card")
            expect(user_card_tab).to_be_focused()
            expect(user_card_tab).to_have_attribute("aria-selected", "true")

            print("All checks passed!")

            # Take screenshot
            page.screenshot(path="verification/tabs_verified.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

import re
if __name__ == "__main__":
    run()
