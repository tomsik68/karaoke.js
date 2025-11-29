import fs from "fs";
import { JSDOM } from "jsdom";

const htmlFile = "public/index.html"; // path to your HTML file
const outputFile = "src/dom_registry.ts";   // where the generated TS class will go

// Load HTML
const html = fs.readFileSync(htmlFile, "utf-8");
const dom = new JSDOM(html);
const document = dom.window.document;

// Type mapping based on tag name
const tagTypeMap: Record<string, string> = {
  input: "HTMLInputElement",
  textarea: "HTMLTextAreaElement",
  select: "HTMLSelectElement",
  button: "HTMLButtonElement",
  audio: "HTMLAudioElement",
  canvas: "HTMLCanvasElement",
  div: "HTMLDivElement",
  span: "HTMLSpanElement",
  label: "HTMLLabelElement",
  form: "HTMLFormElement",
  h1: "HTMLHeadingElement",
  h2: "HTMLHeadingElement",
  h3: "HTMLHeadingElement",
  h4: "HTMLHeadingElement",
  h5: "HTMLHeadingElement",
  h6: "HTMLHeadingElement",
};

// Collect all elements with an ID
const elements = Array.from(document.querySelectorAll<HTMLElement>("[id]")).map(el => {
  const tag = el.tagName.toLowerCase();
  if (tagTypeMap[tag] == null) {
    throw new Error("Unable to convert HTML tag " + tag + " to type. Please register the tag to the type map.");
  }
  const type = tagTypeMap[tag] || "HTMLElement";
  return { id: el.id, type };
});

// Generate TypeScript class
let output = `// Auto-generated DOM registry\n`;
output += `export class DomRegistry {\n`;
elements.forEach(el => {
  output += `  ${el.id}: ${el.type};\n`;
});
output += `\n  constructor(private root: Document) {\n`;
elements.forEach(el => {
  output += `    this.${el.id} = root.getElementById("${el.id}") as ${el.type};\n`;
});
output += `  }\n`;
output += `}\n`;

// Write to file
fs.writeFileSync(outputFile, output);
console.log(`Generated DOM registry with ${elements.length} elements → ${outputFile}`);
