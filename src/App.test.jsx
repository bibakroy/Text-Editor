import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { toHexColor } from "./utils/color";

const output = () => screen.getByLabelText("HTML output");

it("renders the editor with its HTML output", async () => {
  render(<App />);

  expect(screen.getByText("TEXT EDITOR")).toBeInTheDocument();
  expect(output()).toHaveAttribute("readonly");
  await waitFor(() => expect(output().value).toContain("<h1><em><u>Hello</u></em></h1>"));
  expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument();
});

it("updates the output when formatting is applied", async () => {
  const user = userEvent.setup();
  render(<App />);
  await waitFor(() => expect(output().value).toContain("Hello"));

  await user.selectOptions(screen.getByLabelText("Block type"), "h2");
  expect(output().value).toContain("<h2>");
});

it("replaces a blockquote instead of nesting a heading inside it", async () => {
  const user = userEvent.setup();
  render(<App />);
  await waitFor(() => expect(output().value).toContain("Hello"));

  await user.selectOptions(screen.getByLabelText("Block type"), "blockquote");
  expect(output().value).toContain("<blockquote>");
  await user.selectOptions(screen.getByLabelText("Block type"), "h3");
  expect(output().value).not.toContain("<blockquote>");
  expect(output().value).toContain("<h3>");
  expect(screen.getByLabelText("Block type")).toHaveValue("h3");
});

it("leaves the trailing empty paragraph out of the output", async () => {
  const user = userEvent.setup();
  render(<App />);
  await waitFor(() => expect(output().value).toContain("Hello"));

  await user.selectOptions(screen.getByLabelText("Block type"), "h2");
  expect(output().value).not.toMatch(/<p><\/p>$/);
});

it("keeps an inserted image when something else is inserted next", async () => {
  const user = userEvent.setup();
  const prompt = vi.spyOn(window, "prompt").mockReturnValue("https://example.com/a.png");
  render(<App />);
  await waitFor(() => expect(output().value).toContain("Hello"));

  await user.click(screen.getByRole("button", { name: "Image" }));
  await user.selectOptions(screen.getByLabelText("Emoji"), "🔥");

  expect(output().value).toContain('<img src="https://example.com/a.png">');
  expect(output().value).toContain("🔥");
  prompt.mockRestore();
});

it("inserts the URL as link text when nothing is selected", async () => {
  const user = userEvent.setup();
  const prompt = vi.spyOn(window, "prompt").mockReturnValue("example.com");
  render(<App />);
  await waitFor(() => expect(output().value).toContain("Hello"));

  await user.click(screen.getByRole("button", { name: "Link" }));

  expect(output().value).toMatch(/<a [^>]*href="https:\/\/example\.com"[^>]*>example\.com<\/a>/);
  prompt.mockRestore();
});

it("refuses javascript: links from the link prompt", async () => {
  const user = userEvent.setup();
  const prompt = vi.spyOn(window, "prompt").mockReturnValue("javascript:alert(1)");
  const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
  render(<App />);
  await waitFor(() => expect(output().value).toContain("Hello"));

  await user.click(screen.getByRole("button", { name: "Link" }));

  expect(prompt).toHaveBeenCalled();
  expect(alert).toHaveBeenCalledWith("Only http, https, mailto and tel links are allowed.");
  expect(output().value).not.toContain("javascript:");
  prompt.mockRestore();
  alert.mockRestore();
});

it.each([
  ["rgb(255, 0, 0)", "#ff0000"],
  ["rgba(0, 128, 255, 0.5)", "#0080ff"],
  ["#ABC", "#aabbcc"],
  ["#123456", "#123456"],
  ["red", "#000000"],
  [undefined, "#000000"],
])("toHexColor(%j) is %s", (input, expected) => {
  expect(toHexColor(input)).toBe(expected);
});

it("labels the editable area for screen readers", async () => {
  render(<App />);
  await waitFor(() => expect(screen.getByRole("textbox", { name: "Editor" })).toHaveAttribute("contenteditable", "true"));
});
