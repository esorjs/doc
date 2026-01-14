from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the playground
        page.goto("http://localhost:8000/playground/index.html")

        # Verify tablist role
        tablist = page.locator('div[role="tablist"]')
        expect(tablist).to_be_visible()

        # Verify initial state of Counter tab
        counter_tab = page.locator('#tab-counter')
        expect(counter_tab).to_have_attribute("role", "tab")
        expect(counter_tab).to_have_attribute("aria-selected", "true")

        # Verify initial state of Todo tab
        todo_tab = page.locator('#tab-todo')
        expect(todo_tab).to_have_attribute("aria-selected", "false")

        # Click Todo tab
        todo_tab.click()

        # Verify state change
        expect(todo_tab).to_have_attribute("aria-selected", "true")
        expect(counter_tab).to_have_attribute("aria-selected", "false")

        # Take screenshot
        page.screenshot(path="/app/verification/verification.png")

        browser.close()
        print("Verification passed!")

if __name__ == "__main__":
    run()
