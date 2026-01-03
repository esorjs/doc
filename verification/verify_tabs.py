from playwright.sync_api import sync_playwright, expect
import re

def verify_tabs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the playground
        page.goto("http://localhost:8000/playground/index.html")

        # Verify Tab List
        tablist = page.locator('div[role="tablist"]')
        expect(tablist).to_be_visible()

        # Verify Tabs
        counter_tab = page.get_by_role("tab", name="Counter")
        todo_tab = page.get_by_role("tab", name="Todo List")

        expect(counter_tab).to_be_visible()
        expect(todo_tab).to_be_visible()

        # Initial State: Counter is selected
        expect(counter_tab).to_have_attribute("aria-selected", "true")
        expect(todo_tab).to_have_attribute("aria-selected", "false")

        # Verify Panel association
        expect(counter_tab).to_have_attribute("aria-controls", "counter")

        # Click Todo Tab
        todo_tab.click()

        # Verify State Change
        expect(counter_tab).to_have_attribute("aria-selected", "false")
        expect(todo_tab).to_have_attribute("aria-selected", "true")

        # Verify Panel Visibility
        todo_panel = page.locator("#todo")
        expect(todo_panel).to_have_class(re.compile(r"active"))

        # Screenshot
        page.screenshot(path="verification/tabs_verification.png")
        print("Verification successful!")

        browser.close()

if __name__ == "__main__":
    verify_tabs()
