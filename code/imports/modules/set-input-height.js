export default function (defaultHeight, element) {
  if (element) {
    // Support passing an event and a raw element from refs;
    const target = element.target ? element.target : element;
    target.style.height = `${defaultHeight}px`;
    target.style.height = `${target.scrollHeight}px`;
  }
}
