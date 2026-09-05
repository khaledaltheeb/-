import 'react';

declare module 'react' {
  interface FormHTMLAttributes<T> {
    /** WebMCP Declarative API tool identifier. */
    toolname?: string;
    /** WebMCP Declarative API tool description exposed to browser agents. */
    tooldescription?: string;
    /** WebMCP boolean attribute. Empty string is preferred so React serializes it verbatim. */
    toolautosubmit?: string | boolean;
  }

  interface InputHTMLAttributes<T> {
    /** Description used by WebMCP when synthesizing the input JSON Schema. */
    toolparamdescription?: string;
  }

  interface SelectHTMLAttributes<T> {
    toolparamdescription?: string;
  }

  interface TextareaHTMLAttributes<T> {
    toolparamdescription?: string;
  }

  interface FieldsetHTMLAttributes<T> {
    toolparamdescription?: string;
  }
}
