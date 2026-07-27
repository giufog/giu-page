const toast = document.querySelector('.toast');
let toastTimer;
const sources = document.querySelector('.sources');
document.querySelectorAll('[data-toast]').forEach((button) => {
  button.addEventListener('click', () => {
    toast.textContent = button.dataset.toast;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  });
});
document.querySelectorAll('[data-dialog]').forEach((button) => {
  button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal());
});
document.querySelectorAll('.segmented button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.segmented .is-selected')?.classList.remove('is-selected');
    button.classList.add('is-selected');
  });
});

const printButton = document.querySelector('[data-print]');
if (printButton) {
  printButton.addEventListener('click', () => {
    const details = [...document.querySelectorAll('details')];
    const previouslyOpen = new Set(details.filter((item) => item.open));
    details.forEach((item) => { item.open = true; });

    const restoreDetails = () => {
      details.forEach((item) => { item.open = previouslyOpen.has(item); });
      window.removeEventListener('afterprint', restoreDetails);
    };

    window.addEventListener('afterprint', restoreDetails);
    window.print();
  });
}

