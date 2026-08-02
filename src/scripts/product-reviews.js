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
  const score = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
  const fullStar = String.fromCharCode(9733);
  const emptyStar = String.fromCharCode(9734);
  return fullStar.repeat(score) + emptyStar.repeat(5 - score);
};

const formatAverage = (average) =>
  Number(average || 0).toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const createReviewCard = (review) => {
  const card = document.createElement("article");
  card.className = "review-card user-review-card";

  const header = document.createElement("div");
  header.className = "review-header";

  const stars = document.createElement("div");
  stars.className = "review-stars";
  stars.textContent = renderStars(review.Puntuacion);

  const date = document.createElement("span");
  date.className = "review-date";
  date.textContent = formatDate(review.Fecha);

  header.append(stars, date);

  const comment = document.createElement("p");
  comment.className = "review-comment";
  comment.textContent = review.Comentario;

  const author = document.createElement("div");
  author.className = "review-author";

  const name = document.createElement("strong");
  name.textContent = review.Nombre || "Cliente";

  author.append(name);
  card.append(header, comment, author);

  return card;
};

export function initProductReviews() {
  document.querySelectorAll("[data-product-reviews]").forEach((section) => {
    const productId = section.dataset.productReviews;
    const form = section.querySelector("[data-review-form]");
    const list = section.querySelector("[data-user-review-list]");
    const status = section.querySelector("[data-review-status]");
    const average = section.querySelector("[data-review-average]");
    const total = section.querySelector("[data-review-total]");
    const averageStars = section.querySelector("[data-review-average-stars]");
    const gate = section.querySelector("[data-review-gate]");
    const submit = form?.querySelector('button[type="submit"]');

    if (!productId || !form || !list) return;

    const setStatus = (message, tone = "") => {
      if (!status) return;
      status.textContent = message;
      status.dataset.tone = tone;
    };

    const setFormEnabled = (enabled) => {
      form.querySelectorAll("input, textarea, button").forEach((field) => {
        field.disabled = !enabled;
      });
      form.classList.toggle("is-disabled", !enabled);
    };

    const renderSummary = (result) => {
      const reviewTotal = Number(result.total || 0);
      const reviewAverage = Number(result.average || 0);

      if (average) average.textContent = formatAverage(reviewAverage);
      if (total) {
        total.textContent = `(${reviewTotal} ${reviewTotal === 1 ? "valoración" : "valoraciones"})`;
      }
      if (averageStars) averageStars.textContent = renderStars(reviewAverage);
    };

    const renderGate = (result) => {
      if (!gate) return;

      if (!result.hasSession) {
        gate.textContent = "Inicia sesión con tu cuenta para comentar después de comprar este producto.";
      } else if (!result.hasPurchased) {
        gate.textContent = "Podrás comentar cuando hayas comprado este producto.";
      } else if (result.hasReviewed) {
        gate.textContent = "Ya comentaste este producto. Si publicas de nuevo, actualizaremos tu comentario.";
      } else {
        gate.textContent = "Compra verificada. Puedes compartir tu experiencia.";
      }

      gate.dataset.tone = result.canReview ? "success" : "locked";
    };

    const renderReviews = (reviews) => {
      list.replaceChildren();

      if (!reviews.length) {
        const empty = document.createElement("p");
        empty.className = "review-empty";
        empty.textContent = "Todavía no hay comentarios de clientes para este producto.";
        list.append(empty);
        return;
      }

      reviews.forEach((review) => list.append(createReviewCard(review)));
    };

    const applyResult = (result) => {
      renderSummary(result);
      renderGate(result);
      renderReviews(result.reviews || []);
      setFormEnabled(Boolean(result.canReview));
      if (submit) {
        submit.textContent = result.hasReviewed ? "Actualizar comentario" : "Publicar comentario";
      }
    };

    const loadReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message);
        applyResult(result);
      } catch {
        renderReviews([]);
        setFormEnabled(false);
        setStatus("No se pudieron cargar los comentarios.", "error");
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
        applyResult(result);
        setStatus("Comentario publicado. Gracias por compartir tu experiencia.", "success");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "No se pudo guardar el comentario.", "error");
      }
    });

    loadReviews();
  });
}
