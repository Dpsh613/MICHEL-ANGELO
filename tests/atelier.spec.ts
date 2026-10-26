import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the entrance loads without browser or image errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("Michelangelo | The Living Atelier");
  await expect(
    page.getByRole("heading", { name: "Michelangelo", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Enter the atelier" }).click();
  await expect(page).toHaveURL(/#works$/);
  await expect(
    page.getByRole("button", { name: "Explore David" }),
  ).toBeVisible();
  for (const section of ["#process", "#stone", ".site-footer"]) {
    await page.locator(section).scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(350);
  const brokenImages = await page
    .locator("img")
    .evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.src),
    );
  expect(brokenImages).toEqual([]);
  expect(errors).toEqual([]);
});

test("artwork details, zoom, panning, next work, and Escape work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore David" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "David", exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: /The gaze/ }).click();
  await expect(dialog.getByRole("button", { name: "Reset zoom" })).toHaveText(
    "210%",
  );
  await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Reset zoom" })).toHaveText(
    "250%",
  );
  const image = dialog.locator(".viewer-image");
  const before = await image.locator("img").getAttribute("style");
  const bounds = (await image.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 60,
    bounds.y + bounds.height / 2 + 25,
    { steps: 4 },
  );
  await page.mouse.up();
  expect(await image.locator("img").getAttribute("style")).not.toEqual(before);
  await dialog.getByRole("button", { name: "Reset zoom" }).click();
  await expect(dialog.getByRole("button", { name: "Reset zoom" })).toHaveText(
    "100%",
  );
  await dialog.getByRole("button", { name: "Next work" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Piet\u00e0", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Explore David" }),
  ).toBeFocused();
});

test("the index filters and searches all six works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open the work index" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator(".index-work")).toHaveCount(6);
  await dialog
    .getByRole("button", { name: "Architecture", exact: true })
    .click();
  await expect(dialog.locator(".index-work")).toHaveCount(1);
  await expect(dialog.locator(".index-work")).toContainText(
    "A dome for the sky",
  );
  await dialog.getByRole("button", { name: "All", exact: true }).click();
  await dialog.getByRole("searchbox").fill("david");
  await expect(dialog.locator(".index-work")).toHaveCount(1);
  await dialog.getByRole("searchbox").fill("pieta");
  await expect(dialog.locator(".index-work")).toHaveCount(1);
  await expect(dialog.locator(".index-work")).toContainText("Piet\u00e0");
  await dialog.getByRole("searchbox").fill("nothing matches this");
  await expect(dialog.locator(".index-work")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Show all works" }).click();
  await expect(dialog.locator(".index-work")).toHaveCount(6);
  await dialog.getByRole("button", { name: /A dome for the sky/ }).click();
  await expect(
    dialog.getByRole("heading", { name: "A dome for the sky" }),
  ).toBeVisible();
});

test("process tabs support mouse and keyboard and open the correct study", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /Think beyond the figure/ }).click();
  await expect(page.getByRole("tabpanel").locator("img")).toHaveAttribute(
    "src",
    "/images/architecture.webp",
  );
  await page
    .getByRole("tab", { name: /Think beyond the figure/ })
    .press("ArrowDown");
  await expect(
    page.getByRole("tab", { name: /Listen to the material/ }),
  ).toBeFocused();
  await expect(page.getByRole("tabpanel").locator("img")).toHaveAttribute(
    "src",
    "/images/non-finito.webp",
  );
  await page.getByRole("button", { name: "Open the study" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Between stone and life" }),
  ).toBeVisible();
});

test("light, ambient sound, and credits are functional", async ({ page }) => {
  await page.goto("/");
  const sound = page.getByRole("button", { name: "Turn ambient sound on" });
  await sound.click();
  await expect(
    page.getByRole("button", { name: "Turn ambient sound off" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Turn ambient sound off" }).click();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  const light = page.getByRole("slider", {
    name: "Move the light across the marble",
  });
  await light.focus();
  await light.fill("40");
  expect(
    await page
      .locator("#stone")
      .evaluate((element) => element.style.getPropertyValue("--light-x")),
  ).toBe("40%");
  await light.press("ArrowRight");
  await expect(light).toHaveValue("41");
  await page.getByRole("button", { name: "About this experience" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "A workshop without walls." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("mobile navigation, artwork dialog, and narrow layouts work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: /Selected works/ })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Explore David" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /The gaze/ }).click();
  await expect(page.getByRole("button", { name: "Reset zoom" })).toHaveText(
    "210%",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  for (const width of [320, 390, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const dimensions = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test("the atelier and artwork viewer pass automated WCAG checks", async ({
  page,
}) => {
  await page.goto("/");
  for (const section of ["#works", "#process", "#stone", ".site-footer"]) {
    await page.locator(section).scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(500);
  const atelier = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(atelier.violations).toEqual([]);
  await page.getByRole("button", { name: "Explore David" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const viewer = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(viewer.violations).toEqual([]);
});

test("mobile navigation contains keyboard focus and closes on resize", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(
    mobileNav.getByRole("link", { name: /The atelier/ }),
  ).toBeFocused();
  await mobileNav.getByRole("link", { name: /Inside the mind/ }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", {
      name: "Michelangelo Buonarroti, back to the atelier",
    }),
  ).toBeFocused();
  await page.setViewportSize({ width: 1024, height: 844 });
  await expect(mobileNav).not.toBeVisible();
  await expect(page.locator("main")).not.toHaveAttribute("inert");
});
