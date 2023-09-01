# Documentation

Here you will find flow diagrams documenting complex logic.

This is meant to be used as a source for communicating the logic flows in this application, and should written in a way for non-devs to understand.

## Contributing: Mermaid in markdown

> https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/

Github has added support for generating diagrams written in mermaid inside markdown files.

Here are the mermaid docs: https://mermaid.js.org/syntax/flowchart.html

Heres an example:

```mermaid
flowchart TB
    S(Start) --> A(First step)
    A ..-> B[Next step]
    B --Note inbetween steps--> C[Another step]
    C --> D[/some time elapsed/]
    D --> E{Is this a\ngood example?}
    E --> |Yes| F1[Great!]
    E --> |No| F2[Create an issue\nlet me know!]
    F1 --> End1(End)
    F2 --> A
```
