const shareUrl = "https://giufog.github.io/giu-page/forfora/";
const shareButton = document.querySelector("[data-share]");
const toast = document.querySelector(".toast");
let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

shareButton?.addEventListener("click", async () => {
  try {
    if (navigator.share) {
      await navigator.share({ url: shareUrl });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    showToast("Link copiato.");
  } catch (error) {
    if (error?.name !== "AbortError") {
      showToast("Non è stato possibile condividere il link.");
    }
  }
});
