const formatDate = (value) => {
  try {
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
};

const renderStars = (rating) => {
  const score = Math.min(5, Math.max(1, Number(rating) || 1));
  const fullStar = String.fromCharCode(9733);
  const emptyStar = String.fromCharCode(9734);
  return fullStar.repeat(score) + emptyStar.repeat(5 - score);
};

const createReviewCard = (review) => {
  const card = document.createElement("article");
  card.className = "review-card user-review-card";

  const stars = document.createElement("div");
  stars.className = "review-stars";
  stars.setAttribute("aria-label", `${review.rating} de 5 estrellas`);
  stars.textContent = renderStars(review.rating);

  const comment = document.createElement("p");
  comment.className = "review-comment";
  comment.textContent = `"${review.comment}"`;

  const author = document.createElement("div");
  author.className = "review-author";

  const name = document.createElement("strong");
  name.textContent = review.name || "Cliente";

  const meta = document.createElement("span");
  meta.textContent = `Cliente - ${formatDate(review.createdAt)}`;

  author.append(name, meta);
  card.append(stars, comment, author);

  return card;
};

export function initProductReviews() {
  document.querySelectorAll("[data-product-reviews]").forEach((section) => {
    const productId = section.dataset.productReviews;
    const form = section.querySelector("[data-review-form]");
    const list = section.querySelector("[data-user-review-list]");
    const status = section.querySelector("[data-review-status]");

    if (!productId || !form || !list) return;

    const setStatus = (message, tone = "") => {
      if (!status) return;
      status.textContent = message;
      status.dataset.tone = tone;
    };

    const renderReviews = (reviews) => {
      list.replaceChildren();

      if (!reviews.length) {
        const empty = document.createElement("p");
        empty.className = "review-empty";
        empty.textContent = "Todavia no hay comentarios de clientes para este producto.";
        list.append(empty);
        return;
      }

      reviews.forEach((review) => list.append(createReviewCard(review)));
    };

    const loadReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
        const result = await response.json();
        renderReviews(result.ok ? result.reviews : []);
      } catch {
        renderReviews([]);
      }
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus("Guardando comentario...");

      const data = new FormData(form);

      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            name: data.get("name"),
            rating: Number(data.get("rating")),
            comment: data.get("comment"),
          }),
        });
        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.message || "No se pudo guardar el comentario.");
        }

        form.reset();
        form.querySelector('input[name="rating"][value="5"]')?.click();
        renderReviews(result.reviews || []);
        setStatus("Comentario publicado. Gracias por compartir tu experiencia.", "success");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "No se pudo guardar el comentario.", "error");
      }
    });

    loadReviews();
  });
}
