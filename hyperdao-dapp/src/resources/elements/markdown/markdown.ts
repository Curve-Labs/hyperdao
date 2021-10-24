import { bindable } from "aurelia-framework";

const marked = require("marked");

export class Markdown{

  @bindable document: string;
  markdown: string;

  // constructor() {
  //   marked.setOptions({ breaks: true, gfm: true });
  // }

  attached(): void {
    this.markdown = marked(this.document);
  }
}
