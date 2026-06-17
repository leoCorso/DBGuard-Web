import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'textarea[codeText]',
  standalone: true
})
export class CodeText {
  constructor(private control: NgControl) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const textarea = event.target as HTMLTextAreaElement;

    if (event.key === 'Tab') {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    '; // 4 spaces

      // Handle multi-line indent when text is selected
      if (start !== end) {
        const value = textarea.value;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const beforeSelection = value.substring(0, lineStart);
        const afterSelection = value.substring(end);
        const lines = value.substring(lineStart, end).split('\n');

        const indented = event.shiftKey
          ? lines.map(l => l.startsWith(spaces) ? l.slice(4) : l.replace(/^ {1,4}/, ''))
          : lines.map(l => spaces + l);

        const newValue = beforeSelection + indented.join('\n') + afterSelection;
        const lengthDiff = newValue.length - value.length;

        this.control.control?.setValue(newValue, { emitEvent: false });
        textarea.setSelectionRange(start + (event.shiftKey ? -Math.min(4, lines[0].match(/^ */)?.[0].length ?? 0) : 4), end + lengthDiff);
      } else {
        // Simple tab insert at cursor
        const value = textarea.value;
        const newValue = value.substring(0, start) + spaces + value.substring(end);
        this.control.control?.setValue(newValue, { emitEvent: false });
        textarea.setSelectionRange(start + 4, start + 4);
      }
    }

    // Enter key: auto-indent to match current line
    if (event.key === 'Enter') {
      event.preventDefault();
      const value = textarea.value;
      const start = textarea.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.substring(lineStart, start);
      const indent = currentLine.match(/^(\s*)/)?.[1] ?? '';
      const newValue = value.substring(0, start) + '\n' + indent + value.substring(textarea.selectionEnd);

      this.control.control?.setValue(newValue, { emitEvent: false });
      textarea.setSelectionRange(start + 1 + indent.length, start + 1 + indent.length);
    }
  }
}
