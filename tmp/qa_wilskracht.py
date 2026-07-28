from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
OUT = Path("/Users/samriek/projectWilskrachtzorg/tmp")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    errors = []
    page.on("console", lambda msg: errors.append(f"console:{msg.type}:{msg.text}") if msg.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(f"page:{error}"))

    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    page.screenshot(path=str(OUT / "dashboard-desktop.png"), full_page=True)
    assert page.get_by_text("Acties die aandacht vragen").is_visible()
    assert page.get_by_text("Herkomst & verblijfsduur").is_visible()

    page.get_by_role("link", name="Trajecten & herkomst").click()
    page.wait_for_load_state("networkidle")
    assert page.get_by_text("Vergelijking per herkomstgemeente").is_visible()
    page.screenshot(path=str(OUT / "trajecten-desktop.png"), full_page=True)

    page.get_by_role("link", name="Uitstroom & vervolgplek").click()
    page.wait_for_load_state("networkidle")
    assert page.get_by_text("Recente gesprekken & besluiten").is_visible()

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    mobile.goto(BASE_URL)
    mobile.wait_for_load_state("networkidle")
    mobile.screenshot(path=str(OUT / "dashboard-mobile.png"), full_page=True)
    assert mobile.get_by_role("button", name="Open navigatie").is_visible()
    assert mobile.locator("body").evaluate("(el) => el.scrollWidth <= window.innerWidth")

    print({"errors": errors, "desktop_title": page.title(), "mobile_width": mobile.locator("body").evaluate("(el) => el.scrollWidth")})
    browser.close()
