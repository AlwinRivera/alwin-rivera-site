import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RichText } from "@/components/rich-text";

const render = (text: string) => renderToStaticMarkup(<RichText text={text} />);

describe("RichText links", () => {
  it("keeps a sentence's full stop out of an email link", () => {
    const html = render("Email me at aimrivera@gmail.com.");
    expect(html).toContain('href="mailto:aimrivera@gmail.com"');
    expect(html).toContain("</a>.");
  });

  it("keeps trailing punctuation out of URLs", () => {
    expect(render("See https://github.com/AlwinRivera.")).toContain('href="https://github.com/AlwinRivera"');
    expect(render("Try https://codepen.io/devAlwinRivera/, and more")).toContain(
      'href="https://codepen.io/devAlwinRivera/"'
    );
  });

  it("shows URLs without the protocol or trailing slash", () => {
    expect(render("https://www.example.com/")).toContain(">example.com</a>");
  });
});

describe("RichText blocks", () => {
  it("renders numbered lists as <ol> and bullets as <ul>", () => {
    const html = render("Steps:\n1. Plan\n2. Build\n- tested\n- shipped");
    expect(html).toContain("<ol><li>Plan</li><li>Build</li></ol>");
    expect(html).toContain("<ul><li>tested</li><li>shipped</li></ul>");
  });

  it("renders **bold** and strips single-asterisk emphasis", () => {
    const html = render("I'm **front-end** and *careful*");
    expect(html).toContain("<strong>front-end</strong>");
    expect(html).toContain("careful");
    expect(html).not.toContain("*");
  });

  it("escapes HTML from the model instead of rendering it", () => {
    const html = render('<img src=x onerror="alert(1)"> <script>alert(1)</script>');
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<script");
    expect(html).toContain("&lt;script&gt;");
  });
});
